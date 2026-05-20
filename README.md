# Reportate CDMX

Urban problem reporting app for Mexico City powered by Claude AI vision analysis.

## Structure

```
reportate-cdmx/
  backend/    Flask API with Claude vision analysis
  frontend/   (coming soon)
```

## Backend

### Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your keys
```

### Run

```bash
python app.py
# or for production:
gunicorn app:app
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /api/reports | List reports (stub) |
| POST | /api/analyze | Analyze image for urban problems |

### POST /api/analyze

**Request:**
```json
{
  "image": "<base64 encoded image>",
  "media_type": "image/jpeg"
}
```

**Response:**
```json
{
  "category": "bache",
  "severity": "high",
  "description": "Bache de gran tamaño en la calzada...",
  "solution": "Reparación inmediata del pavimento...",
  "authority": "Alcaldia",
  "impact_score": 8,
  "hashtags": ["#Bache", "#CDMX", "#ReportaCDMX"]
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude vision |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase anon/service key |
