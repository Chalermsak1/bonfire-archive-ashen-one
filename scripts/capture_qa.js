import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const OUT_DIR = '/Users/chalermsak/.gemini/antigravity-ide/brain/acfe58f3-ad77-4a8f-ab7e-2307ff214f63/visual-qa';
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9222;

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

async function main() {
  console.log('Spawning headless Chrome with GPU WebGL flags...');
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--ignore-gpu-blocklist',
    '--use-gl=angle',
    '--no-sandbox',
    '--hide-scrollbars',
    'http://127.0.0.1:5173/'
  ], { stdio: 'ignore' });

  const cleanup = () => {
    try { chromeProc.kill('SIGKILL'); } catch {}
  };
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);

  try {
    console.log('Waiting for Chrome CDP...');
    const targets = await waitForPortReady(PORT);
    const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('5173')) || targets.find(t => t.type === 'page');
    if (!pageTarget) {
      throw new Error('Could not find active page target');
    }

    console.log('Connecting to target:', pageTarget.webSocketDebuggerUrl);
    const client = createCdpClient(pageTarget.webSocketDebuggerUrl);

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('DOM.enable');

    console.log('Allowing initial 3D relic shaders and textures to load...');
    await sleep(3000);

    // Disable smooth scroll for instant predictable positioning
    await client.send('Runtime.evaluate', {
      expression: 'document.documentElement.style.scrollBehavior = "auto";'
    });

    async function snap(filename, beyondViewport = false) {
      const res = await client.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: beyondViewport
      });
      const buffer = Buffer.from(res.data, 'base64');
      const outPath = path.join(OUT_DIR, filename);
      fs.writeFileSync(outPath, buffer);
      console.log(`Saved: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
    }

    async function scrollTo(selector) {
      await client.send('Runtime.evaluate', {
        expression: `
          (() => {
            if ('${selector}' === '#monument' || '${selector}' === '#top') {
              window.scrollTo(0, 0);
              return;
            }
            const el = document.querySelector('${selector}');
            if (el) {
              const rect = el.getBoundingClientRect();
              const targetY = rect.top + window.scrollY;
              window.scrollTo(0, Math.max(0, targetY - 60));
            }
          })()
        `
      });
      await sleep(700);
    }

    // 1. DESKTOP (1440x900)
    console.log('\n--- 1. DESKTOP (1440x900) ---');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await scrollTo('#monument');
    await sleep(800);
    await snap('desktop_1_hero.png');

    console.log('Testing card flip in Hero...');
    await client.send('Runtime.evaluate', {
      expression: `
        const btn = document.querySelector('.altar-control-btn');
        if (btn) btn.click();
      `
    });
    await sleep(1000);
    await snap('desktop_1_hero_flipped.png');

    // Flip back
    await client.send('Runtime.evaluate', {
      expression: `
        const btn = document.querySelector('.altar-control-btn');
        if (btn) btn.click();
      `
    });
    await sleep(600);

    console.log('Capturing Chronicle...');
    await scrollTo('#chronicle');
    await snap('desktop_2_chronicle.png');

    console.log('Capturing Sanctuary Vault...');
    await scrollTo('#vault');
    await snap('desktop_3_vault.png');

    console.log('Testing Variant Switch: Abyss Tainted...');
    await client.send('Runtime.evaluate', {
      expression: `
        const btns = Array.from(document.querySelectorAll('.vault-tab-btn, button'));
        const abyss = btns.find(b => b.textContent && b.textContent.includes('ABYSS'));
        if (abyss) abyss.click();
      `
    });
    await sleep(800);
    await snap('desktop_3_vault_abyss.png');

    console.log('Capturing Anatomy Workbench...');
    await scrollTo('#anatomy');
    await snap('desktop_4_anatomy.png');

    console.log('Testing Anatomy Hotspot #2 click...');
    await client.send('Runtime.evaluate', {
      expression: `
        const markers = document.querySelectorAll('.hotspot-marker');
        if (markers.length > 1) markers[1].click();
      `
    });
    await sleep(600);
    await snap('desktop_4_anatomy_hotspot.png');

    console.log('Capturing Foundry Blueprint...');
    await scrollTo('#foundry');
    await snap('desktop_5_foundry.png');

    console.log('Capturing Closing Pyre & Footer...');
    await scrollTo('#pyre');
    await snap('desktop_6_pyre.png');

    console.log('Capturing Desktop Full Page...');
    await scrollTo('#monument');
    await sleep(500);
    await snap('desktop_fullpage_1440.png', true);

    // 2. TABLET (768x1024)
    console.log('\n--- 2. TABLET (768x1024) ---');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 768,
      height: 1024,
      deviceScaleFactor: 1,
      mobile: true
    });
    await scrollTo('#monument');
    await sleep(800);
    await snap('tablet_1_hero.png');

    await scrollTo('#vault');
    await snap('tablet_3_vault.png');

    await scrollTo('#monument');
    await sleep(500);
    await snap('tablet_fullpage_768.png', true);

    // 3. MOBILE (390x844)
    console.log('\n--- 3. MOBILE (390x844) ---');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await scrollTo('#monument');
    await sleep(800);
    await snap('mobile_1_hero.png');

    console.log('Testing Mobile Drawer Menu...');
    await client.send('Runtime.evaluate', {
      expression: `
        const toggle = document.querySelector('.menu-toggle');
        if (toggle) toggle.click();
      `
    });
    await sleep(600);
    await snap('mobile_nav_drawer.png');

    // Close drawer
    await client.send('Runtime.evaluate', {
      expression: `
        const closeBtn = document.querySelector('.mobile-nav-drawer__close');
        if (closeBtn) closeBtn.click();
      `
    });
    await sleep(400);

    console.log('Capturing Mobile Chronicle...');
    await scrollTo('#chronicle');
    await snap('mobile_2_chronicle.png');

    console.log('Capturing Mobile Vault...');
    await scrollTo('#vault');
    await snap('mobile_3_vault.png');

    console.log('Capturing Mobile Anatomy...');
    await scrollTo('#anatomy');
    await snap('mobile_4_anatomy.png');

    console.log('Capturing Mobile Foundry...');
    await scrollTo('#foundry');
    await snap('mobile_5_foundry.png');

    console.log('Capturing Mobile Full Page...');
    await scrollTo('#monument');
    await sleep(500);
    await snap('mobile_fullpage_390.png', true);

    console.log('\nAll Visual QA Screenshots successfully captured!');
    client.close();
  } finally {
    cleanup();
  }
}

main().catch(err => {
  console.error('Fatal QA error:', err);
  process.exit(1);
});
