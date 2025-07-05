# Review Sorting Implementation Fix - PRP

## Purpose
Fix the broken review sorting functionality on influencer pages to enable users to sort reviews by "Most Recent" and "Most Popular" with fast loading and consistent UX following YouTube-style sorting patterns.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Implement a fully functional review sorting system that allows users to sort reviews by "Most Recent" and "Most Popular" with smooth UX transitions, consistent with the existing design system and YouTube-style sorting patterns.

## Why
- **User Experience**: Users need to find relevant reviews quickly (newest vs most liked)
- **Performance**: Fast loading prevents user frustration and abandonment
- **Consistency**: Matches expectations from platforms like YouTube
- **Engagement**: Better review discoverability increases user interaction

## What
Users can click sorting controls on influencer pages to reorder reviews instantly with smooth loading states and error handling.

### Success Criteria
- [ ] Sorting controls are visible and accessible above the reviews section
- [ ] "Recent" sorting shows newest reviews first (ORDER BY timestamp DESC)
- [ ] "Popular" sorting shows most liked reviews first (ORDER BY likes DESC, timestamp DESC)
- [ ] Loading states show during sort transitions (≤2 seconds)
- [ ] Error states provide retry functionality
- [ ] Sorting state persists during pagination
- [ ] Mobile and desktop responsive design
- [ ] Accessibility compliance (ARIA labels, keyboard navigation)

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- file: src/hooks/api/usePaginatedReviews.ts
  why: Core pagination and sorting logic already implemented
  
- file: src/components/ModernSortingControls.tsx
  why: UI component with proper styling and accessibility
  
- file: src/components/EnhancedUserReviews.tsx
  why: Integration point where sorting is displayed
  
- file: src/pages/InfluencerProfile.tsx
  why: Main page where sorting will be used
  
- file: CLAUDE.md
  why: Design system patterns, color schemes, and debugging methodology
  
- doc: https://supabase.com/docs/reference/javascript/order
  section: Database sorting and pagination
  critical: ORDER BY with multiple columns for tie-breaking
```

### Current Codebase Analysis
**Review Sorting System Status:**
- ✅ **Backend Logic**: `usePaginatedReviews` hook with sorting implemented
- ✅ **UI Components**: `ModernSortingControls` with proper styling
- ✅ **Database Schema**: Reviews table with `timestamp` and `likes` columns
- ✅ **Integration**: `EnhancedUserReviews` connects everything
- ❌ **Issue**: Missing proper test IDs and integration testing

**Working Components:**
```typescript
// Already implemented and working:
- usePaginatedReviews(influencerId, pageSize, sortBy)
- ModernSortingControls(currentSort, onSortChange, totalCount, etc.)
- EnhancedUserReviews with sorting integration
```

### Current Codebase Tree (Focus Areas)
```bash
src/
├── hooks/api/
│   └── usePaginatedReviews.ts          # ✅ Core sorting logic
├── components/
│   ├── ModernSortingControls.tsx       # ✅ UI component
│   ├── EnhancedUserReviews.tsx         # ✅ Integration point
│   └── ReviewPagination.tsx            # ✅ Pagination component
├── pages/
│   └── InfluencerProfile.tsx           # ✅ Main usage location
└── types/
    └── vote.ts                         # ✅ Type definitions
```

### Desired Codebase Tree (No New Files Needed)
```bash
# All necessary files already exist
# Focus on FIXING existing implementation
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: Supabase ordering requires specific syntax
// ❌ Wrong: .order('timestamp DESC')
// ✅ Correct: .order('timestamp', { ascending: false })

// CRITICAL: Multiple column sorting for tie-breaking
// ✅ Correct: .order('likes', { ascending: false }).order('timestamp', { ascending: false })

// CRITICAL: Loading states must be managed properly
// changeSorting() should set loading=true before fetch

// CRITICAL: Test IDs must match exactly
// data-testid="sorting-controls"
// data-testid="sort-recent"  
// data-testid="sort-popular"

// CRITICAL: Color scheme consistency
// Use: text-juicy, bg-juicy, border-juicy for pink theme
// Use: text-natty, bg-natty, border-natty for green theme
```

## Implementation Blueprint

### Data Models (Already Implemented)
```typescript
// From types/vote.ts and usePaginatedReviews.ts
export type ReviewSortOption = 'recent' | 'likes';

interface Review {
  id: string;
  userId: string;
  username: string;
  profilePicture?: string;
  influencerId: string;
  vote: 'natty' | 'juicy';
  content: string;
  timestamp: string;
  likes: number;
  dislikes?: number;
}

interface PaginatedReviewsState {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  sortBy: ReviewSortOption;
  stats: {
    totalCount: number;
    loadedCount: number;
    currentPageDisplay: number;
  };
}
```

### Tasks to Complete (In Order)

```yaml
Task 1: Diagnose Current Implementation
VERIFY src/hooks/api/usePaginatedReviews.ts:
  - CONFIRM sorting logic in fetchReviews function (lines 78-85)
  - VERIFY changeSorting function handles loading states (lines 153-167)
  - CHECK error handling and retry logic

Task 2: Fix ModernSortingControls Component
VERIFY src/components/ModernSortingControls.tsx:
  - CONFIRM test IDs are present: data-testid="sorting-controls", "sort-recent", "sort-popular"
  - VERIFY loading states show correctly during sort changes
  - CHECK accessibility attributes and keyboard navigation

Task 3: Fix EnhancedUserReviews Integration
VERIFY src/components/EnhancedUserReviews.tsx:
  - CONFIRM ModernSortingControls receives correct props
  - VERIFY changeSorting function is passed correctly
  - CHECK initial load and sort state management

Task 4: Add Integration Tests
CREATE tests/review-sorting.test.ts:
  - TEST sorting controls render with correct test IDs
  - TEST sorting changes trigger API calls
  - TEST loading states during sort transitions
  - TEST error states and retry functionality

Task 5: Add Playwright End-to-End Tests
CREATE playwright/review-sorting.spec.ts:
  - TEST user can click sorting controls
  - TEST reviews reorder correctly
  - TEST loading states are visible
  - TEST error recovery works
```

### Per Task Pseudocode

```typescript
// Task 1: Diagnose Current Implementation
// Check if sorting logic is working:
const { changeSorting, sortBy, loading, error } = usePaginatedReviews({
  influencerId: "test-id",
  pageSize: 10,
  sortBy: 'recent'
});

// Verify database query structure:
if (sort === 'recent') {
  query = query.order('timestamp', { ascending: false });
} else if (sort === 'likes') {
  query = query.order('likes', { ascending: false })
               .order('timestamp', { ascending: false });
}

// Task 2: Fix ModernSortingControls Component
// Ensure test IDs are present:
<div data-testid="sorting-controls">
  <Button data-testid="sort-recent">Recent</Button>
  <Button data-testid="sort-popular">Popular</Button>
</div>

// Task 3: Fix EnhancedUserReviews Integration
// Verify props are passed correctly:
<ModernSortingControls
  currentSort={sortBy}
  onSortChange={changeSorting}
  totalCount={stats.totalCount}
  loadedCount={stats.loadedCount}
  isLoading={loading}
  error={error}
/>
```

### Integration Points
```yaml
DATABASE:
  - table: reviews (id, user_id, influencer_id, vote, content, likes, timestamp)
  - indexes: idx_reviews_timestamp, idx_reviews_likes (already exist)
  
UI_COMPONENTS:
  - ModernSortingControls: Main sorting interface
  - EnhancedUserReviews: Integration container
  - ReviewPagination: Pagination controls
  
HOOKS:
  - usePaginatedReviews: Core data fetching and sorting
  - useAuth: User authentication context
  
STYLING:
  - Tailwind classes: text-juicy, bg-juicy, border-juicy
  - Animations: hover:scale-105, transition-all duration-200
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
npm run lint              # ESLint checking
npm run type-check        # TypeScript checking
npm run build            # Build verification

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests
```typescript
// CREATE tests/review-sorting.test.tsx
describe('Review Sorting', () => {
  test('renders sorting controls with correct test IDs', () => {
    render(<ModernSortingControls {...props} />);
    expect(screen.getByTestId('sorting-controls')).toBeInTheDocument();
    expect(screen.getByTestId('sort-recent')).toBeInTheDocument();
    expect(screen.getByTestId('sort-popular')).toBeInTheDocument();
  });

  test('calls onSortChange when sort option clicked', () => {
    const onSortChange = jest.fn();
    render(<ModernSortingControls {...props} onSortChange={onSortChange} />);
    
    fireEvent.click(screen.getByTestId('sort-popular'));
    expect(onSortChange).toHaveBeenCalledWith('likes');
  });

  test('shows loading state during sort change', () => {
    render(<ModernSortingControls {...props} isLoading={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

```bash
# Run and iterate until passing:
npm test -- --testNamePattern="Review Sorting"
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Integration Test with Playwright
```typescript
// CREATE playwright/review-sorting.spec.ts
test('user can sort reviews by recent and popular', async ({ page }) => {
  await page.goto('/influencer/test-influencer-id');
  
  // Wait for reviews to load
  await page.waitForSelector('[data-testid="sorting-controls"]');
  
  // Click "Popular" sorting
  await page.click('[data-testid="sort-popular"]');
  
  // Wait for loading and verify sort changed
  await page.waitForSelector('[data-testid="loading-spinner"]');
  await page.waitForSelector('[data-testid="loading-spinner"]', { state: 'detached' });
  
  // Verify first review has high likes
  const firstReview = await page.locator('.review-card').first();
  // Add specific assertions based on test data
});
```

```bash
# Run integration tests:
npx playwright test review-sorting.spec.ts --headed
# If failing: Check test data setup and page loading
```

## Final Validation Checklist
- [ ] All tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run type-check`
- [ ] Sorting controls render with correct test IDs
- [ ] Clicking "Recent" sorts by timestamp DESC
- [ ] Clicking "Popular" sorts by likes DESC, timestamp DESC
- [ ] Loading states show during sort transitions
- [ ] Error states provide retry functionality
- [ ] Mobile responsive design works
- [ ] Accessibility features work (keyboard navigation, ARIA labels)

## Anti-Patterns to Avoid
- ❌ Don't create new components when existing ones work
- ❌ Don't skip loading states - users need feedback
- ❌ Don't ignore error handling - provide retry options
- ❌ Don't break existing pagination when sorting
- ❌ Don't hardcode sort options - use existing types
- ❌ Don't ignore accessibility - include proper ARIA labels
- ❌ Don't skip test IDs - they're critical for testing

## Confidence Score: 9/10

**High confidence for one-pass implementation because:**
- ✅ All core logic already exists and is well-implemented
- ✅ UI components are already built with proper styling
- ✅ Integration is already in place
- ✅ Database schema supports sorting
- ✅ Comprehensive context provided
- ✅ Clear validation steps
- ✅ Existing patterns to follow

**Minor risk areas:**
- Test ID implementation may need verification
- Integration testing may require test data setup

This PRP provides comprehensive context for fixing the review sorting functionality with high confidence of success through the systematic approach and existing robust foundation.