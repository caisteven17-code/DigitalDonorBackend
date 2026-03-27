/**
 * tunnel.js - Starts a localtunnel to expose a local port publicly.
 * Usage: node tunnel.js
 * This will output a public URL that forwards to http://localhost:3000 (the api-gateway)
 */
const localtunnel = require('localtunnel');

const PORT = 3000;
const SUBDOMAIN = 'digital-donor-api'; // Try to get a consistent subdomain

async function startTunnel() {
  try {
    const tunnel = await localtunnel({ port: PORT, subdomain: SUBDOMAIN });

    console.log('');
    console.log('==============================================');
    console.log(' TUNNEL ACTIVE - Share this URL with anyone! ');
    console.log('==============================================');
    console.log(' Public URL: ' + tunnel.url);
    console.log('');
    console.log(' Update HomeScreen.js baseUrl to:');
    console.log("   '" + tunnel.url + "'");
    console.log('==============================================');
    console.log('');

    tunnel.on('close', () => {
      console.log('[tunnel] Tunnel closed. Restart to get a new URL.');
    });

    tunnel.on('error', (err) => {
      console.error('[tunnel] Error:', err.message);
    });

  } catch (err) {
    // If subdomain is taken, try without it
    console.warn('[tunnel] Subdomain taken, getting random URL...');
    try {
      const tunnel = await localtunnel({ port: PORT });
      console.log('');
      console.log('==============================================');
      console.log(' TUNNEL ACTIVE - Share this URL!            ');
      console.log(' Public URL: ' + tunnel.url);
      console.log(' Update HomeScreen.js baseUrl to this URL!  ');
      console.log('==============================================');
      console.log('');
    } catch (err2) {
      console.error('[tunnel] Failed to start tunnel:', err2.message);
    }
  }
}

startTunnel();
