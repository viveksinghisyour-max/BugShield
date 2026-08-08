import json
import os
from openai import OpenAI
from config import settings


def _get_client() -> OpenAI:
    api_key = (
        settings.nvidia_api_key
        or settings.gemini_api_key
        or os.getenv("NVIDIA_API_KEY")
        or os.getenv("GEMINI_API_KEY")
        or "dummy-key-for-init"
    )
    return OpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=api_key,
        timeout=30.0,
    )


def analyze_vulnerability(finding: dict) -> dict:
    """
    Calls NVIDIA Nemotron-3 Ultra to analyze a vulnerability finding
    and generate an explanation, fix, and secure code example.
    """
    api_key = (
        settings.nvidia_api_key
        or settings.gemini_api_key
        or os.getenv("NVIDIA_API_KEY")
        or os.getenv("GEMINI_API_KEY")
    )
    if not api_key or api_key in ("your_nvidia_api_key_here", "your_gemini_api_key_here"):
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
            model="nvidia/nemotron-3-ultra-550b-a55b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            top_p=0.95,
            max_tokens=4096,
            extra_body={"chat_template_kwargs": {"enable_thinking": True}, "reasoning_budget": 2048},
            stream=True,
        )

        content_chunks = []
        for chunk in completion:
            if not chunk.choices:
                continue
            if chunk.choices[0].delta.content is not None:
                content_chunks.append(chunk.choices[0].delta.content)

        response_text = "".join(content_chunks).strip()

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
    Handles a conversation with BugShield AI using NVIDIA Nemotron-3 Ultra.
    Enforces a strict cybersecurity persona.
    """
    api_key = (
        settings.nvidia_api_key
        or settings.gemini_api_key
        or os.getenv("NVIDIA_API_KEY")
        or os.getenv("GEMINI_API_KEY")
    )
    if not api_key or api_key in ("your_nvidia_api_key_here", "your_gemini_api_key_here"):
        return "BugShield AI key is not set. Please set NVIDIA_API_KEY in your environment variables."

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
            model="nvidia/nemotron-3-ultra-550b-a55b",
            messages=api_messages,
            temperature=0.3,
            top_p=0.95,
            max_tokens=4096,
            extra_body={"chat_template_kwargs": {"enable_thinking": True}, "reasoning_budget": 2048},
            stream=True,
        )

        content_chunks = []
        for chunk in completion:
            if not chunk.choices:
                continue
            if chunk.choices[0].delta.content is not None:
                content_chunks.append(chunk.choices[0].delta.content)

        return "".join(content_chunks)
    except Exception as e:
        err_str = str(e)
        print(f"AI Chat Error: {err_str}")
        if "429" in err_str or "Quota exceeded" in err_str:
            return "The NVIDIA API rate limit / quota was reached for this key. Please wait a moment before trying again."
        if "401" in err_str or "403" in err_str or "API_KEY_INVALID" in err_str:
            return "The configured NVIDIA API key is invalid. Please check your NVIDIA_API_KEY in environment settings."
        return f"Unable to reach BugShield AI network: {err_str}"

