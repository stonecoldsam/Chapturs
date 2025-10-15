# 🎉 R2 Setup Complete - Test & Deploy Checklist

## ✅ What's Done

1. **R2 Bucket Created** - `chapturs-images` on Cloudflare
2. **API Token Generated** - Read & Write permissions
3. **Credentials Added to .env.local** - All 5 variables configured
4. **Free Tier Settings** - Optimized for 10 GB limit
5. **Test Page Created** - `/test-upload` for easy testing

## 🧪 Test Locally (RIGHT NOW)

### Step 1: Open Test Page

The dev server should be running. Open your browser:

```
http://localhost:3000/test-upload
```

### Step 2: Test Uploads

Try each upload type:

1. **Profile Upload** (3 MB limit)
   - Click "Click to upload Profile Picture"
   - Select an image
   - Watch progress bar
   - See compressed result!

2. **Cover Upload** (5 MB limit)
   - Try a larger image
   - Verify it works

3. **Fan Art Upload** (8 MB limit)
   - Test with a high-res image
   - Check compression savings

### Step 3: Verify Results

For each upload, check:

- ✅ **3 URLs created**: thumbnail, optimized, original
- ✅ **WebP conversion** worked (see .webp in filenames)
- ✅ **Compression savings** shown (should be 60-70%)
- ✅ **Images display** correctly
- ✅ **Metadata** saved (size, dimensions, etc.)

### Step 4: Check Usage Stats

Click **"Check Usage"** button to see:

- Current storage used
- Number of images
- Operations count
- Status (safe/warning/critical)

## 🐛 If Something Breaks

### Issue: "Failed to generate upload URL"

**Check console for error**. Likely causes:

1. **Missing env vars** - Did you restart the dev server after adding .env.local?
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Wrong credentials** - Double-check R2 values in .env.local match Cloudflare dashboard

3. **Bucket doesn't exist** - Verify `chapturs-images` bucket exists in R2

### Issue: "Upload failed - Network error"

**Bucket permissions issue**. Fix:

1. Go to Cloudflare R2 dashboard
2. Click on `chapturs-images` bucket
3. Go to **Settings** → **Public Access**
4. Enable **"Allow Public Access"**
5. Save

### Issue: Images upload but don't display

**CORS configuration needed**:

1. In R2 bucket settings, find **CORS**
2. Add this policy:
   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000", "https://chapturs.com"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

### Issue: "Property 'image' does not exist"

**TypeScript server hasn't reloaded**. Fix:

1. Press `Cmd/Ctrl + Shift + P`
2. Type: "TypeScript: Restart TS Server"
3. Press Enter

Or just ignore - it will work at runtime!

## 🚀 Deploy to Vercel

Once local testing works:

### Step 1: Commit Your Changes

```bash
git add .
git commit -m "Add free-tier image upload system with R2"
git push
```

### Step 2: Add Environment Variables to Vercel

Go to Vercel dashboard → Your Project → Settings → Environment Variables

Add these **8 variables**:

```env
R2_ACCOUNT_ID=bcdec06776b58a6802e2c3face0f004c
R2_ACCESS_KEY_ID=cbe51f0c8d2f6f8044520e106c030fcf
R2_SECRET_ACCESS_KEY=0132ed719091206bd225da40c32b8c8b07b6d139531bbb96acc483d214267e92
R2_BUCKET_NAME=chapturs-images
R2_PUBLIC_URL=https://pub-bcdec06776b58a6802e2c3face0f004c.r2.dev

FREE_TIER_ENABLED=true
FREE_TIER_STORAGE_GB=10
FREE_TIER_OPERATIONS=1000000
```

**Important**: Add them to:
- ✅ Production
- ✅ Preview
- ✅ Development

### Step 3: Redeploy

Vercel will auto-deploy when you push, but if you added env vars after:

1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"

### Step 4: Test Production

Visit your production URL:
```
https://your-app.vercel.app/test-upload
```

Upload an image and verify it works!

## 📊 Expected Results

### Compression Savings

```
Profile (512×512):
├─ Original JPEG: ~2 MB
├─ Optimized WebP: ~400 KB (80% smaller!)
├─ Thumbnail: ~20 KB (99% smaller!)
└─ Total saved: ~1.6 MB per upload

Cover (800×1200):
├─ Original PNG: ~5 MB
├─ Optimized WebP: ~800 KB (84% smaller!)
├─ Thumbnail: ~50 KB (99% smaller!)
└─ Total saved: ~4.2 MB per upload

Fan Art (1200×1200):
├─ Original JPG: ~8 MB
├─ Optimized WebP: ~2 MB (75% smaller!)
├─ Thumbnail: ~80 KB (99% smaller!)
└─ Total saved: ~6 MB per upload
```

### Storage Efficiency

10 uploads = ~20-30 MB storage (vs 40-80 MB without optimization)

**You can fit ~300-500 images per GB!**

## 🎯 Next Steps After Testing

1. ✅ Test locally (`/test-upload`)
2. ✅ Fix any issues
3. ✅ Commit and push
4. ✅ Add env vars to Vercel
5. ✅ Test production
6. ⏭️ Integrate into profile editor
7. ⏭️ Replace URL inputs with ImageUpload component

## 📝 What to Commit

When you commit, you'll be adding:

**New Files:**
- `src/lib/r2.ts` - R2 client
- `src/lib/image-processing.ts` - Image optimization
- `src/lib/r2-usage.ts` - Usage monitoring
- `src/app/api/upload/request/route.ts` - Upload request API
- `src/app/api/upload/confirm/route.ts` - Upload confirm API
- `src/app/api/upload/delete/route.ts` - Delete API
- `src/components/upload/ImageUpload.tsx` - Upload UI
- `src/app/test-upload/page.tsx` - Test page
- `prisma/schema.prisma` - Updated with Image model

**Modified Files:**
- `.env.example` - Added R2 template

**DON'T COMMIT:**
- `.env.local` - Keep this secret!

## 🎉 Success Criteria

Your system is working when:

- ✅ Image uploads complete without errors
- ✅ 3 URLs are returned (thumbnail, optimized, original)
- ✅ All images display in the test page
- ✅ Compression savings show ~60-70%
- ✅ Usage stats load correctly
- ✅ Files appear in R2 bucket dashboard
- ✅ Database has image records

## 💡 Pro Tips

1. **Test with different sizes** - Try small (100 KB), medium (2 MB), and large (8 MB) images
2. **Test file types** - Try JPEG, PNG, WebP, GIF
3. **Check the R2 dashboard** - Verify files appear in your bucket
4. **Monitor compression** - Should see 60-70% savings consistently
5. **Test error cases** - Try uploading a file that's too large

## 🔥 Common Gotchas

### Vercel Environment Variables

**Must add to ALL environments** (Production, Preview, Development) or previews won't work!

### R2 Public Access

**Must enable** or images won't be accessible via URLs.

### CORS Configuration

**Must add** if you get network errors on upload.

### Auth in Production

You'll need to add real `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET` to Vercel for login to work.

## 📚 Reference Docs

If you get stuck:

- `QUICK_START_IMAGE_UPLOAD.md` - 5-min setup guide
- `IMAGE_UPLOAD_FREE_TIER_COMPLETE.md` - Complete implementation summary
- `IMAGE_UPLOAD_IMPLEMENTATION.md` - Full technical details
- `IMPLEMENTATION_COMPLETE.md` - Overall status

---

**You're ready to test! Visit http://localhost:3000/test-upload now! 🚀**
