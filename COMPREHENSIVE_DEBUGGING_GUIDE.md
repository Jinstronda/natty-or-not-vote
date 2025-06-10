# 🔧 COMPREHENSIVE DEBUGGING GUIDE

## 🎯 DEBUGGING PHILOSOPHY

**NEVER ASSUME - ALWAYS VERIFY**

This document outlines our robust debugging methodology to identify and fix issues systematically rather than making assumptions.

## 🚨 CRITICAL DEBUGGING PRINCIPLES

### 1. **Hypothesis-Driven Development**
- Always form a clear hypothesis before testing
- Use `window.testAuthHypothesis("your hypothesis here")` to log your theory
- Collect evidence to prove or disprove your hypothesis
- Never proceed without data

### 2. **Comprehensive Logging**
- Every major operation is logged with timing data
- State changes are captured automatically
- Network operations are tracked with full context
- Error conditions include stack traces and context

### 3. **Data Export & Analysis**
- Use `window.exportAllDebugLogs()` to export all debugging data
- Save logs before and after each debugging session
- Share logs with team members for collaborative debugging

## 🔍 CURRENT DEBUGGING SYSTEM

### Authentication Debugging
```javascript
// Export auth logs
window.exportAuthDebugLogs()

// Clear auth logs  
window.clearAuthDebugLogs()

// Test a hypothesis
window.testAuthHypothesis("getSession() hangs due to circular RLS dependency")
```

### Influencer Loading Debugging
```javascript
// Export influencer loading logs
window.exportInfluencerDebugLogs()

// Clear influencer logs
window.clearInfluencerDebugLogs()
```

### Complete System Export
```javascript
// Export everything
window.exportAllDebugLogs()
```

## 📊 DEBUGGING DATA STRUCTURE

Each debug log contains:
- **Timestamp**: Exact moment of event
- **Level**: ERROR, WARN, INFO, TIMING, STATE, NETWORK, DATABASE, VERBOSE
- **Message**: Human-readable description
- **Data**: Structured context object
- **Stack**: Error stack traces when applicable

## 🎯 CURRENT ISSUE: AUTHENTICATION & INFLUENCER LOADING

### Problem Statement
- Login works initially but fails on refresh
- Influencers don't load, showing timeout errors
- `getSession()` appears to hang for 12+ seconds

### Debugging Hypotheses to Test

#### Hypothesis 1: Circular Dependency Still Exists
```javascript
window.testAuthHypothesis("RLS policies still causing circular dependency in auth flow")
```
**Evidence to collect:**
- Timing of `getSession()` calls
- Database query execution times
- RLS policy evaluation logs

#### Hypothesis 2: Network/Database Latency
```javascript
window.testAuthHypothesis("Network latency or database performance causing timeouts")
```
**Evidence to collect:**
- Individual query response times
- Network request timing
- Comparison of direct DB queries vs Supabase client

#### Hypothesis 3: Client-Side State Management
```javascript
window.testAuthHypothesis("React state management causing re-render loops or blocking")
```
**Evidence to collect:**
- Component re-render frequency
- State change sequence
- useEffect dependency tracking

#### Hypothesis 4: Supabase Client Configuration
```javascript
window.testAuthHypothesis("Supabase client configuration or session handling issue")
```
**Evidence to collect:**
- Supabase client initialization
- Session storage state
- Auth event sequence

## 🛠️ DEBUGGING WORKFLOW

### Step 1: Reproduce the Issue
1. Open browser dev tools
2. Clear all debug logs: `window.clearAuthDebugLogs(); window.clearInfluencerDebugLogs()`
3. Refresh the page
4. Wait for issue to occur
5. Export logs: `window.exportAllDebugLogs()`

### Step 2: Analyze the Timeline
1. Review auth initialization sequence
2. Identify where delays occur
3. Check for error patterns
4. Look for timeout correlations

### Step 3: Form Specific Hypothesis
1. Based on evidence, create specific theory
2. Log hypothesis: `window.testAuthHypothesis("your specific theory")`
3. Design test to prove/disprove

### Step 4: Test Hypothesis
1. Make targeted changes
2. Re-run reproduction steps
3. Compare before/after logs
4. Validate if issue is resolved

### Step 5: Document Findings
1. Update this document with findings
2. Create detailed issue report
3. Implement permanent fix
4. Add preventive measures

## 📋 DEBUG LOG ANALYSIS CHECKLIST

### Authentication Flow Analysis
- [ ] `AuthContext_initialization` timing
- [ ] `clearStaleState` execution time
- [ ] `main_getSession` duration
- [ ] Session validation success/failure
- [ ] User object creation timing
- [ ] Background profile fetch timing

### Influencer Loading Analysis
- [ ] Query enabled state changes
- [ ] Auth check before query execution
- [ ] Supabase query building time
- [ ] Database query execution time
- [ ] Response data structure validation
- [ ] Retry attempt patterns

### Common Timeout Patterns
- [ ] Exactly 12-second timeouts (auth timeout)
- [ ] 8-second timeouts (main session check)
- [ ] 3-second timeouts (stale session check)
- [ ] 20-second timeouts (loading watchdog)

## 🚨 CRITICAL ERROR PATTERNS TO WATCH

### Pattern 1: Silent Hangs
- No error messages but operations never complete
- Usually indicates blocking I/O or infinite loops
- Check for circular dependencies

### Pattern 2: Timeout Cascades
- One timeout causing subsequent operations to fail
- Often in auth -> data loading chain
- Look for dependency chains

### Pattern 3: State Inconsistencies
- UI shows loading but data is available
- Usually React state management issues
- Check state update sequences

## 📝 DEBUGGING SESSION TEMPLATE

```markdown
## Debugging Session: [Date] - [Issue Description]

### Hypothesis
[Your specific hypothesis here]

### Test Method
[How you plan to test this hypothesis]

### Evidence Collected
[Attach debug logs and timeline analysis]

### Results
[What the evidence shows]

### Conclusion
[Hypothesis proven/disproven, next steps]

### Action Items
[Specific changes to implement]
```

## 🎯 NEXT STEPS FOR CURRENT ISSUE

1. **Immediate**: Run reproduction with new debugging system
2. **Analyze**: Export and review complete debug logs
3. **Hypothesis**: Form specific theory based on evidence
4. **Test**: Make targeted fix based on hypothesis
5. **Verify**: Confirm fix with before/after logs
6. **Document**: Update this guide with findings

## 💡 DEBUGGING BEST PRACTICES

1. **Always log hypothesis before testing**
2. **Export logs before making any changes**
3. **Test one variable at a time**
4. **Compare before/after states**
5. **Document all findings**
6. **Share logs with team for review**

---

**Remember: The goal is not to fix quickly, but to fix correctly with full understanding of the root cause.**