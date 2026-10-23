"""
Generador de Hojas de Asistencia Laboral
-----------------------------------------
Script en Python para la generación de hojas de control y registro de asistencia
personalizadas por empleado, cargo y período mensual.

Diseñado para ejecutarse de forma independiente desde la línea de comandos
o integrado como módulo en vistas de Django REST Framework.
"""

import sys
import calendar
import datetime
from typing import Dict, Any, Optional
import io


def get_month_name_es(month: int) -> str:
    """Devuelve el nombre del mes en español."""
    months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]
    if 1 <= month <= 12:
        return months[month - 1]
    return f"Mes {month}"


def get_weekday_name_es(weekday_idx: int) -> str:
    """Devuelve el nombre del día de la semana en español (0=Lunes, 6=Domingo)."""
    days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    return days[weekday_idx % 7]


def generate_attendance_matrix(year: int, month: int) -> list:
    """Genera la lista de días del mes con su nombre de día y si es fin de semana."""
    num_days = calendar.monthrange(year, month)[1]
    days_data = []

    for day in range(1, num_days + 1):
        dt = datetime.date(year, month, day)
        weekday_num = dt.weekday()
        weekday_name = get_weekday_name_es(weekday_num)
        is_weekend = weekday_num >= 5  # Sábado o Domingo

        days_data.append({
            "day": day,
            "weekday": weekday_name,
            "date": dt.strftime("%Y-%m-%d"),
            "is_weekend": is_weekend,
            "default_status": "Descanso" if is_weekend else "Laborable"
        })
    return days_data


def generate_attendance_csv(full_name: str, job_title: str, year: int, month: int, department: str = "General") -> str:
    """Genera el contenido de la hoja de asistencia en formato CSV delimitado por comas."""
    month_name = get_month_name_es(month)
    days = generate_attendance_matrix(year, month)

    output = io.StringIO()
    output.write("REGISTRO MENSUAL DE ASISTENCIA LABORAL\n")
    output.write(f"Empleado,{full_name}\n")
    output.write(f"Cargo,{job_title}\n")
    output.write(f"Departamento,{department}\n")
    output.write(f"Período,{month_name} {year}\n")
    output.write(f"Fecha de emisión,{datetime.date.today().strftime('%d/%m/%Y')}\n\n")
    output.write("Día,Día de la Semana,Fecha,Hora Entrada,Firma Entrada,Hora Salida,Firma Salida,Observaciones\n")

    for d in days:
        if d["is_weekend"]:
            output.write(f"{d['day']},{d['weekday']},{d['date']},--,--,--,--,Fin de semana\n")
        else:
            output.write(f"{d['day']},{d['weekday']},{d['date']},08:00,,17:00,,\n")

    return output.getvalue()


def generate_attendance_html(full_name: str, job_title: str, year: int, month: int, department: str = "General") -> str:
    """
    Genera una hoja de asistencia en formato HTML imprimible con estilos CSS
    optimizados para hoja A4 vertical y visualización ejecutiva.
    """
    month_name = get_month_name_es(month)
    days = generate_attendance_matrix(year, month)
    today_str = datetime.date.today().strftime("%d/%m/%Y")

    rows_html = []
    for d in days:
        row_class = "weekend-row" if d["is_weekend"] else "work-row"
        obs_text = "Fin de semana" if d["is_weekend"] else ""
        entry_time = "--" if d["is_weekend"] else ""
        exit_time = "--" if d["is_weekend"] else ""

        rows_html.append(f"""
        <tr class="{row_class}">
            <td class="text-center font-mono">{d['day']:02d}</td>
            <td>{d['weekday']}</td>
            <td class="text-center">{entry_time}</td>
            <td class="sig-col"></td>
            <td class="text-center">{exit_time}</td>
            <td class="sig-col"></td>
            <td class="obs-col">{obs_text}</td>
        </tr>
        """)

    return f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Hoja de Asistencia - {full_name}</title>
<style>
    @page {{ size: A4 portrait; margin: 15mm; }}
    body {{
        font-family: Arial, Helvetica, sans-serif;
        color: #1e293b;
        margin: 0;
        padding: 20px;
        background: #ffffff;
        font-size: 11px;
    }}
    .header-box {{
        border-bottom: 2px solid #0f172a;
        padding-bottom: 12px;
        margin-bottom: 16px;
    }}
    .title {{
        font-size: 18px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0 0 6px 0;
        color: #0f172a;
    }}
    .subtitle {{
        font-size: 12px;
        color: #64748b;
        margin: 0;
    }}
    .info-grid {{
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        padding: 12px 16px;
        border-radius: 4px;
        margin-bottom: 16px;
    }}
    .info-item {{ font-size: 12px; }}
    .info-label {{ font-weight: bold; color: #475569; }}
    .info-val {{ color: #0f172a; }}
    table {{
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 24px;
    }}
    th {{
        background: #0f172a;
        color: #ffffff;
        font-weight: 600;
        text-align: left;
        padding: 5px 6px;
        font-size: 10px;
        text-transform: uppercase;
        border: 1px solid #0f172a;
    }}
    td {{
        padding: 4px 6px;
        border: 1px solid #cbd5e1;
        font-size: 10px;
    }}
    .weekend-row {{ background-color: #f1f5f9; color: #94a3b8; }}
    .work-row:nth-child(even) {{ background-color: #fafafa; }}
    .text-center {{ text-align: center; }}
    .font-mono {{ font-family: monospace; font-size: 11px; }}
    .sig-col {{ width: 110px; }}
    .obs-col {{ width: 100px; }}
    .signatures {{
        margin-top: 30px;
        display: flex;
        justify-content: space-between;
        gap: 40px;
    }}
    .sig-box {{
        flex: 1;
        text-align: center;
        border-top: 1px solid #475569;
        padding-top: 6px;
        margin-top: 40px;
    }}
    .sig-title {{ font-weight: bold; font-size: 11px; color: #0f172a; }}
    .sig-sub {{ font-size: 10px; color: #64748b; margin-top: 2px; }}
</style>
</head>
<body>
    <div class="header-box">
        <h1 class="title">Control Mensual de Asistencia</h1>
        <p class="subtitle">Documento Oficial de Registro de Jornada Laboral</p>
    </div>

    <div class="info-grid">
        <div class="info-item"><span class="info-label">Nombre del Colaborador:</span> <span class="info-val">{full_name}</span></div>
        <div class="info-item"><span class="info-label">Cargo / Puesto:</span> <span class="info-val">{job_title}</span></div>
        <div class="info-item"><span class="info-label">Período:</span> <span class="info-val">{month_name} {year}</span></div>
        <div class="info-item"><span class="info-label">Fecha de Emisión:</span> <span class="info-val">{today_str}</span></div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 32px; text-align: center;">Día</th>
                <th style="width: 80px;">Día Semana</th>
                <th style="width: 70px; text-align: center;">H. Entrada</th>
                <th>Firma Entrada</th>
                <th style="width: 70px; text-align: center;">H. Salida</th>
                <th>Firma Salida</th>
                <th>Observaciones</th>
            </tr>
        </thead>
        <tbody>
            {''.join(rows_html)}
        </tbody>
    </table>

    <div class="signatures">
        <div class="sig-box">
            <div class="sig-title">{full_name}</div>
            <div class="sig-sub">{job_title} (Firma del Empleado)</div>
        </div>
        <div class="sig-box">
            <div class="sig-title">Firma y Sello de Supervisión</div>
            <div class="sig-sub">Recursos Humanos / Dirección</div>
        </div>
    </div>
</body>
</html>"""


def generate_attendance_document(
    full_name: str,
    job_title: str,
    year: Optional[int] = None,
    month: Optional[int] = None,
    format_type: str = "pdf"
) -> Dict[str, Any]:
    """
    Función principal de integración.
    Valida y genera la hoja de asistencia para un usuario.
    """
    now = datetime.datetime.now()
    year = year or now.year
    month = month or now.month

    if not full_name or not full_name.strip():
        raise ValueError("El nombre completo es obligatorio.")
    if not job_title or not job_title.strip():
        raise ValueError("El cargo es obligatorio.")

    full_name_clean = full_name.strip()
    job_title_clean = job_title.strip()

    month_name = get_month_name_es(month)
    safe_name = "_".join(full_name_clean.lower().split())
    filename = f"hoja_asistencia_{safe_name}_{month_name.lower()}_{year}"

    if format_type.lower() == "csv":
        content = generate_attendance_csv(full_name_clean, job_title_clean, year, month)
        return {
            "filename": f"{filename}.csv",
            "content_type": "text/csv; charset=utf-8",
            "content": content.encode("utf-8"),
            "full_name": full_name_clean,
            "job_title": job_title_clean,
            "month_name": month_name,
            "year": year
        }
    else:
        # Formato HTML listo para visualización o conversión PDF
        content = generate_attendance_html(full_name_clean, job_title_clean, year, month)
        return {
            "filename": f"{filename}.html",
            "content_type": "text/html; charset=utf-8",
            "content": content.encode("utf-8"),
            "full_name": full_name_clean,
            "job_title": job_title_clean,
            "month_name": month_name,
            "year": year
        }


if __name__ == "__main__":
    # Prueba CLI rápida
    name = sys.argv[1] if len(sys.argv) > 1 else "Colaborador de Prueba"
    role = sys.argv[2] if len(sys.argv) > 2 else "Especialista Técnico"
    result = generate_attendance_document(name, role)
    print(f"Hoja generada exitosamente para: {result['full_name']} ({result['job_title']})")
    print(f"Archivo sugerido: {result['filename']}")
