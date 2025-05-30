from fastapi import FastAPI, Query, HTTPException, Depends, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, Response
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.hash import bcrypt
from typing import List
import csv
from pathlib import Path
from typing import Optional


import feedparser
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import stopwords
import ssl
from bs4 import BeautifulSoup
import asyncio
import aiohttp
from datetime import datetime
import joblib
from urllib.parse import quote
import httpx
import pandas as pd
import os
import ast
from collections import Counter
import math
import json
from functools import lru_cache

# === SSL bypass untuk NLTK ===
try:
    _create_unverified_https_context = ssl._create_unverified_context
    ssl._create_default_https_context = _create_unverified_https_context
except AttributeError:
    pass

nltk.download('stopwords')
stop_words = set(stopwords.words('indonesian'))

# === FastAPI app ===
app = FastAPI()

# === CORS Middleware ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === SQLite & SQLAlchemy setup ===
DATABASE_URL = "sqlite:///./userss.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
Base = declarative_base()
SessionLocal = sessionmaker(bind=engine)

# === Model User ===
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

# === Model HorecaBusiness ===
class HorecaBusiness(Base):
    __tablename__ = "horeca_businesses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    rating = Column(Float)
    user_rating_count = Column(Integer)
    plus_code = Column(String)
    wilayah = Column(String, index=True)
    types = Column(Text)  # JSON string untuk menyimpan array types
    score = Column(Float)  # untuk top horeca ranking

# === Pydantic schema ===
class UserCreate(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str

    class Config:
        orm_mode = True

class HorecaPlace(BaseModel):
    name: str
    wilayah: str
    rating: float
    review_count: int
    score: float

class HorecaBusinessCreate(BaseModel):
    name: str
    rating: Optional[float] = None
    user_rating_count: Optional[int] = None
    plus_code: Optional[str] = None
    wilayah: Optional[str] = None
    types: Optional[str] = None
    score: Optional[float] = None

# === Dependency DB Session ===
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

region_patterns = {
    r'\bKota Jakarta Pusat\b':      'Jakarta Pusat',
    r'\bKota Jakarta Selatan\b':    'Jakarta Selatan',
    r'\bJakarta Utara\b':           'Jakarta Utara',
    r'\bKota Jakarta Utara\b':      'Jakarta Utara',
    r'\bJakarta Timur\b':           'Jakarta Timur',
    r'\bKota Jakarta Barat\b':      'Jakarta Barat',
    r'\bBogor\b':                   'Bogor',
    r'\bDepok\b':                   'Depok',
    r'\bTangerang\b':               'Tangerang',
    r'\bBekasi\b':                  'Bekasi'
}
all_pattern = '|'.join(f'({p})' for p in region_patterns)

def ekstrak_wilayah_from_pluscode(pc: str) -> str:
    if not pc:
        return None
    for patt, name in region_patterns.items():
        if re.search(patt, pc, flags=re.IGNORECASE):
            return name
    return None

# === Function to migrate CSV data to database ===
def migrate_csv_to_db():
    db = SessionLocal()
    try:
        # Check if data already exists
        existing_count = db.query(HorecaBusiness).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} records. Skipping migration.")
            return

        csv_path = os.path.join(os.path.dirname(__file__), "all_business_data_horeca_jabodetabek-1744532904805.csv")
        if not os.path.exists(csv_path):
            print(f"CSV file not found: {csv_path}")
            return

        df = pd.read_csv(csv_path)
        
        # Filter hanya wilayah Jabodetabek
        mask = df['places.plusCode'].astype(str).str.contains(all_pattern, regex=True, na=False)
        df = df[mask].copy()
        
        # Extract wilayah
        df['wilayah'] = df['places.plusCode'].apply(ekstrak_wilayah_from_pluscode)
        df = df[df['wilayah'].notnull()]

        # Calculate score for ranking (rating * log(review_count + 1))
        df['places.rating'] = pd.to_numeric(df['places.rating'], errors='coerce')
        df['places.userRatingCount'] = pd.to_numeric(df['places.userRatingCount'], errors='coerce')
        df['score'] = df.apply(lambda row: 
            (row['places.rating'] or 0) * math.log((row['places.userRatingCount'] or 0) + 1), 
            axis=1
        )

        # Insert data into database
        businesses = []
        for _, row in df.iterrows():
            business = HorecaBusiness(
                name=row.get('places.name', ''),
                rating=row.get('places.rating') if pd.notna(row.get('places.rating')) else None,
                user_rating_count=row.get('places.userRatingCount') if pd.notna(row.get('places.userRatingCount')) else None,
                plus_code=row.get('places.plusCode'),
                wilayah=row.get('wilayah'),
                types=row.get('places.types', '[]'),
                score=row.get('score', 0)
            )
            businesses.append(business)

        # Bulk insert in batches
        batch_size = 1000
        for i in range(0, len(businesses), batch_size):
            batch = businesses[i:i + batch_size]
            db.bulk_save_objects(batch)
            db.commit()
            print(f"Inserted batch {i//batch_size + 1}, records {i+1}-{min(i+batch_size, len(businesses))}")

        print(f"Successfully migrated {len(businesses)} records to database")

    except Exception as e:
        print(f"Error during migration: {e}")
        db.rollback()
    finally:
        db.close()

# === Buat tabel saat startup ===
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    # Migrate CSV data on first startup
    migrate_csv_to_db()

# === Endpoint Register ===
@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar.")
    hashed_pw = bcrypt.hash(user.password)
    new_user = User(email=user.email, password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Pendaftaran berhasil", "user": {"id": new_user.id, "email": new_user.email}}

# === Endpoint Login ===
@app.post("/login")
def login(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user or not bcrypt.verify(password, user.password):
        raise HTTPException(status_code=401, detail="Email atau password salah.")
    return {"message": "Login berhasil", "user": {"id": user.id, "email": user.email}}

@app.post("/update_email")
def update_email(user_id: int = Form(...), email: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan.")
    user.email = email
    db.commit()
    return {"message": "Email berhasil diperbarui."}

# === Load Model Sentimen ===
model = joblib.load('backend/sentiment_model_lgbm.pkl')
vectorizer = joblib.load('backend/tfidf_vectorizer_.pkl')

# === Google Places API ===
X_GOOG_API_KEY = "AIzaSyAg_WIL_YuycSAUtMWWBWy1JSxWhpJoUyg"
BASE_URL = "https://places.googleapis.com/v1/places:searchText"
NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby"

# === Preprocessing & Sentiment Prediction ===
def preprocess(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    tokens = text.split()
    tokens = [word for word in tokens if word not in stop_words]
    return ' '.join(tokens)

def predict_sentiment(text):
    vector = vectorizer.transform([text])
    result = model.predict(vector)[0]
    return int(result)

# === RSS Scraping ===
def get_articles_rss(query: str):
    url = f"https://news.google.com/rss/search?q={quote(query)}&hl=id&gl=ID&ceid=ID:id"
    feed = feedparser.parse(url)
    articles = []
    for entry in feed.entries[:15]:
        date = None
        if hasattr(entry, 'published_parsed') and entry.published_parsed:
            date = datetime(*entry.published_parsed[:6]).isoformat()

        articles.append({
            "title": entry.title,
            "summary": entry.summary,
            "link": entry.link,
            "date": date
        })
    return articles

# === Fetch OG Thumbnails ===
async def fetch_og_image(session, url):
    try:
        async with session.get(url, timeout=5) as resp:
            if resp.status != 200:
                return None
            html = await resp.text()
            soup = BeautifulSoup(html, 'html.parser')

            # Cek Open Graph
            tag = soup.find('meta', property='og:image')
            # Fallback ke Twitter Card
            if not tag:
                tag = soup.find('meta', attrs={'name': 'twitter:image'})
            # Fallback ke JSON-LD schema.org
            if not tag:
                ld = soup.find('script', type='application/ld+json')
                if ld:
                    import json
                    data = json.loads(ld.string or '{}')
                    img = data.get('image')
                    if isinstance(img, str):
                        return img
                    elif isinstance(img, dict):
                        return img.get('url')

            if tag and tag.get('content'):
                image_url = tag['content']
                if any(image_url.lower().endswith(ext)
                       for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                    return image_url
    except Exception:
        pass
    return "https://via.placeholder.com/150"

# === Endpoint: /search_news ===
@app.get("/search_news")
async def search_news(keyword: str = Query(...)):
    articles = get_articles_rss(keyword)
    if not articles:
        return {"message": "Tidak ditemukan berita."}

    processed = [preprocess(a['summary']) for a in articles]
    tfidf_matrix = vectorizer.transform(processed)
    query_vec = vectorizer.transform([preprocess(keyword)])
    similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()

    ranked = sorted(zip(similarities, articles), reverse=True, key=lambda x: x[0])

    async with aiohttp.ClientSession() as session:
        thumbnails = await asyncio.gather(
            *[fetch_og_image(session, a["link"]) for _, a in ranked[:5]]
        )

    result = []
    for i, (score, article) in enumerate(ranked[:5]):
        result.append({
            "title": article["title"],
            "summary": article["summary"],
            "link": article["link"],
            "date": article["date"],
            "score": float(score),
            "thumbnail": thumbnails[i] or "https://via.placeholder.com/150",
            "sentiment": predict_sentiment(article["title"])
        })
    return result

# === Endpoint: /sentiment ===
@app.get("/sentiment")
async def analyze_sentiment(text: str = Query(...)):
    return {"text": text, "sentiment": predict_sentiment(text)}

# === Endpoint: /search-places ===
@app.get("/search-places")
async def search_places_real_time(
    query: str = Query(..., description="Kata kunci pencarian"),
    location: str = Query("Indonesia", description="Lokasi"),
    max_results: int = Query(20, ge=1, le=100, description="Jumlah hasil maksimal")
):
    try:
        full_query = f"{query} in {location}"
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": X_GOOG_API_KEY,
            "X-Goog-FieldMask": ",".join([
                "places.id",
                "places.displayName",
                "places.formattedAddress",
                "places.location",
                "places.rating",
                "places.userRatingCount",
                "places.types",
                "places.photos",
                "places.websiteUri",
                "places.nationalPhoneNumber",
                "places.types"
            ])
        }
        payload = {
            "textQuery": full_query,
            "maxResultCount": max_results
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(BASE_URL, headers=headers, json=payload)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)

        data = response.json()
        return {
            "status": "success",
            "count": len(data.get("places", [])),
            "results": data.get("places", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# === Endpoint: /place-details ===
@app.get("/place-details")
async def get_place_details(place_id: str = Query(..., description="ID tempat dari Google Places")):
    try:
        detail_url = f"https://places.googleapis.com/v1/places/{place_id}"

        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": X_GOOG_API_KEY,
            "X-Goog-FieldMask": ",".join([
                "id",
                "displayName",
                "formattedAddress",
                "location",
                "rating",
                "userRatingCount",
                "types",
                "photos",
                "websiteUri",
                "nationalPhoneNumber",
                "reviews"
            ])
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(detail_url, headers=headers)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)

        data = response.json()
        return {
            "status": "success",
            "data": data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sentiment_batch")
async def sentiment_batch(titles: List[str] = Body(...)):
    return {
        "results": [
            {"text": title, "sentiment": predict_sentiment(title)}
            for title in titles
        ]
    }

# === Updated Endpoints using SQLite Database ===

@app.get("/top-horeca", response_model=List[HorecaPlace])
async def get_top_horeca(
    wilayah: Optional[str] = Query(None),
    limit: int = Query(20),
    db: Session = Depends(get_db)
):
    """Get top HORECA places from database"""
    query = db.query(HorecaBusiness)
    
    if wilayah:
        query = query.filter(HorecaBusiness.wilayah.ilike(f"%{wilayah}%"))
    
    # Order by score descending
    businesses = query.order_by(HorecaBusiness.score.desc()).limit(limit).all()
    
    result = []
    for business in businesses:
        result.append(HorecaPlace(
            name=business.name,
            wilayah=business.wilayah or "",
            rating=business.rating or 0.0,
            review_count=business.user_rating_count or 0,
            score=business.score or 0.0
        ))
    
    return result

@app.get("/correlation-data")
def get_correlation_data(db: Session = Depends(get_db)):
    """Get correlation data between rating and user rating count from database"""
    try:
        businesses = db.query(HorecaBusiness).filter(
            HorecaBusiness.rating.isnot(None),
            HorecaBusiness.user_rating_count.isnot(None)
        ).all()

        result = []
        for business in businesses:
            result.append({
                "places.rating": business.rating,
                "places.userRatingCount": business.user_rating_count
            })

        return result
    
    except Exception as e:
        return {"error": str(e)}

@app.get("/horeca-per-wilayah")
def horeca_per_wilayah(db: Session = Depends(get_db)):
    """Get HORECA count per wilayah from database"""
    try:
        from sqlalchemy import func
        
        result = db.query(
            HorecaBusiness.wilayah,
            func.count(HorecaBusiness.id).label('jumlah')
        ).filter(
            HorecaBusiness.wilayah.isnot(None)
        ).group_by(
            HorecaBusiness.wilayah
        ).order_by(
            func.count(HorecaBusiness.id).desc()
        ).all()

        return [{"wilayah": r.wilayah, "jumlah": r.jumlah} for r in result]

    except Exception as e:
        return {"error": str(e)}

@app.get("/header-stats")
def header_stats(db: Session = Depends(get_db)):
    """Get header statistics from database"""
    try:
        from sqlalchemy import func
        
        # Total HORECA
        total_horeca = db.query(func.count(HorecaBusiness.id)).scalar()
        
        # Average rating
        avg_rating = db.query(func.avg(HorecaBusiness.rating)).filter(
            HorecaBusiness.rating.isnot(None)
        ).scalar()
        rata_rata_rating = round(avg_rating, 2) if avg_rating else 0.0
        
        # Popular places (more than 100 reviews)
        total_populer = db.query(func.count(HorecaBusiness.id)).filter(
            HorecaBusiness.user_rating_count > 100
        ).scalar()

        # Count categories from types
        businesses_with_types = db.query(HorecaBusiness.types).filter(
            HorecaBusiness.types.isnot(None),
            HorecaBusiness.types != '[]'
        ).all()

        type_counter = Counter()
        for business in businesses_with_types:
            try:
                if business.types:
                    type_list = ast.literal_eval(business.types)
                    if isinstance(type_list, list):
                        type_counter.update(type_list)
            except Exception:
                continue

        restaurant_count = type_counter.get("restaurant", 0)
        cafe_count = type_counter.get("cafe", 0)
        hotel_count = type_counter.get("lodging", 0) + type_counter.get("hotel", 0)

        return {
            "total_horeca": total_horeca,
            "rata_rata_rating": rata_rata_rating,
            "total_populer": total_populer,
            "total_per_kategori": {
                "restaurant": restaurant_count,
                "cafe": cafe_count,
                "hotel": hotel_count
            }
        }

    except Exception as e:
        return {"error": str(e)}

# === Additional utility endpoints ===

@app.post("/add-horeca-business")
def add_horeca_business(business: HorecaBusinessCreate, db: Session = Depends(get_db)):
    """Add new HORECA business to database"""
    try:
        # Calculate score if rating and user_rating_count provided
        score = 0.0
        if business.rating and business.user_rating_count:
            score = business.rating * math.log(business.user_rating_count + 1)
        
        db_business = HorecaBusiness(
            name=business.name,
            rating=business.rating,
            user_rating_count=business.user_rating_count,
            plus_code=business.plus_code,
            wilayah=business.wilayah,
            types=business.types or '[]',
            score=score
        )
        
        db.add(db_business)
        db.commit()
        db.refresh(db_business)
        
        return {"message": "HORECA business added successfully", "id": db_business.id}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/horeca-search")
def search_horeca_businesses(
    name: Optional[str] = Query(None),
    wilayah: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    limit: int = Query(50),
    db: Session = Depends(get_db)
):
    """Search HORECA businesses with filters"""
    query = db.query(HorecaBusiness)
    
    if name:
        query = query.filter(HorecaBusiness.name.ilike(f"%{name}%"))
    if wilayah:
        query = query.filter(HorecaBusiness.wilayah.ilike(f"%{wilayah}%"))
    if min_rating:
        query = query.filter(HorecaBusiness.rating >= min_rating)
    
    businesses = query.order_by(HorecaBusiness.score.desc()).limit(limit).all()
    
    return [
        {
            "id": b.id,
            "name": b.name,
            "rating": b.rating,
            "user_rating_count": b.user_rating_count,
            "wilayah": b.wilayah,
            "score": b.score
        }
        for b in businesses
    ]

# === NEW ENDPOINT: /search-nearby-places ===
@app.get("/search-nearby-places")
async def search_nearby_places(
    lat: float = Query(..., description="Latitude lokasi pengguna"),
    lng: float = Query(..., description="Longitude lokasi pengguna"),
    radius: int = Query(5000, ge=100, le=50000, description="Radius pencarian dalam meter"),
    type: str = Query("restaurant|hotel|convenience_store|cafe|bakery|meal_takeaway", description="Jenis tempat yang dicari"),
    max_results: int = Query(20, ge=1, le=100, description="Jumlah hasil maksimal")
):
    """
    Endpoint untuk mencari HORECA terdekat berdasarkan koordinat pengguna
    """
    try:
        # Convert type parameter to included types array
        included_types = [t.strip() for t in type.split("|") if t.strip()]
        
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": X_GOOG_API_KEY,
            "X-Goog-FieldMask": ",".join([
                "places.id",
                "places.displayName", 
                "places.formattedAddress",
                "places.location",
                "places.rating",
                "places.userRatingCount",
                "places.types",
                "places.photos",
                "places.websiteUri",
                "places.nationalPhoneNumber",
                "places.businessStatus"
            ])
        }
        
        payload = {
            "includedTypes": included_types,
            "maxResultCount": max_results,
            "locationRestriction": {
                "circle": {
                    "center": {
                        "latitude": lat,
                        "longitude": lng
                    },
                    "radius": radius
                }
            },
            "rankPreference": "DISTANCE"  # Sort by distance
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(NEARBY_URL, headers=headers, json=payload)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code, 
                detail=f"Google Places API Error: {response.text}"
            )

        data = response.json()
        places = data.get("places", [])
        
        # Add distance calculation to each place
        for place in places:
            if "location" in place:
                place_lat = place["location"]["latitude"]
                place_lng = place["location"]["longitude"]
                
                # Calculate distance using Haversine formula
                distance = calculate_distance(lat, lng, place_lat, place_lng)
                place["distance_km"] = round(distance, 2)
        
        # Sort by distance (closest first)
        places.sort(key=lambda x: x.get("distance_km", float('inf')))
        
        return {
            "status": "success",
            "count": len(places),
            "user_location": {"lat": lat, "lng": lng},
            "radius_km": radius / 1000,
            "results": places
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching nearby places: {str(e)}")

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two points using Haversine formula
    Returns distance in kilometers
    """
    R = 6371  # Earth's radius in kilometers
    
    # Convert latitude and longitude from degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c