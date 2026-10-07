# Kings'n Queens Caffetteria — deploy en Railway

Sitio estático en un solo archivo (`index.html`, con imágenes y estilos ya incluidos).

## Pasos
1. Subí esta carpeta a un repositorio de GitHub (los 3 archivos en la raíz).
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
- Rutas internas: `#inicio`, `#tienda`, `#productos`, `#carrito`.
- El carrito y el idioma se guardan en el navegador del cliente.
- Pedidos y contacto por WhatsApp: 0987 660 000 (wa.me/595987660000).
- Para actualizar: editar el diseño, re-exportar `index.html` y hacer push.
