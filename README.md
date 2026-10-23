# Generador de hojas de asistencia

## Ejecutar en local

Desde la raiz del repositorio, instala las dependencias:

```powershell
python -m pip install -r asistencia/requirements.txt
npm install
```

Inicia la API Python en una terminal:

```powershell
python asistencia/servidor.py
```

Inicia el frontend en otra terminal desde la raiz del repositorio:

```powershell
npm run dev
```

Abre http://localhost:3000 (Vite muestra otro puerto si esta ocupado).
La API escucha solo en 127.0.0.1:8765; Vite reenvia las peticiones.
No se necesitan claves de API ni Django para esta ejecucion local.
La vista previa requiere Windows con Microsoft Word instalado. Se abre una
copia temporal del DOCX con Word, se exporta a PDF y se muestran sus paginas
como imagenes. No se reconstruye la plantilla con HTML.

## Descargas

- Captura NOMBRE, PUESTO y ADSCRIPCION, selecciona el anio, genera y descarga el ZIP.
- El ZIP contiene dos DOCX por mes desde el mes actual hasta diciembre, usando
   `../asistencia/ASISTENCIA(1).docx` y el script original.
- El formato, adscripcion, jornada, horario y firma institucional del Word se
   conservan. La vista muestra el DOCX renderizado por Microsoft Word.
   Los fines de semana aparecen sombreados segun la logica del script original.
- El selector de mes y los botones de quincena solo controlan la vista previa;
   la descarga siempre comienza en el mes actual y termina en diciembre del anio
   seleccionado. Por ejemplo, en octubre se generan seis hojas: las dos
   quincenas de octubre, noviembre y diciembre.

El script original tambien admite personalizacion por terminal, generando desde
el mes indicado hasta diciembre:

```powershell
python asistencia/generar_asistencias.py --plantilla "asistencia/ASISTENCIA(1).docx" --inicio 2026-10 --salida asistencia/asistencias_2026 --nombre "Ana Maria Gomez" --puesto "Responsable de Sistemas" --adscripcion "Coordinacion de Vinculacion Estatal"
```

## Publicar la app completa

GitHub Pages publica el frontend. La API Python se aloja por separado en Render
mediante `render.yaml` y `asistencia/Dockerfile`; Render usa LibreOffice para
mostrar la vista previa DOCX en Linux. La primera vez, crea el servicio desde
[Render](https://render.com/deploy?repo=https://github.com/martin-lopez25/asistencias-app)
y confirma el blueprint `asistencia-api-martin-lopez25`. Pages ya apunta a ese
servicio. En el plan gratuito, la primera solicitud despues de inactividad puede
tardar mientras Render despierta el backend.

## Comprobaciones

```powershell
npm run lint
npm run build
```
