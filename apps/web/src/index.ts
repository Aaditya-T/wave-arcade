import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT || 3000);
const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const LOGO_PATH = resolve(APP_ROOT, 'logo.png');

const html = String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Wave Arcade - XRPL Community Games</title>
    <meta
      name="description"
      content="Wave Arcade turns XRPL communities into a shared arcade for wallet-linked profiles, quests, factions, leaderboards, and social payments."
    />
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@500;700;900&display=swap");

      :root {
        color-scheme: dark;
        --bg: #0a0a12;
        --surface: #14142a;
        --surface-2: #1b1b36;
        --border: #2a2a4a;
        --text: #e8e8f0;
        --muted: #8888aa;
        --cyan: #00f0ff;
        --magenta: #ff00aa;
        --success: #00ff88;
        --warning: #ffcc00;
        --gold: #ffd700;
        --black: #000000;
        --pixel: "Press Start 2P", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        --body: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      html {
        scroll-behavior: smooth;
      }

      body {
        min-width: 320px;
        margin: 0;
        background:
          linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px),
          linear-gradient(0deg, rgba(255, 0, 170, 0.05) 1px, transparent 1px),
          linear-gradient(135deg, #0a0a12 0%, #111126 46%, #150d21 100%);
        background-size: 24px 24px, 24px 24px, auto;
        color: var(--text);
        font-family: var(--body);
      }

      body::before {
        content: "";
        position: fixed;
        inset: 0;
        z-index: 100;
        background: repeating-linear-gradient(
          0deg,
          rgba(255, 255, 255, 0.035),
          rgba(255, 255, 255, 0.035) 1px,
          transparent 1px,
          transparent 4px
        );
        mix-blend-mode: overlay;
        pointer-events: none;
      }

      body::after {
        content: "";
        position: fixed;
        inset: 0;
        z-index: 99;
        border: 10px solid rgba(0, 0, 0, 0.34);
        box-shadow: inset 0 0 72px rgba(0, 0, 0, 0.9);
        pointer-events: none;
      }

      a {
        color: inherit;
      }

      .shell {
        width: min(1160px, calc(100% - 32px));
        margin: 0 auto;
      }

      .pixel-font {
        font-family: var(--pixel);
        font-weight: 400;
      }

      .topbar {
        position: sticky;
        top: 0;
        z-index: 20;
        border-bottom: 2px solid var(--border);
        background: rgba(10, 10, 18, 0.94);
        box-shadow: 0 4px 0 var(--black);
      }

      .nav {
        display: flex;
        min-height: 76px;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
      }

      .brand {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        text-decoration: none;
      }

      .brand img {
        width: 48px;
        height: 48px;
        border: 2px solid var(--cyan);
        border-radius: 2px;
        box-shadow: 4px 4px 0 var(--black);
        image-rendering: pixelated;
      }

      .brand span {
        font-family: var(--pixel);
        font-size: 0.88rem;
        line-height: 1.5;
      }

      .nav-links {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .nav-links a {
        border: 2px solid var(--border);
        border-radius: 2px;
        padding: 10px 12px;
        background: var(--surface);
        box-shadow: 3px 3px 0 var(--black);
        color: var(--text);
        font-family: var(--pixel);
        font-size: 0.62rem;
        line-height: 1.4;
        text-decoration: none;
      }

      .nav-links a:hover {
        border-color: var(--cyan);
        color: var(--cyan);
      }

      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
        align-items: center;
        gap: 44px;
        min-height: calc(100vh - 76px);
        padding: 42px 0 70px;
      }

      .hero-copy-panel,
      .cabinet,
      .module,
      .step,
      .join-panel {
        border: 2px solid var(--border);
        border-radius: 2px;
        background: var(--surface);
        box-shadow: 6px 6px 0 var(--black);
      }

      .hero-copy-panel {
        position: relative;
        padding: 28px;
      }

      .hero-copy-panel::before {
        content: "PLAYER 1 READY";
        position: absolute;
        top: -18px;
        left: 18px;
        border: 2px solid var(--border);
        border-radius: 2px;
        padding: 8px 10px;
        background: var(--bg);
        color: var(--success);
        font-family: var(--pixel);
        font-size: 0.62rem;
        line-height: 1.4;
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin: 10px 0 20px;
        color: var(--gold);
        font-family: var(--pixel);
        font-size: 0.7rem;
        line-height: 1.7;
      }

      .cursor {
        width: 12px;
        height: 18px;
        background: var(--gold);
        box-shadow: 3px 3px 0 var(--black);
      }

      h1,
      h2,
      h3,
      p {
        margin-top: 0;
      }

      h1 {
        max-width: 840px;
        margin-bottom: 18px;
        color: var(--cyan);
        font-family: var(--pixel);
        font-size: 4.25rem;
        line-height: 1.12;
        text-shadow:
          4px 4px 0 var(--black),
          7px 7px 0 var(--magenta);
      }

      .hero-copy {
        max-width: 680px;
        margin-bottom: 0;
        color: var(--text);
        font-size: 1.12rem;
        font-weight: 700;
        line-height: 1.75;
      }

      .hero-copy strong {
        color: var(--warning);
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        margin-top: 28px;
      }

      .button {
        display: inline-flex;
        min-height: 50px;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--cyan);
        border-radius: 2px;
        padding: 0 16px;
        background: var(--surface-2);
        box-shadow: 5px 5px 0 var(--black);
        color: var(--text);
        font-family: var(--pixel);
        font-size: 0.7rem;
        line-height: 1.5;
        text-align: center;
        text-decoration: none;
        transition: transform 100ms steps(2), box-shadow 100ms steps(2);
      }

      .button:hover {
        transform: translate(-2px, -2px);
        box-shadow: 7px 7px 0 var(--black);
      }

      .button:active {
        transform: translate(4px, 4px);
        box-shadow: 1px 1px 0 var(--black);
      }

      .button.primary {
        border-color: var(--warning);
        background: var(--warning);
        color: var(--bg);
      }

      .cabinet {
        position: relative;
        overflow: hidden;
        padding: 22px;
        background:
          linear-gradient(90deg, rgba(0, 240, 255, 0.09) 50%, transparent 50%),
          linear-gradient(0deg, rgba(255, 0, 170, 0.08) 50%, transparent 50%),
          var(--surface);
        background-size: 16px 16px, 16px 16px, auto;
      }

      .screen {
        display: grid;
        min-height: 420px;
        place-items: center;
        border: 2px solid var(--cyan);
        border-radius: 2px;
        background:
          repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05) 2px, transparent 2px, transparent 6px),
          #05050b;
        box-shadow:
          inset 0 0 0 6px #0d0d1a,
          inset 0 0 40px rgba(0, 240, 255, 0.18);
      }

      .screen img {
        width: min(68%, 320px);
        height: auto;
        filter:
          drop-shadow(0 0 14px rgba(0, 240, 255, 0.72))
          drop-shadow(12px 12px 0 rgba(255, 0, 170, 0.24));
        image-rendering: pixelated;
      }

      .cabinet-label {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-top: 18px;
        color: var(--gold);
        font-family: var(--pixel);
        font-size: 0.62rem;
        line-height: 1.5;
      }

      .controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin-top: 18px;
      }

      .stick {
        width: 38px;
        height: 38px;
        border: 2px solid var(--border);
        background: var(--magenta);
        box-shadow: 4px 4px 0 var(--black);
      }

      .coin {
        width: 28px;
        height: 28px;
        border: 2px solid var(--black);
        border-radius: 50%;
        background: var(--gold);
        box-shadow: 4px 4px 0 var(--black);
      }

      section {
        padding: 74px 0;
      }

      .section-heading {
        display: grid;
        grid-template-columns: minmax(0, 0.85fr) minmax(280px, 1fr);
        gap: 32px;
        margin-bottom: 30px;
      }

      .section-heading h2 {
        margin-bottom: 0;
        color: var(--cyan);
        font-family: var(--pixel);
        font-size: 2.25rem;
        line-height: 1.35;
        text-shadow: 4px 4px 0 var(--black);
      }

      .section-heading p {
        border-left: 6px solid var(--magenta);
        margin-bottom: 0;
        padding-left: 18px;
        color: var(--text);
        font-size: 1.04rem;
        font-weight: 700;
        line-height: 1.75;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
      }

      .module {
        min-height: 250px;
        padding: 20px;
      }

      .tag {
        display: inline-flex;
        margin-bottom: 24px;
        border: 2px solid currentColor;
        border-radius: 2px;
        padding: 8px 10px;
        background: #080813;
        color: var(--cyan);
        font-family: var(--pixel);
        font-size: 0.58rem;
        line-height: 1.5;
        box-shadow: 3px 3px 0 var(--black);
      }

      .module:nth-child(2n) .tag {
        color: var(--warning);
      }

      .module:nth-child(3n) .tag {
        color: var(--magenta);
      }

      .module h3,
      .step h3 {
        margin-bottom: 12px;
        color: var(--text);
        font-family: var(--pixel);
        font-size: 1rem;
        line-height: 1.45;
      }

      .module p,
      .step p,
      .join-panel p,
      .join-panel li {
        margin-bottom: 0;
        color: var(--muted);
        font-weight: 700;
        line-height: 1.65;
      }

      .flow {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 14px;
        counter-reset: step;
      }

      .step {
        position: relative;
        min-height: 190px;
        padding: 18px;
      }

      .step::before {
        counter-increment: step;
        content: "0" counter(step);
        display: grid;
        width: 54px;
        height: 42px;
        margin-bottom: 20px;
        place-items: center;
        border: 2px solid var(--black);
        border-radius: 2px;
        background: var(--success);
        box-shadow: 4px 4px 0 var(--black);
        color: var(--bg);
        font-family: var(--pixel);
        font-size: 0.72rem;
      }

      .join {
        display: grid;
        grid-template-columns: 0.92fr 1.08fr;
        gap: 16px;
      }

      .join-panel {
        padding: 24px;
      }

      .join-panel h2 {
        margin-bottom: 18px;
        color: var(--warning);
        font-family: var(--pixel);
        font-size: 1.8rem;
        line-height: 1.35;
      }

      .join-panel ul {
        display: grid;
        gap: 14px;
        margin: 0;
        padding-left: 20px;
      }

      footer {
        border-top: 2px solid var(--border);
        padding: 28px 0 40px;
        background: rgba(10, 10, 18, 0.92);
        box-shadow: 0 -4px 0 var(--black);
        color: var(--muted);
        font-weight: 700;
      }

      footer .shell {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
      }

      footer strong {
        color: var(--cyan);
        font-family: var(--pixel);
        font-size: 0.72rem;
      }

      @media (max-width: 980px) {
        .hero,
        .section-heading,
        .join {
          grid-template-columns: 1fr;
        }

        .hero {
          min-height: auto;
          padding-top: 44px;
        }

        h1 {
          font-size: 3.4rem;
        }

        .section-heading h2 {
          font-size: 1.8rem;
        }

        .grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .flow {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 680px) {
        .shell {
          width: min(100% - 24px, 1160px);
        }

        body::after {
          border-width: 5px;
        }

        .nav {
          align-items: flex-start;
          flex-direction: column;
          padding: 14px 0;
        }

        .nav-links {
          display: grid;
          width: 100%;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .nav-links a {
          text-align: center;
        }

        .hero-copy-panel {
          padding: 24px 18px 20px;
        }

        h1 {
          font-size: 2.2rem;
          text-shadow:
            3px 3px 0 var(--black),
            5px 5px 0 var(--magenta);
        }

        .hero-copy {
          font-size: 1rem;
        }

        .actions,
        footer .shell {
          align-items: stretch;
          flex-direction: column;
        }

        .button {
          width: 100%;
        }

        .screen {
          min-height: 300px;
        }

        .cabinet-label {
          flex-direction: column;
        }

        .grid {
          grid-template-columns: 1fr;
        }

        .section-heading h2 {
          font-size: 1.32rem;
        }
      }
    </style>
  </head>
  <body>
    <header class="topbar">
      <nav class="shell nav" aria-label="Main navigation">
        <a class="brand" href="/">
          <img src="/logo.png" alt="Wave Arcade logo" width="48" height="48" />
          <span>Wave<br />Arcade</span>
        </a>
        <div class="nav-links">
          <a href="#modules">Games</a>
          <a href="#flow">Loop</a>
          <a href="#rewards">Rewards</a>
          <a href="#join">Join</a>
        </div>
      </nav>
    </header>

    <main>
      <div class="shell hero">
        <section class="hero-copy-panel" aria-labelledby="hero-title">
          <p class="eyebrow"><span class="cursor" aria-hidden="true"></span>Insert wallet to play</p>
          <h1 id="hero-title">Wave Arcade</h1>
          <p class="hero-copy">
            The <strong>XRPL community arcade</strong> where wallets become player cards,
            Discord and Telegram become game lobbies, and every quest, tip, faction battle,
            boss hit, and canvas pixel can feed a shared leaderboard.
          </p>
          <div class="actions" aria-label="Primary actions">
            <a class="button primary" href="#join">Enter Arcade</a>
            <a class="button" href="#modules">Pick Mode</a>
          </div>
        </section>

        <aside class="cabinet" aria-label="Wave Arcade cabinet">
          <div class="screen">
            <img src="/logo.png" alt="Wave Arcade logo" width="320" height="320" />
          </div>
          <div class="cabinet-label">
            <span>XP + REWARDS</span>
            <span>XRPL POWERED</span>
          </div>
          <div class="controls" aria-hidden="true">
            <span class="stick"></span>
            <span class="coin"></span>
            <span class="coin"></span>
            <span class="coin"></span>
          </div>
        </aside>
      </div>

      <section id="modules">
        <div class="shell">
          <div class="section-heading">
            <h2>Choose your game mode.</h2>
            <p>
              Bring your crew, connect your wallet, and turn everyday community action
              into XP, status, rewards, and scoreboard drama.
            </p>
          </div>
          <div class="grid">
            <article class="module">
              <span class="tag">Identity</span>
              <h3>Player cards</h3>
              <p>Your XRPL wallet becomes a living arcade profile with XP, level, badges, faction, and bragging rights.</p>
            </article>
            <article class="module">
              <span class="tag">Quests</span>
              <h3>Daily runs</h3>
              <p>Complete bite-sized challenges, learn new communities, discover projects, and keep your streak alive.</p>
            </article>
            <article class="module">
              <span class="tag">Factions</span>
              <h3>Team rivalry</h3>
              <p>Create a faction, rally friends, climb together, and turn community pride into a team sport.</p>
            </article>
            <article class="module">
              <span class="tag">Payments</span>
              <h3>Tips and rain</h3>
              <p>Celebrate helpful members, creators, moderators, and meme makers with social XRP-powered rewards.</p>
            </article>
            <article class="module">
              <span class="tag">Boss</span>
              <h3>Live events</h3>
              <p>Show up for boss fights, faction pushes, and limited-time events that move the whole lobby.</p>
            </article>
            <article class="module">
              <span class="tag">Ledger</span>
              <h3>On-chain energy</h3>
              <p>Keep the fun social while wallet activity, rewards, and reputation stay rooted in the XRP Ledger.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="flow">
        <div class="shell">
          <div class="section-heading">
            <h2>How players level up.</h2>
            <p>
              Wave Arcade is made for fast, repeatable community play: jump in,
              make a move, earn progress, and come back to beat your last score.
            </p>
          </div>
          <div class="flow">
            <article class="step">
              <h3>Connect</h3>
              <p>Bring your XRPL wallet and social identity into one arcade profile.</p>
            </article>
            <article class="step">
              <h3>Choose</h3>
              <p>Pick a faction, quest, event, bounty, or community challenge.</p>
            </article>
            <article class="step">
              <h3>Play</h3>
              <p>Tip, paint, attack, submit, solve, vote, raid, or complete a run.</p>
            </article>
            <article class="step">
              <h3>Earn</h3>
              <p>Collect XP, badges, faction points, and recognition for real participation.</p>
            </article>
            <article class="step">
              <h3>Rank</h3>
              <p>Climb the leaderboard and help your community claim the top slot.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="rewards">
        <div class="shell">
          <div class="section-heading">
            <h2>Rewards should feel alive.</h2>
            <p>
              Wave Arcade turns the moments communities already care about into visible
              reputation: helping, creating, testing, inviting, competing, and showing up.
            </p>
          </div>
        </div>
      </section>

      <section id="join">
        <div class="shell join">
          <div class="join-panel">
            <h2>Ready your wallet. Rally your crew.</h2>
            <p>
              Wave Arcade is for XRPL communities that want chat to turn into action,
              participation to become reputation, and game nights to feel native to the ledger.
            </p>
          </div>
          <div class="join-panel">
            <ul>
              <li>Build a player identity that travels across web, Xaman, Discord, and Telegram.</li>
              <li>Earn XP and status from quests, tips, events, bounties, and faction play.</li>
              <li>Compete with friends, rival groups, and entire communities on shared leaderboards.</li>
              <li>Make XRPL activity feel social, playful, and worth coming back for.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>

    <footer>
      <div class="shell">
        <strong>Wave Arcade</strong>
        <span>XRPL participation made social, playable, and measurable.</span>
      </div>
    </footer>
  </body>
</html>`;

const server = createServer(async (req, res) => {
  const pathname = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`).pathname;

  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ status: 'ok', app: 'web' }));
    return;
  }

  if (pathname === '/logo.png') {
    try {
      const logo = await stat(LOGO_PATH);
      res.writeHead(200, {
        'Cache-Control': 'public, max-age=86400',
        'Content-Length': logo.size,
        'Content-Type': 'image/png',
      });
      createReadStream(LOGO_PATH).pipe(res);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Logo not found');
    }
    return;
  }

  if (pathname !== '/') {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html.replace('<h1 id="hero-title">Wave Arcade</h1>', '<h1 id="hero-title">Game Over</h1>'));
    return;
  }

  res.writeHead(200, {
    'Cache-Control': 'no-store',
    'Content-Type': 'text/html; charset=utf-8',
  });
  res.end(html);
});

server.listen(PORT, () => {
  console.log(`[web] running at http://localhost:${PORT}`);
});
