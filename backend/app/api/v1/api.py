from fastapi import APIRouter
from .auth import router as auth_router
from .characters import router as characters_router
from .upload import router as upload_router
from .videos import router as videos_router
from .websocket import router as websocket_router

api_router = APIRouter()

# 包含认证路由
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])

# 包含角色管理路由
api_router.include_router(characters_router, prefix="/characters", tags=["characters"])

# 包含文件上传路由
api_router.include_router(upload_router, prefix="/upload", tags=["upload"])

# 包含视频生成路由
api_router.include_router(videos_router, prefix="/videos", tags=["videos"])

# 包含WebSocket路由
api_router.include_router(websocket_router, tags=["websocket"]) 