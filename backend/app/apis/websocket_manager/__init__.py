from typing import Dict, Any, Set, List, Optional
from enum import Enum
from fastapi import WebSocket, WebSocketDisconnect
from fastapi import APIRouter

router = APIRouter(prefix="/api/websocket", tags=["websocket"])

class EventType(str, Enum):
    MODERATION = "moderation"
    ANALYTICS = "analytics"
    USER_ACTIVITY = "user_activity"
    SYSTEM = "system"

class WebSocketManager:
    def __init__(self):
        # Room-based connections (e.g. tickets)
        self.room_connections: Dict[str, Set[WebSocket]] = {}
        # Admin connections by event type
        self.admin_connections: Dict[EventType, Set[WebSocket]] = {
            event_type: set() for event_type in EventType
        }

    async def connect_to_room(self, websocket: WebSocket, room_id: str):
        """Connect a websocket to a room (e.g. ticket)"""
        await websocket.accept()
        if room_id not in self.room_connections:
            self.room_connections[room_id] = set()
        self.room_connections[room_id].add(websocket)

    def disconnect_from_room(self, websocket: WebSocket, room_id: str):
        """Disconnect a websocket from a room"""
        if room_id in self.room_connections:
            self.room_connections[room_id].discard(websocket)
            if not self.room_connections[room_id]:
                del self.room_connections[room_id]

    async def connect_admin(self, websocket: WebSocket, event_types: Optional[List[EventType]] = None):
        """Connect an admin websocket to receive specific event types"""
        await websocket.accept()
        types_to_connect = event_types or list(EventType)
        for event_type in types_to_connect:
            self.admin_connections[event_type].add(websocket)

    def disconnect_admin(self, websocket: WebSocket):
        """Disconnect an admin websocket from all event types"""
        for connections in self.admin_connections.values():
            connections.discard(websocket)

    async def broadcast_to_room(self, room_id: str, event_type: str, data: Any):
        """Broadcast a message to all connected clients in a room"""
        if room_id not in self.room_connections:
            return

        message = {
            "type": event_type,
            "data": data
        }

        # Keep track of dead connections to remove
        dead_connections = set()

        for connection in self.room_connections[room_id]:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error sending message to websocket: {str(e)}")
                dead_connections.add(connection)

        # Remove dead connections
        for dead in dead_connections:
            self.disconnect_from_room(dead, room_id)

    async def broadcast_admin_event(self, event_type: EventType, data: Any):
        """Broadcast an admin event to all connected admin clients"""
        if event_type not in self.admin_connections:
            return

        message = {
            "type": event_type,
            "data": data
        }

        # Keep track of dead connections to remove
        dead_connections = set()

        for connection in self.admin_connections[event_type]:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error sending message to admin websocket: {str(e)}")
                dead_connections.add(connection)

        # Remove dead connections
        for dead in dead_connections:
            self.disconnect_admin(dead)

@router.websocket("/admin")
async def admin_websocket(websocket: WebSocket, event_types: Optional[str] = None):
    """WebSocket endpoint for admin connections"""
    try:
        # Parse event types from query param
        types_to_connect = None
        if event_types:
            types_to_connect = [EventType(t) for t in event_types.split(",")]

        await manager.connect_admin(websocket, types_to_connect)
        
        try:
            while True:
                # Keep connection alive and handle any incoming messages
                data = await websocket.receive_json()
                # Handle any admin messages if needed
                print(f"Received admin message: {data}")
        except WebSocketDisconnect:
            manager.disconnect_admin(websocket)
    except Exception as e:
        print(f"Error in admin websocket: {str(e)}")
        try:
            await websocket.close()
        except:
            pass

@router.websocket("/room/{room_id}")
async def room_websocket(websocket: WebSocket, room_id: str):
    """WebSocket endpoint for room connections"""
    try:
        await manager.connect_to_room(websocket, room_id)
        
        try:
            while True:
                # Keep connection alive and handle any incoming messages
                data = await websocket.receive_json()
                # Handle any room messages if needed
                print(f"Received room message: {data}")
        except WebSocketDisconnect:
            manager.disconnect_from_room(websocket, room_id)
    except Exception as e:
        print(f"Error in room websocket: {str(e)}")
        try:
            await websocket.close()
        except:
            pass

manager = WebSocketManager()
