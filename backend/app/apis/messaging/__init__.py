from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Set, Optional
from datetime import datetime
import json
from pydantic import BaseModel

router = APIRouter(prefix="/api/messaging", tags=["messaging", "stream"])

class ConnectionManager:
    def __init__(self):
        # Store active connections by ticket_id
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, ticket_id: str):
        await websocket.accept()
        if ticket_id not in self.active_connections:
            self.active_connections[ticket_id] = set()
        self.active_connections[ticket_id].add(websocket)

    def disconnect(self, websocket: WebSocket, ticket_id: str):
        if ticket_id in self.active_connections:
            self.active_connections[ticket_id].discard(websocket)
            if not self.active_connections[ticket_id]:
                del self.active_connections[ticket_id]

    async def broadcast_to_ticket(
        self,
        ticket_id: str,
        message_type: str,
        data: dict,
        exclude: Optional[WebSocket] = None
    ):
        if ticket_id in self.active_connections:
            message = {
                "type": message_type,
                "data": data,
                "timestamp": datetime.utcnow().isoformat()
            }
            for connection in self.active_connections[ticket_id]:
                if connection != exclude:
                    try:
                        await connection.send_json(message)
                    except:
                        # Connection might be closed
                        pass

manager = ConnectionManager()

@router.websocket("/ws/comments/{ticket_id}")
async def websocket_endpoint(websocket: WebSocket, ticket_id: str):
    await manager.connect(websocket, ticket_id)
    try:
        while True:
            # Keep the connection alive and handle incoming messages
            data = await websocket.receive_json()
            # Handle any client-side messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket, ticket_id)
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
        manager.disconnect(websocket, ticket_id)
