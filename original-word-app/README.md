# Generador de hojas de asistencia

## Ejecutar la aplicación

Desde la carpeta del proyecto, instala las dependencias e inicia Vite:

```powershell
npm install
npm run dev
```

Abre http://localhost:3000. La generación se hace en el navegador; no requiere
servidor Python, Microsoft Word ni conexión a Internet.

## Hojas de asistencia

- Captura nombre, puesto y adscripción; selecciona el año.
- En opciones avanzadas, genera desde el mes actual hasta diciembre, un mes completo
  o una sola quincena del mes seleccionado.
- Descarga un ZIP con dos DOCX por mes en el modo normal o mensual, o un DOCX al
  elegir una quincena.
- Cada DOCX parte de `public/templates/ASISTENCIA(1).docx`; solo cambia el contenido
  de los campos, el período y la tabla quincenal. Se conservan las demás partes y
  recursos del archivo original.

## APK Android

El APK descargable está en `public/asistencia.apk`. Para volver a compilarlo en
Windows se necesita Android Studio/SDK y JDK 21. Aparta primero el APK publicado
para que el build no lo incluya dentro de sí mismo:

```powershell
Push-Location generador-de-hojas-de-asistencia
Move-Item public\asistencia.apk "$env:TEMP\asistencia-anterior.apk"
npm run build
npx cap sync android
$env:JAVA_HOME = 'RUTA\A\JDK-21'
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
Push-Location android
.\gradlew.bat assembleDebug
Pop-Location
Copy-Item android\app\build\outputs\apk\debug\app-debug.apk public\asistencia.apk
Copy-Item public\asistencia.apk dist\asistencia.apk
Pop-Location
```

## Comprobaciones

```powershell
npm run lint
npm run build
```