import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const OUT_DIR = '/Users/chalermsak/.gemini/antigravity-ide/brain/acfe58f3-ad77-4a8f-ab7e-2307ff214f63/refined-verification';
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9238;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function createCdpClient(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) {
        reject(new Error(msg.error.message || JSON.stringify(msg.error)));
      } else {
        resolve(msg.result);
      }
    }
  };

  const openPromise = new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  return {
    async send(method, params = {}) {
      await openPromise;
      const msgId = id++;
      return new Promise((resolve, reject) => {
        pending.set(msgId, { resolve, reject });
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    },
    close() {
      ws.close();
    }
  };
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForPortReady(port, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const list = await fetchJson(`http://127.0.0.1:${port}/json/list`);
      return list;
    } catch {
      await sleep(200);
    }
  }
  throw new Error(`Chrome port ${port} did not become ready`);
}

async function captureSection(client, selector, filename) {
  await client.send('Runtime.evaluate', {
    expression: `document.querySelector('${selector}')?.scrollIntoView({ behavior: 'instant', block: 'center' });`
  });
  await sleep(650);
  const ss = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(OUT_DIR, filename), Buffer.from(ss.data, 'base64'));
  console.log(`Saved ${filename}`);
}

async function main() {
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--ignore-gpu-blocklist',
    '--use-gl=angle',
    '--no-sandbox',
    'about:blank'
  ], { stdio: 'ignore' });

  const cleanup = () => {
    try { chromeProc.kill('SIGKILL'); } catch {}
  };
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);

  try {
    const tabs = await waitForPortReady(PORT);
    const targetTab = tabs.find(t => t.type === 'page') || tabs[0];
    const client = createCdpClient(targetTab.webSocketDebuggerUrl);

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    // 1. DESKTOP CAPTURES (1440x960)
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 960,
      deviceScaleFactor: 2,
      mobile: false
    });

    console.log('Navigating to http://127.0.0.1:5173/ (Desktop)...');
    await client.send('Page.navigate', { url: 'http://127.0.0.1:5173/' });
    await sleep(3000);

    await captureSection(client, '#hero', '01_hero_refined.png');
    await captureSection(client, '#chronicle', '02_chronicle_refined.png');
    await captureSection(client, '#vault', '03_vault_refined.png');
    await captureSection(client, '#anatomy', '04_anatomy_refined.png');
    await captureSection(client, '#foundry', '05_foundry_refined.png');
    await captureSection(client, '.crypt-conclusion', '06_footer_refined.png');

    // 2. MOBILE CAPTURES (390x844)
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });

    console.log('Switching to mobile viewport (390x844)...');
    await sleep(1000);

    await captureSection(client, '#hero', '07_mobile_hero.png');
    await captureSection(client, '#chronicle', '08_mobile_chronicle.png');
    await captureSection(client, '#vault', '09_mobile_vault.png');
    await captureSection(client, '#anatomy', '10_mobile_anatomy.png');
    await captureSection(client, '#foundry', '11_mobile_foundry.png');
    await captureSection(client, '.crypt-conclusion', '12_mobile_footer.png');

    client.close();
  } finally {
    cleanup();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
