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
3. Copy the URI and replace `[YOUR-PASSWORD]` with your actual database password.
4. Place it in `backend/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
5. Note: If using transaction pooler on port 6543, ensure SSL mode is enabled (default in SQLAlchemy).

---

## Step 4: Seed Initial Data (Optional)
To load initial categories (Vegetable, Fruit, Fish, Plastic, Paper) and Dhaka demo markets:
```bash
cd backend
python seed.py
```
Your database is now fully populated and synchronized with live APIs.
