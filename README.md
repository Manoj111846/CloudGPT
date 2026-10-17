# CloudGPT

CloudGPT is a student-friendly AI assistant focused on cloud computing, AWS, Docker, DevOps, networking, Python, and deployment.

## Run locally on Windows

1. Open this folder in VS Code.
2. Open Terminal in this folder and create a virtual environment if needed:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```powershell
   python -m pip install -r requirements.txt
   ```
4. Open `.env` and replace `paste_your_actual_api_key_here` with your Google AI Studio API key. Keep the key private.
5. Start the app:
   ```powershell
   python -m uvicorn main:app --reload
   ```
6. Visit http://127.0.0.1:8000

Health endpoint: http://127.0.0.1:8000/api/health

## Security

- `.env` is ignored by Git.
- Do not paste your API key into chat, frontend JavaScript, screenshots, or GitHub.
- If the key is exposed, revoke it in Google AI Studio and create a replacement.

## Docker

Build:
```bash
docker build -t cloudgpt .
```

Run (loads your local environment file):
```bash
docker run --env-file .env -p 8000:8000 cloudgpt
```
