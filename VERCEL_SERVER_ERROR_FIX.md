# 🚨 Fixing "Server Error" on Vercel

## The Problem

You're seeing:
```
Server error
There is a problem with the server configuration.
Check the server logs for more information.
```

This happens when **NextAuth v5** can't find the required `AUTH_SECRET` environment variable.

---

## ✅ Quick Fix (5 minutes)

### Step 1: Add AUTH_SECRET to Vercel

1. Go to your **Vercel Dashboard**
2. Select your **Chapturs** project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**

Add this variable:

| Key | Value | Environments |
|-----|-------|--------------|
| `AUTH_SECRET` | `lINGmUWYHQdy02k6FggIwAh/HPTTQL5UQfoc1xeIZVY=` | ✅ Production<br>✅ Preview<br>✅ Development |

### Step 2: Add Google OAuth Credentials

While you're in environment variables, add these too:

| Key | Value | Environments |
|-----|-------|--------------|
| `AUTH_GOOGLE_ID` | (from Google Cloud Console) | ✅ Production<br>✅ Preview<br>✅ Development |
| `AUTH_GOOGLE_SECRET` | (from Google Cloud Console) | ✅ Production<br>✅ Preview<br>✅ Development |

### Step 3: Add NEXTAUTH_URL

**For Production environment ONLY:**

| Key | Value | Environments |
|-----|-------|--------------|
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | ✅ Production |

Replace `your-app.vercel.app` with your actual Vercel domain.

### Step 4: Redeploy

Either:
- **Push a commit** (triggers auto-deploy)
- **Or manually redeploy** in Vercel Dashboard

---

## 📋 Full Environment Variables Checklist for Vercel

Make sure **ALL** of these are set in Vercel:

### ✅ Database (Already Set)
- `DATABASE_URL`
- `DIRECT_URL`

### ✅ Redis (Already Set)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

### ✅ AI (Already Set)
- `GROQ_API_KEY`

### ❌ Auth (MISSING - Add These!)
- `AUTH_SECRET` = `lINGmUWYHQdy02k6FggIwAh/HPTTQL5UQfoc1xeIZVY=`
- `AUTH_GOOGLE_ID` = (your Client ID)
- `AUTH_GOOGLE_SECRET` = (your Client Secret)
- `NEXTAUTH_URL` = `https://your-app.vercel.app` (Production only)

---

## 🔍 How to Check Vercel Logs

To see the actual error:

1. Go to **Vercel Dashboard**
2. Click your project
3. Go to **Deployments**
4. Click the latest deployment
5. Click **Functions**
6. Look for errors mentioning "AUTH_SECRET" or "invalid secret"

You should see something like:
```
Error: Please define `AUTH_SECRET` environment variable
```

---

## 🎯 Don't Have Google OAuth Yet?

If you haven't set up Google OAuth credentials yet:

### Option 1: Quick Test (Use Placeholder)

Add these to Vercel temporarily to see if the server error goes away:

```bash
AUTH_GOOGLE_ID="test-id"
AUTH_GOOGLE_SECRET="test-secret"
```

⚠️ **Login won't work** but the server error should disappear.

### Option 2: Set Up Real Google OAuth (10 minutes)

Follow `GOOGLE_OAUTH_SETUP.md` or `AUTH_SETUP_VERCEL.md` to get real credentials.

---

## 🧪 Test Locally First

Before deploying, test that your environment variables work locally:

1. Update `.env`:
```bash
AUTH_SECRET="lINGmUWYHQdy02k6FggIwAh/HPTTQL5UQfoc1xeIZVY="
AUTH_GOOGLE_ID="your-real-or-test-id"
AUTH_GOOGLE_SECRET="your-real-or-test-secret"
NEXTAUTH_URL="http://localhost:3000"
```

2. Run dev server:
```bash
npm run dev
```

3. Visit `http://localhost:3000`
   - If you see the homepage: ✅ Auth config is valid
   - If you see "Server Error": ❌ Check your .env file

4. Try to sign in:
   - Click sign in button
   - Should redirect to Google (or show error if credentials are fake)

---

## 🐛 Still Getting Server Error?

### Check 1: Environment Variables in Vercel

Go to **Settings → Environment Variables** and verify:
- ✅ `AUTH_SECRET` exists
- ✅ It's enabled for "Production"
- ✅ No extra spaces or quotes
- ✅ You clicked "Save"

### Check 2: Redeploy After Adding Variables

**Important:** Adding environment variables doesn't auto-redeploy!

You must:
- Push a new commit, OR
- Go to Deployments → ⋯ → Redeploy

### Check 3: Check Build Logs

Go to **Deployments → Latest → Build Logs**

Look for:
- ❌ "AUTH_SECRET not defined"
- ❌ "Invalid environment variable"
- ❌ Import errors

### Check 4: Database Connection

The error might not be auth-related! Check if database connection works:

```bash
# In Vercel environment variables, verify:
DATABASE_URL exists
DIRECT_URL exists
```

---

## 💡 Common Mistakes

### Mistake 1: Only Added to "Production"
✅ **Fix**: Select **all three** environments (Production, Preview, Development)

### Mistake 2: Didn't Redeploy
✅ **Fix**: Push a commit or manually redeploy

### Mistake 3: Extra Quotes
❌ Bad: `"lINGmUWYHQdy02k6FggIwAh/HPTTQL5UQfoc1xeIZVY="`  
✅ Good: `lINGmUWYHQdy02k6FggIwAh/HPTTQL5UQfoc1xeIZVY=`

### Mistake 4: Wrong NEXTAUTH_URL
❌ Bad: `http://localhost:3000` (in Production)  
✅ Good: `https://your-actual-app.vercel.app`

---

## 📸 Visual Guide: Adding Environment Variables in Vercel

```
Vercel Dashboard
└─ Your Project
   └─ Settings
      └─ Environment Variables
         └─ Add New
            ┌─────────────────────────────────┐
            │ Key: AUTH_SECRET                 │
            │ Value: lINGmUW...                │
            │ Environments:                    │
            │ ☑ Production                     │
            │ ☑ Preview                        │
            │ ☑ Development                    │
            └─────────────────────────────────┘
            Click "Save"
```

Repeat for each variable!

---

## ✅ Success Checklist

After adding all variables and redeploying:

- [ ] Visit `https://your-app.vercel.app`
- [ ] Homepage loads (no server error)
- [ ] Click "Sign In" button
- [ ] Redirects to Google OAuth page
- [ ] After authorizing, redirects back logged in

---

## 🚀 Summary

**The server error is because `AUTH_SECRET` is missing.**

**Fix in 3 steps:**
1. Add `AUTH_SECRET` to Vercel environment variables
2. Add Google OAuth credentials (or test values)
3. Redeploy

**Takes 5 minutes and the error will be gone!**

---

Need help? Check the Vercel function logs for specific error messages.
