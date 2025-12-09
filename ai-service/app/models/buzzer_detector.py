import numpy as np
from typing import List, Tuple
from datetime import datetime
from app.schemas.tweet import Tweet, BuzzerDetectionResponse
from app.models.feature_extractor import feature_extractor
from app.config import settings


class BuzzerDetector:
    """
    Rule-based + heuristic buzzer detection
    (In production, this would be a trained ML model)
    """
    
    def __init__(self):
        # Feature weights (manually tuned, in production would be learned)
        self.weights = {
            'is_new_account': 0.25,
            'follower_ratio': 0.15,
            'has_excessive_hashtags': 0.20,
            'has_buzzer_pattern': 0.15,
            'caps_ratio': 0.10,
            'emoji_count': 0.05,
            'exclamation_count': 0.05,
            'retweet_ratio': 0.05,
        }
    
    def detect(self, tweet: Tweet) -> BuzzerDetectionResponse:
        """
        Detect if a tweet is from a buzzer account
        Returns detection result with score and reasons
        """
        
        # Extract features
        features = feature_extractor.extract_features(tweet)
        
        # Calculate buzzer score
        score, reasons = self._calculate_buzzer_score(features)
        
        # Determine if buzzer
        is_buzzer = score >= settings.buzzer_threshold
        
        # Calculate confidence based on number of strong signals
        confidence = self._calculate_confidence(features, reasons)
        
        return BuzzerDetectionResponse(
            tweet_id=tweet.id,
            buzzer_score=round(score, 3),
            is_buzzer=is_buzzer,
            reasons=reasons,
            cluster_id=None,  # Will be set by clustering service
            confidence=round(confidence, 3),
            analyzed_at=datetime.utcnow().isoformat() + 'Z',
            features=features,
        )
    
    def _calculate_buzzer_score(
        self, 
        features: dict
    ) -> Tuple[float, List[str]]:
        """
        Calculate buzzer probability score (0-1)
        Returns (score, list of reasons)
        """
        
        score = 0.0
        reasons = []
        
        # Check: New account (< 90 days)
        if features['is_new_account'] == 1.0:
            score += self.weights['is_new_account']
            age = int(features['account_age_days'])
            reasons.append(f"New account (created {age} days ago)")
        
        # Check: Suspicious follower ratio
        if features['follower_ratio'] > 2.0:
            score += self.weights['follower_ratio']
            ratio = features['follower_ratio']
            reasons.append(f"High following/follower ratio ({ratio:.1f})")
        
        # Check: Excessive hashtags
        if features['has_excessive_hashtags'] == 1.0:
            score += self.weights['has_excessive_hashtags']
            count = int(features['hashtag_count'])
            reasons.append(f"Excessive hashtag usage ({count} hashtags)")
        
        # Check: Buzzer patterns
        if features['has_buzzer_pattern'] == 1.0:
            score += self.weights['has_buzzer_pattern']
            reasons.append("Contains buzzer trigger words (BREAKING/URGENT)")
        
        # Check: Excessive CAPS
        if features['caps_ratio'] > 0.3:
            score += self.weights['caps_ratio']
            pct = int(features['caps_ratio'] * 100)
            reasons.append(f"Excessive capitalization ({pct}% CAPS)")
        
        # Check: Emoji stuffing
        if features['emoji_count'] >= 5:
            score += self.weights['emoji_count']
            count = int(features['emoji_count'])
            reasons.append(f"Excessive emoji usage ({count} emojis)")
        
        # Check: Multiple exclamations
        if features['exclamation_count'] >= 3:
            score += self.weights['exclamation_count']
            count = int(features['exclamation_count'])
            reasons.append(f"Multiple exclamation marks ({count})")
        
        # Check: Suspicious retweet ratio
        if features['retweet_ratio'] > 0.7:
            score += self.weights['retweet_ratio']
            reasons.append("Unusually high retweet ratio")
        
        # Verified accounts get penalty (less likely to be buzzer)
        if features['is_verified'] == 1.0:
            score *= 0.5
            reasons.append("Verified account (lower risk)")
        
        return min(score, 1.0), reasons
    
    def _calculate_confidence(
        self, 
        features: dict, 
        reasons: List[str]
    ) -> float:
        """
        Calculate confidence in the detection
        More signals = higher confidence
        """
        
        # Base confidence on number of signals
        signal_count = len(reasons)
        
        if signal_count == 0:
            return 0.5  # Low confidence (no signals)
        elif signal_count <= 2:
            return 0.6
        elif signal_count <= 4:
            return 0.75
        elif signal_count <= 6:
            return 0.85
        else:
            return 0.95  # Very high confidence (many signals)
    
    def batch_detect(
        self, 
        tweets: List[Tweet]
    ) -> List[BuzzerDetectionResponse]:
        """Detect buzzers in batch"""
        
        results = []
        for tweet in tweets:
            result = self.detect(tweet)
            results.append(result)
        
        return results


# Singleton instance
buzzer_detector = BuzzerDetector()