from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CharacterBase(BaseModel):
    name: str
    description: Optional[str] = None

class CharacterCreate(CharacterBase):
    pass

class CharacterUpdate(CharacterBase):
    name: Optional[str] = None

class CharacterResponse(CharacterBase):
    id: str
    user_id: str
    embedding_vector: Optional[str] = None
    is_public: bool
    character_data: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CharacterImageBase(BaseModel):
    image_url: str
    image_type: str = "reference"
    file_size: Optional[str] = None
    mime_type: Optional[str] = None

class CharacterImageCreate(CharacterImageBase):
    pass

class CharacterImageResponse(CharacterImageBase):
    id: str
    character_id: str
    created_at: datetime

    class Config:
        from_attributes = True 