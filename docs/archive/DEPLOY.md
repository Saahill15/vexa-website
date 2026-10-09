# Deploying vexadigital.in

`.github/workflows/deploy.yml` deploys on every push to the `live-site` branch, and on demand from the Actions tab (Run workflow). It rsyncs the repo to `/opt/vexa/site` on the Hetzner box (skipping `.git`, `node_modules`, `.next`, `.env*` and `data`), then runs:

```
cd /opt/vexa/n8n && docker compose up -d --build --no-deps site
```

This matches the live setup in PASTE_DEPLOY.md: the `site` service was added to `/opt/vexa/n8n/docker-compose.yml` and builds from `/opt/vexa/site`. `docker-compose.site.yml` in this repo is the reference block for that service, not a second stack.

Only the `site` container is rebuilt; Traefik, n8n and brain are not touched. If `VEXA_SSH_KEY` is empty the job skips with a notice instead of failing.

## One time setup

1. On the server, create a dedicated deploy key (no passphrase) and authorise it:

   ```
   ssh-keygen -t ed25519 -N "" -C "github-deploy-vexa-site" -f ~/.ssh/vexa_site_deploy
   cat ~/.ssh/vexa_site_deploy.pub >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```

2. Print the private key once and copy all of it, including the BEGIN and END lines:

   ```
   cat ~/.ssh/vexa_site_deploy
   ```

   Paste it into the GitHub secret `VEXA_SSH_KEY`, then delete the private key file from the server (`rm ~/.ssh/vexa_site_deploy`). Never commit it.

3. In GitHub, Settings, Secrets and variables, Actions, add the three repository secrets:

   | Secret | Value |
   | --- | --- |
   | `VEXA_SSH_HOST` | `167.233.116.200` |
   | `VEXA_SSH_USER` | the user that owns `/opt/vexa/site` and can run docker (currently `root`) |
   | `VEXA_SSH_KEY` | the private key from step 2 |

Check: run the workflow from the Actions tab, then `curl -I https://vexadigital.in` returns 200 and the page shows the new design.

## Keep contact briefs across redeploys

Briefs from the contact form are appended to `/app/data/contact-submissions.jsonl` inside the container. They survive a rebuild only if `/app/data` is a named volume. Target: the `site` service in `/opt/vexa/n8n/docker-compose.yml` has

```
    volumes:
      - site_data:/app/data
```

and the file has a top level `volumes:` entry with `site_data:`. Check: `docker inspect vexa-site --format '{{json .Mounts}}'` lists a volume mounted at `/app/data`. Without it, every deploy deletes the saved briefs. Read them with `docker exec vexa-site cat /app/data/contact-submissions.jsonl`.

To be told about each brief, set `CONTACT_WEBHOOK_URL` (and optionally `CONTACT_WEBHOOK_TOKEN`) in the site service's `environment`, for example an n8n webhook that emails Soda. The brief is saved to disk first, so a failed webhook never loses it.

Before the first run, confirm on the box that `/opt/vexa/n8n/docker-compose.yml` holds the `site` service. If it instead runs from `/opt/vexa/site/docker-compose.site.yml`, set `COMPOSE_DIR` in the workflow to `/opt/vexa/site` and add `-f docker-compose.site.yml` to the command.
