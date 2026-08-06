import json
import os
from openai import OpenAI
from config import settings


def _get_client() -> OpenAI:
    api_key = settings.gemini_api_key or os.getenv("GEMINI_API_KEY") or os.getenv("NVIDIA_API_KEY") or "dummy-key-for-init"
    return OpenAI(
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        api_key=api_key,
        timeout=8.0,
    )


def analyze_vulnerability(finding: dict) -> dict:
    """
    Calls Gemini 2.0 Flash to analyze a vulnerability finding
    and generate an explanation, fix, and secure code example.
    """
    if not settings.gemini_api_key or settings.gemini_api_key == "your_gemini_api_key_here":
        return {}

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
        client = _get_client()
        completion = client.chat.completions.create(
            model="gemini-2.0-flash",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            top_p=0.7,
            max_tokens=1024,
            stream=False,
        )

        response_text = completion.choices[0].message.content

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
            "secure_example": "",
        }


def chat_with_ai(messages: list, system_context: str = "") -> str:
    """
    Handles a conversation with BugShield AI using Gemini 2.0 Flash.
    Enforces a strict cybersecurity persona.
    """
    if not settings.gemini_api_key or settings.gemini_api_key == "your_gemini_api_key_here":
        return "BugShield AI key is not set. Please get a free Gemini API key from https://aistudio.google.com/app/apikey and add GEMINI_API_KEY to your environment variables."

    system_prompt = (
        "You are BugShield AI, a highly specialized cybersecurity assistant. "
        "You ONLY answer questions related to vulnerabilities, secure coding, risk analysis, and fixes. "
        "If the user asks about anything else, politely decline and steer the conversation back to security.\n\n"
        f"{system_context}"
    )

    api_messages = [{"role": "system", "content": system_prompt.strip()}] + messages

    try:
        client = _get_client()
        completion = client.chat.completions.create(
            model="gemini-2.0-flash",
            messages=api_messages,
            temperature=0.3,
            top_p=0.8,
            max_tokens=1024,
            stream=False,
        )
        return completion.choices[0].message.content
    except Exception as e:
        err_str = str(e)
        print(f"AI Chat Error: {err_str}")
        if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "Quota exceeded" in err_str:
            return "The Gemini API rate limit / quota was reached for this key. Please wait a minute or set a new free Gemini API key from https://aistudio.google.com/app/apikey in your environment settings."
        if "401" in err_str or "403" in err_str or "API_KEY_INVALID" in err_str:
            return "The configured Gemini API key is invalid. Please get a free API key starting with 'AIzaSy...' from https://aistudio.google.com/app/apikey."
        return f"Unable to reach BugShield AI network: {err_str}"
