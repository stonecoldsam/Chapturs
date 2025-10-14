# Manual Testing Guide: Character Profile Creation

## Prerequisites
1. Database migration applied (see `CHARACTER_SYSTEM_MIGRATION.md`)
2. User is authenticated and logged in
3. User has at least one work created

## Test Scenarios

### 1. Happy Path - Create Minimal Character
**Test**: Create character with only required field

**Steps**:
1. Navigate to work editor
2. Select a name/word in the text
3. Click "Add Character Profile"
4. Fill in only "Name" field: `"Test Hero"`
5. Submit

**Expected**:
- ✅ 200 response
- ✅ Character appears in Characters list
- ✅ Default values applied (empty arrays for aliases, personalityTraits, empty object for metadata)

**API Test**:
```bash
curl -X POST https://chapturs.com/api/works/[workId]/characters \
  -H "Content-Type: application/json" \
  -H "Cookie: [auth-cookie]" \
  -d '{"name": "Test Hero"}'
```

**Expected Response**:
```json
{
  "success": true,
  "character": {
    "id": "cm...",
    "name": "Test Hero",
    "aliases": "[]",
    "personalityTraits": "[]",
    "metadata": "{}",
    ...
  }
}
```

---

### 2. Happy Path - Create Full Character
**Test**: Create character with all fields

**Steps**:
1. Navigate to work editor
2. Click "Add Character Profile"
3. Fill in all fields:
   - Name: `"John Doe"`
   - Aliases: `["The Wanderer", "JD"]`
   - Role: `"protagonist"`
   - First Appearance: `1`
   - Image URL: `"https://example.com/john.jpg"`
   - Physical Description: `"Tall with dark hair"`
   - Age: `"30"`
   - Height: `"6'2\""`
   - Backstory: `"Born in a small village..."`
   - Personality Traits: `["brave", "loyal", "stubborn"]`
   - Motivations: `"To save his family"`
   - Character Arc: `"From naive to experienced"`
   - Author Notes: `"Based on historical figure"`
4. Submit

**Expected**:
- ✅ 200 response
- ✅ All fields saved correctly
- ✅ Character appears with full details

---

### 3. Validation - Missing Name
**Test**: Submit without required name field

**Steps**:
1. Click "Add Character Profile"
2. Leave name empty or don't provide it
3. Submit

**Expected**:
- ✅ 400 Bad Request
- ✅ Error message: `"Validation failed"`
- ✅ Details include: `"Character name is required"`

**API Test**:
```bash
curl -X POST https://chapturs.com/api/works/[workId]/characters \
  -H "Content-Type: application/json" \
  -H "Cookie: [auth-cookie]" \
  -d '{}'
```

**Expected Response**:
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "message": "Character name is required"
    }
  ]
}
```

---

### 4. Validation - Name Too Long
**Test**: Submit with name exceeding 100 characters

**Steps**:
1. Enter name with 101+ characters
2. Submit

**Expected**:
- ✅ 400 Bad Request
- ✅ Error: `"Character name too long"`

---

### 5. Validation - Invalid Image URL
**Test**: Submit with malformed image URL

**API Test**:
```bash
curl -X POST https://chapturs.com/api/works/[workId]/characters \
  -H "Content-Type: application/json" \
  -H "Cookie: [auth-cookie]" \
  -d '{"name": "Test", "imageUrl": "not-a-url"}'
```

**Expected**:
- ✅ 400 Bad Request
- ✅ Error: `"Invalid image URL"`

---

### 6. Validation - Negative First Appearance
**Test**: Submit with negative chapter number

**API Test**:
```bash
curl -X POST https://chapturs.com/api/works/[workId]/characters \
  -H "Content-Type: application/json" \
  -H "Cookie: [auth-cookie]" \
  -d '{"name": "Test", "firstAppearance": -1}'
```

**Expected**:
- ✅ 400 Bad Request
- ✅ Error: `"First appearance must be positive"`

---

### 7. Authorization - Not Authenticated
**Test**: Try to create character without login

**API Test**:
```bash
curl -X POST https://chapturs.com/api/works/[workId]/characters \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
```

**Expected**:
- ✅ 401 Unauthorized
- ✅ Error: `"Unauthorized"`

---

### 8. Authorization - Not Work Owner
**Test**: Try to create character in someone else's work

**Steps**:
1. Login as User A
2. Try to create character in User B's work

**Expected**:
- ✅ 403 Forbidden
- ✅ Error: `"Unauthorized - You do not own this work"`

---

### 9. Error Handling - Work Not Found
**Test**: Try to create character for non-existent work

**API Test**:
```bash
curl -X POST https://chapturs.com/api/works/invalid-work-id/characters \
  -H "Content-Type: application/json" \
  -H "Cookie: [auth-cookie]" \
  -d '{"name": "Test"}'
```

**Expected**:
- ✅ 404 Not Found
- ✅ Error: `"Work not found"`

---

### 10. Database Error - Missing Table
**Test**: Verify helpful error if migration not applied

**Condition**: Tables don't exist (before migration)

**Expected**:
- ✅ 500 Internal Server Error
- ✅ Error: `"Database table not found"`
- ✅ Hint: `"Run: npx prisma migrate deploy"`

---

### 11. Persistence Test
**Test**: Verify character persists after refresh

**Steps**:
1. Create character "Alice"
2. Refresh page
3. Navigate to Characters list

**Expected**:
- ✅ Character "Alice" is still present
- ✅ All saved data intact

---

### 12. Character Version Creation
**Test**: Verify character version is created when firstAppearance is provided

**API Test**:
```bash
curl -X POST https://chapturs.com/api/works/[workId]/characters \
  -H "Content-Type: application/json" \
  -H "Cookie: [auth-cookie]" \
  -d '{
    "name": "Evolving Hero",
    "firstAppearance": 1,
    "physicalDescription": "Young and innocent",
    "backstory": "Grew up in peaceful times"
  }'
```

**Expected**:
- ✅ Character profile created
- ✅ Character version also created in `character_versions` table
- ✅ Version has `fromChapter = 1`
- ✅ Development notes: `"Introduced in chapter 1"`

**Verify**:
```sql
SELECT * FROM character_versions WHERE "characterId" = '[character-id]';
```

---

### 13. Relationship Test (Optional)
**Test**: Create character with relationship to another

**Steps**:
1. Create first character "Alice"
2. Create second character "Bob"
3. Add relationship: Alice -> Bob (relationship type: "friend")

**Expected**:
- ✅ Relationship created
- ✅ Can query relationships through API

---

### 14. GET Characters Test
**Test**: Retrieve all characters for a work

**API Test**:
```bash
curl -X GET https://chapturs.com/api/works/[workId]/characters?chapter=1 \
  -H "Cookie: [auth-cookie]"
```

**Expected**:
- ✅ 200 response
- ✅ Array of characters returned
- ✅ Version-aware data based on chapter parameter

---

## Console Error Checking

After each test, check browser console for:
- ❌ No 500 errors
- ❌ No "Failed to create character" messages
- ✅ Clean network tab (or appropriate error status codes)

## Database Verification

After tests, verify in Supabase:

```sql
-- Check character was created
SELECT * FROM character_profiles WHERE "workId" = '[work-id]';

-- Check version if applicable
SELECT * FROM character_versions WHERE "characterId" = '[character-id]';

-- Verify indexes exist
SELECT indexname FROM pg_indexes WHERE tablename = 'character_profiles';
```

## Expected Index Names
- `character_profiles_workId_idx`
- `character_profiles_name_idx`
- `character_versions_characterId_idx`
- `character_versions_fromChapter_idx`

---

## Success Criteria

All tests should pass with:
- ✅ Correct HTTP status codes
- ✅ Proper error messages with helpful details
- ✅ Data persists in database
- ✅ No console errors for valid requests
- ✅ Validation errors clear and actionable
- ✅ Authorization properly enforced
