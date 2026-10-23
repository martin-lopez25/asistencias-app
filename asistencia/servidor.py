import argparse
import base64
import io
import json
import os
import subprocess
from datetime import date
from functools import lru_cache
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Lock
from zipfile import ZIP_DEFLATED, ZipFile

from generar_asistencias import crear_documento


PLANTILLA = Path(__file__).with_name("ASISTENCIA(1).docx")
WORD_LOCK = Lock()


@lru_cache(maxsize=32)
def renderizar_preview(
    nombre: str | None, puesto: str | None, anio: int, mes: int, quincena: int,
    adscripcion: str | None = None,
) -> bytes:
    import pythoncom
    import pymupdf
    from win32com.client import DispatchEx

    with WORD_LOCK, TemporaryDirectory(prefix="asistencia_preview_") as directorio:
        origen = Path(directorio) / "asistencia.docx"
        destino = Path(directorio) / "asistencia.pdf"
        crear_documento(PLANTILLA, anio, mes, quincena, nombre, puesto, adscripcion).save(origen)
        if os.name == "nt":
            import pythoncom
            from win32com.client import DispatchEx

            pythoncom.CoInitialize()
            word = None
            documento = None
            try:
                word = DispatchEx("Word.Application")
                word.Visible = False
                word.DisplayAlerts = 0
                documento = word.Documents.Open(str(origen), ReadOnly=True, AddToRecentFiles=False)
                documento.ExportAsFixedFormat(str(destino), 17)
            finally:
                try:
                    if documento is not None:
                        documento.Close(False)
                    if word is not None:
                        word.Quit()
                finally:
                    pythoncom.CoUninitialize()
        else:
            subprocess.run(
                ["libreoffice", "--headless", "--convert-to", "pdf", "--outdir", directorio, str(origen)],
                check=True,
                capture_output=True,
                timeout=90,
            )
        paginas = []
        with pymupdf.open(destino) as pdf:
            for pagina in pdf:
                imagen = pagina.get_pixmap(matrix=pymupdf.Matrix(1.5, 1.5), alpha=False)
                paginas.append({
                    "src": "data:image/png;base64," + base64.b64encode(imagen.tobytes("png")).decode("ascii"),
                    "width": imagen.width,
                    "height": imagen.height,
                })
        return json.dumps({"pages": paginas}).encode("utf-8")


def generar_preview(datos: dict) -> bytes:
    anio, mes, quincena = datos.get("year"), datos.get("month"), datos.get("fortnight")
    if type(anio) is not int or not 1900 <= anio <= 2100:
        raise ValueError("El anio debe estar entre 1900 y 2100.")
    if type(mes) is not int or not 1 <= mes <= 12:
        raise ValueError("El mes debe estar entre 1 y 12.")
    if type(quincena) is not int or quincena not in (1, 2):
        raise ValueError("La quincena debe ser 1 o 2.")
    campos = []
    for campo in ("full_name", "job_title"):
        valor = datos.get(campo, "")
        if not isinstance(valor, str) or len(valor) > 120 or any(caracter in valor for caracter in "\r\n\t"):
            raise ValueError("Nombre y puesto admiten hasta 120 caracteres en una sola linea.")
        campos.append(valor.strip() or None)
    adscripcion = datos.get("adscripcion", "")
    if not isinstance(adscripcion, str) or len(adscripcion) > 120 or any(caracter in adscripcion for caracter in "\r\n\t"):
        raise ValueError("La adscripcion admite hasta 120 caracteres en una sola linea.")
    return renderizar_preview(campos[0], campos[1], anio, mes, quincena, adscripcion.strip() or None)


def generar_zip(datos: dict) -> bytes:
    nombre = datos.get("full_name", "")
    puesto = datos.get("job_title", "")
    adscripcion = datos.get("adscripcion", "")
    anio = datos.get("year")
    for etiqueta, valor in (("Nombre", nombre), ("Puesto", puesto)):
        if not isinstance(valor, str) or not valor.strip() or len(valor) > 120:
            raise ValueError(f"{etiqueta} es obligatorio y admite hasta 120 caracteres.")
        if any(caracter in valor for caracter in "\r\n\t"):
            raise ValueError(f"{etiqueta} debe estar en una sola linea.")
    if not isinstance(adscripcion, str) or len(adscripcion) > 120:
        raise ValueError("La adscripcion admite hasta 120 caracteres.")
    if any(caracter in adscripcion for caracter in "\r\n\t"):
        raise ValueError("La adscripcion debe estar en una sola linea.")
    if type(anio) is not int or not 1900 <= anio <= 2100:
        raise ValueError("El anio debe estar entre 1900 y 2100.")
    archivo = io.BytesIO()
    with ZipFile(archivo, "w", ZIP_DEFLATED) as paquete:
        for mes in range(date.today().month, 13):
            for quincena in (1, 2):
                documento = crear_documento(PLANTILLA, anio, mes, quincena, nombre, puesto, adscripcion.strip() or None)
                contenido = io.BytesIO()
                documento.save(contenido)
                paquete.writestr(f"ASISTENCIA_{anio}_{mes:02d}_Q{quincena}.docx", contenido.getvalue())
    return archivo.getvalue()


class AttendanceHandler(BaseHTTPRequestHandler):
    def origenes_permitidos(self) -> set[str]:
        configurados = os.environ.get("CORS_ALLOWED_ORIGINS")
        if configurados is not None:
            return {origen.strip() for origen in configurados.split(",") if origen.strip()}
        return {
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://martin-lopez25.github.io",
        }

    def agregar_cors(self) -> None:
        origen = self.headers.get("Origin")
        if origen and origen in self.origenes_permitidos():
            self.send_header("Access-Control-Allow-Origin", origen)
            self.send_header("Vary", "Origin")

    def responder_error(self, estado: int, mensaje: str) -> None:
        contenido = json.dumps({"error": mensaje}).encode("utf-8")
        self.send_response(estado)
        self.agregar_cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(contenido)))
        self.end_headers()
        self.wfile.write(contenido)

    def do_OPTIONS(self) -> None:
        origen = self.headers.get("Origin")
        if origen and origen not in self.origenes_permitidos():
            self.send_response(403)
            self.end_headers()
            return
        self.send_response(204)
        self.agregar_cors()
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Max-Age", "600")
        self.end_headers()

    def do_GET(self) -> None:
        if self.path != "/health":
            self.responder_error(404, "Ruta no encontrada.")
            return
        contenido = b'{"status":"ok"}'
        self.send_response(200)
        self.agregar_cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(contenido)))
        self.end_headers()
        self.wfile.write(contenido)

    def do_POST(self) -> None:
        if self.path not in ("/api/asistencia/original/", "/api/asistencia/original/preview/"):
            self.responder_error(404, "Ruta no encontrada.")
            return
        try:
            longitud = int(self.headers.get("Content-Length", "0"))
            if not 0 < longitud <= 16384:
                raise ValueError("Solicitud vacia o demasiado grande.")
            datos = json.loads(self.rfile.read(longitud))
            if not isinstance(datos, dict):
                raise ValueError("Se esperaba un objeto JSON.")
            es_preview = self.path.endswith("/preview/")
            contenido = generar_preview(datos) if es_preview else generar_zip(datos)
        except (ValueError, UnicodeDecodeError) as error:
            self.responder_error(400, str(error))
            return
        except Exception as error:
            self.log_error("No se pudo generar el documento: %s", error)
            self.responder_error(500, "No se pudo procesar la plantilla. La vista previa requiere Microsoft Word y las dependencias Python instaladas.")
            return
        nombre = f"ASISTENCIAS_{datos['year']}.zip"
        self.send_response(200)
        self.agregar_cors()
        self.send_header("Content-Type", "application/json; charset=utf-8" if es_preview else "application/zip")
        if not es_preview:
            self.send_header("Content-Disposition", f'attachment; filename="{nombre}"')
        self.send_header("Content-Length", str(len(contenido)))
        self.end_headers()
        self.wfile.write(contenido)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="API local de las plantillas de asistencia.")
    parser.add_argument("--host", default=os.environ.get("HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", "8765")))
    args = parser.parse_args()
    servidor = ThreadingHTTPServer((args.host, args.port), AttendanceHandler)
    print(f"API de asistencia en http://{args.host}:{args.port}", flush=True)
    servidor.serve_forever()