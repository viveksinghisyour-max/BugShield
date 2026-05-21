from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from database import get_db, row_to_dict, rows_to_dicts
from utils.security import current_user, require_permission


router = APIRouter(tags=["users"])


@router.get("/users")
def list_users(user=Depends(require_permission("manage_users"))):
    with get_db() as db:
        return rows_to_dicts(db.execute("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC").fetchall())


class RoleUpdateRequest(BaseModel):
    role: str


@router.put("/users/{user_id}/role")
def update_user_role(user_id: int, payload: RoleUpdateRequest, admin=Depends(require_permission("manage_users"))):
    if payload.role not in {"admin", "developer", "viewer"}:
        raise HTTPException(status_code=422, detail="Invalid role")
    
    with get_db() as db:
        user_exists = db.execute("SELECT id FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user_exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        db.execute("UPDATE users SET role = ? WHERE id = ?", (payload.role, user_id))
    
    return {"status": "ok", "message": f"User role updated to {payload.role}"}


@router.get("/users/{user_id}/activity")
def get_user_activity(user_id: int, admin=Depends(require_permission("manage_users"))):
    with get_db() as db:
        # Get user details
        user = row_to_dict(db.execute("SELECT id, name, email, role, created_at FROM users WHERE id = ?", (user_id,)).fetchone())
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get projects with scan counts
        projects = rows_to_dicts(db.execute('''
            SELECT p.id, p.project_name, p.upload_date, p.status, 
                   COUNT(s.id) as total_scans
            FROM projects p
            LEFT JOIN scans s ON p.id = s.project_id
            WHERE p.user_id = ?
            GROUP BY p.id
            ORDER BY p.upload_date DESC
        ''', (user_id,)).fetchall())
        
        # Get recent notifications (as activity log)
        notifications = rows_to_dicts(db.execute('''
            SELECT id, title, message, level, created_at 
            FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 20
        ''', (user_id,)).fetchall())
        
    return {
        "user": user,
        "projects": projects,
        "notifications": notifications,
        "stats": {
            "total_projects": len(projects),
            "total_scans": sum(p.get("total_scans", 0) for p in projects)
        }
    }


@router.get("/notifications")
def get_notifications(user=Depends(current_user)):
    """Return the last 20 notifications for the current user, newest first."""
    with get_db() as db:
        rows = rows_to_dicts(
            db.execute(
                "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
                (user["id"],),
            ).fetchall()
        )
    # Map read_at to a boolean 'read' field for the frontend
    for row in rows:
        row["read"] = row.get("read_at") is not None
    return rows


@router.post("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, user=Depends(current_user)):
    """Mark a notification as read."""
    from database import utc_now
    with get_db() as db:
        db.execute(
            "UPDATE notifications SET read_at = ? WHERE id = ? AND user_id = ?",
            (utc_now(), notification_id, user["id"]),
        )
    return {"status": "ok"}
