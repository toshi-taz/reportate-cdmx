import os
from supabase import create_client

_client = None


def _get_client():
    global _client
    if _client is None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        if not url or not key:
            raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set")
        _client = create_client(url, key)
    return _client


def save_report(analysis: dict, lat: float | None, lng: float | None, image_b64: str) -> dict:
    row = {
        "lat": lat,
        "lng": lng,
        "category": analysis.get("category"),
        "severity": analysis.get("severity"),
        "description": analysis.get("description"),
        "solution": analysis.get("solution"),
        "authority": analysis.get("authority"),
        "impact_score": analysis.get("impact_score"),
        "image_b64": image_b64,
    }
    result = _get_client().table("reports").insert(row).execute()
    return result.data[0]


def get_reports() -> list:
    result = _get_client().table("reports").select("*").order("created_at", desc=True).execute()
    return result.data
