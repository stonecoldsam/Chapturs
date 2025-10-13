# 🔍 Debugging "Access Denied" Login Error

## The Error

You're getting "Access Denied" after selecting your Google account. This means:
- ✅ Google OAuth is working (you reach Google's login page)
- ✅ Credentials are correct (Google accepts them)
- ❌ Our signIn callback is returning `false` (rejecting the login)

## Most Likely Causes

### 1. Database Connection Issue (Most Common)

**Problem:** Vercel can't connect to Supabase

**Check:**
- Are `DATABASE_URL` and `DIRECT_URL` set in Vercel?
- Are the connection strings correct?
- Is Supabase project active?

**Fix in Vercel:**
1. Settings → Environment Variables
2. Verify these exist:
   ```
   DATABASE_URL=postgresql://postgres.xxx:password@aws-1-us-east-2.pooler.supabase.com:5432/postgres
   DIRECT_URL=postgresql://postgres.xxx:password@aws-1-us-east-2.pooler.supabase.com:5432/postgres
   ```
3. Make sure they're set for **Production** environment
4. Redeploy after adding/fixing

---

### 2. Prisma Client Not Generated

**Problem:** Prisma client doesn't exist in production build

**Check Vercel Build Logs:**
1. Deployments → Latest → Build Logs
2. Look for: `✔ Generated Prisma Client`
3. If missing, Prisma isn't generating in build

**Fix:**
Check `package.json` has postinstall script:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

---

### 3. Database Schema Not Pushed

**Problem:** Tables don't exist in Supabase

**Check in Supabase:**
1. Go to Supabase dashboard
2. Click **Table Editor**
3. Should see tables: User, Author, Work, etc.
4. If tables are missing → schema not pushed

**Fix:**
```bash
npx prisma db push
```

---

## 📊 Check the Logs

I just added detailed logging to the auth callback. After the deployment finishes:

### Step 1: Try to Sign In Again

1. Go to your Vercel app
2. Click "Sign In"
3. Select your Google account
4. You'll get "Access Denied" again (expected)

### Step 2: Check Vercel Function Logs

1. Go to **Vercel Dashboard**
2. Your project → **Deployments**
3. Click latest deployment
4. Click **Functions** tab
5. Look for `/api/auth/callback/google` or similar
6. Click on it to see logs

### Step 3: Look for These Log Messages

**If you see:**
```
🔐 Sign-in attempt: { provider: 'google', email: 'your@email.com', ... }
📝 Attempting to upsert user in database...
❌ Database error during sign-in: ...
```

→ **Database connection issue**

**If you see:**
```
🔐 Sign-in attempt: { provider: 'google', email: 'your@email.com', ... }
📝 Attempting to upsert user in database...
✅ User upserted: your@email.com
📝 Attempting to upsert author profile...
❌ Database error during sign-in: ...
```

→ **Author table or relation issue**

**If you see:**
```
❌ Sign-in rejected: No email in profile
```

→ **Google OAuth scope issue** (rare)

**If you see nothing:**
→ **Auth callback not running** (config issue)

---

## 🔧 Quick Fixes

### Fix 1: Verify Environment Variables

**Run this check:**

In Vercel Dashboard:
1. Settings → Environment Variables
2. Confirm ALL of these exist for **Production**:

```bash
# Auth (CRITICAL)
AUTH_SECRET=lINGmUWYHQdy02k6FggIwAh/HPTTQL5UQfoc1xeIZVY=
AUTH_GOOGLE_ID=xxxxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-xxxxx
NEXTAUTH_URL=https://your-app.vercel.app

# Database (CRITICAL)
DATABASE_URL=postgresql://postgres.xxx:password@aws-1-us-east-2.pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres.xxx:password@aws-1-us-east-2.pooler.supabase.com:5432/postgres

# Redis (Optional for now)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx

# AI (Optional for now)
GROQ_API_KEY=gsk_xxxxx
```

### Fix 2: Test Database Connection

Create a test endpoint to verify database works:

`src/app/api/test-db/route.ts`:
```typescript
import { prisma } from '@/lib/database/PrismaService'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    return NextResponse.json({
      success: true,
      message: 'Database connected!',
      userCount
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
```

Then visit: `https://your-app.vercel.app/api/test-db`

**If you see:**
```json
{"success": true, "message": "Database connected!", "userCount": 0}
```
→ ✅ Database works!

**If you see error:**
→ ❌ Database connection broken

---

## 🎯 Most Common Solution

**90% of the time, it's missing DATABASE_URL in Vercel.**

### Quick Check:

1. Go to Vercel → Settings → Environment Variables
2. Search for `DATABASE_URL`
3. If it doesn't exist or shows wrong value → **That's the problem!**
4. Add it with the Supabase connection string
5. Add `DIRECT_URL` too (same value for now)
6. Redeploy

---

## 📋 Debugging Checklist

Go through these in order:

- [ ] Verified `DATABASE_URL` exists in Vercel env vars
- [ ] Verified `DIRECT_URL` exists in Vercel env vars
- [ ] Verified `AUTH_SECRET` exists in Vercel env vars
- [ ] Verified `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` exist
- [ ] Checked Supabase dashboard - tables exist
- [ ] Checked Vercel function logs for error details
- [ ] Tested `/api/test-db` endpoint
- [ ] Checked build logs for "Generated Prisma Client"
- [ ] Redeployed after adding environment variables

---

## 🔍 After Logs Show Error

Once you check the Vercel function logs and see the specific error:

**Copy the error message and send it to me** - I can give you the exact fix!

Example errors:
```
Error: Can't reach database server
→ DATABASE_URL is wrong or Supabase is down

Error: Invalid `prisma.user.upsert()` invocation
→ Schema mismatch or table doesn't exist

Error: Unique constraint failed on the fields: (`email`)
→ User already exists with different ID (shouldn't happen but possible)
```

---

## 💡 Quick Test

**Want to test locally first?**

```bash
# Update .env with Supabase credentials
DATABASE_URL="postgresql://postgres.xxx:password@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.xxx:password@aws-1-us-east-2.pooler.supabase.com:5432/postgres"

# Try pushing schema
npx prisma db push

# Start dev server
npm run dev

# Try logging in at http://localhost:3000
```

If it works locally but not on Vercel → **environment variables aren't set in Vercel**

---

## ✅ Next Steps

1. **Wait for deployment to finish** (commit d41ffc0 just pushed)
2. **Try signing in again** (will fail but generate logs)
3. **Check Vercel function logs** (see exact error)
4. **Send me the error message** from the logs
5. **I'll give you the exact fix!**

Or if you want to skip ahead:
- Add `DATABASE_URL` and `DIRECT_URL` to Vercel environment variables
- That's probably the issue 90% of the time

---

**Once the deployment finishes, try logging in and check those function logs!** 🔍
