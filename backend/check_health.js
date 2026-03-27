const fetch = require('node-fetch');

const services = [
  { name: 'Gateway', url: 'http://localhost:3000/health' },
  { name: 'Users', url: 'http://localhost:3001/health' },
  { name: 'Donations', url: 'http://localhost:3002/health' },
  { name: 'Notifications', url: 'http://localhost:3003/health' },
  { name: 'Payments', url: 'http://localhost:3004/health' }
];

async function check() {
  console.log("=== SERVICE HEALTH CHECK ===");
  for (const s of services) {
    try {
      const res = await fetch(s.url);
      const data = await res.json();
      console.log(`[PASS] ${s.name}: ${JSON.stringify(data)}`);
    } catch (e) {
      console.log(`[FAIL] ${s.name}: ${e.message}`);
    }
  }
}

check();
