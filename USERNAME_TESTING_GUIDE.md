# Username System Testing Guide

## 🧪 Manual Testing Instructions

### Test 1: New User Google OAuth + Username Selection

**Steps:**
1. Open http://localhost:8081/signup in incognito browser
2. Click "Continue with Google"
3. Complete Google OAuth flow
4. **Expected**: Username selection form should appear
5. Enter a username (test with various scenarios):
   - ✅ Valid: "testuser123" 
   - ❌ Invalid: "ab" (too short)
   - ❌ Invalid: "test@user" (special chars)
   - ❌ Taken: Try a username that exists
6. **Expected**: Real-time validation and availability checking
7. Submit valid, available username
8. **Expected**: Redirect to home page with username set

### Test 2: Existing User Login

**Steps:**
1. Open http://localhost:8081/login
2. **Expected**: See both Google and email/password options
3. Try logging in with existing email/password account
4. **Expected**: Successful login

### Test 3: Username Editing in Profile

**Steps:**
1. Login to your account
2. Navigate to your profile page
3. **Expected**: See "Username Settings" card
4. Click "Change Username" (or "Set Username" if none)
5. Test username editing with various scenarios:
   - ✅ Valid new username
   - ❌ Username already taken
   - ❌ Invalid characters
   - ❌ Too short
6. **Expected**: Real-time validation and saving

### Test 4: Edge Cases

**Test 4a: User without username**
1. Check if users created via Google OAuth but without username can:
   - Access their profile
   - Set a username via profile page
   - See proper fallback UI

**Test 4b: Database consistency**
1. Check that username updates are properly reflected everywhere
2. Check that old usernames become available after change
3. Check that profile queries work with null usernames

## 🔧 Debug Console Commands

Open browser dev console and run these to debug:

```javascript
// Check current auth state
console.log('Auth state:', window.supabase?.auth?.getUser());

// Check profile data
window.supabase?.from('profiles').select('*').eq('id', 'USER_ID_HERE').single()
  .then(({data, error}) => console.log('Profile:', data, error));

// Check username availability
window.supabase?.from('profiles').select('username').eq('username', 'test_username').single()
  .then(({data, error}) => console.log('Username check:', data, error));
```

## 🎯 Expected Behaviors

### Google OAuth New User Flow:
1. User clicks "Continue with Google" → Google OAuth
2. Supabase creates profile with null username
3. SignUp.tsx detects null username → shows username form
4. User enters username → availability checked → saved
5. Redirect to home with complete profile

### Profile Username Management:
1. Users see current username or "No username set"
2. Real-time validation during editing
3. Proper error handling for duplicates/invalid inputs
4. Immediate UI updates after successful changes
5. Query cache invalidation to reflect changes

### Database State:
1. New Google OAuth users: profile with null username
2. After username selection: profile with username
3. Username changes: old username becomes available
4. No orphaned or inconsistent data

## 🚨 Critical Test Points

1. **No user lockouts**: Existing email/password users can still login
2. **Username uniqueness**: No duplicate usernames possible
3. **Real-time validation**: Immediate feedback on username availability
4. **Proper fallbacks**: UI handles null/empty usernames gracefully
5. **Database consistency**: All profile queries work regardless of username state
6. **Navigation flows**: Users are guided through the proper flows
7. **Error handling**: Clear error messages for all failure cases

## 🔍 Debugging Signs

**✅ Working correctly:**
- Google OAuth redirects back to signup with username form
- Username availability checks work in real-time
- Profile page shows username editor
- Users can change usernames without errors
- Database updates reflect immediately in UI

**❌ Issues to fix:**
- Google OAuth redirects to home without username selection
- Username availability always shows available/taken incorrectly
- Profile page doesn't show username editor
- Username changes don't save or cause errors
- UI doesn't update after username changes

## 📝 Test Results Template

```
Test Date: ___________
Browser: ___________

[ ] Google OAuth + Username Selection works
[ ] Existing user email/password login works  
[ ] Username editing in profile works
[ ] Real-time validation works
[ ] Database consistency maintained
[ ] No user lockouts
[ ] Error handling works properly

Issues found:
_________________________
_________________________
_________________________
```