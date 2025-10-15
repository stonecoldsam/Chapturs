# 🔧 FIX CORS ERROR - R2 Bucket Configuration

## ✅ Good News!

The upload system is **working**! The API generated a presigned URL successfully.

The error is just **CORS configuration** - your R2 bucket needs to allow uploads from `https://chapturs.com`.

---

## 🛠️ Fix in 2 Minutes

### Step 1: Go to Cloudflare R2 Dashboard

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **R2 Object Storage** in sidebar
3. Click your **`chapturs-images`** bucket

### Step 2: Configure CORS

1. Click **Settings** tab
2. Scroll down to **CORS Policy**
3. Click **Add CORS policy** or **Edit**

### Step 3: Add This Policy

```json
[
  {
    "AllowedOrigins": [
      "https://chapturs.com",
      "https://*.chapturs.com",
      "https://*.vercel.app"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

### Step 4: Save

Click **Save** or **Update CORS policy**

---

## 🎯 What This Does

**AllowedOrigins:**
- `https://chapturs.com` - Your production domain
- `https://*.chapturs.com` - Any subdomain (like `www.chapturs.com`)
- `https://*.vercel.app` - Preview deployments

**AllowedMethods:**
- `PUT` - Upload files
- `GET` - Download/view files
- `DELETE` - Remove files
- `HEAD` - Check if file exists

**AllowedHeaders:**
- `*` - Allow all headers (needed for presigned URLs)

**MaxAgeSeconds:**
- `3600` - Cache CORS response for 1 hour

---

## ✅ After Saving

**No redeploy needed!** Just refresh the page and try uploading again.

The CORS error will disappear and uploads will work! 🚀

---

## 🧪 Test Again

1. Go to `https://chapturs.com/test-upload`
2. Select an image
3. Click upload
4. **Should work now!** ✅

You should see:
- Progress bar → 100%
- 3 URLs generated (thumbnail, optimized, original)
- Images display correctly
- Compression savings shown

---

## 🐛 Still Not Working? Advanced Debugging

### 1. Verify CORS Policy is Actually Saved

In Cloudflare R2 Dashboard:
1. Go to your `chapturs-images` bucket
2. Settings tab → CORS Policy
3. **Take a screenshot** of what you see
4. Make sure it shows the JSON policy (not empty)

### 2. Check R2 Bucket Settings

**Make sure Public Access is enabled:**
1. Go to bucket Settings
2. Check if **"Public access"** or **"R2.dev subdomain"** is enabled
3. You need the bucket to allow public access for presigned URLs to work

### 3. Test with Browser DevTools

Open your browser console while testing upload:

1. Go to `https://chapturs.com/test-upload`
2. Open DevTools (F12)
3. Go to **Network** tab
4. Try uploading
5. Look for the **OPTIONS** request (CORS preflight)
6. Check response headers for `Access-Control-Allow-Origin`

**What to look for:**
- ✅ OPTIONS request should return **200 OK**
- ✅ Response should include `Access-Control-Allow-Origin: https://chapturs.com`
- ❌ If OPTIONS returns **403**, CORS policy isn't working

### 4. Wildcard Subdomain Issue

Cloudflare R2 **may not support** `https://*.vercel.app` wildcards. 

**Try the wildcard-free policy above** with explicit domains only.

### 5. Wait for Propagation

CORS changes can take **2-5 minutes** to propagate. After saving:
- Wait 3-5 minutes
- Hard refresh (Ctrl+Shift+R)
- Try in Incognito mode

### 6. Custom Domain vs R2 Direct URL

Your presigned URLs point to:
```
https://chapturs-images.bcdec06776b58a6802e2c3face0f004c.r2.cloudflarestorage.com
```

This is the **R2 storage endpoint**. CORS must be configured on this bucket.

If you have a **custom domain** (like `images.chapturs.com`) pointing to R2:
- CORS must be on the **bucket**, not the domain
- The domain just proxies to the bucket

---

## 🔧 Quick Fix: Try Wildcard CORS First

**Fastest way to test if CORS is the actual issue:**

1. Change CORS policy to allow **all origins** (`"AllowedOrigins": ["*"]`)
2. Save and wait 2 minutes
3. Try upload again
4. If it works → CORS was the issue, just need to fix the origin format
5. If it still fails → Different issue (see below)

---

## ❌ If CORS `*` Still Doesn't Work

Then it's **NOT a CORS configuration issue**. Could be:

### A. Presigned URL Signature Issue
- R2 credentials might be wrong
- Time sync issue (server time vs R2 time)
- Bucket name mismatch

**Check Vercel environment variables:**
- `R2_BUCKET_NAME` must exactly match bucket name in Cloudflare
- `R2_ACCOUNT_ID` must match your R2 account ID
- `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` must be valid

### B. Bucket Permissions
- Bucket might not allow uploads even with presigned URLs
- Check R2 bucket **permissions** settings

### C. R2 Free Tier Limits
- Check if you've exceeded R2 free tier limits
- Go to R2 dashboard → Check usage

---

## 🐛 If Still Not Working

### Double-check the bucket name in CORS

Make sure you're editing the **`chapturs-images`** bucket, not a different one.

### Check for typos

The policy must be **valid JSON**. Use a JSON validator if unsure.

### Try with wildcard (RECOMMENDED FOR TESTING)

Cloudflare R2 might not support wildcard subdomains like `https://*.vercel.app`. Try this **simpler policy for testing**:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Length"],
    "MaxAgeSeconds": 3600
  }
]
```

**This allows all origins.** Use this to test if CORS is the issue. If uploads work with this, then we know the wildcard subdomain format was the problem.

### After Testing with `*`:

If uploads work with the wildcard policy, switch to this **specific policy without wildcards**:

```json
[
  {
    "AllowedOrigins": [
      "https://chapturs.com",
      "https://www.chapturs.com",
      "https://chapturs.vercel.app"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Length"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## 📊 What's Working Now

- ✅ R2 credentials configured
- ✅ Environment variables in Vercel
- ✅ Prisma client generated with Image model
- ✅ API generating presigned URLs
- ✅ Authentication working
- ⏳ CORS configuration needed ← **YOU ARE HERE**

---

**Next step: Add CORS policy to R2 bucket and test!** 🎯

It's the last step before uploads work! 🎉
