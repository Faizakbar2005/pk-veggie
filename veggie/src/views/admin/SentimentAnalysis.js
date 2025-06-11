import React, { useState, useEffect } from "react";

export default function SentimentAnalysis({ placeDetails, loading }) {
  const [reviewsSentiment, setReviewsSentiment] = useState([]);
  const [sentimentStats, setSentimentStats] = useState({});
  const [sentimentLoading, setSentimentLoading] = useState(false);

  // Analyze sentiment
  const analyzeSentiment = async (reviews) => {
    try {
      setSentimentLoading(true);
      const reviewTexts = reviews.map(review => 
        review.text?.text || review.originalText?.text || ''
      ).filter(text => text.length > 0);

      if (reviewTexts.length === 0) {
        setReviewsSentiment([]);
        setSentimentStats({});
        return;
      }

      const response = await fetch('http://localhost:8080/sentiment_batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewTexts)
      });

      if (!response.ok) throw new Error('Failed to analyze sentiment');

      const sentimentData = await response.json();
      const results = sentimentData.results || [];
      
      const enhancedReviews = reviews.map((review, index) => {
        const sentiment = results[index]?.sentiment;
        const sentimentLabel = getSentimentLabel(sentiment);
        
        // Only include reviews with positive or negative sentiment
        if (sentimentLabel) {
          return {
            ...review,
            sentiment: sentiment,
            sentimentLabel: sentimentLabel
          };
        }
        return null;
      }).filter(review => review !== null);

      setReviewsSentiment(enhancedReviews);

      const stats = results.reduce((acc, item) => {
        const sentiment = item?.sentiment;
        const label = getSentimentLabel(sentiment);
        
        // Only count positive and negative sentiments
        if (label) {
          acc[label] = (acc[label] || 0) + 1;
        }
        return acc;
      }, {});

      const total = results.length;
      const statsWithPercentage = Object.keys(stats).reduce((acc, key) => {
        acc[key] = {
          count: stats[key],
          percentage: ((stats[key] / total) * 100).toFixed(1)
        };
        return acc;
      }, {});

      setSentimentStats(statsWithPercentage);

    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      setReviewsSentiment([]);
      setSentimentStats({});
    } finally {
      setSentimentLoading(false);
    }
  };

  // Helper function to get sentiment label
  const getSentimentLabel = (sentiment) => {
    if (sentiment === 1) return 'Positif';
    if (sentiment === -1) return 'Negatif';
    return null; // Skip neutral sentiments
  };

  // Effect to analyze sentiment when place details change
  useEffect(() => {
    if (placeDetails && placeDetails.reviews && placeDetails.reviews.length > 0) {
      analyzeSentiment(placeDetails.reviews);
    } else {
      setReviewsSentiment([]);
      setSentimentStats({});
    }
  }, [placeDetails]);

  // Reset state when no place is selected
  useEffect(() => {
    if (!placeDetails) {
      setReviewsSentiment([]);
      setSentimentStats({});
    }
  }, [placeDetails]);

  const getSentimentIcon = (sentiment) => {
    if (sentiment === 1) return <span className="text-green-500 text-lg">😊</span>;
    if (sentiment === -1) return <span className="text-red-500 text-lg">😞</span>;
    return null;
  };

  const getSentimentBgClass = (sentiment) => {
    if (sentiment === 1) return 'bg-gradient-to-r from-green-50 to-green-100 border-green-200';
    if (sentiment === -1) return 'bg-gradient-to-r from-red-50 to-red-100 border-red-200';
    return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8 border border-gray-100">
      <div className="flex items-center mb-6">

        <h3 className="text-2xl font-bold text-gray-900 pl-4 mt-4">Analisis Sentimen Review</h3>
      </div>
      
      {(loading || sentimentLoading) ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            {loading ? "Memuat data tempat..." : "Memproses analisis sentimen..."}
          </p>
        </div>
      ) : (
        <>
          {/* Sentiment Statistics */}
          {Object.keys(sentimentStats).length > 0 ? (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-6 pl-4">Distribusi Sentimen</h4>
              
              {/* Sentiment Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {Object.entries(sentimentStats).map(([label, stats]) => (
                  <div key={label} className={`rounded-xl p-6 border-2 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 ${
                    label === 'Positif' ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-300 hover:border-green-400' :
                    'bg-gradient-to-br from-red-50 to-rose-100 border-red-300 hover:border-red-400'
                  }`}>
                    <div className="text-center">
                      <div className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-4 shadow-lg ${
                        label === 'Positif' ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' :
                        'bg-gradient-to-br from-red-400 to-red-600 text-white'
                      }`}>
                        <span className="text-2xl font-bold">{stats.percentage}%</span>
                      </div>
                      <h5 className="text-xl font-bold text-gray-800 mb-2">{label}</h5>
                      <div className="flex items-center justify-center space-x-1">
                        {label === 'Positif' ? 
                          <span className="text-2xl">😊</span> : 
                          <span className="text-2xl">😞</span>
                        }
                        <p className="text-gray-600 font-medium">{stats.count} review</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Bar Chart */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
                <h5 className="text-lg font-semibold text-gray-800 mb-6 text-center">Perbandingan Sentimen</h5>
                <div className="flex items-end justify-center space-x-12 h-48">
                  {Object.entries(sentimentStats).map(([label, stats]) => (
                    <div key={label} className="flex flex-col items-center group">
                      <div className="relative mb-4">
                        {/* Tooltip */}
                        <div className={`absolute -top-12 left-1/2 transform -translate-x-1/2 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300
                          bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg
                          before:content-[''] before:absolute before:top-full before:left-1/2 
                          before:transform before:-translate-x-1/2 before:border-4 
                          before:border-transparent before:border-t-gray-800`}>
                          {stats.count} review ({stats.percentage}%)
                        </div>
                        
                        {/* Bar */}
                        <div 
                          className={`w-16 rounded-t-xl transition-all duration-700 ease-out shadow-lg
                            group-hover:shadow-xl transform group-hover:scale-105 ${
                            label === 'Positif' ? 
                              'bg-gradient-to-t from-green-400 via-green-500 to-green-600 hover:from-green-500 hover:to-green-700' :
                              'bg-gradient-to-t from-red-400 via-red-500 to-red-600 hover:from-red-500 hover:to-red-700'
                          }`}
                          style={{ 
                            height: `${Math.max(stats.percentage * 1.8, 20)}px`,
                            animation: `growBar 1s ease-out ${Object.keys(sentimentStats).indexOf(label) * 0.2}s both`
                          }}
                        >
                          {/* Percentage label on bar */}
                          <div className="flex items-center justify-center h-full">
                            <span className="text-white font-bold text-sm transform -rotate-0">
                              {stats.percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Label and icon */}
                      <div className="text-center">
                        <div className="mb-2">
                          {label === 'Positif' ? 
                            <span className="text-3xl">😊</span> : 
                            <span className="text-3xl">😞</span>
                          }
                        </div>
                        <span className="text-base font-semibold text-gray-700">{label}</span>
                        <div className="text-sm text-gray-500 mt-1">{stats.count} review</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add custom CSS for animation */}
              <style jsx>{`
                @keyframes growBar {
                  from {
                    height: 0px;
                  }
                  to {
                    height: ${Math.max(Object.entries(sentimentStats)[0]?.[1]?.percentage * 1.8, 20)}px;
                  }
                }
              `}</style>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-12 text-center mb-8">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Data sentimen tidak tersedia</h4>
              <p className="text-gray-500">Tidak ada review yang dapat dianalisis untuk tempat ini</p>
            </div>
          )}

          {/* Sample Reviews - Now showing 10 reviews */}
          {reviewsSentiment.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-gray-800 pl-4">Review Terbaru</h4>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Menampilkan {Math.min(10, reviewsSentiment.length)} dari {reviewsSentiment.length} review
                </span>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                {reviewsSentiment.slice(0, 10).map((review, index) => (
                  <div key={index} className={`border rounded-xl p-5 transition-all duration-200 hover:shadow-md ${getSentimentBgClass(review.sentiment)}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white rounded-full p-2 shadow-sm">
                          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">
                            {review.authorAttribution?.displayName || 'Pengguna Anonim'}
                          </span>
                          <div className="flex items-center mt-1">
                            <div className="flex items-center mr-3">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-4 h-4 ${i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="ml-1 text-sm text-gray-600">{review.rating || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getSentimentIcon(review.sentiment)}
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                          review.sentiment === 1 ? 'bg-green-500 text-white' :
                          'bg-red-500 text-white'
                        }`}>
                          {review.sentimentLabel}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {(review.text?.text || review.originalText?.text || '').substring(0, 250)}
                      {(review.text?.text || review.originalText?.text || '').length > 250 ? '...' : ''}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {review.publishTime ? new Date(review.publishTime).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Tanggal tidak tersedia'}
                      </span>
                      <span className="text-xs bg-white px-2 py-1 rounded">
                        Review #{index + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {reviewsSentiment.length > 10 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    Dan {reviewsSentiment.length - 10} review lainnya...
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}