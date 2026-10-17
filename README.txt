SHOP GALLERY AND OPTIONAL 3D UPDATE

Status: tested locally, not deployed to GitHub.

Upload shop.js, shop.css, inline-editor.js and the vendor FOLDER into the ROOT of vivianongjy/vivianongjy.github.io, replacing matching files. Keep the two library files inside vendor/. Do not upload this README. No product JSON is included; existing catalogue and page content are preserved.

Wait for GitHub Pages deployment, then refresh with Command+Shift+R. Exit any old editor before refreshing.

Changes:
- MYR payment: TBD. Previous recipient and QR suppressed even with old saved settings. Venmo retained.
- Button: Confirm order. It still opens an email draft; the customer must send it. It does not automatically place an order, take payment or update Shop Desk.
- Quantity 0: row stays visible while basket is open; increase it again if needed. Close and reopen to remove zero rows. Remove and Empty my basket remove immediately.
- Each tab session has its own guest basket, with separate owner preview. Browser duplication/session restoration may copy or restore a tab session.
- Owner edit > Add product / Edit product > Add photos: up to six JPEG/PNG/WebP images. Apply product, then Save changes. Images are optimized to a maximum dimension of 2000 pixels.
- View details: select thumbnails, tap photo or use + / - / Fit to zoom. Scroll within enlarged photo to view other areas.
- Optional 3D: upload a self-contained GLB version 2 model under 10 MB, or enter a direct public .glb URL. Uploaded models require embedded textures/buffers. Apply product, then Save changes. Visitors press View in 3D, drag to rotate, pinch/scroll to zoom. A product photo is not automatically converted into a 3D model.
- The 3D library is bundled locally and loads only when View in 3D is pressed.

Tests passed: isolated visitors/tabs; owner preview; zero row retention and reopen cleanup; stale MYR suppression; Confirm order label; required fields; gallery and zoom; sample GLB loads with camera controls; owner photo/GLB persistence through mocked GitHub requests; desktop/mobile editor layout; no runtime errors in editor tests.

Library: @google/model-viewer 4.4.0, Google, BSD-3-Clause. License included in vendor/. https://modelviewer.dev/

Customer accounts, automatic emails and automatic Shop Desk ingestion remain unavailable in the GitHub-only version.
