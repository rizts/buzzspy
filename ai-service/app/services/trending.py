from typing import List, Dict
from collections import Counter, defaultdict
from datetime import datetime
from app.schemas.tweet import Tweet, TrendingTopic
from app.models.buzzer_detector import buzzer_detector


class TrendingAnalyzer:
    """Analyze trending topics and detect artificial trends"""
    
    def analyze_trends(
        self, 
        tweets: List[Tweet],
        min_cluster_size: int = 5
    ) -> List[TrendingTopic]:
        """
        Analyze tweets to find trending topics
        Detect if trends are artificially boosted by buzzers
        """
        
        # Group tweets by hashtags
        hashtag_groups = self._group_by_hashtags(tweets)
        
        # Analyze each hashtag cluster
        trending_topics = []
        
        for hashtag, tweet_group in hashtag_groups.items():
            if len(tweet_group) < min_cluster_size:
                continue
            
            # Detect buzzers in this cluster
            buzzer_count = self._count_buzzers(tweet_group)
            buzzer_pct = (buzzer_count / len(tweet_group)) * 100
            
            # Calculate sentiment
            sentiment = self._analyze_sentiment(tweet_group)
            
            # Calculate suspicious score
            suspicious_score = self._calculate_suspicious_score(
                tweet_group, 
                buzzer_pct
            )
            
            # Get top hashtags in this cluster
            top_hashtags = self._get_top_hashtags(tweet_group, limit=5)
            
            trending_topics.append(TrendingTopic(
                topic=hashtag,
                tweet_count=len(tweet_group),
                buzzer_percentage=round(buzzer_pct, 2),
                top_hashtags=top_hashtags,
                sentiment=sentiment,
                suspicious_score=round(suspicious_score, 3),
            ))
        
        # Sort by tweet count (most popular first)
        trending_topics.sort(key=lambda x: x.tweet_count, reverse=True)
        
        return trending_topics
    
    def _group_by_hashtags(
        self, 
        tweets: List[Tweet]
    ) -> Dict[str, List[Tweet]]:
        """Group tweets by their primary hashtag"""
        
        groups = defaultdict(list)
        
        for tweet in tweets:
            if tweet.entities.hashtags:
                # Use first hashtag as primary
                primary = tweet.entities.hashtags[0]
                groups[primary].append(tweet)
        
        return dict(groups)
    
    def _count_buzzers(self, tweets: List[Tweet]) -> int:
        """Count how many tweets are from buzzers"""
        
        buzzer_count = 0
        
        for tweet in tweets:
            result = buzzer_detector.detect(tweet)
            if result.is_buzzer:
                buzzer_count += 1
        
        return buzzer_count
    
    def _analyze_sentiment(self, tweets: List[Tweet]) -> str:
        """
        Simple sentiment analysis based on keywords
        (In production, use proper NLP model)
        """
        
        positive_words = [
            'bagus', 'hebat', 'sukses', 'berhasil', 'mantap', 
            'luar biasa', 'positif', 'setuju', 'mendukung'
        ]
        
        negative_words = [
            'gagal', 'buruk', 'salah', 'korupsi', 'hoax',
            'bohong', 'negatif', 'tolak', 'menolak', 'protes'
        ]
        
        positive_count = 0
        negative_count = 0
        
        for tweet in tweets:
            text_lower = tweet.text.lower()
            
            for word in positive_words:
                if word in text_lower:
                    positive_count += 1
            
            for word in negative_words:
                if word in text_lower:
                    negative_count += 1
        
        if positive_count > negative_count * 1.5:
            return 'positive'
        elif negative_count > positive_count * 1.5:
            return 'negative'
        else:
            return 'neutral'
    
    def _calculate_suspicious_score(
        self, 
        tweets: List[Tweet],
        buzzer_percentage: float
    ) -> float:
        """
        Calculate how suspicious this trend is
        High buzzer % + coordinated timing = very suspicious
        """
        
        score = 0.0
        
        # Factor 1: Buzzer percentage (0-0.5 score)
        score += min(buzzer_percentage / 100, 0.5)
        
        # Factor 2: Account diversity (0-0.25 score)
        unique_authors = len(set(t.author.username for t in tweets))
        diversity = unique_authors / len(tweets)
        score += (1 - diversity) * 0.25  # Low diversity = suspicious
        
        # Factor 3: Time clustering (0-0.25 score)
        time_clustering = self._calculate_time_clustering(tweets)
        score += time_clustering * 0.25
        
        return min(score, 1.0)
    
    def _calculate_time_clustering(self, tweets: List[Tweet]) -> float:
        """
        Measure if tweets are suspiciously clustered in time
        (Coordinated buzzer activity)
        """
        
        if len(tweets) < 3:
            return 0.0
        
        try:
            timestamps = [
                datetime.fromisoformat(t.created_at.replace('Z', '+00:00'))
                for t in tweets
            ]
            timestamps.sort()
            
            # Calculate time gaps between consecutive tweets
            gaps = [
                (timestamps[i+1] - timestamps[i]).total_seconds()
                for i in range(len(timestamps) - 1)
            ]
            
            # If many tweets within 5 minutes = suspicious
            short_gaps = sum(1 for gap in gaps if gap < 300)  # 5 minutes
            clustering_ratio = short_gaps / len(gaps)
            
            return clustering_ratio
            
        except:
            return 0.0
    
    def _get_top_hashtags(
        self, 
        tweets: List[Tweet], 
        limit: int = 5
    ) -> List[str]:
        """Get most common hashtags in tweet cluster"""
        
        all_hashtags = []
        for tweet in tweets:
            all_hashtags.extend(tweet.entities.hashtags)
        
        counter = Counter(all_hashtags)
        return [tag for tag, _ in counter.most_common(limit)]


# Singleton instance
trending_analyzer = TrendingAnalyzer()