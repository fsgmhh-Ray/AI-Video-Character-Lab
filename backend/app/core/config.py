from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # 应用基本配置
    app_name: str = "AI Video Character Lab"
    app_version: str = "0.1.0"
    environment: str = "development"
    debug: bool = True
    
    # 服务器配置
    host: str = "0.0.0.0"
    port: int = 8000
    
    # 数据库配置
    database_url: str = "sqlite:///./test.db"  # 默认使用SQLite
    postgres_url: Optional[str] = None
    
    # 如果设置了PostgreSQL URL，优先使用
    @property
    def db_url(self) -> str:
        return self.postgres_url or self.database_url
    
    # 安全配置
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS配置
    cors_origins: List[str] = ["*"]
    
    # 文件上传配置
    upload_dir: str = "./uploads"
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    
    # AI服务配置
    openai_api_key: Optional[str] = None
    runway_api_key: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings() 