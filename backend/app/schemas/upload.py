from pydantic import BaseModel
from typing import List, Optional

class ImageUploadResponse(BaseModel):
    id: str
    filename: str
    url: str
    file_size: int
    mime_type: str
    quality_score: float
    recommendations: List[str]

class BatchUploadResponse(BaseModel):
    total_uploaded: int
    total_failed: int
    uploaded_images: List[ImageUploadResponse]
    failed_files: List[str]

class UploadProgress(BaseModel):
    character_id: str
    total_files: int
    processed_files: int
    current_file: str
    status: str  # 'uploading', 'processing', 'completed', 'failed' 