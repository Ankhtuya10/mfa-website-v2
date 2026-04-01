# Personalized Home Page - Phase 3

## Overview

Transform the home page into a personalized experience for logged-in users, showing content based on their interests, followed designers, and saved items.

## Requirements

### 1. Feed Structure

Single unified feed with 3 filters:
- **For You** (default) - Recommendations based on saved items, tags, and designer tiers
- **Following** - Latest content from followed designers
- **Saved** - User's bookmarked articles and looks

### 2. Data Logic

**For You Feed:**
- Algorithm: Weight saved items' tags + designer tiers + categories user engages with
- Exclude already-saved items
- Rank by relevance score

**Following Feed:**
- Query: articles + collections from designers user follows
- Sort by: published_at descending

**Saved Feed:**
- User's bookmarks sorted by created_at descending
- Show both articles and looks

### 3. UI/UX

- Filter tabs at top of home page feed
- Non-logged users see generic "Explore" feed (current behavior)
- Logged-in users see personalized feed by default
- Empty states with CTAs (Follow designers / Save items)

### 4. Components

- `FeedFilter` - Tabs for For You / Following / Saved
- `FeedContent` - Dynamic content based on selected filter
- `EmptyState` - Context-aware empty states

## Database

No new tables required - use existing:
- `bookmarks` table for saved items and followed designers
- `articles` table with status filter
- `collections` table with status filter
- `designers` table for tier information

## Acceptance Criteria

1. Logged-in users see personalized "For You" feed by default
2. Users can switch between For You / Following / Saved filters
3. Non-logged users see generic content (existing behavior)
4. Empty states guide users to follow/save content
5. Feed updates when user follows new designers or saves items