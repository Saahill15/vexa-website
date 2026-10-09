# Paste into a NEW Cursor chat opened on the folder Workflow AI/04_SITE_BUILDS/vexa-website (model: Claude, not Grok)

Target: vexadigital.in and www.vexadigital.in serve this Next.js site over HTTPS from the existing Hetzner box, within 45 minutes, without touching the n8n or vexa-brain services.

Facts you can rely on:
- Box: root@167.233.116.200, SSH key ~/.ssh/vexa_hetzner (ssh -i ~/.ssh/vexa_hetzner root@167.233.116.200).
- Docker + Traefik v3.6 + Let's Encrypt already run from /opt/vexa/n8n/docker-compose.yml (services traefik, n8n, brain). Read that file first and copy its Traefik label pattern, network name and certresolver name exactly.
- The site builds with `npm run build` and has no database.

Do:
1. Add `output: "standalone"` to next.config.mjs and a small multi stage Dockerfile (node:20-alpine) that runs the standalone server on port 3000. Build locally once to prove it.
2. rsync this folder (without node_modules and .next) to /opt/vexa/site on the box.
3. Add a `site` service to /opt/vexa/n8n/docker-compose.yml that builds /opt/vexa/site, joins the Traefik network, with router rule Host(`vexadigital.in`) || Host(`www.vexadigital.in`), entrypoint websecure, the same certresolver. Back up the compose file first as docker-compose.yml.bak-<date>.
4. `docker compose up -d --build site` only. Do not restart traefik, n8n or brain.
5. Tell Soda to change DNS at GoDaddy: A record @ -> 167.233.116.200 and A (or CNAME) www -> 167.233.116.200, removing the GoDaddy parking/forwarding. Wait for his "done", then confirm with `curl -I https://vexadigital.in` that the certificate is issued and the page is this site, not GoDaddy's /lander.

Done check: https://vexadigital.in shows the VEXA home page with the orange V in the header, n8n.vexadigital.in still loads.
Log in BUILD_LOG.md what you tried, what broke, what came back.
