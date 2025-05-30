import feedparser
import nltk
import re
from bs4 import BeautifulSoup
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

nltk.download("punkt")
nltk.download("stopwords")
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

ID_STOPWORDS = set(stopwords.words("indonesian"))

def preprocess(text):
    # Hilangkan tag HTML
    text = BeautifulSoup(text, "html.parser").get_text()
    # Case folding
    text = text.lower()
    # Hilangkan angka dan simbol
    text = re.sub(r"[^a-zA-Z\s]", "", text)
    # Tokenisasi
    tokens = word_tokenize(text)
    # Stopword removal
    tokens = [t for t in tokens if t not in ID_STOPWORDS and len(t) > 2]
    return " ".join(tokens)

class NewsSearchEngine:
    def __init__(self, keyword="pertanian"):
        self.keyword = keyword
        self.articles = []
        self.vectorizer = TfidfVectorizer()
        self.tfidf_matrix = None

    def fetch_articles(self):
        self.articles.clear()
        rss_url = f"https://news.google.com/rss/search?q={self.keyword}&hl=id&gl=ID&ceid=ID:id"
        feed = feedparser.parse(rss_url)
        for entry in feed.entries:
            summary = entry.get("summary", "")
            clean_summary = preprocess(summary)
            clean_title = preprocess(entry.get("title", ""))
            self.articles.append({
                "title": entry.title,
                "link": entry.link,
                "summary": summary,
                "clean": clean_title + " " + clean_summary
            })

    def build_index(self):
        corpus = [article["clean"] for article in self.articles]
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)

    def search(self, query, top_k=5):
        query_clean = preprocess(query)
        query_vec = self.vectorizer.transform([query_clean])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        top_indices = similarities.argsort()[::-1][:top_k]
        return [self.articles[i] for i in top_indices if similarities[i] > 0.1]
