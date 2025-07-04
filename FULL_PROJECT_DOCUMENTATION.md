# Natty or Juicy: Full System Documentation

## 1. Overview

**Natty or Juicy** is a community-driven platform where users vote and discuss whether fitness influencers have achieved their physiques naturally ("Natty") or with enhancement ("Juicy"). The site is built with React, TypeScript, Vite, and uses Supabase for authentication, database, and storage.

---

## 2. Application Structure

- **Frontend:** React (with TypeScript), Vite, TailwindCSS for styling, Radix UI for components, React Router for navigation, TanStack React Query for data fetching/caching.
- **Backend:** Supabase (PostgreSQL DB, Auth, Storage, Edge Functions).
- **Hosting:** The site is live at [nattyorjuicy.com](https://nattyorjuicy.com).

---

## 3. Main Features

### 3.1 Voting System
- Users can vote "Natty" (natural) or "Juicy" (enhanced) for each influencer.
- Voting is tracked per user per influencer (one vote per influencer per user, but can be changed).
- After voting, users are prompted to leave a review explaining their reasoning.
- Community and expert vote percentages are displayed in real-time.

### 3.2 Reviews & Community Discussion
- Users can submit reviews for influencers after voting.
- Reviews can be liked/disliked by other users.
- Expert reviews are highlighted and factored into a separate "Expert Verdict".
- Community reviews are shown alongside expert reviews for transparency.

### 3.3 Influencer Profiles
- Each influencer has a profile page with:
  - Bio, stats, and social links.
  - Voting breakdown (Natty/Juicy %).
  - Community and expert reviews.
- Influencers can be suggested by users (pending admin approval).

### 3.4 User Profiles & Authentication
- Users can sign up/sign in with email/password or Google OAuth.
- Each user has a profile page showing:
  - Their votes and reviews.
  - Profile picture (uploadable via Supabase Storage).
  - Role (user/admin).
- Authentication state is managed globally via React Context and Supabase Auth.

### 3.5 Admin Panel
- Admins can approve influencer suggestions, moderate reviews, and manage users.
- Admin status is determined by email or role in the database.

---

## 4. Data Model & Supabase Integration

### 4.1 Supabase Tables
- **influencers:** Influencer profiles (id, name, bio, stats, image, social links).
- **votes:** User votes (user_id, influencer_id, vote, timestamp).
- **reviews:** User reviews (user_id, influencer_id, content, vote, likes, dislikes, timestamp).
- **expert_reviews:** Expert-written reviews (author, influencer_id, content, rating, etc.).
- **profiles:** User profiles (id, username, email, role, profile_picture_url).
- **influencer_suggestions:** User-submitted influencer suggestions.
- **review_reactions:** Likes/dislikes on reviews.
- **security_audit_log:** Tracks security events for auditing.

### 4.2 Supabase Auth
- Handles user sign up, sign in, sign out, and session management.
- Supports email/password and Google OAuth.
- On sign up, a trigger auto-creates a profile in the `profiles` table.
- Auth state is synced with React Context for global access.

### 4.3 Supabase Storage
- Used for user profile picture uploads.
- Images are stored and referenced in the `profiles` table.

### 4.4 Supabase Functions
- Rate limiting for uploads and votes.
- Admin checks.
- Automatic profile creation for new users.

---

## 5. Application Flow

### 5.1 Landing & Navigation
- The main navigation bar includes links to Trending, How It Works, Login/Signup, and user profile.
- The homepage lists trending influencers with voting stats.

### 5.2 Voting Flow
1. User visits an influencer profile.
2. If authenticated, user can vote "Natty" or "Juicy".
3. Vote is upserted in the `votes` table (one per user per influencer).
4. User is prompted to leave a review (optional).
5. Vote stats and reviews update in real-time.

### 5.3 Review Flow
1. After voting, user can submit a review.
2. Review is stored in the `reviews` table.
3. Other users can like/dislike reviews.
4. Expert reviews are shown separately.

### 5.4 Authentication Flow
1. User signs up or logs in (email/password or Google).
2. On sign up, a profile is auto-created in `profiles`.
3. Auth state is managed via Supabase and React Context.
4. User can upload a profile picture (stored in Supabase Storage).

### 5.5 Influencer Suggestion
- Authenticated users can suggest new influencers.
- Suggestions are stored in `influencer_suggestions` and require admin approval.

---

## 6. Styling & Design System
- Uses TailwindCSS for utility-first styling.
- Custom color variables for "Natty" (green) and "Juicy" (pink/purple).
- Responsive, modern UI with accessible components.

---

## 7. Error Handling & Diagnostics
- Global error boundaries for React errors.
- Diagnostic utilities for Supabase connection and auth state.
- Security audit logs for sensitive actions.

---

## 8. How Everything Connects
- **Frontend** interacts with **Supabase** for all data (votes, reviews, profiles, etc.).
- **React Context** provides global user/auth state.
- **React Query** manages data fetching, caching, and real-time updates.
- **Supabase Triggers/Functions** automate profile creation and enforce business logic.
- **Admin Panel** is protected by role-based access (checked via Supabase).

---

## 9. Extensibility & Future-Proofing
- Modular React components and hooks for easy feature addition.
- Supabase schema can be extended for new features (e.g., badges, influencer stats).
- All business logic is centralized in hooks and context for maintainability.

---

## 10. References
- Main entry: `src/App.tsx`, `src/main.tsx`
- Auth: `src/contexts/AuthContext.tsx`, `src/hooks/useUserProfile.ts`
- Voting: `src/hooks/useVotes.ts`, `src/components/VotingSection.tsx`
- Reviews: `src/hooks/useSupabaseReviews.ts`, `src/components/ReviewPromptDialog.tsx`
- Supabase client: `src/integrations/supabase/client.ts`
- Data types: `src/integrations/supabase/types.ts`
- Styling: `src/index.css`
- Admin: `src/pages/AdminPanel.tsx`, `src/components/admin/AdminGate.tsx`

---

## 11. Deep Dives

### 11.1 Supabase Table Schemas (from `src/integrations/supabase/types.ts`)
- **influencers:**
  - `id`, `name`, `description`, `image`, `social_links`, `claimed_status`, `height`, `weight`, `years_training`, `created_at`, `updated_at`
- **votes:**
  - `id`, `user_id`, `influencer_id`, `vote`, `timestamp`
- **reviews:**
  - `id`, `user_id`, `influencer_id`, `vote`, `content`, `likes`, `dislikes`, `timestamp`
- **expert_reviews:**
  - `id`, `author`, `influencer_id`, `content`, `rating`, `link_url`, `likes`, `created_at`, `updated_at`
- **profiles:**
  - `id`, `username`, `email`, `role`, `profile_picture_url`, `created_at`, `updated_at`
- **influencer_suggestions:**
  - `id`, `influencer_name`, `image_url`, `social_links`, `status`, `submitted_by`, `timestamp`
- **review_reactions:**
  - `id`, `review_id`, `user_id`, `reaction_type`, `created_at`
- **security_audit_log:**
  - `id`, `user_id`, `event_type`, `event_details`, `ip_address`, `user_agent`, `created_at`

### 11.2 Supabase Functions
- **check_upload_rate_limit(user_id):** Returns boolean if user can upload.
- **check_vote_rate_limit(user_id):** Returns boolean if user can vote.
- **create_user_profile(user_id, user_email, username):** Creates a profile for new users.
- **is_admin(user_id):** Returns boolean if user is admin.
- **refresh_vote_counts():** Refreshes cached vote counts for influencers.

### 11.3 Authentication & Profile Creation
- On sign up, a trigger in Supabase creates a profile in `profiles`.
- OAuth users (Google) are supported and handled with profile creation logic.
- Auth state is globally available via React Context.

### 11.4 Voting Logic
- Voting is handled via upsert to the `votes` table (ensures one vote per user per influencer).
- Vote stats are recalculated and cached for performance.
- Users can change their vote at any time.

### 11.5 Review Logic
- Users can submit one review per influencer.
- Reviews are linked to both user and influencer.
- Reviews can be liked/disliked (tracked in `review_reactions`).
- Expert reviews are shown separately and factored into "Expert Verdict".

### 11.6 Influencer Suggestion & Admin Flow
- Users can suggest new influencers (stored in `influencer_suggestions`).
- Admins can approve or reject suggestions via the admin panel.
- Admins can moderate reviews and manage users.

### 11.7 Error Handling
- Global error boundaries catch React errors and store them for debugging.
- Diagnostic utilities check Supabase connection and auth state.
- Security audit logs track sensitive actions for compliance.

---

## 12. Summary

Natty or Juicy is a robust, community-driven platform for voting and discussion, built with modern web technologies and a scalable backend. The architecture is clean, modular, and ready for future growth.

---

If you need more detail on any specific part (e.g., a deep dive into a component, Supabase function, or admin workflow), just ask! 