from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class VideoBase(BaseModel):
    title: str
    description: Optional[str] = None
    script: str
    character_id: str
    duration: Optional[int] = 30  # 秒
    style: Optional[str] = "realistic"  # realistic, cartoon, artistic

class VideoCreate(VideoBase):
    pass

class VideoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    script: Optional[str] = None
    duration: Optional[int] = None
    style: Optional[str] = None

class VideoResponse(VideoBase):
    id: str
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    status: str  # pending, processing, completed, failed
    created_at: datetime
    user_id: str

class VideoTaskCreate(BaseModel):
    character_id: str
    script: str
    duration: int = 30
    style: str = "realistic"
    quality: str = "standard"  # standard, high, ultra

class VideoTaskResponse(BaseModel):
    id: str
    status: str  # pending, processing, completed, failed
    progress: int  # 0-100
    estimated_time: Optional[int] = None  # 秒
    created_at: datetime

class VideoGenerationRequest(BaseModel):
    character_id: str
    script: str
    duration: int = 30
    style: str = "realistic"
    quality: str = "standard"  # standard, high, ultra
    background_music: Optional[str] = None
    voice_over: Optional[str] = None

class VideoGenerationResponse(BaseModel):
    task_id: str
    status: str
    estimated_completion: datetime
    progress_url: str 