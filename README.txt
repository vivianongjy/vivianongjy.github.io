PRODUCT PHOTO UPLOAD FIX

Not deployed yet. Unzip and upload inline-editor.js, cms-content.js and the vendor FOLDER to the ROOT of vivianongjy/vivianongjy.github.io, replacing matching files. Keep the three HEIC decoder files inside vendor/. This update does not replace products or content JSON.

Wait for GitHub Pages deployment. Refresh with Command+Shift+R, then go to Buisness > Owner edit > Add product or Edit product. Product photos is now at the TOP of the dialog. Choose up to six pictures, wait for previews, Apply product, then Save changes. Optional 3D upload is collapsed separately and accepts GLB models, not pictures.

Photo formats: JPG/JPEG, PNG, WebP, AVIF, GIF, BMP and browser-supported images. HEIC/HEIF iPhone photos use a local browser converter when native decoding fails. File size limit remains 30 MB each. Decoder loads only when a HEIC file needs it. File conversion happens locally; optimized images are uploaded to your GitHub repository only when you Save changes.

Tested locally: actual file chooser opened from a mouse click; PNG files with no MIME type selected and previewed; public libheif sample HEIC converted and previewed; three photos and a model saved through mocked GitHub requests; no editor runtime errors. Your original affected file has not been examined, so if it still fails, report the exact message beside the picker.

heic-to 1.6.6 is included unmodified with license and source links in vendor/.
