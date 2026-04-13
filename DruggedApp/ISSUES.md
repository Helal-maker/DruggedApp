# DruggedApp - Issues & Technical Notes

## Issues Faced

### 1. expo-sqlite Version Mismatch

**Problem:** Initial installation of `expo-sqlite` installed version `55.x`.

```
Warning: expo-sqlite@55.0.15 - expected version: ~16.0.10
```

**Status:** FIXED - Reinstalled correct version `expo-sqlite@~16.0.10`

---

### 2. WASM Loading Failure on Web

**Problem:** SQLite fails on web due to WASM module loading.

```
Unable to resolve "./wa-sqlite/wa-sqlite.wasm" from "node_modules/expo-sqlite/web/worker.ts"
```

**Root Cause:** The expo-sqlite library uses WebAssembly (wa-sqlite) for SQLite operations. On web, Metro bundler cannot resolve WASM files from worker scripts. This is a known limitation.

**Current Status:** 
- Native apps: SQLite database `drugged.db` works ✅
- Web: Uses JavaScript fallback with sample data (20 drugs)

---

### 3. Drug Search Not Working on Web

**Why:** The real SQLite database cannot be loaded in browser due to WASM limitation.

**Solution:** Implemented Platform detection:
- `Platform.OS === 'web'` → Uses hardcoded sample data (5 drugs)
- Native (iOS/Android) → Uses full SQLite database

---

## Implementation Details

### Database Service (`drugDatabase.ts`)

Uses `Platform` check and `expo-file-system` with Asset API:

```typescript
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
```

- **Web:** Falls back to `WEB_SAMPLE` array (5 drugs for demo)
- **Native:** Copies bundled `drugged.db` from assets to document directory, then opens with SQLite

### Required Packages

```bash
npm install expo-file-system expo-asset expo-sqlite@~16.0.10
```

### Database File Location

For the database to work:
1. Place `drugged.db` in `src/assets/` folder
2. Use `Asset.fromModule(require('../assets/drugged.db'))` to load
3. Copy to document directory using `FileSystem.File.copy()`

---

## Summary

| Platform | Database | Status |
|----------|----------|--------|
| Android  | SQLite   | Full 23,596 drugs ✅ |
| iOS       | SQLite   | Full 23,596 drugs ✅ |
| Web       | JS Array | 5 sample drugs |

---

## Why Search Works (Or Doesn't)

### Current Status

**Web Search:** Adding debug logging to diagnose

The search function now logs:
- Platform.OS value
- Query string
- WEB_SAMPLE length
- Results count

Open browser DevTools (F12) → Console to see debug output.

### Expected Behavior

```
[DEBUG] Platform.OS: web
[DEBUG] Query: PANADOL
[DEBUG] WEB_SAMPLE length: 5
[DEBUG] Web results: 1
```

### If Not Working

Common issues:
1. **Platform not detected as 'web'** - Might be 'android' or 'ios' in some cases
2. **Sample data mismatch** - Database names differ from web sample
3. **Filter logic** - Case sensitivity or string matching issue

### To Debug

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try searching for "PANADOL"
4. Check console for `[DEBUG]` messages

---

Last Updated: 2026-04-12