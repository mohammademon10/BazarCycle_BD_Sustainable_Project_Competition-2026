# 🚀 BazarCycle BD — Deployment Guide

This guide details how to deploy the full BazarCycle BD stack to production using free or low-cost hosting:
- **Frontend:** Vercel / Netlify
- **Backend:** Render / Railway / Fly.io / Koyeb (FastAPI Python)
- **Database:** Supabase PostgreSQL (Managed Cloud Postgres)

---

## 1. Supabase PostgreSQL Setup
1. Create a free account at [https://supabase.com](https://supabase.com) and click **New Project**.
2. Set project name (e.g., `bazarcycle-bd-prod`), choose a region close to Bangladesh (e.g., Singapore `ap-southeast-1`), and set a secure database password.
3. Open the **SQL Editor** tab in your Supabase dashboard.
4. Copy the entire contents of `database/schema.sql` from this repository and run it in the SQL Editor to instantiate all tables, indexes, and foreign keys.
5. In Supabase Project Settings -> **Database**, copy your **Connection String (URI)**.
   - Format: `postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

---

## 2. Backend Deployment (FastAPI on Render / Railway / Koyeb)

### Environment Variables
Configure the following in your host dashboard:
```env
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
JWT_SECRET=generate_a_random_32_character_production_secret_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=https://bazarcycle-bd.vercel.app,http://localhost:5173
ENVIRONMENT=production
```

### Build & Start Commands
- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Optional Seed:** Run `python seed.py` one time via shell or deploy hook to populate demo categories and markets.

---

## 3. Frontend Deployment (React + Vite on Vercel)
1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com), click **Add New Project** and select your GitHub repository.
3. Configure project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. In **Environment Variables**, add:
   ```env
   VITE_API_BASE_URL=https://your-backend-service.onrender.com/api
   ```
5. Click **Deploy**.

---

## 4. Production Security Checklist
- [x] Passwords hashed with bcrypt (rounds=12)
- [x] JWT Bearer token authentication on all management and collection endpoints
- [x] Strict CORS restriction to your deployed frontend domain
- [x] Database password and JWT secrets stored in environment variables, never committed to git
- [x] Row-level locking on pickup claims to prevent race conditions
- [x] Quantity input validation (`quantity > 0 KG`) enforced on backend
- [x] CO₂ and financial numbers clearly marked with estimation disclaimers
