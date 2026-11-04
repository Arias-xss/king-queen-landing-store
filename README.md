# Kings'n Queens Caffetteria — deploy en Railway

Sitio estático de la tienda: `index.html`, `styles.css`, `i18n.js`, `app.js` y `assets/`.

## Pasos
1. Subí esta carpeta a un repositorio de GitHub.
2. En Railway: **New Project → Deploy from GitHub repo** → elegí el repo.
3. Railway detecta Node, instala `serve` y ejecuta `npm start` (usa la variable `PORT` automáticamente).
4. En **Settings → Networking → Generate Domain** para obtener la URL pública, o conectá `www.kingsnqueens.com.py` como dominio propio.

## Probar localmente
```
npm install
npm start
```
Abrí http://localhost:3000

## Notas
- Secciones: `#inicio`, `#finca`, `#recorrido`, `#productos`, `#clasificacion`, `#carrito`, `#contacto`.
- El texto en español está en `index.html`; el inglés y el portugués, en `i18n.js`.
- Precio, formulario y WhatsApp se configuran al inicio de `app.js`.
- El carrito y el idioma se guardan en el navegador del cliente.
- Pedidos por WhatsApp: 0987 660 000 (wa.me/595987660000).
- Formulario de contacto → EspoCRM (Lead Capture). Si los leads no llegan, habilitar el dominio en los orígenes permitidos (CORS) del CRM.
- SEO: canonical, Open Graph, datos estructurados, `robots.txt` y `sitemap.xml` usan `https://www.kingsnqueens.com.py/`. Si el dominio final cambia, actualizarlos junto con `llms.txt`.
- `serve.json` define la caché: si reemplazás una imagen de `assets/`, cambiale el nombre.
