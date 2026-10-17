Basket privacy update

Upload shop.js to the ROOT of vivianongjy/vivianongjy.github.io, replacing the existing shop.js. Commit, wait for GitHub Pages to finish deploying, then refresh the shop with Command+Shift+R. Do not upload this README or any content JSON files.

Each browser profile has its own visitor basket. Owner edit has a separate preview basket. People sharing a browser profile share the visitor basket; accounts are not implemented. This does not send baskets to GitHub or automatically create records in Shop Desk. Existing legacy basket storage is not imported into the new visitor basket.

Verified with two isolated Chrome browser contexts, owner/public switching, clearing one basket independently and persistence across tabs in the same browser.
