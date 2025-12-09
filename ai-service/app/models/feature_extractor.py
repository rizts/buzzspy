import re
from datetime import datetime, timezone
from typing import Dict, List
import numpy as np
from app.schemas.tweet import Tweet, Author
from app.config import settings


class FeatureExtractor:
    """Extract features from tweets for buzzer detection"""
    
    # Patterns yang sering digunakan buzzer
    BUZZER_PATTERNS = [
        r'BREAKING:',
        r'URGENT:',
        r'VIRAL:',
        r'THREAD 🧵',
        r'WAJIB TAHU',
        r'FAKTA SEBENARNYA',
    ]
    
    # Kata-kata yang sering di-capitalize buzzer
    CAPS_TRIGGERS = ['BREAKING', 'URGENT', 'VIRAL', 'HOAX', 'FAKTA']
    
    def extract_features(self, tweet: Tweet) -> Dict[str, float]:
        """Extract all features from a tweet"""
        
        features = {
            # Account features
            'account_age_days': self._get_account_age(tweet.author),
            'follower_ratio': self._get_follower_ratio(tweet.author),
            'is_new_account': self._is_new_account(tweet.author),
            'is_verified': float(tweet.author.verified),
            
            # Content features
            'text_length': len(tweet.text),
            'hashtag_count': len(tweet.entities.hashtags),
            'mention_count': len(tweet.entities.mentions),
            'url_count': len(tweet.entities.urls),
            'has_excessive_hashtags': float(len(tweet.entities.hashtags) >= 4),
            
            # Pattern features
            'has_buzzer_pattern': self._has_buzzer_pattern(tweet.text),
            'caps_ratio': self._calculate_caps_ratio(tweet.text),
            'emoji_count': self._count_emojis(tweet.text),
            'exclamation_count': tweet.text.count('!'),
            
            # Engagement features (normalized)
            'engagement_rate': self._calculate_engagement_rate(tweet),
            'retweet_ratio': self._calculate_retweet_ratio(tweet),
        }
        
        return features
    
    def _get_account_age(self, author: Author) -> float:
        """Calculate account age in days"""
        try:
            created = datetime.fromisoformat(author.created_at.replace('Z', '+00:00'))
            age = (datetime.now(timezone.utc) - created).days
            return float(age)
        except:
            return 365.0  # Default to 1 year if parse fails
    
    def _is_new_account(self, author: Author) -> float:
        """Check if account is suspiciously new (< 90 days)"""
        age = self._get_account_age(author)
        return float(age < settings.min_account_age_days)
    
    def _get_follower_ratio(self, author: Author) -> float:
        """Calculate following/follower ratio (high = suspicious)"""
        if author.followers == 0:
            return 10.0  # Maximum suspicious score
        
        ratio = author.following / author.followers
        return min(ratio, 10.0)  # Cap at 10
    
    def _has_buzzer_pattern(self, text: str) -> float:
        """Check for common buzzer patterns"""
        text_upper = text.upper()
        
        for pattern in self.BUZZER_PATTERNS:
            if re.search(pattern, text_upper):
                return 1.0
        
        return 0.0
    
    def _calculate_caps_ratio(self, text: str) -> float:
        """Calculate ratio of CAPS words (buzzers love CAPS)"""
        words = text.split()
        if not words:
            return 0.0
        
        caps_words = sum(1 for word in words if word.isupper() and len(word) > 2)
        return caps_words / len(words)
    
    def _count_emojis(self, text: str) -> float:
        """Count emojis (buzzers often use excessive emojis)"""
        # Simple emoji detection using unicode ranges
        emoji_pattern = re.compile(
            "["
            u"\U0001F600-\U0001F64F"  # emoticons
            u"\U0001F300-\U0001F5FF"  # symbols & pictographs
            u"\U0001F680-\U0001F6FF"  # transport & map symbols
            u"\U0001F1E0-\U0001F1FF"  # flags
            u"\U00002702-\U000027B0"
            u"\U000024C2-\U0001F251"
            "]+", flags=re.UNICODE
        )
        
        emojis = emoji_pattern.findall(text)
        return float(len(emojis))
    
    def _calculate_engagement_rate(self, tweet: Tweet) -> float:
        """Calculate normalized engagement rate"""
        total_engagement = (
            tweet.metrics.likes + 
            tweet.metrics.retweets + 
            tweet.metrics.replies
        )
        
        if tweet.metrics.views == 0:
            return 0.0
        
        # Normalize by views
        rate = total_engagement / tweet.metrics.views
        return min(rate, 1.0)  # Cap at 100%
    
    def _calculate_retweet_ratio(self, tweet: Tweet) -> float:
        """High retweet ratio can indicate coordinated activity"""
        total_engagement = (
            tweet.metrics.likes + 
            tweet.metrics.retweets + 
            tweet.metrics.replies
        )
        
        if total_engagement == 0:
            return 0.0
        
        return tweet.metrics.retweets / total_engagement
    
    def get_feature_vector(self, tweet: Tweet) -> np.ndarray:
        """Get feature vector as numpy array for ML model"""
        features = self.extract_features(tweet)
        
        # Return features in consistent order
        feature_order = [
            'account_age_days',
            'follower_ratio',
            'is_new_account',
            'is_verified',
            'text_length',
            'hashtag_count',
            'has_excessive_hashtags',
            'has_buzzer_pattern',
            'caps_ratio',
            'emoji_count',
            'exclamation_count',
            'engagement_rate',
            'retweet_ratio',
        ]
        
        vector = [features.get(key, 0.0) for key in feature_order]
        return np.array(vector, dtype=np.float32)


# Singleton instance
feature_extractor = FeatureExtractor()