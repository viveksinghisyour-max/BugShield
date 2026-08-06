import json
from openai import OpenAI
from config import settings

client = OpenAI(
  base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
  api_key=settings.gemini_api_key,
  timeout=5.0
)

def analyze_vulnerability(finding: dict) -> dict:
    """
    Calls the Gemini model to analyze a vulnerability finding
    and generate an explanation, fix, and secure code example.
    """
    prompt = f"""You are a cybersecurity expert.

Analyze this vulnerability.

Type:
{finding.get('issue')}

Severity:
{finding.get('severity')}

Code Context:
File: {finding.get('file')}
Line: {finding.get('line')}

Return:
1. Simple explanation
2. Why dangerous
3. Fix suggestion
4. Secure code example

Keep response concise and beginner-friendly.

Return JSON only.
Format:
{{
  "explanation": "...",
  "danger": "...",
  "fix": "...",
  "secure_example": "..."
}}
"""
    try:
        completion = client.chat.completions.create(
            model="gemini-1.5-flash",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            top_p=0.7,
            max_tokens=1024,
            stream=False
        )
        
        response_text = completion.choices[0].message.content
        
        # Clean up JSON formatting if the model wraps it in markdown blocks
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        return json.loads(response_text.strip())
    except Exception as e:
        print(f"AI Service Error: {e}")
        return {
            "explanation": "AI explanation unavailable.",
            "danger": "",
            "fix": "",
            "secure_example": ""
        }

def chat_with_ai(messages: list, system_context: str = "") -> str:
    """
    Handles a conversation with the BugShield AI.
    Enforces a strict cybersecurity persona.
    """
    system_prompt = (
        "You are BugShield AI, a highly specialized cybersecurity assistant. "
        "You ONLY answer questions related to vulnerabilities, secure coding, risk analysis, and fixes. "
        "If the user asks about anything else, politely decline and steer the conversation back to security.\n\n"
        f"{system_context}"
    )
    
    # Prepend the system prompt to the messages
    api_messages = [{"role": "system", "content": system_prompt.strip()}] + messages

    try:
        completion = client.chat.completions.create(
            model="gemini-1.5-flash",
            messages=api_messages,
            temperature=0.3,
            top_p=0.8,
            max_tokens=1024,
            stream=False
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"AI Chat Error: {e}")
        return "I'm sorry, I am currently experiencing an issue connecting to the secure AI network. Please try again later."
