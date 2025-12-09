import time
from typing import List
from app.schemas.tweet import (
    Tweet,
    BuzzerDetectionResponse,
    BatchDetectionResponse,
    TrendingTopicsResponse,
    TrendingTopicRequest,
)
from app.models.buzzer_detector import buzzer_detector
from app.services.trending import trending_analyzer
from datetime import datetime


class DetectionService:
    """Main service for buzzer detection and analysis"""
    
    def __init__(self):
        self.total_analyzed = 0
        self.total_buzzers_detected = 0
    
    async def detect_single(self, tweet: Tweet) -> BuzzerDetectionResponse:
        """Detect buzzer for single tweet"""
        
        self.total_analyzed += 1
        result = buzzer_detector.detect(tweet)
        
        if result.is_buzzer:
            self.total_buzzers_detected += 1
        
        return result
    
    async def detect_batch(
        self, 
        tweets: List[Tweet],
        threshold: float = 0.7
    ) -> BatchDetectionResponse:
        """Detect buzzers for multiple tweets"""
        
        start_time = time.time()
        
        # Detect all tweets
        results = buzzer_detector.batch_detect(tweets)
        
        # Count buzzers
        buzzer_count = sum(1 for r in results if r.is_buzzer)
        buzzer_rate = (buzzer_count / len(tweets)) if tweets else 0.0
        
        # Update stats
        self.total_analyzed += len(tweets)
        self.total_buzzers_detected += buzzer_count
        
        processing_time = (time.time() - start_time) * 1000  # Convert to ms
        
        return BatchDetectionResponse(
            results=results,
            total_buzzers=buzzer_count,
            buzzer_rate=round(buzzer_rate, 3),
            processing_time_ms=round(processing_time, 2),
        )
    
    async def analyze_trending(
        self, 
        request: TrendingTopicRequest
    ) -> TrendingTopicsResponse:
        """Analyze trending topics from tweets"""
        
        topics = trending_analyzer.analyze_trends(
            tweets=request.tweets,
            min_cluster_size=request.min_cluster_size,
        )
        
        return TrendingTopicsResponse(
            topics=topics,
            analyzed_count=len(request.tweets),
            timestamp=datetime.utcnow().isoformat() + 'Z',
        )
    
    def get_stats(self) -> dict:
        """Get service statistics"""
        
        return {
            'total_analyzed': self.total_analyzed,
            'total_buzzers_detected': self.total_buzzers_detected,
            'buzzer_rate': (
                round(self.total_buzzers_detected / self.total_analyzed, 3)
                if self.total_analyzed > 0
                else 0.0
            ),
        }


# Singleton instance
detection_service = DetectionService()