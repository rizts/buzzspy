from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from datetime import datetime

from app.config import settings
from app.schemas.tweet import (
    BuzzerDetectionRequest,
    BuzzerDetectionResponse,
    BatchDetectionRequest,
    BatchDetectionResponse,
    TrendingTopicRequest,
    TrendingTopicsResponse,
)
from app.services.detection import detection_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown logic"""
    
    # Startup
    print("🚀 Starting BuzzSpy AI Service...")
    
    if settings.is_replit:
        print(f"🔷 Running on Replit")
        print(f"   Repl: {settings.repl_slug}")
        print(f"   Owner: {settings.repl_owner}")
        public_url = f"https://{settings.repl_slug}.{settings.repl_owner}.repl.co"
        print(f"   Public URL: {public_url}")
    else:
        print("💻 Running locally")
    
    print("✅ AI Service ready!")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down AI Service...")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered buzzer detection service for Twitter/X",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routes

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "endpoints": {
            "health": "GET /health",
            "detect_single": "POST /api/detect",
            "detect_batch": "POST /api/detect/batch",
            "analyze_trending": "POST /api/trending",
            "stats": "GET /api/stats",
        },
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + 'Z',
        "service": settings.app_name,
        "version": settings.app_version,
    }


@app.post("/api/detect", response_model=BuzzerDetectionResponse)
async def detect_buzzer(request: BuzzerDetectionRequest):
    """
    Detect if a single tweet is from a buzzer account
    
    Returns buzzer score (0-1) and reasons for detection
    """
    try:
        result = await detection_service.detect_single(request.tweet)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/detect/batch", response_model=BatchDetectionResponse)
async def detect_buzzers_batch(request: BatchDetectionRequest):
    """
    Detect buzzers for multiple tweets in batch
    
    More efficient than calling /api/detect multiple times
    """
    
    if not request.tweets:
        raise HTTPException(status_code=400, detail="No tweets provided")
    
    if len(request.tweets) > 100:
        raise HTTPException(
            status_code=400, 
            detail="Maximum 100 tweets per batch"
        )
    
    try:
        result = await detection_service.detect_batch(
            tweets=request.tweets,
            threshold=request.threshold,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/trending", response_model=TrendingTopicsResponse)
async def analyze_trending_topics(request: TrendingTopicRequest):
    """
    Analyze tweets to identify trending topics
    
    Detects if trends are artificially boosted by buzzer accounts
    """
    
    if not request.tweets:
        raise HTTPException(status_code=400, detail="No tweets provided")
    
    try:
        result = await detection_service.analyze_trending(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stats")
async def get_statistics():
    """Get service statistics"""
    
    stats = detection_service.get_stats()
    
    return {
        "success": True,
        "data": stats,
        "timestamp": datetime.utcnow().isoformat() + 'Z',
    }


@app.get("/api/model/info")
async def get_model_info():
    """Get information about the detection model"""
    
    return {
        "model_type": "Rule-based + Heuristic",
        "features": [
            "account_age_days",
            "follower_ratio",
            "is_new_account",
            "text_length",
            "hashtag_count",
            "has_buzzer_pattern",
            "caps_ratio",
            "emoji_count",
            "engagement_rate",
        ],
        "threshold": settings.buzzer_threshold,
        "min_account_age_days": settings.min_account_age_days,
        "similarity_threshold": settings.similarity_threshold,
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )