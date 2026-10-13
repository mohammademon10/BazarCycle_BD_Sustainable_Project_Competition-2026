# 🐘 Supabase PostgreSQL Setup Guide

BazarCycle BD is designed for native compatibility with Supabase PostgreSQL.

---

## Step 1: Create Supabase Project
1. Log in to [https://supabase.com](https://supabase.com).
2. Create a new organization and project.
3. Save your generated database password securely.

---

## Step 2: Run Database Schema
1. In the Supabase Dashboard left menu, click **SQL Editor**.
2. Click **New query**.
3. Open `database/schema.sql` from the BazarCycle BD repository.
4. Paste the SQL statements into the editor and click **Run**.
5. You should see successful table creation:
   - `profiles`
   - `markets`
   - `waste_categories`
   - `waste_records`
   - `pickup_requests`
   - `impact_records`
   - `sustainability_scores`

---

## Step 3: Configure Backend Connection String
1. Go to **Project Settings** -> **Database**.
2. Under **Connection string**, select **URI**.
3. **Important for Render (IPv4 Compatibility):**
   - Render free tier instances use **IPv4**.
   - Direct connection (`db.[PROJECT-REF].supabase.co:5432`) resolves to **IPv6**, which causes `connect ENETUNREACH` on Render.
   - **Solution:** In the Supabase Database settings, select the **Connection Pooler** tab (Mode: **Session**, port `5432` or **Transaction**, port `6543`).
   - Copy the Pooler URI:
     ```env
     DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
     ```
   - (Alternatively, if using the direct host on a network that supports IPv6):
     ```env
     DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
     ```
4. Note: If `DATABASE_URL` is omitted or temporarily unreachable, BazarCycle BD automatically falls back to its robust in-memory database with pre-seeded demonstration data, ensuring zero downtime!

---

## Step 4: Seed Initial Data (Optional)
To load initial categories (Vegetable, Fruit, Fish, Plastic, Paper) and Dhaka demo markets:
```bash
cd backend
python seed.py
```
Your database is now fully populated and synchronized with live APIs.
