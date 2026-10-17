import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from google import genai

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
load_dotenv(BASE_DIR / ".env")

app = FastAPI(title="CloudGPT", version="1.1.0")
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=10000)


@app.get("/")
def home():
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/health")
def health():
    return {"status": "healthy", "application": "CloudGPT", "version": "1.1.0"}


@app.post("/api/chat")
def chat(request: ChatRequest):
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key or api_key == "paste_your_actual_api_key_here":
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is not configured. Add it to the .env file and restart CloudGPT."
        )

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=(
                "You are CloudGPT, a helpful AI assistant specializing in cloud computing, "
                "AWS, Docker, DevOps, networking, Python, and deployment. Explain clearly "
                "for students, and give safe step-by-step instructions when useful.\n\n"
                f"User: {request.message}"
            ),
        )
        answer = (response.text or "").strip()
        if not answer:
            answer = "I couldn't generate a text response. Please try asking in a different way."
        return {"reply": answer}
    except Exception as exc:
        # Avoid returning API keys or detailed provider internals to the browser.
        print(f"Gemini request failed: {type(exc).__name__}: {exc}")
        raise HTTPException(
            status_code=502,
            detail="Gemini could not answer this request. Check your API key, internet connection, and API access, then try again."
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
