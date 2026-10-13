#!/usr/bin/env node
/**
 * BazarCycle BD - Render Free Tier Keep-Alive Ping Script
 * 
 * Usage:
 *   node scripts/ping-keepalive.js https://your-app.onrender.com
 *   OR set RENDER_APP_URL in your environment.
 * 
 * Purpose:
 *   External ping script for cron jobs, GitHub Actions, or local servers
 *   to ping /health every 10-14 minutes, preventing Render free tier from sleeping.
 */

const targetBase = process.argv[2] || process.env.RENDER_APP_URL || 'https://bazarcycle-bd.onrender.com';
const healthUrl = targetBase.replace(/\/+$/, '') + '/health';

console.log(`[Keep-Alive] Pinging ${healthUrl} at ${new Date().toISOString()}...`);

const start = Date.now();

fetch(healthUrl, {
  method: 'GET',
  headers: {
    'User-Agent': 'BazarCycle-KeepAlive-Monitor/1.0',
    'Accept': 'application/json',
  },
})
  .then(async (res) => {
    const elapsed = Date.now() - start;
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      console.log(`[Keep-Alive SUCCESS] ${res.status} OK in ${elapsed}ms. Server is awake!`);
      console.log('Response:', data);
      process.exit(0);
    } else {
      console.error(`[Keep-Alive WARNING] Server responded with status ${res.status} in ${elapsed}ms`);
      process.exit(1);
    }
  })
  .catch((err) => {
    const elapsed = Date.now() - start;
    console.error(`[Keep-Alive ERROR] Request failed after ${elapsed}ms:`, err.message);
    process.exit(1);
  });
