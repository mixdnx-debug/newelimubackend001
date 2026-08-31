/**
 * ELIMUmaterial — Keep-Alive (ADDITIVE MODULE — does not change any existing
 * logic, route or flow).
 *
 * Render's free tier suspends a web service after ~15 minutes without
 * inbound traffic. This module pings the service's own public URL every
 * 14 minutes (just under the limit) so the dyno NEVER falls asleep and the
 * wallet / database never gets wiped by a sleep-restart cycle.
 *
 * It activates only when the public URL is known:
 *   - RENDER_EXTERNAL_URL is set automatically by Render, or
 *   - SELF_URL can be set manually (e.g. https://elimubackend.onrender.com)
 * On localhost it stays silent (no need to keep a dev machine awake).
 */
const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes — safely under Render's 15-min sleep window

function startKeepAlive() {
  const base = (process.env.SELF_URL || process.env.RENDER_EXTERNAL_URL || '').trim();
  if (!base) {
    console.log('ℹ️  Keep-alive idle (no SELF_URL / RENDER_EXTERNAL_URL — running locally).');
    return;
  }
  const target = base.replace(/\/+$/, '') + '/api/sync/ping';

  const ping = async () => {
    try {
      const res = await fetch(target, { method: 'GET' });
      console.log(`💓 Keep-alive ping → ${target} [${res.status}] ${new Date().toISOString()}`);
    } catch (e) {
      console.log(`💓 Keep-alive ping failed (will retry in 14 min): ${e.message}`);
    }
  };

  // First ping 60s after boot (lets the service finish starting), then every 14 min.
  setTimeout(ping, 60 * 1000);
  setInterval(ping, PING_INTERVAL_MS);
  console.log(`💓 Keep-alive armed — pinging ${target} every 14 minutes.`);
}

module.exports = { startKeepAlive };
