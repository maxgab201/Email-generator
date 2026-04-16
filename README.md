# MailCraft — AI Email Generator

Mobile-first email generator powered by **Google Gemini 3.1 Pro Preview**.

## Deploy to Vercel (step by step)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/mailcraft.git
git push -u origin main
```

### 2. Add the API key in Vercel
1. Go to [vercel.com](https://vercel.com) → Import your GitHub repo
2. Before clicking **Deploy**, open **Environment Variables**
3. Add:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** your Gemini API key
4. Click **Deploy** ✅

> ⚠️ Never upload `.env.local` to GitHub — it's already in `.gitignore`.
> The API key lives only in Vercel's environment variables, never in the browser.

## Run locally
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)
