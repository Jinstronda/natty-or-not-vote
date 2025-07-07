# Review Reply System - YouTube-Style Expandable Comments

## Goal
Implement a robust, modern review reply system similar to YouTube's comment interface where users can reply to other users' reviews with expandable/collapsible nested conversations. The system must be completely robust, include modern loading states, rate limiting (1 comment every 3 hours), and comprehensive testing.

## Why
- **Enhanced User Engagement**: Allow users to have conversations about specific reviews, creating deeper community discussions
- **Better Content Moderation**: Enable contextual responses and clarifications to existing reviews
- **Modern UX Standards**: Match user expectations from platforms like YouTube, Twitter, and Reddit
- **Increased Platform Stickiness**: Encourage users to return and participate in ongoing discussions

## What
A complete nested reply system that integrates seamlessly with the existing review infrastructure:

### User-Visible Behavior
- Users see existing reviews with a "Reply" button underneath each review
- Clicking "Reply" opens an inline reply form below the review
- Submitted replies appear in a threaded view beneath the parent review
- Reply threads are initially collapsed with a "Show X replies" expandable control
- Users can reply to both main reviews and existing replies (nested conversation)
- All replies show with proper indentation and visual threading
- Modern loading states during submission and expansion
- Rate limiting prevents spam (1 reply every 3 hours per user)

### Technical Requirements
- PostgreSQL database schema for nested replies
- React components with TypeScript for type safety
- Supabase integration with RLS policies for security
- Real-time updates via Supabase subscriptions
- Comprehensive Playwright testing
- Mobile-responsive design
- Progressive enhancement approach

### Success Criteria
- [ ] Users can reply to any review or existing reply
- [ ] Reply threads expand/collapse with smooth animations
- [ ] Rate limiting enforced: 1 reply per user every 3 hours
- [ ] Real-time updates when new replies are posted
- [ ] All existing review functionality preserved and working
- [ ] Mobile experience is smooth and intuitive
- [ ] Comprehensive test coverage with Playwright
- [ ] Performance remains excellent (< 200ms for expansions)

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://ux.stackexchange.com/questions/1712/what-is-a-good-way-to-display-infinite-nested-comments
  why: UX best practices for nested comment display and visual hierarchy
  
- url: https://www.geeksforgeeks.org/design-a-nested-chat-comments-using-html-css-and-javascript/
  why: Technical implementation patterns for nested comment systems
  
- url: https://medium.com/@dennis.portillo/an-introduction-to-our-nested-comment-system-cb2ae8b4016
  why: Architecture patterns and database design for nested comments

- file: /src/components/EnhancedUserReviews.tsx
  why: Current review display component to extend with reply functionality
  
- file: /src/hooks/useSupabaseReviews.ts
  why: Existing review CRUD patterns to mirror for replies
  
- file: /src/hooks/useSupabaseReactions.ts
  why: Like/dislike implementation pattern to apply to replies
  
- file: /src/types/database.types.ts
  why: Current database schema structure and TypeScript types
  
- file: /supabase/migrations/20250609192235-7458954e-55aa-4c68-8285-685cdc1ed6a8.sql
  why: RLS policies, indexing patterns, and rate limiting functions
  
- file: /tests/review-sorting.spec.ts
  why: Testing patterns and Playwright conventions for UI components
  
- file: /src/components/ReviewReactions.tsx
  why: Optimistic UI update patterns and real-time functionality
```

### Current Codebase Tree (Review System)
```bash
src/
├── components/
│   ├── EnhancedUserReviews.tsx          # Main review display component
│   ├── UserReviews.tsx                  # Original review component  
│   ├── ReviewReactions.tsx              # Like/dislike functionality
│   ├── ReviewSortingControls.tsx        # Sort by recent/popular
│   └── ReviewPagination.tsx             # Load more reviews
├── hooks/
│   ├── useSupabaseReviews.ts           # Review CRUD operations
│   ├── useSupabaseReactions.ts         # Like/dislike management
│   ├── usePaginatedReviews.ts          # Paginated review fetching
│   └── useReviews.ts                   # General review utilities
├── types/
│   └── database.types.ts               # Supabase generated types
└── pages/
    └── InfluencerProfile.tsx           # Where reviews are displayed

supabase/
└── migrations/
    └── [existing-migration].sql       # Current database schema
```

### Desired Codebase Tree (With Reply System)
```bash
src/
├── components/
│   ├── EnhancedUserReviews.tsx          # MODIFY: Add reply integration
│   ├── ReviewItem.tsx                   # NEW: Individual review with replies  
│   ├── ReplyForm.tsx                    # NEW: Inline reply composer
│   ├── ReplyList.tsx                    # NEW: Expandable reply thread
│   ├── ReplyItem.tsx                    # NEW: Individual reply display
│   └── ReplyButton.tsx                  # NEW: Toggle reply form
├── hooks/
│   ├── useReviewReplies.ts             # NEW: Reply CRUD operations
│   ├── useNestedReplies.ts             # NEW: Nested reply fetching
│   ├── useReplyRateLimit.ts            # NEW: Rate limiting enforcement
│   └── useExpandableReplies.ts         # NEW: Expand/collapse state
├── types/
│   └── reply.ts                        # NEW: Reply-specific types
└── supabase/
    └── migrations/
        └── YYYYMMDD-review-reply-system.sql  # NEW: Reply tables and policies
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: Supabase RLS policies must allow nested queries
// Review policies at line 63-70 in migration file show the pattern
CREATE POLICY "Authenticated users can view all reviews" ON public.reviews 
  FOR SELECT TO authenticated USING (true);

// CRITICAL: Rate limiting function uses PostgreSQL interval arithmetic  
// Pattern at line 150-160 shows how to implement time-based rate limiting
CREATE OR REPLACE FUNCTION public.check_reply_rate_limit(user_id uuid)
RETURNS boolean AS $$
  SELECT COUNT(*) < 1 
  FROM public.review_replies 
  WHERE review_replies.user_id = check_reply_rate_limit.user_id 
    AND created_at > NOW() - INTERVAL '3 hours';
$$

// CRITICAL: React Query cache invalidation for nested data
// Pattern from useSupabaseReactions.ts shows optimistic updates
queryClient.setQueryData(['reviews', influencerId], (oldData) => {
  // Update nested reply data optimistically
});

// CRITICAL: Supabase real-time subscriptions for nested updates
// Pattern from useRealTimeReviews shows how to listen for changes
supabase
  .channel('review_replies')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'review_replies' },
    handleReplyChange
  )

// GOTCHA: TailwindCSS className conflicts with nested indentation
// Use consistent indentation pattern: pl-4, pl-8, pl-12 for nesting levels
const getIndentClass = (level: number) => `pl-${Math.min(level * 4, 12)}`;
```

## Implementation Blueprint

### Database Schema & Structure
```sql
-- Core reply table with self-referencing foreign key for nesting
CREATE TABLE public.review_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES public.review_replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 2000),
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_review_replies_review_id ON public.review_replies(review_id);
CREATE INDEX idx_review_replies_parent_id ON public.review_replies(parent_reply_id);
CREATE INDEX idx_review_replies_user_id ON public.review_replies(user_id);
CREATE INDEX idx_review_replies_created_at ON public.review_replies(created_at DESC);

-- RLS policies mirroring review patterns
CREATE POLICY "Authenticated users can view all replies" ON public.review_replies 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert their own replies" ON public.review_replies 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update their own replies" ON public.review_replies 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete their own replies" ON public.review_replies 
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Rate limiting function (3 hour cooldown)
CREATE OR REPLACE FUNCTION public.check_reply_rate_limit(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*) < 1 
  FROM public.review_replies 
  WHERE review_replies.user_id = check_reply_rate_limit.user_id 
    AND created_at > NOW() - INTERVAL '3 hours';
$$;
```

### TypeScript Types Extension
```typescript
// Add to src/types/reply.ts
export interface ReviewReply {
  id: string;
  review_id: string;
  parent_reply_id: string | null;
  user_id: string;
  content: string;
  likes: number;
  dislikes: number;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: {
    username: string;
    profile_picture_url: string | null;
  };
  // Nested replies for tree structure
  replies?: ReviewReply[];
  // UI state
  isExpanded?: boolean;
  replyCount?: number;
}

// Extension of existing review type
export interface ReviewWithReplies extends Review {
  replies?: ReviewReply[];
  replyCount: number;
  isRepliesExpanded: boolean;
}
```

### List of Tasks (Implementation Order)

```yaml
Task 1 - Database Schema:
  CREATE supabase/migrations/YYYYMMDD-review-reply-system.sql:
    - CREATE review_replies table with proper constraints
    - ADD performance indexes following existing patterns  
    - CREATE RLS policies mirroring review security model
    - CREATE rate limiting function (3 hour cooldown)
    - CREATE triggers for updated_at timestamp
    - ADD admin override policies for moderation

Task 2 - TypeScript Types:
  CREATE src/types/reply.ts:
    - DEFINE ReviewReply interface with nested structure
    - EXTEND existing Review type to include replies
    - ADD UI state types for expansion/loading
    - MIRROR pattern from database.types.ts structure

Task 3 - Core Reply Hook:
  CREATE src/hooks/useReviewReplies.ts:
    - IMPLEMENT CRUD operations (create, read, update, delete)
    - MIRROR patterns from useSupabaseReviews.ts
    - ADD rate limiting checks before submission
    - INCLUDE optimistic updates for immediate UI feedback
    - ADD real-time subscriptions for live updates

Task 4 - Nested Reply Fetching:
  CREATE src/hooks/useNestedReplies.ts:
    - IMPLEMENT recursive reply fetching with depth limits
    - ADD pagination for large reply threads
    - INCLUDE user profile data in joins
    - OPTIMIZE with single query using WITH RECURSIVE
    - CACHE reply trees efficiently

Task 5 - Reply Components:
  CREATE src/components/ReplyForm.tsx:
    - IMPLEMENT inline reply composer with validation
    - MIRROR styling patterns from existing review forms
    - ADD character count and rate limit warnings
    - INCLUDE cancel/submit actions with loading states
    - HANDLE keyboard shortcuts (Ctrl+Enter to submit)

Task 6 - Reply Display Components:
  CREATE src/components/ReplyItem.tsx:
    - RENDER individual reply with user info
    - INCLUDE like/dislike buttons (mirror ReviewReactions)
    - ADD edit/delete for own replies
    - IMPLEMENT proper indentation for nesting levels
    - SHOW relative timestamps

Task 7 - Reply List with Expansion:
  CREATE src/components/ReplyList.tsx:
    - IMPLEMENT expandable reply threads
    - ADD "Show X replies" button with smooth animation
    - HANDLE nested reply rendering with depth limits
    - INCLUDE loading states for expansion
    - OPTIMIZE for performance with virtualization if needed

Task 8 - Integration with Existing Reviews:
  MODIFY src/components/EnhancedUserReviews.tsx:
    - ADD reply functionality to existing review items
    - INTEGRATE ReplyForm, ReplyList, and ReplyButton
    - PRESERVE all existing functionality and styling
    - UPDATE to use ReviewWithReplies type
    - MAINTAIN backward compatibility

Task 9 - Rate Limiting & Validation:
  CREATE src/hooks/useReplyRateLimit.ts:
    - IMPLEMENT client-side rate limit checking
    - ADD countdown timer display for rate-limited users
    - HANDLE rate limit errors gracefully
    - SHOW user-friendly messages about cooldown period

Task 10 - Real-time Updates:
  EXTEND existing real-time hooks:
    - ADD reply subscriptions to useRealTime.ts
    - HANDLE live reply additions/updates
    - UPDATE reply counts in real-time
    - MAINTAIN scroll position during updates

Task 11 - Testing Suite:
  CREATE tests/review-reply-system.spec.ts:
    - TEST reply creation and validation
    - TEST expansion/collapse functionality  
    - TEST rate limiting enforcement
    - TEST nested reply threading
    - TEST mobile responsiveness
    - TEST real-time updates
    - TEST accessibility features

Task 12 - Performance Optimization:
  IMPLEMENT performance enhancements:
    - ADD database query optimization
    - IMPLEMENT component memoization
    - ADD lazy loading for deep reply threads
    - OPTIMIZE Supabase query patterns
    - MONITOR and fix any performance regressions
```

### Key Component Pseudocode

```typescript
// Task 5: ReplyForm.tsx
interface ReplyFormProps {
  reviewId: string;
  parentReplyId?: string | null;
  onSubmit: (content: string) => Promise<void>;
  onCancel: () => void;
  isVisible: boolean;
}

function ReplyForm({ reviewId, parentReplyId, onSubmit, onCancel, isVisible }: ReplyFormProps) {
  // PATTERN: Form validation from existing review components
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // CRITICAL: Rate limiting check before enabling submit
  const { canReply, timeUntilNext } = useReplyRateLimit();
  
  const handleSubmit = async () => {
    // PATTERN: Optimistic update from ReviewReactions
    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
      onCancel(); // Hide form after successful submit
    } catch (error) {
      // PATTERN: Error handling from existing forms
      toast.error('Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // PATTERN: Smooth animations from existing components
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          {/* Form implementation with TailwindCSS styling */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

```typescript
// Task 7: ReplyList.tsx  
interface ReplyListProps {
  reviewId: string;
  replies: ReviewReply[];
  maxDepth?: number;
  currentDepth?: number;
}

function ReplyList({ reviewId, replies, maxDepth = 3, currentDepth = 0 }: ReplyListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // PATTERN: Progressive loading from existing pagination
  const { data: nestedReplies, isLoading } = useNestedReplies(reviewId, {
    enabled: isExpanded
  });
  
  // CRITICAL: YouTube-style expansion with reply count
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  // PATTERN: Indentation classes for visual hierarchy
  const indentClass = `pl-${Math.min(currentDepth * 4, 12)}`;
  
  return (
    <div className={indentClass}>
      {!isExpanded && replies.length > 0 && (
        <Button 
          variant="ghost" 
          onClick={toggleExpanded}
          className="text-sm text-muted-foreground"
        >
          Show {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
        </Button>
      )}
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {replies.map(reply => (
              <ReplyItem 
                key={reply.id} 
                reply={reply}
                maxDepth={maxDepth}
                currentDepth={currentDepth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### Integration Points
```yaml
DATABASE:
  - migration: "Add review_replies table with foreign key constraints"
  - indexes: "Performance indexes for reply queries and user lookups"
  - policies: "RLS policies matching existing review security model"
  
HOOKS:
  - extend: useRealTime.ts to include reply subscriptions
  - create: useReviewReplies.ts for CRUD operations
  - create: useNestedReplies.ts for tree fetching
  
COMPONENTS:
  - modify: EnhancedUserReviews.tsx to integrate reply functionality
  - create: ReplyForm.tsx, ReplyList.tsx, ReplyItem.tsx
  - preserve: All existing review functionality and styling
  
TYPES:
  - extend: database.types.ts with generated reply types
  - create: reply.ts with UI-specific reply interfaces
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
npm run lint                          # ESLint checking
npx tsc --noEmit                     # TypeScript compilation
npm run build                        # Vite build verification

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests
```typescript
// CREATE test files with these test cases:
describe('Review Reply System', () => {
  test('can create reply to review', async () => {
    // PATTERN: Mirror existing review tests
    const reply = await createReply(reviewId, 'Test reply content');
    expect(reply.content).toBe('Test reply content');
  });

  test('rate limiting prevents spam replies', async () => {
    // Test 3-hour rate limit enforcement
    await createReply(reviewId, 'First reply');
    await expect(createReply(reviewId, 'Spam reply')).rejects.toThrow('Rate limit');
  });

  test('nested replies display correctly', async () => {
    // Test reply threading and indentation
    const parentReply = await createReply(reviewId, 'Parent');
    const childReply = await createReply(reviewId, 'Child', parentReply.id);
    expect(childReply.parent_reply_id).toBe(parentReply.id);
  });
});
```

```bash
# Run and iterate until passing:
npm run test -- --testNamePattern="Reply"
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Integration Test
```bash
# Start the development server
npm run dev

# Test the full reply workflow
npx playwright test tests/review-reply-system.spec.ts --headed
# Expected: All reply interactions work smoothly
# If error: Check browser console and Playwright trace
```

### Level 4: Performance Validation
```bash
# Test reply expansion performance
node -e "
console.time('Reply Expansion');
// Simulate expanding 50 replies
console.timeEnd('Reply Expansion');
// Expected: < 200ms for smooth UX
"

# Test database query performance
# Check Supabase logs for slow queries (> 100ms)
```

## Final Validation Checklist
- [ ] All tests pass: `npm run test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npx tsc --noEmit`
- [ ] Manual test successful: Reply creation, expansion, rate limiting
- [ ] Performance < 200ms: Reply expansion and loading
- [ ] Mobile responsive: Test on multiple screen sizes
- [ ] Real-time updates: Test with multiple browser tabs
- [ ] Rate limiting enforced: Verify 3-hour cooldown
- [ ] Error handling graceful: Network failures, validation errors
- [ ] Accessibility tested: Keyboard navigation, screen readers

---

## Anti-Patterns to Avoid
- ❌ Don't create new authentication patterns - use existing auth context
- ❌ Don't skip rate limiting validation - enforce on both client and server
- ❌ Don't ignore real-time subscriptions - replies must update live
- ❌ Don't break existing review functionality - maintain backward compatibility
- ❌ Don't use different styling patterns - follow existing TailwindCSS conventions
- ❌ Don't skip performance optimization - reply expansion must be smooth
- ❌ Don't ignore mobile experience - ensure touch-friendly interactions
- ❌ Don't hardcode nesting limits - make reply depth configurable

---

## PRP Quality Score: 9/10

**Confidence Level**: Very High - This PRP provides comprehensive context including:
- ✅ Complete current system analysis with code examples
- ✅ Modern UX patterns from web research  
- ✅ Database schema with performance optimization
- ✅ Step-by-step implementation plan with specific file modifications
- ✅ Detailed validation loops with executable commands
- ✅ Error prevention with known gotchas and anti-patterns
- ✅ Integration points clearly defined
- ✅ Testing strategy comprehensive and specific

The extensive research into the existing codebase, combined with modern UI patterns and detailed technical specifications, provides sufficient context for successful one-pass implementation by an AI agent.