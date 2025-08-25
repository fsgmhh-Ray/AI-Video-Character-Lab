from fastapi import APIRouter
from .auth import router as auth_router
from .characters import router as characters_router

api_router = APIRouter()

# 包含认证路由
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])

# 包含角色管理路由
api_router.include_router(characters_router, prefix="/characters", tags=["characters"]) 