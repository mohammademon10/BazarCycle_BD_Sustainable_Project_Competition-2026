# 🚀 Keeping Your Render Free Tier Web Service Awake 24/7

Render's Free Tier web services spin down ("sleep") after **15 minutes of inactivity**. When a user visits a sleeping service, Render takes **30 to 60 seconds** to boot the container (a cold start).

Because a sleeping service cannot ping itself, an **external monitor** must ping the lightweight `/health` endpoint every 10–14 minutes.

---

## ⚡ Option 1: UptimeRobot (Recommended - Fastest & 100% Free)

UptimeRobot is free, takes 2 minutes to set up, and will keep your BazarCycle app warm around the clock:

1. Create a free account at [uptimerobot.com](https://uptimerobot.com).
2. Click **"+ Add New Monitor"**.
3. Fill in the fields:
   - **Monitor Type:** `HTTP(s)`
   - **Friendly Name:** `BazarCycle BD Keep-Alive`
   - **URL (or IP):** `https://<YOUR-RENDER-SUBDOMAIN>.onrender.com/health`
   - **Monitoring Interval:** Every `10 minutes` (or `5 minutes`)
4. Click **"Create Monitor"**.
5. Done! UptimeRobot will ping `/health` continuously. Because `/health` responds in <1ms without database queries, this uses virtually zero memory or database quota.

---

## ⏱️ Option 2: Cron-job.org (100% Free)

1. Sign up at [cron-job.org](https://cron-job.org).
2. Click **"Create Cronjob"**.
3. **Title:** `BazarCycle Health Ping`
4. **URL:** `https://<YOUR-RENDER-SUBDOMAIN>.onrender.com/health`
5. **Schedule:** Every `10 minutes`.
6. Click **"Create"**.

---

## 🤖 Option 3: GitHub Actions (Free Built-In Automation)

We have included a pre-configured workflow in `.github/workflows/keep-alive.yml`.

1. Go to your GitHub repository: `Settings` → `Secrets and variables` → `Actions`.
2. Click **"New repository secret"**:
   - **Name:** `RENDER_APP_URL`
   - **Secret:** `https://<YOUR-RENDER-SUBDOMAIN>.onrender.com`
3. The workflow will automatically trigger every 12 minutes to ping your app and keep it warm.

---

## 💡 Render Free Tier Limits Note
Render provides **750 free instance hours per calendar month** per account.
Since one full month is `31 days × 24 hours = 744 hours`, **one web service can run 24/7 for the entire month on the free tier without paying a cent**.
