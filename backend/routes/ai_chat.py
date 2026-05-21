from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from database import get_db, row_to_dict
from services.ai_service import chat_with_ai
from utils.security import current_user

router = APIRouter(tags=["ai_chat"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    vulnerability_id: Optional[int] = None

@router.post("/chat")
def handle_chat(payload: ChatRequest, user=Depends(current_user)):
    system_context = ""
    
    # If a vulnerability_id is provided, fetch its context
    if payload.vulnerability_id:
        with get_db() as db:
            vuln_row = db.execute(
                "SELECT * FROM vulnerabilities WHERE id = ?", 
                (payload.vulnerability_id,)
            ).fetchone()
            
            if vuln_row:
                vuln = row_to_dict(vuln_row)
                system_context = (
                    f"The user is asking about a specific vulnerability context:\n"
                    f"Type: {vuln['issue']}\n"
                    f"Severity: {vuln['severity']}\n"
                    f"File: {vuln['file']} (Line {vuln['line']})\n"
                    f"Provided AI Explanation: {vuln['explanation']}\n\n"
                    f"Use this context to directly answer their questions about it."
                )
    
    # Convert Pydantic models to dicts for the OpenAI client
    api_messages = [{"role": msg.role, "content": msg.content} for msg in payload.messages]
    
    # Get AI response
    response_text = chat_with_ai(api_messages, system_context)
    
    return {"reply": response_text}
