# Drug Search - Why It Doesn't Work

## Executive Summary

| Platform | Search Status | Database |
|----------|-------------|----------|
| Web | ❌ Returns 0 results | Hardcoded sample (5 drugs) |
| Android | ✅ Works | SQLite (23,596 drugs) |
| iOS | ✅ Works | SQLite (23,596 drugs) |

---

## Root Cause Analysis

### 1. Web Platform Limitation

**The Problem:**
- `expo-sqlite` uses WebAssembly (WASM) to run SQLite in JavaScript
- Metro bundler (used for web) cannot resolve WASM files
- Error: `Unable to resolve "./wa-sqlite/wa-sqlite.wasm"`

**Why This Happens:**
```
node_modules/expo-sqlite/web/worker.ts
  ↓
import wasmModule from './wa-sqlite/wa-sqlite.wasm'
  ↓
Metro cannot find .wasm files in worker imports
  ↓
Search fails on web
```

### 2. Current Implementation

The code in `drugDatabase.ts` uses Platform detection:

```typescript
if (Platform.OS === 'web') {
  // Use hardcoded sample data
  return WEB_SAMPLE.filter(d => ...);
} else {
  // Use SQLite database
  const db = await getNativeDb();
  return db.getAllAsync<Drug>(...);
}
```

**Issue:** Even though the code switches to `WEB_SAMPLE`, the search still returns 0 results.

### 3. WEB_SAMPLE Data Issue

Current sample data:

```typescript
const WEB_SAMPLE: Drug[] = [
  { id: 1, trade_name: "PANADOL", active_ingredient: "PARACETAMOL", ... },
  { id: 2, trade_name: "BRUFEN", active_ingredient: "IBUPROFEN", ... },
  { id: 3, trade_name: "AMOXIL", active_ingredient: "AMOXICILLIN", ... },
  { id: 4, trade_name: "VOLTAREN", active_ingredient: "DICLOFENAC SODIUM", ... },
  { id: 5, trade_name: "OMEPRAZOLE", active_ingredient: "OMEPRAZOLE", ... },
];
```

Database has different naming:
```
PANADOL ACUTE HEAD COLD      (not PANADOL)
PANADOL EXTRA 48 F.C. TABS. (not PANADOL EXTRA)
```

**The mismatch:** Web sample has simplified names, database has full names.

---

## Search Function Flow

```
User types "PANADOL"
    ↓
DrugSearchScreen.tsx
    ↓
searchDrugs("PANADOL")
    ↓
Platform.OS === 'web'?
    ↓ YES (on web)
    ↓
WEB_SAMPLE.filter()
    ↓
"panadol".includes("panadol")?
    ↓
Returns PANADOL record
    ↓
Display results
```

**But wait - the filter should work!**

Let's check the actual search code:

```typescript
export async function searchDrugs(query: string): Promise<Drug[]> {
  const q = query.trim();
  if (!q) return [];

  if (Platform.OS === 'web') {
    const lower = q.toLowerCase();
    return WEB_SAMPLE.filter(d =>
      d.trade_name?.toLowerCase().includes(lower) ||
      d.active_ingredient?.toLowerCase().includes(lower)
    );
  }
  // ...
}
```

This should work! Let me check if there's another issue...

---

## Possible Issues

### Issue A: Platform Detection

The issue might be that `Platform.OS` is not `'web'` during development.

```typescript
Platform.OS  // What value does this return?
```

In Expo:
- Web browser: `'web'`
- Android: `'android'`
- iOS: `'ios'`

### Issue B: Metro Caching

Old compiled code might be cached.

```bash
# Clear Metro cache
npx expo start --clear
```

### Issue C: Bundle Not Loading

The JavaScript bundle might not be loading correctly.

Check Network tab in browser dev tools:
- `localhost:8081` → Should return HTML
- `localhost:8081/index.js` → Should return JavaScript

---

## Debugging Steps

### 1. Check Platform Value

Add console log to see what Platform.OS returns:

```typescript
// In drugDatabase.ts
console.log('Platform.OS:', Platform.OS);
console.log('Search query:', query);
console.log('WEB_SAMPLE:', WEB_SAMPLE);
```

### 2. Check Browser Console

Open browser DevTools (F12) and check:
- Console for errors
- Network for failed requests
- Sources for loaded scripts

### 3. Check TypeScript Compilation

```bash
npx tsc --noEmit
```

Expected: No errors

---

## Solutions

### Solution 1: Fix Web Sample Data (Quick)

Update `WEB_SAMPLE` to match real database entries:

```typescript
const WEB_SAMPLE: Drug[] = [
  { id: 1, trade_name: "PANADOL ACUTE HEAD COLD", active_ingredient: "PARACETAMOL+ brompheniramine+ pseudoeph edrine", ... },
  // ... more entries
];
```

### Solution 2: Use Real JSON File (Better)

1. Export database to JSON:
```bash
sqlite3 drugged.db ".mode json" "SELECT * FROM drugs LIMIT 1000" > drugs.json
```

2. Import in code:
```typescript
import drugsData from '../data/drugs.json';
```

### Solution 3: Fetch from API (Best)

Create a simple API endpoint that returns search results.

---

## Technical Details

### expo-sqlite Web Architecture

```
┌─────────────────────────────────────────┐
│              Web Browser                │
├─────────────────────────────────────────┤
│  expo-sqlite                            │
│    └── web/worker.ts (WebWorker)       │
│         └── wa-sqlite.wasm (SQLite)     │
└─────────────────────────────────────────┘
         ↓ Cannot load
┌─────────────────────────────────────────┐
│              Metro Bundler              │
├─────────────────────────────────────────┤
│  - No .wasm import support              │
│  - Worker imports fail                 │
│  - Falls back to empty                 │
└─────────────────────────────────────────┘
```

### FileSystem API (Working)

The new expo-file-system (v55) uses different API:

```typescript
// Old API (expo-file-system < 55)
// import { documentDirectory } from 'expo-file-system/legacy';

// New API (expo-file-system >= 55)
import { Paths, File } from 'expo-file-system';

const destPath = new File(Paths.document, DB_NAME);
await sourceFile.copy(destPath);
```

---

## Summary

| Problem | Cause | Solution |
|---------|-------|----------|
| Search returns 0 on web | Platform detection issue OR sample data mismatch | Debug with console.log |
| SQLite fails on web | WASM not supported in Metro | Use sample data fallback |
| No results displayed | UI not rendering results | Check DrugSearchScreen |

---

## Next Steps

1. Add debugging to find the actual issue
2. Fix the sample data or Platform detection
3. Test thoroughly on web
4. Deploy to native for full functionality

---

Last Updated: 2026-04-12