# Website deployment

The live application is https://www.vexadigital.in. The apex redirects to the canonical www host. GitHub is the source repository; it does not host this dynamic SQLite application through GitHub Pages.

The production Compose project is `site` in `/opt/vexa/site`, using `docker-compose.site.yml`. It is independent of OS, Valuate and n8n. Traefik uses `vexa_edge` and certificate resolver `le`. The private mail relay is on `vexa_account_mail`.

Only the owner performs a release. CI checks ordinary branches and pull requests without production credentials. The production SSH key was removed from this repository's Actions secrets before collaborator access was accepted. The retained manual release workflow cannot authenticate to production without it. Do not restore production credentials to this shared repository: repository write access can allow workflow changes, and the current plan does not enforce private branch protection. Feature branches and PR review are the contribution workflow, not a technical permission boundary.

Use the owner's existing private SSH access for an audited release. GitHub collaboration does not grant server access; do not share the owner's private key, production environment or database. Any future automated deployment needs a separate owner-controlled credential and approval boundary.

Before releasing, compare intended source with production, save source and SQLite backups, retain the previous image, and check free disk space. Production `.env` and `/app/data` remain separate. Do not sync build caches, local databases, filled environment files or company documents.

For an owner-operated release, sync the audited source to `/opt/vexa/site` and run:

```sh
cd /opt/vexa/site
docker compose -p site -f docker-compose.site.yml build site
docker compose -p site -f docker-compose.site.yml up -d --no-deps site
```

Then check HTTPS home, mobile navigation, article checkpoint, account API boundary and enquiry validation. Restore a retained previous image for an application rollback; replacing the live database can lose later legitimate records.

The historical `live-site` branch is retained for provenance. Current development starts from `main`.
