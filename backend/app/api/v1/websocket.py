from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from ...core.security import get_current_user_websocket
from ...core.database import get_db
from sqlalchemy.orm import Session
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"用户 {user_id} 连接成功")
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"用户 {user_id} 断开连接")
    
    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message)
                except Exception as e:
                    logger.error(f"发送消息失败: {e}")
                    self.disconnect(connection, user_id)
    
    async def broadcast(self, message: str):
        for user_id in list(self.active_connections.keys()):
            await self.send_personal_message(message, user_id)

manager = ConnectionManager()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: str,
    token: str = None
):
    """WebSocket连接端点"""
    try:
        # 验证用户身份
        if token:
            user = await get_current_user_websocket(token)
            if not user or str(user.id) != user_id:
                await websocket.close(code=4001, reason="身份验证失败")
                return
        else:
            # 如果没有token，允许连接但记录警告
            logger.warning(f"用户 {user_id} 连接时没有提供token")
        
        await manager.connect(websocket, user_id)
        
        try:
            while True:
                # 接收消息
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # 处理不同类型的消息
                if message.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
                elif message.get("type") == "task_progress":
                    # 处理任务进度更新
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "task_progress_update",
                            "task_id": message.get("task_id"),
                            "progress": message.get("progress", 0)
                        }),
                        user_id
                    )
                else:
                    # 回显消息
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "echo",
                            "message": message.get("message", "收到消息")
                        }),
                        user_id
                    )
                    
        except WebSocketDisconnect:
            manager.disconnect(websocket, user_id)
            
    except Exception as e:
        logger.error(f"WebSocket连接错误: {e}")
        try:
            await websocket.close(code=4000, reason="服务器错误")
        except:
            pass 