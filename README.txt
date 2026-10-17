GitHub-only basket and email-order update

Status: built and browser-tested locally; not deployed.

Replace shop.js and shop.css in the root of vivianongjy/vivianongjy.github.io with these two files. No product or page JSON is included or replaced. Wait for GitHub Pages deployment, then refresh with Command+Shift+R.

Guest baskets use sessionStorage, so separate new tabs in the same browser have separate baskets. Refreshing the current tab retains that tab's basket. Owner edit uses a separate preview basket. Legacy localStorage baskets are ignored. Browser duplication or session restore may copy/restore a tab's own session. This is not account-based basket storage.

The button reads Email order. Required fields: name, email, delivery country/region. It opens an email draft addressed to the configured shop email, default vivianong0913@gmail.com, containing products, quantities, totals and the customer's details. The customer must press Send in their email app. No automatic order capture or email delivery confirmation is implemented. Nothing is marked paid or sent merely by clicking the button.

Customer sign-in, customer directory, automatic Shop Desk ingestion and automatic email notifications are not deployed or implemented in this GitHub-only update. They require a backend. Existing ChatGPT Shop Desk remains private and unchanged; orders can be recorded manually there.

GitHub Pages terms exclude using Pages to run an e-commerce site. This is a source patch, not a claim of production commerce readiness. Review hosting before opening a transactional shop: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

Verification passed: independent browsers; independent new tabs within one browser; owner/public basket separation; clear one basket without clearing another; required customer-field validation; sessionStorage used instead of shared localStorage.
