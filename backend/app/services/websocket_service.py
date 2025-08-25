import asyncio
import json
import logging
from typing import Dict, Set, Optional
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # 存储活跃连接
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # 存储用户连接
        self.user_connections: Dict[str, WebSocket] = {}
        
    async def connect(self, websocket: WebSocket, user_id: str, connection_type: str = "general"):
        """建立WebSocket连接"""
        await websocket.accept()
        
        # 添加到活跃连接
        if connection_type not in self.active_connections:
            self.active_connections[connection_type] = set()
        self.active_connections[connection_type].add(websocket)
        
        # 添加到用户连接
        self.user_connections[user_id] = websocket
        
        logger.info(f"User {user_id} connected to {connection_type}")
        
        # 发送连接确认
        await self.send_personal_message({
            "type": "connection_established",
            "message": "WebSocket连接已建立",
            "timestamp": datetime.utcnow().isoformat()
        }, websocket)
    
    def disconnect(self, websocket: WebSocket, user_id: str, connection_type: str = "general"):
        """断开WebSocket连接"""
        if connection_type in self.active_connections:
            self.active_connections[connection_type].discard(websocket)
        
        if user_id in self.user_connections:
            del self.user_connections[user_id]
        
        logger.info(f"User {user_id} disconnected from {connection_type}")
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """发送个人消息"""
        try:
            await websocket.send_text(json.dumps(message, ensure_ascii=False))
        except Exception as e:
            logger.error(f"Failed to send personal message: {e}")
    
    async def send_to_user(self, user_id: str, message: dict):
        """发送消息给特定用户"""
        if user_id in self.user_connections:
            websocket = self.user_connections[user_id]
            await self.send_personal_message(message, websocket)
    
    async def broadcast_to_type(self, message: dict, connection_type: str):
        """广播消息给特定类型的连接"""
        if connection_type in self.active_connections:
            disconnected = set()
            for websocket in self.active_connections[connection_type]:
                try:
                    await websocket.send_text(json.dumps(message, ensure_ascii=False))
                except Exception as e:
                    logger.error(f"Failed to broadcast message: {e}")
                    disconnected.add(websocket)
            
            # 清理断开的连接
            for websocket in disconnected:
                self.active_connections[connection_type].discard(websocket)
    
    async def broadcast_to_all(self, message: dict):
        """广播消息给所有连接"""
        for connection_type in self.active_connections:
            await self.broadcast_to_type(message, connection_type)

class ProgressTracker:
    def __init__(self, connection_manager: ConnectionManager):
        self.connection_manager = connection_manager
        self.task_progress: Dict[str, dict] = {}
    
    async def update_task_progress(self, task_id: str, user_id: str, progress: int, status: str, message: str = ""):
        """更新任务进度"""
        self.task_progress[task_id] = {
            "progress": progress,
            "status": status,
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # 发送进度更新给用户
        progress_message = {
            "type": "task_progress_update",
            "task_id": task_id,
            "progress": progress,
            "status": status,
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await self.connection_manager.send_to_user(user_id, progress_message)
        
        logger.info(f"Task {task_id} progress updated: {progress}% - {status}")
    
    async def complete_task(self, task_id: str, user_id: str, result: dict):
        """完成任务"""
        self.task_progress[task_id] = {
            "progress": 100,
            "status": "completed",
            "result": result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # 发送完成通知
        completion_message = {
            "type": "task_completed",
            "task_id": task_id,
            "result": result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await self.connection_manager.send_to_user(user_id, completion_message)
        
        logger.info(f"Task {task_id} completed for user {user_id}")
    
    async def fail_task(self, task_id: str, user_id: str, error: str):
        """任务失败"""
        self.task_progress[task_id] = {
            "progress": 0,
            "status": "failed",
            "error": error,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # 发送失败通知
        failure_message = {
            "type": "task_failed",
            "task_id": task_id,
            "error": error,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await self.connection_manager.send_to_user(user_id, failure_message)
        
        logger.error(f"Task {task_id} failed for user {user_id}: {error}")

# 创建全局实例
connection_manager = ConnectionManager()
progress_tracker = ProgressTracker(connection_manager)

async def websocket_endpoint(websocket: WebSocket, user_id: str, connection_type: str = "general"):
    """WebSocket端点"""
    await connection_manager.connect(websocket, user_id, connection_type)
    
    try:
        while True:
            # 接收消息
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # 处理不同类型的消息
            if message.get("type") == "ping":
                await connection_manager.send_personal_message({
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                }, websocket)
            
            elif message.get("type") == "subscribe_task":
                task_id = message.get("task_id")
                if task_id:
                    # 订阅特定任务的进度更新
                    logger.info(f"User {user_id} subscribed to task {task_id}")
            
            elif message.get("type") == "unsubscribe_task":
                task_id = message.get("task_id")
                if task_id:
                    # 取消订阅
                    logger.info(f"User {user_id} unsubscribed from task {task_id}")
    
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, user_id, connection_type)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        connection_manager.disconnect(websocket, user_id, connection_type) 