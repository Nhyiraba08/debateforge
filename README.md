# DebateForge 🗣️
> AI-powered debate practice — face an opponent, get judged, improve fast.

---

## What it does
- **Face the Opponent** — AI argues the opposite side of your position
- **Get Judged** — AI scores your argument on Clarity, Logic, Evidence, and Persuasiveness

---

## Project Structure
```
debate-ai/
├── api/
│   └── debate.js        ← Serverless function (calls Claude API)
├── public/
│   └── index.html       ← The entire frontend
├── vercel.json          ← Vercel routing config
├── package.json
└── README.md
```

---

## Deploy to Vercel (Step-by-Step)

### Step 1 — Get a free Anthropic API Key
1. Go to https://console.anthropic.com
2. Sign up for a free account
3. Go to **API Keys** → click **Create Key**
4. Copy the key (starts with `sk-ant-...`)

### Step 2 — Put the project on GitHub
1. Go to https://github.com and create a free account if you don't have one
2. Click **New Repository** → name it `debateforge` → click **Create**
3. Upload all these files to the repo (drag and drop works)

### Step 3 — Deploy on Vercel
1. Go to https://vercel.com and sign up with your GitHub account
2. Click **Add New Project** → Import your `debateforge` repo
3. Click **Deploy** (default settings are fine)

### Step 4 — Add your API Key as an Environment Variable
1. In your Vercel project dashboard, go to **Settings → Environment Variables**
2. Click **Add New**:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** paste your key from Step 1
3. Click **Save**
4. Go to **Deployments** → click the three dots on your latest deploy → **Redeploy**

### Step 5 — Done! 🎉
Your site is live at `https://debateforge.vercel.app` (or similar)

---

## Customization Tips
- **Add more topics**: Edit the `TOPICS` array in `index.html`
- **Change the scoring criteria**: Edit the `judge` system prompt in `api/debate.js`
- **Change colors**: Edit the CSS variables at the top of `index.html` under `:root`

---

## Free Tier Limits
- Anthropic gives you free credits to start (~$5 worth)
- Vercel free tier: 100GB bandwidth/month, unlimited deployments
- More than enough to practice and show to people!
