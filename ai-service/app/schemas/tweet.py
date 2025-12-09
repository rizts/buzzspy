from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class Author(BaseModel):
    id: str
    username: str
    display_name: str
    followers: int
    following: int
    verified: bool
    created_at: str


class Metrics(BaseModel):
    likes: int
    retweets: int
    replies: int
    views: int


class Entities(BaseModel):
    hashtags: List[str]
    mentions: List[str]
    urls: List[str]


class Tweet(BaseModel):
    id: str
    text: str
    author: Author
    created_at: str
    metrics: Metrics
    entities: Entities


class BuzzerDetectionRequest(BaseModel):
    tweet: Tweet


class BuzzerDetectionResponse(BaseModel):
    tweet_id: str
    buzzer_score: float = Field(..., ge=0.0, le=1.0)
    is_buzzer: bool
    reasons: List[str]
    cluster_id: Optional[str] = None
    confidence: float = Field(..., ge=0.0, le=1.0)
    analyzed_at: str
    features: Optional[dict] = None


class BatchDetectionRequest(BaseModel):
    tweets: List[Tweet]
    threshold: float = 0.7


class BatchDetectionResponse(BaseModel):
    results: List[BuzzerDetectionResponse]
    total_buzzers: int
    buzzer_rate: float
    processing_time_ms: float


class TrendingTopicRequest(BaseModel):
    tweets: List[Tweet]
    min_cluster_size: int = 5


class TrendingTopic(BaseModel):
    topic: str
    tweet_count: int
    buzzer_percentage: float
    top_hashtags: List[str]
    sentiment: str  # positive, negative, neutral
    suspicious_score: float


class TrendingTopicsResponse(BaseModel):
    topics: List[TrendingTopic]
    analyzed_count: int
    timestamp: str