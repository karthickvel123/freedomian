# FreeDomain Platform — Production Hosting Guide

This guide covers the top recommended ways to deploy and host the full-stack FreeDomain platform with 100% uptime, SSL, and database persistence.

---

## Architecture Summary

| Layer | Technology | Hosting Options |
|---|---|---|
| **Frontend** | React 18, Tailwind CSS, Vite | Vercel, Cloudflare Pages, or bundled inside Express |
| **Backend** | Node.js, Express (ESM), Helmet | Render, Railway, DigitalOcean App Platform, VPS |
| **Database** | MySQL (with SQLite fallback) | Railway MySQL, Aiven, AWS RDS, PlanetScale, or Docker MySQL |

---

## Option 1: 1-Click All-in-One Deployment on Render / Railway (Recommended)

Because the Express backend is configured to automatically serve the built React frontend from `client/dist`, you can deploy the entire application as a **single unified service**!

### Steps on Render:
1. Push your project to a GitHub or GitLab repository.
2. Log into [Render.com](https://render.com) and create a **New PostgreSQL/MySQL Database**:
   - Create a MySQL instance (or use free cloud MySQL on [Aiven.io](https://aiven.io)).
   - Copy the connection URL / credentials.
3. Create a **New Web Service**:
   - Connect your GitHub repository.
   - Set **Build Command**:
     ```bash
     npm --prefix client install && npm --prefix client run build && npm --prefix server install
     ```
   - Set **Start Command**:
     ```bash
     npm --prefix server start
     ```
   - Add Environment Variables:
     - `NODE_ENV`: `production`
     - `PORT`: `10000` (Render binds dynamically)
     - `JWT_SECRET`: Generate a random secure string
     - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: From your MySQL instance
     - `ADMIN_EMAIL`: Your production admin email
     - `ADMIN_PASSWORD`: Your strong admin password
     - `REGISTRAR_PROVIDER`: `resellerclub` (or `porkbun`)
     - `REGISTRAR_SANDBOX`: `false` (for live domain registrations)
     - `RESELLERCLUB_USER_ID`: Your ResellerClub Reseller ID
     - `RESELLERCLUB_API_KEY`: Your ResellerClub API Key
4. Click **Deploy**. Render will build the React app, launch the Node server, and provision your free SSL certificate (`https://your-app.onrender.com`)!

---

## Option 2: Split Architecture (Vercel Frontend + Cloud Backend)

If you prefer global edge CDN hosting for the frontend:

### 1. Deploy the Backend (Railway or Render)
- Deploy only the `server/` directory as a Node.js Web Service.
- Take note of your backend URL: e.g. `https://api.freedomain.org`.

### 2. Deploy Frontend on Vercel
1. In `client/src/services/api.js`, set `API_BASE` to `https://api.freedomain.org/api` (or configure a rewrite rule in `vercel.json`).
2. Run `vercel` or link your repository to [Vercel.com](https://vercel.com):
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add `CORS_ORIGINS=https://your-frontend.vercel.app` in your backend environment variables.

---

## Option 3: All-in-One Docker Deployment on a VPS ($4–$6/mo)

A single Linux VPS (DigitalOcean Droplet, Hetzner Cloud, Linode, or AWS EC2) running Docker Compose is cost-effective and provides complete data sovereignty.

### 1. Connect to your VPS:
```bash
ssh root@your_server_ip
```

### 2. Install Docker & Docker Compose:
```bash
curl -fsSL https://get.docker.com | sh
```

### 3. Clone Repository & Run:
```bash
git clone https://github.com/your-username/freedomain-platform.git
cd freedomain-platform
```

### 4. Edit `docker-compose.yml`:
Update passwords and registrar keys:
```bash
nano docker-compose.yml
```

### 5. Launch Services:
```bash
docker compose up -d --build
```
Your MySQL database and FreeDomain web application will boot up automatically.

### 6. Setup Free SSL with Nginx Reverse Proxy & Certbot:
Create an Nginx configuration (`/etc/nginx/sites-available/freedomain`):
```nginx
server {
    server_name yourdomain.org www.yourdomain.org;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable site and generate SSL:
```bash
ln -s /etc/nginx/sites-available/freedomain /etc/nginx/sites-enabled/
certbot --nginx -d yourdomain.org -d www.yourdomain.org
```

---

## Connecting Live Registrar Credentials

When you are ready to subsidize and register real live domains:

1. **ResellerClub**:
   - Sign up for a Reseller Account at [ResellerClub.com](https://www.resellerclub.com).
   - Go to **Settings > API** in your ResellerClub control panel.
   - Whitelist your server's public IP address.
   - Copy your **Reseller ID** and **API Key**.
   - Fund your ResellerClub account balance with working capital (this is the balance debited when you approve user domains).
   - In your `.env`, set:
     ```env
     REGISTRAR_SANDBOX=false
     REGISTRAR_PROVIDER=resellerclub
     RESELLERCLUB_USER_ID=123456
     RESELLERCLUB_API_KEY=your_live_api_key
     ```
2. **Porkbun**:
   - Create an account at [Porkbun.com](https://porkbun.com).
   - Navigate to **Account > API Access** and generate an API Key & Secret Key.
   - Set `REGISTRAR_PROVIDER=porkbun`, `PORKBUN_API_KEY=...`, and `PORKBUN_SECRET_KEY=...`.