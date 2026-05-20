import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from anthropic import Anthropic
from dotenv import load_dotenv
from db import save_report, get_reports as db_get_reports

load_dotenv()

app = Flask(__name__)
CORS(app)

client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are an urban problems analyst for Mexico City (CDMX).
Analyze the provided image and identify any urban issues present.

You MUST respond with valid JSON only, no additional text. Use this exact structure:
{
  "category": "string (e.g. bache, alumbrado, basura, graffiti, inundacion, obra_abandonada, otro)",
  "severity": "string (low, medium, high, critical)",
  "description": "string (brief description of the problem in Spanish)",
  "solution": "string (recommended action in Spanish)",
  "authority": "string (responsible authority, e.g. SEMOVI, SACMEX, Alcaldia, SSC)",
  "impact_score": "number (1-10 impact on citizens)",
  "hashtags": ["array", "of", "relevant", "hashtags"]
}"""


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/reports", methods=["GET"])
def get_reports():
    return jsonify(db_get_reports())


@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    if not data or "image" not in data or "media_type" not in data:
        return jsonify({"error": "Missing required fields: image, media_type"}), 400

    image_data = data["image"]
    media_type = data["media_type"]
    lat = data.get("lat")
    lng = data.get("lng")

    # Strip data URL prefix if present
    if "," in image_data:
        image_data = image_data.split(",", 1)[1]

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key or api_key == "mock":
        app.logger.info("MOCK MODE: returning test response")
        analysis = {
            "category": "bache",
            "severity": "high",
            "description": "Bache de aproximadamente 40cm de diámetro en pavimento deteriorado. Representa riesgo para vehículos y peatones.",
            "solution": "Reparación asfáltica de emergencia con bacheo en frío, señalización temporal inmediata.",
            "authority": "Alcaldía Cuauhtémoc — Dirección de Obras",
            "impact_score": 7,
            "hashtags": ["#CDMX", "#Bache", "#AlcaldiaCuauhtemoc", "#ObrasPublicas"]
        }
        return jsonify(save_report(analysis, lat, lng, image_data))

    try:
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_data,
                            },
                        },
                        {
                            "type": "text",
                            "text": "Analyze this image for urban problems in CDMX and respond with JSON only.",
                        },
                    ],
                }
            ],
        )

        analysis = json.loads(response.content[0].text)
        return jsonify(save_report(analysis, lat, lng, image_data))

    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse model response as JSON"}), 500
    except Exception as e:
        app.logger.error(f"Analysis error: {e}")
        return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    app.run(debug=os.environ.get("FLASK_DEBUG", "false").lower() == "true", port=5000)
