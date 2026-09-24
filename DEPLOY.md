# Deploying vexadigital.in

`.github/workflows/deploy.yml` deploys on every push to the `live-site` branch, and on demand from the Actions tab (Run workflow). It rsyncs the repo to `/opt/vexa/site` on the Hetzner box (skipping `.git`, `node_modules`, `.next` and `.env*`), then runs:

```
cd /opt/vexa/site && docker compose -f docker-compose.site.yml up -d --build site
```

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

Before the first run, confirm on the box that `/opt/vexa/site/docker-compose.site.yml` is the file that runs the `site` service. If the site instead runs from `/opt/vexa/n8n/docker-compose.yml` (see PASTE_DEPLOY.md), change the last command in the workflow to `cd /opt/vexa/n8n && docker compose up -d --build site`.
