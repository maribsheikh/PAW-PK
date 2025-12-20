Hostinger deployment guide
=========================

This document explains two deployment paths for this project:

- Shared hosting (Hostinger public_html) — upload static frontend files only.
- VPS / Cloud (Docker) — run the full stack (backend + frontend served by backend) using Docker.

1) Shared hosting (public_html) — static frontend only
-----------------------------------------------------

If your Hostinger plan doesn't support Node.js, deploy only the frontend static build to the `public_html` folder.

Steps:

1. Build the frontend locally or on the server:

   cd /path/to/project
   npm run build:frontend

2. Copy the contents of `frontend/dist` into Hostinger's `public_html` folder. You can use SFTP, Hostinger's file manager, or the script included:

   ./scripts/deploy_static_to_public_html.sh /path/to/local/public_html

   - The script prepares a `public_html` folder in the repo by default. Upload its contents to Hostinger's `public_html`.

3. Configure the domain in Hostinger control panel to point to the site (usually automatic when placed in `public_html`).

4. Enable SSL in Hostinger (they provide Let's Encrypt integration). Test the site.

Notes:

- This method does not deploy the backend API. If you need the API, use a VPS with Docker (below) or another Node host.
- Update API base URL in the frontend config/environment to point to your API server.

2) VPS / Cloud (recommended if you need backend) — Docker
-------------------------------------------------------

This repo includes a multi-stage `Dockerfile` and `docker-compose.prod.yml` to build and run the full app.

On a server (VPS) with Docker and Docker Compose installed:

1. Copy repository files to the server (git clone or upload).

2. Build and run with Docker Compose (in project root):

   docker compose -f docker-compose.prod.yml up -d --build

   - This builds the frontend and backend, creates an image, and starts the container.
   - The compose file maps host port 80 to container port 3001. Change as needed.

3. Ensure DNS for your domain points to the server's IP. Use an A record.

4. (Optional but recommended) Use a reverse proxy like Nginx (or Traefik) on the host to add HTTPS with Let's Encrypt and serve the app on standard ports. Example:

   - Run Nginx to proxy `https://yourdomain.com` -> `http://localhost:3001`.
   - Use Certbot to obtain/renew certificates.

3) Environment variables and secrets
-----------------------------------

- Backend reads `BACKEND_PORT`, `PORT`, and `NODE_ENV`.
- Configure JWT_SECRET, DB connection strings, email creds, etc. in your host environment or a secrets manager.

4) Docker image notes
---------------------

- The Dockerfile uses Debian-based images and installs `libvips-dev` to support `sharp` used by the backend image.
- If you prefer Alpine-based images, adjust the Dockerfile and install the required dependencies for `sharp`.

5) Troubleshooting
------------------

- If the container fails with `EADDRINUSE`, make sure the host port (e.g., 80) is free or change the mapping in `docker-compose.prod.yml`.
- If static assets 404, ensure the frontend build completed and `frontend/dist` exists in the image.

If you want, I can also:

- Add a PM2 ecosystem file for process management instead of running `node server.js` directly.
- Provide an `nginx` reverse-proxy example config with Certbot instructions.
- Create a GitHub Actions workflow to build images and push to a container registry for easy deploy.
