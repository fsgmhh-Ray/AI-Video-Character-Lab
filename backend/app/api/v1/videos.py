from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db
from ...core.security import get_current_user
from ...models.user import User
from ...models.character import Character
from ...models.video import Video, VideoTask
from ...schemas.video import VideoTaskCreate, VideoTaskResponse, VideoResponse
from ...services.ai_service import ai_service
import json

router = APIRouter()

@router.post("/generate", response_model=VideoTaskResponse)
async def create_video_task(
    task_data: VideoTaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建视频生成任务"""
    # 检查角色是否存在
    character = db.query(Character).filter(
        Character.id == task_data.character_id,
        Character.user_id == current_user.id
    ).first()
    
    if not character:
        raise HTTPException(status_code=404, detail="角色不存在")
    
    # 创建视频任务
    db_task = VideoTask(
        user_id=current_user.id,
        character_id=task_data.character_id,
        script=task_data.script,
        duration=task_data.duration,
        style=task_data.style,
        quality=task_data.quality
    )
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    return db_task

@router.get("/tasks", response_model=List[VideoTaskResponse])
async def get_video_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """获取用户的视频任务列表"""
    tasks = db.query(VideoTask).filter(
        VideoTask.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return tasks

@router.get("/tasks/{task_id}", response_model=VideoTaskResponse)
async def get_video_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取单个视频任务"""
    task = db.query(VideoTask).filter(
        VideoTask.id == task_id,
        VideoTask.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    return task

@router.get("/", response_model=List[VideoResponse])
async def get_videos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """获取用户的视频列表"""
    videos = db.query(Video).filter(
        Video.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return videos

@router.websocket("/ws/{task_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    task_id: str,
    db: Session = Depends(get_db)
):
    """WebSocket连接用于实时任务进度"""
    await websocket.accept()
    
    try:
        while True:
            # 获取任务状态
            task = db.query(VideoTask).filter(VideoTask.id == task_id).first()
            if not task:
                await websocket.send_text(json.dumps({"error": "任务不存在"}))
                break
            
            # 发送任务状态
            await websocket.send_text(json.dumps({
                "task_id": str(task.id),
                "status": task.status,
                "progress": task.progress,
                "estimated_time": task.estimated_time
            }))
            
            # 如果任务完成，发送结果
            if task.status == "completed":
                await websocket.send_text(json.dumps({
                    "status": "completed",
                    "video_id": str(task.video_id) if task.video_id else None
                }))
                break
            
            # 等待一段时间再发送更新
            import asyncio
            await asyncio.sleep(2)
            
    except WebSocketDisconnect:
        print(f"WebSocket断开连接: {task_id}")
    except Exception as e:
        await websocket.send_text(json.dumps({"error": str(e)})) 