# Meteo Cartaya — Web Meteorológica

Web profesional con datos en tiempo real de AEMET para el suroeste peninsular.

## Estructura de archivos

```
meteocartaya/
├── index.html    ← Página principal
├── style.css     ← Estilos
├── aemet.js      ← Módulo API AEMET (clave incluida)
├── map.js        ← Mapa interactivo D3 con observaciones por provincia
└── app.js        ← Lógica principal (hero, previsión, registros, avisos)
```

## Cómo subir la web

### Opción A — GitHub Pages (gratis, recomendado)
1. Crea un repositorio en https://github.com
2. Sube los 5 archivos al repositorio
3. Ve a Settings → Pages → Source: "main branch"
4. Tu web estará en `https://tuusuario.github.io/meteocartaya`

### Opción B — Netlify (gratis, dominio personalizado)
1. Arrastra la carpeta `meteocartaya/` a https://app.netlify.com/drop
2. Netlify te da una URL en segundos
3. Puedes conectar tu propio dominio desde el panel

### Opción C — Hosting tradicional (FTP)
1. Sube los 5 archivos a la raíz de tu hosting por FTP
2. Asegúrate de que `index.html` es el archivo principal

## Datos que se cargan automáticamente de AEMET

| Sección | Endpoint AEMET | Actualización |
|---|---|---|
| Hero (temperatura actual) | `/observacion/convencional/datos/estacion/5960` | Cada 30 min |
| Previsión 7 días | `/prediccion/especifica/municipio/diaria/21021` | Cada 30 min |
| Mapa por provincias | `/observacion/convencional/todas` | Cada 30 min |
| Registros del mes | `/valores/climatologicos/diarios/datos/...` | Cada 30 min |
| Avisos activos | `/avisos_cap/ultimoelaborado/area/ES` | Cada 30 min |

## Notas importantes

- **CORS**: La API de AEMET permite llamadas desde el navegador (CORS habilitado).
- **Rate limit**: AEMET limita a ~50 peticiones/minuto. El sistema usa caché de 30 minutos para no superar el límite.
- **Estación**: Los datos de observación usan la estación de Huelva (5960). Puedes cambiarla en `app.js` si prefieres otra más cercana.
- **Municipio Cartaya**: El código AEMET es `21021` para la predicción. No necesita cambio.

## Personalización rápida

- **Cambiar colores**: Edita las variables CSS en `style.css` (sección `:root`)
- **Cambiar estación**: Modifica `ESTACION_HUELVA` en `app.js`
- **Añadir secciones**: El HTML usa secciones semánticas fáciles de extender
