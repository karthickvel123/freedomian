# FreeDomain Platform (100% Subsidized • Zero Ads)

A production-ready, ad-free full-stack web application that allows eligible open-source developers, students, researchers, and non-profits to search `.com` and `.in` domain availability and receive approved domains subsidized for **₹0**, backed by real-time registrar/registry protocols, an authoritative MySQL database, tiered abuse prevention, an admin governance portal, and a complete user DNS & nameserver management workspace.

---

## Key Features

1. **Zero Advertisements & Pure Transparency**:
   - Unlike spammy or deceptive "free domain" portals, FreeDomain injects **zero ads, zero tracking scripts, and zero forced domain-parking pages**.
   - Transparent platform grant fund model explaining how real wholesale registrar costs are absorbed.
2. **Real-time .com & .in Availability (Never Faked / Never Scraped)**:
   - Queries official ICANN and registry RDAP (Registration Data Access Protocol - RFC 7482/7484) endpoints (Verisign for `.com` and NIXI for `.in`) alongside authoritative DNS fallback.
3. **Genuine Registrar / Reseller API Integration**:
   - Built-in adapters for **ResellerClub / LogicBoxes** (leading Indian `.in` & `.com` reseller API) and **Porkbun REST v3 API**.
   - Full sandboxed registrar simulation mode for developer evaluation with realistic order IDs, domain IDs, and 1-year expirations.
4. **Abuse Prevention & Fair-Use Safeguards**:
   - **Disposable Email Blocker**: Blocks 100+ temporary/throwaway email providers (Mailinator, TempMail, etc.).
   - **Quota Enforcement**: Strictly limits users to **1 active subsidized domain grant** per verified account.
   - **RFC 1035 Domain Syntax Sanitizer**: Enforces label rules (`[a-z0-9-]`, 3–63 chars, no edge hyphens, standard TLDs).
   - **Tiered Rate Limiting**: Express rate limiting across general API (120 req/15m), domain searches (30 req/min), and subsidy requests (5/day).
5. **Admin Review & Fulfillment Portal**:
   - Real-time KPI summary: Remaining Grant Fund (₹), Total Subsidies Paid, Pending Requests, Active Domains, and Registrar API Health.
   - 1-click **"Approve & Purchase"**: Automatically calls the registrar API, debits the platform subsidy budget, generates nameservers, and binds the domain to the user.
   - Rejection workflow with customizable feedback.
   - Grant pool top-up interface to deposit additional funds into the subsidy reserve.
6. **User Domain Management Workspace**:
   - **DNS Records Manager**: Add, inspect, and delete A, AAAA, CNAME, TXT, and MX records with host validation.
   - **Nameserver Manager**: Switch seamlessly between FreeDomain Smart Anycast DNS (`ns1.freedomain.org`, `ns2.freedomain.org`) and Custom Nameservers (Cloudflare, AWS, etc.) with automated registrar push.
   - Application status tracker with reviewer feedback notes.
7. **Robust Dual-Mode Database Engine**:
   - Configured for **MySQL** via `mysql2/promise` connection pooling with migration scripts (`schema.sql`).
   - Includes an automated local **SQLite fallback** so the platform runs immediately out-of-the-box with zero configuration friction.

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express (ES Modules), Helmet, CORS, Express-Rate-Limit, Cookie-Parser, JSONWebToken, BcryptJS
- **Database**: MySQL (with zero-config SQLite automatic fallback)
- **Registrars Supported**: ResellerClub / LogicBoxes API, Porkbun API v3, Verisign/NIXI RDAP Protocol (RFC 7482)

---

## Project Structure

```
freedomain-platform/
├── client/                      # Vite + React Frontend
│   ├── public/                  # Favicon & assets
│   ├── src/
│   │   ├── components/          # Navbar, Footer, DomainSearchBar, SearchResultCard, SubsidyModal, AuthModal
│   │   ├── context/             # AuthContext (JWT & session state)
│   │   ├── pages/               # HomePage, UserDashboardPage, AdminDashboardPage
│   │   ├── services/            # api.js (Fetch wrapper with Bearer token)
│   │   ├── App.jsx              # Routing & root application
│   │   └── index.css            # Tailwind base & custom styles
│   ├── package.json
│   └── vite.config.js
├── server/                      # Node.js + Express Backend
│   ├── database/
│   │   ├── db.js                # Dual-mode database pool (MySQL + SQLite fallback)
│   │   └── schema.sql           # Complete MySQL DDL & initial seed data
│   ├── middleware/
│   │   ├── auth.js              # JWT verification & requireAdmin guards
│   │   ├── abusePrevention.js   # Disposable email block, quota limit, syntax validator
│   │   └── rateLimiter.js       # IP rate limiting
│   ├── routes/
│   │   ├── auth.js              # Register, login, session /me
│   │   ├── domains.js           # Domain search & RDAP check
│   │   ├── subsidy.js           # Subsidy grant application & tracking
│   │   ├── userDomains.js       # User DNS records & nameserver management
│   │   └── admin.js             # Admin approval queue & budget manager
│   ├── services/
│   │   └── registrar/           # RegistrarService, RdapClient, ResellerClubAdapter, PorkbunAdapter
│   ├── .env.example             # Configuration templates
│   ├── index.js                 # Server entry point
│   └── package.json
├── package.json                 # Monorepo workspace runner
└── README.md
```

---

## Quick Start Guide

### 1. Prerequisites
- Node.js >= 18 (Tested on Node v24)
- npm >= 9

### 2. Installation
Install dependencies for both client and server:
```bash
npm run setup
```

### 3. Environment Configuration
Inspect `server/.env` (pre-created with working defaults):
```env
PORT=5000
JWT_SECRET=freedomain-super-secret-jwt-key-change-in-prod-2026

# MySQL Database (Optional - auto-switches to embedded SQLite if MySQL is not running)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=freedomain_db

# Initial Admin Credentials (seeded automatically on first boot)
ADMIN_EMAIL=admin@freedomain.org
ADMIN_PASSWORD=Admin@12345

# Registrar API Configuration (Set REGISTRAR_SANDBOX=false and add credentials for live registrar calls)
REGISTRAR_PROVIDER=resellerclub
REGISTRAR_SANDBOX=true
RESELLERCLUB_USER_ID=
RESELLERCLUB_API_KEY=
```

### 4. Running the Platform
Start the backend server:
```bash
npm run dev:server
```
In a second terminal, start the frontend development server:
```bash
npm run dev:client
```
Open **http://localhost:5173** in your browser.

---

## Default Accounts for Testing

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| **Admin** | `admin@freedomain.org` | `Admin@12345` | Access `/admin` to review applications, approve ₹0 grants, and manage budget |
| **Builder / User** | Any permanent email (e.g. `aarav@gmail.com`) | 8+ characters | Search domains, apply for ₹0 subsidy, and manage DNS/Nameservers |

*(The login modal also includes one-click "Fill Admin" and "Fill Sample Builder" buttons for instant evaluation).*

---

## End-to-End User & Admin Flow

1. **Domain Search**:
   - Go to the homepage and search any `.com` or `.in` domain (e.g. `indiahacks-2026`).
   - The platform queries the official registry via RDAP.
   - Available domains display: **Retail: ~~₹899~~ → FreeDomain Subsidy: ₹0**.
2. **Subsidy Application**:
   - Click **"Apply for ₹0 Grant"**.
   - Choose a project category (Open Source, Student, Non-Profit, Developer Portfolio, Startup MVP).
   - Provide project title, description, and proof of work (GitHub / portfolio link).
   - Accept the fair-use terms and submit.
3. **Admin Review & Automated Purchase**:
   - Log in as `admin@freedomain.org` and open the **Admin Portal**.
   - Inspect the application in the **Pending Queue**.
   - Click **"Approve & Purchase"**: The backend executes the registration call via the registrar API, debits ₹899 from the platform grant pool, assigns authoritative nameservers, and registers the domain.
4. **User DNS & Nameserver Control**:
   - Log back in as the user and open **My Dashboard**.
   - The domain is now **Active** with a 1-year registration.
   - Open the **DNS Zone Records** tab to add `A`, `CNAME`, `TXT`, or `MX` records.
   - Open the **Nameserver Configuration** tab to switch between default FreeDomain DNS and custom nameservers (such as Cloudflare).