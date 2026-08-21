# Deploy config — closes the audit items a zip cannot

The V3 re-audit marked several items **live-only**: they are properties of the HTTP
response, not of any file in this bundle. These configs make them a one-step deploy.

| Audit item | Fixed by |
|---|---|
| SEC-011..015 response headers | `.htaccess` / `_headers` / `nginx-security-headers.conf` |
| SEC-007 HTTPS | `.htaccess` rewrite (or platform setting) |
| PERF-007 compression | gzip + brotli blocks |
| llms.txt served as text/plain | explicit Content-Type rules |

## Pick one

- **Apache** — `.htaccess` is already at the bundle root. Nothing else to do.
- **Netlify / Cloudflare Pages** — copy `deploy/_headers` to the publish root.
- **nginx** — paste `deploy/nginx-security-headers.conf` into the `server{}` block.

## Read this before enabling CSP

CSP ships as **Report-Only** on purpose. This page uses inline `<script>` and `<style>`
and performs 20 `innerHTML` assignments. An enforcing policy without `'unsafe-inline'`
**will break the page**. Collect reports first, then move to nonces or hashes.

## Still not covered by these files

- **LCP / CLS** must be measured on the live URL; local-static numbers are artifacts.
- **robots.txt / sitemap.xml** ship in this bundle but only work once served from the domain root.
