# 🚀 BazarCycle BD — 100% Free Production Deployment Guide

This guide details how to deploy the entire **BazarCycle BD** platform completely **FREE**.

---

## 🌟 Recommended Method: 1-Click Unified Fullstack on Render.com (100% Free)

Since BazarCycle BD is structured as an integrated Node.js / Express + React (Vite) application, you can deploy both the frontend and backend together in a **single free web service**.

### Steps:
1. **Push your code to GitHub**:
   Ensure all changes are pushed to your repository (e.g. `main` branch).

2. **Sign up / Log in to [Render.com](https://render.com)** (Free).

3. **Deploy with Blueprint OR Web Service**:
   - **Method A (Easiest - Blueprint)**:
     - In Render dashboard, click **New +** -> **Blueprint**.
     - Select your GitHub repository.
     - Render will automatically read `render.yaml` and configure everything.
     - Click **Apply**.
   
   - **Method B (Manual Web Service)**:
     - Click **New +** -> **Web Service**.
     - Connect your repository.
     - Configure the service:
       - **Name:** `bazarcycle-bd`
       - **Region:** Singapore / Frankfurt / Oregon (any free region)
       - **Runtime:** `Node`
       - **Build Command:** `npm install && npm run build`
       - **Start Command:** `npm start`
       - **Instance Type:** `Free`
     - In **Environment Variables**, add:
       - `NODE_ENV` = `production`
       - `JWT_SECRET` = (Click generate or type any secret 32-character string)
     - Click **Deploy Web Service**.

4. **Done!**
   - Render will build the Vite SPA into `dist/` and start Express (`server.ts`).
   - Your live website will be available at `https://bazarcycle-bd.onrender.com`.
   - Both `/` (React UI) and `/api/*` (REST endpoints) work seamlessly on the same URL with zero CORS issues!

---

## ⚡ Method 2: Split Deployment (Netlify/Vercel Frontend + Render/Railway Backend)

If you prefer deploying the frontend to **Netlify** or **Vercel**:

### 1. Backend on Render.com:
- Deploy as a Node Web Service using `npm start`.
- Note down your backend URL: `https://your-backend.onrender.com`.

### 2. Frontend on Netlify:
- Go to [Netlify](https://app.netlify.com).
- Click **Add new site** -> **Import an existing project** -> **GitHub**.
- Netlify will detect `netlify.toml`:
  - **Build command:** `npm run build`
  - **Publish directory:** `dist`
- In **Site configuration** -> **Environment variables**, add:
  - `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`
- Click **Deploy site**.
- Netlify SPA routing is already handled by `public/_redirects` and `netlify.toml`!

---

## 🔑 Pre-Configured Demo Credentials
Once deployed, log in immediately with:
- **Platform Admin:** `admin@bazarcycle.bd` / `BazarCycle2026!`
- **Market Manager (Karwan Bazar):** `manager@bazarcycle.bd` / `BazarCycle2026!`
- **Waste Collector (Green Cycle):** `collector@bazarcycle.bd` / `BazarCycle2026!`
