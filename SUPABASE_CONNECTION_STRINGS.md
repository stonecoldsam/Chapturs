# 🔌 Getting Supabase Connection Strings

## Where to Find Both DATABASE_URL and DIRECT_URL

### Visual Guide

```
Supabase Dashboard
  └─ Settings (⚙️)
      └─ Database
          └─ Connection string section
              └─ Connection parameters (tabs)
                  └─ URI tab ← CLICK THIS
                      └─ Dropdown menu ← LOOK HERE!
                          ├─ Session mode      ← DATABASE_URL
                          ├─ Transaction mode
                          └─ Direct connection ← DIRECT_URL
```

---

## Step-by-Step Instructions

### 1️⃣ Get DATABASE_URL (Session Pooling)

1. In your Supabase project, click **Settings** (⚙️ icon in sidebar)
2. Click **Database** in the settings menu
3. Scroll down to **"Connection string"** section
4. Click the **"URI"** tab (not "Session", not "Transaction")
5. You'll see a dropdown - select **"Session mode"**
6. Copy the string that appears - it looks like:

```
postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

7. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with the password you set when creating the project
8. Notice the port is **6543** - this confirms it's the pooled connection
9. This is your `DATABASE_URL` ✅

**Example**:
```bash
# Before (what you see):
postgresql://postgres.abcdefghijk:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# After (what you use):
DATABASE_URL="postgresql://postgres.abcdefghijk:MySecretPass123!@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

---

### 2️⃣ Get DIRECT_URL (Direct Connection)

1. In the **SAME** location (Settings → Database → Connection string → URI tab)
2. Change the dropdown from "Session mode" to **"Direct connection"**
3. Copy the NEW string that appears - it looks like:

```
postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

4. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with the same password
5. Notice the port is **5432** - this confirms it's the direct connection
6. This is your `DIRECT_URL` ✅

**Example**:
```bash
# Before (what you see):
postgresql://postgres.abcdefghijk:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres

# After (what you use):
DIRECT_URL="postgresql://postgres.abcdefghijk:MySecretPass123!@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

---

## 🔑 Key Differences

| Variable | Port | Use Case | When Used |
|----------|------|----------|-----------|
| `DATABASE_URL` | **5432** | Session pooling (pgBouncer) | App queries, API routes |
| `DIRECT_URL` | **5432*** | Direct connection | Migrations only (`prisma db push`) |

*Note: As of 2025, Supabase uses port 5432 for both pooled and direct connections. The difference is in the hostname:
- Session Pooler: `aws-X-region.pooler.supabase.com`
- Direct Connection: `db.xxxxx.supabase.co`

---

## 📋 Quick Copy Template

Once you have both, add to your `.env.local`:

```bash
# Supabase Connection Strings
DATABASE_URL="postgresql://postgres.YOUR_PROJECT_REF:[YOUR-PASSWORD]@aws-0-REGION.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.YOUR_PROJECT_REF:[YOUR-PASSWORD]@aws-0-REGION.pooler.supabase.com:5432/postgres"
```

**Don't forget to**:
- Replace `[YOUR-PASSWORD]` with your actual password
- Replace `YOUR_PROJECT_REF` with your project's reference
- Replace `REGION` with your region (e.g., us-east-1)

---

## ✅ How to Test

After adding both to your `.env.local`:

```bash
# Test the connection
npx prisma db push
```

You should see:
```
✔ Generated Prisma Client
🚀 Your database is now in sync with your Prisma schema.
```

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"
- ✅ Check: Did you replace `[YOUR-PASSWORD]`?
- ✅ Check: Is your IP allowed? (Supabase allows all by default)
- ✅ Check: Did you wait 2 minutes after project creation?

### Error: "Invalid connection string"
- ✅ Check: No spaces in the connection string
- ✅ Check: Password is URL-encoded if it has special characters
- ✅ Check: Copied the entire string (don't truncate)

### Password has special characters?

If your password contains `@`, `#`, `%`, etc., you need to URL-encode it:

| Character | Encoded |
|-----------|---------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| `&` | `%26` |
| `=` | `%3D` |

**Example**:
```bash
# Password: MyPass@123#
# Encoded:  MyPass%40123%23

DATABASE_URL="postgresql://postgres.abc:MyPass%40123%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

---

## 🎯 Next Steps

Once you have both connection strings:

1. ✅ Add them to `.env.local` (local development)
2. ✅ Add them to Vercel environment variables (production)
3. ✅ Run `npx prisma db push` to create tables
4. ✅ Continue with DATABASE_INTEGRATION.md guide

---

## 📸 Visual Reference

**What the Supabase UI looks like:**

```
┌─────────────────────────────────────────┐
│ Connection string                        │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ URI | Session | Transaction         │ │ ← Click "URI" tab
│ └─────────────────────────────────────┘ │
│                                          │
│ Connection parameters:                   │
│ ┌─────────────────────────────────────┐ │
│ │ Session mode                   ▼    │ │ ← Dropdown menu!
│ └─────────────────────────────────────┘ │
│                                          │
│ postgresql://postgres.xxx...             │ ← Connection string appears here
└─────────────────────────────────────────┘
```

**Dropdown options:**
- ✅ **Session mode** → DATABASE_URL (port 6543)
- Transaction mode
- ✅ **Direct connection** → DIRECT_URL (port 5432)

---

**That's it!** You now have both connection strings needed for Prisma + Supabase. 🚀
