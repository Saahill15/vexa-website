# Website deployment

The live application is https://www.vexadigital.in. The apex redirects to the canonical www host. GitHub is the source repository; it does not host this dynamic SQLite application through GitHub Pages.

The production Compose project is `site` in `/opt/vexa/site`, using `docker-compose.site.yml`. It is independent of OS, Valuate and n8n. Traefik uses `vexa_edge` and certificate resolver `le`. The private mail relay is on `vexa_account_mail`.

Only the owner performs a release. CI checks ordinary branches and pull requests without production credentials. The release workflow is manually dispatched from `main`; a feature-branch push is not a release. Its existing SSH secrets remain in GitHub Actions, not source. See [GitHub's secret storage guidance](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets).

Before releasing, compare intended source with production, save source and SQLite backups, retain the previous image, and check free disk space. Production `.env` and `/app/data` remain separate. Do not sync build caches, local databases, filled environment files or company documents.

For an owner-operated release, sync the audited source to `/opt/vexa/site` and run:

```sh
cd /opt/vexa/site
docker compose -p site -f docker-compose.site.yml build site
docker compose -p site -f docker-compose.site.yml up -d --no-deps site
```

Then check HTTPS home, mobile navigation, article checkpoint, account API boundary and enquiry validation. Restore a retained previous image for an application rollback; replacing the live database can lose later legitimate records.

The historical `live-site` branch is retained for provenance. Current development starts from `main`.
