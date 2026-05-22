import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

REPORTS = [
    # Cuauhtémoc (2)
    {
        "lat": 19.4326, "lng": -99.1332,
        "category": "bache",
        "severity": "critical",
        "description": "Bache de más de 40 cm de diámetro en Av. Insurgentes Centro frente al metro Balderas. Causa accidentes y daña llantas.",
        "solution": "Bacheo de emergencia con carpeta asfáltica y señalización preventiva inmediata.",
        "authority": "SEMOVI",
        "impact_score": 95,
        "image_b64": None,
    },
    {
        "lat": 19.4264, "lng": -99.1478,
        "category": "alumbrado",
        "severity": "high",
        "description": "Tres postes de alumbrado público sin funcionar en Col. Doctores, calle Xocongo entre Arcos de Belén y Dr. Andrade. Zona oscura de noche.",
        "solution": "Reposición de luminarias LED y revisión del cableado en el tramo afectado.",
        "authority": "Alcaldía Cuauhtémoc",
        "impact_score": 78,
        "image_b64": None,
    },
    # Iztapalapa (3)
    {
        "lat": 19.3570, "lng": -99.0600,
        "category": "basura",
        "severity": "high",
        "description": "Tiradero clandestino de escombro y residuos sólidos en Av. Ermita Iztapalapa, altura Col. Unidad Modelo. Lleva más de dos semanas acumulándose.",
        "solution": "Retiro inmediato de residuos por camión de volteo, colocación de cámaras de vigilancia y señalización de prohibición.",
        "authority": "Alcaldía Iztapalapa",
        "impact_score": 72,
        "image_b64": None,
    },
    {
        "lat": 19.3450, "lng": -99.0730,
        "category": "inundacion",
        "severity": "critical",
        "description": "Inundación recurrente en Av. Texcoco altura Col. San Miguel Teotongo. En cada lluvia el nivel del agua supera 50 cm, impidiendo el paso vehicular y peatonal.",
        "solution": "Desazolve urgente del drenaje pluvial, instalación de rejillas de mayor capacidad y nivelación del pavimento.",
        "authority": "SACMEX",
        "impact_score": 98,
        "image_b64": None,
    },
    {
        "lat": 19.3720, "lng": -99.0520,
        "category": "bache",
        "severity": "medium",
        "description": "Serie de baches menores en Calle Apatlaco colonia Iztapalapa, deterioro acelerado del pavimento por tráfico pesado.",
        "solution": "Bacheo preventivo con mezcla asfáltica en frío y sellado de grietas longitudinales.",
        "authority": "SEMOVI",
        "impact_score": 55,
        "image_b64": None,
    },
    # Benito Juárez (2)
    {
        "lat": 19.3984, "lng": -99.1584,
        "category": "graffiti",
        "severity": "low",
        "description": "Graffiti extenso en bardas del parque Hundido, colonia Del Valle. Pintadas sobre murales existentes deteriorando el patrimonio visual.",
        "solution": "Limpieza con solventes especiales y repintado de bardas con pintura antigraffiti.",
        "authority": "Alcaldía Benito Juárez",
        "impact_score": 30,
        "image_b64": None,
    },
    {
        "lat": 19.3892, "lng": -99.1702,
        "category": "alumbrado",
        "severity": "medium",
        "description": "Luminaria parpadeante en Insurgentes Sur frente a Plaza Cibeles genera distracción a conductores y deficiente iluminación peatonal nocturna.",
        "solution": "Sustitución de balastro y limpieza de contactos eléctricos en poste afectado.",
        "authority": "Alcaldía Benito Juárez",
        "impact_score": 48,
        "image_b64": None,
    },
    # Coyoacán (2)
    {
        "lat": 19.3467, "lng": -99.1617,
        "category": "obra_abandonada",
        "severity": "high",
        "description": "Obra de construcción abandonada hace más de 8 meses en Av. Miguel Ángel de Quevedo esq. División del Norte. Estructura sin cercar representa riesgo de derrumbe.",
        "solution": "Clausura temporal, instalación de vallas de seguridad perimetrales y notificación al propietario para conclusión o derribo controlado.",
        "authority": "Alcaldía Coyoacán",
        "impact_score": 82,
        "image_b64": None,
    },
    {
        "lat": 19.3530, "lng": -99.1720,
        "category": "basura",
        "severity": "medium",
        "description": "Contenedores de basura desbordados en mercado de Coyoacán, calle Malintzin. Malos olores y presencia de fauna nociva.",
        "solution": "Incremento de frecuencia de recolección a dos veces por día y reposición de contenedores de mayor capacidad.",
        "authority": "Alcaldía Coyoacán",
        "impact_score": 60,
        "image_b64": None,
    },
    # Gustavo A. Madero (2)
    {
        "lat": 19.4850, "lng": -99.1200,
        "category": "bache",
        "severity": "high",
        "description": "Bache profundo en Calz. Vallejo frente a la estación del metro Vallejo. Daños frecuentes a vehículos y riesgo para motociclistas.",
        "solution": "Bacheo profundo con base hidráulica y carpeta asfáltica, señalización mientras dura la reparación.",
        "authority": "SEMOVI",
        "impact_score": 80,
        "image_b64": None,
    },
    {
        "lat": 19.4970, "lng": -99.1050,
        "category": "alumbrado",
        "severity": "low",
        "description": "Poste de alumbrado caído sobre banqueta en Col. Tepeyac Insurgentes, sin señalizar. Obstruye el paso de peatones.",
        "solution": "Retiro del poste caído, instalación de nuevo poste y reconexión del circuito de alumbrado.",
        "authority": "Alcaldía Gustavo A. Madero",
        "impact_score": 35,
        "image_b64": None,
    },
    # Tlalpan (2)
    {
        "lat": 19.2900, "lng": -99.1600,
        "category": "inundacion",
        "severity": "medium",
        "description": "Encharcamiento persistente en Periferico Sur altura Col. Fuentes del Pedregal tras lluvias de mediana intensidad. Afecta carril lateral.",
        "solution": "Desazolve del sistema de drenaje, nivelación de pavimento y ampliación de coladera.",
        "authority": "SACMEX",
        "impact_score": 58,
        "image_b64": None,
    },
    {
        "lat": 19.2750, "lng": -99.1750,
        "category": "graffiti",
        "severity": "low",
        "description": "Pintadas en fachadas de casas en el pueblo de San Andrés Totoltepec, afectando imagen urbana del área de valor histórico.",
        "solution": "Programa de limpieza comunitaria y aplicación de pintura resistente a graffiti en fachadas patrimoniales.",
        "authority": "Alcaldía Tlalpan",
        "impact_score": 28,
        "image_b64": None,
    },
    # Xochimilco (2)
    {
        "lat": 19.2570, "lng": -99.1050,
        "category": "obra_abandonada",
        "severity": "high",
        "description": "Puente peatonal en construcción abandonado sobre canal en Xochimilco. Estructura metálica oxidándose y concreto sin finalizar bloquea parcialmente el canal.",
        "solution": "Retomar obra conforme al proyecto original o demolición controlada, limpieza del canal y señalización de peligro inmediata.",
        "authority": "SACMEX",
        "impact_score": 76,
        "image_b64": None,
    },
    {
        "lat": 19.2640, "lng": -99.0980,
        "category": "basura",
        "severity": "medium",
        "description": "Residuos sólidos arrojados en orilla del Canal Nacional en Col. Santa Cruz Xochitepec. Basura flotante afecta ecosistema y actividad chinampera.",
        "solution": "Operativo de limpieza acuática, instalación de trampas de residuos flotantes y campañas de concientización ciudadana.",
        "authority": "SSC",
        "impact_score": 65,
        "image_b64": None,
    },
]


def main():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in .env")

    client = create_client(url, key)

    count_result = client.table("reports").select("id", count="exact").execute()
    existing = count_result.count or 0
    if existing > 0:
        print(f"⏭️  Skipped: {existing} reports already exist in the database.")
        return

    result = client.table("reports").insert(REPORTS).execute()
    inserted = len(result.data)
    print(f"✅ Inserted {inserted} reports")


if __name__ == "__main__":
    main()
