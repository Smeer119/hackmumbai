# Console Logs Guide

This document explains the console logs you'll see when using the home page with Supabase integration.

## Log Categories

### 🚀 Initialization
- `🚀 [INIT] Component mounted, starting initial load` - Component has mounted and is starting the first data fetch

### 🔄 Data Fetching
- `🔄 [FETCH] Starting fetch for page X` - Beginning to fetch data for page X
- `📊 [FETCH] Requesting items X to Y` - Requesting specific range of items from Supabase
- `⏱️ [FETCH] Query completed in XXms` - Shows how long the Supabase query took
- `✅ [SUCCESS] Fetched X issues` - Successfully retrieved X issues from database
- `🔄 [TRANSFORM] Converted X issues to posts` - Transformed database records to Post format
- `🏁 [FETCH] Fetch complete for page X` - Finished fetching page X

### 📥 Load More
- `📥 [LOAD MORE] Loading page X` - Starting to load page X
- `➕ [LOAD MORE] Adding X posts to existing Y posts` - Adding new posts to the list
- `⏸️ [LOAD MORE] Skipped - loading: true/false, hasMore: true/false` - Load more was skipped (already loading or no more data)
- `🛑 [LOAD MORE] No more posts available` - Reached the end of available data
- `🛑 [LOAD MORE] Reached end - received X < 5` - Last page had fewer items than page size

### 👁️ Scroll Detection
- `👀 [OBSERVER] Observing scroll target` - Intersection observer is now watching for scroll
- `👁️ [SCROLL] Intersection detected - triggering load more` - User scrolled to bottom, loading more
- `🔌 [OBSERVER] Disconnecting observer` - Cleaning up observer on unmount

### 🏠 Page Rendering
- `🏠 [HOME PAGE] Render - Posts: X, Loading: true/false, HasMore: true/false` - Current state of the home page

### 🔄 Refresh
- `🔄 [REFRESH] Refreshing all data` - User triggered a refresh
- `✅ [REFRESH] Refresh complete` - Refresh finished

### ❤️ User Actions
- `❤️ [LIKE] Liking post X` - User liked a post
- `📤 [SHARE] Sharing post X` - User shared a post
- `🗑️ [DELETE] Deleting issue X` - Starting to delete an issue
- `✅ [DELETE] Issue X deleted successfully` - Issue deleted from database

### ❌ Errors
- `❌ [ERROR] Supabase error:` - Error from Supabase query
- `❌ [ERROR] Exception during fetch:` - JavaScript exception during fetch
- `❌ [DELETE ERROR] Error deleting issue:` - Error while deleting
- `❌ [DELETE ERROR] Exception during delete:` - Exception during delete

## Typical Flow

### Initial Page Load
```
🚀 [INIT] Component mounted, starting initial load
🏠 [HOME PAGE] Render - Posts: 0, Loading: true, HasMore: true
📥 [LOAD MORE] Loading page 0
🔄 [FETCH] Starting fetch for page 0
📊 [FETCH] Requesting items 0 to 4
⏱️ [FETCH] Query completed in 250.50ms
✅ [SUCCESS] Fetched 5 issues
🔄 [TRANSFORM] Converted 5 issues to posts
🏁 [FETCH] Fetch complete for page 0
➕ [LOAD MORE] Adding 5 posts to existing 0 posts
👀 [OBSERVER] Observing scroll target
🏠 [HOME PAGE] Render - Posts: 5, Loading: false, HasMore: true
```

### Scroll to Load More
```
👁️ [SCROLL] Intersection detected - triggering load more
📥 [LOAD MORE] Loading page 1
🔄 [FETCH] Starting fetch for page 1
📊 [FETCH] Requesting items 5 to 9
⏱️ [FETCH] Query completed in 180.25ms
✅ [SUCCESS] Fetched 5 issues
🔄 [TRANSFORM] Converted 5 issues to posts
🏁 [FETCH] Fetch complete for page 1
➕ [LOAD MORE] Adding 5 posts to existing 5 posts
🏠 [HOME PAGE] Render - Posts: 10, Loading: false, HasMore: true
```

### Reaching End of Data
```
👁️ [SCROLL] Intersection detected - triggering load more
📥 [LOAD MORE] Loading page 2
🔄 [FETCH] Starting fetch for page 2
📊 [FETCH] Requesting items 10 to 14
⏱️ [FETCH] Query completed in 150.75ms
✅ [SUCCESS] Fetched 3 issues
🔄 [TRANSFORM] Converted 3 issues to posts
🏁 [FETCH] Fetch complete for page 2
➕ [LOAD MORE] Adding 3 posts to existing 10 posts
🛑 [LOAD MORE] Reached end - received 3 < 5
🏠 [HOME PAGE] Render - Posts: 13, Loading: false, HasMore: false
```

## Performance Optimization

### Current Settings
- **Items per page**: 5 (reduced from 10 for faster initial load)
- **Initial skeleton cards**: 2 (when no posts loaded)
- **Loading more skeleton cards**: 1 (when posts already exist)

### What to Monitor
1. **Query Time**: `⏱️ [FETCH] Query completed in XXms`
   - Should be under 500ms for good performance
   - If consistently over 1000ms, check Supabase indexes

2. **Transform Time**: Check the time between `✅ [SUCCESS]` and `🏁 [FETCH]`
   - Should be negligible (< 10ms)
   - If slow, check photo JSON parsing

3. **Render Count**: Number of `🏠 [HOME PAGE] Render` logs
   - Should only render when state changes
   - Too many renders may indicate optimization needed

## Troubleshooting

### No data loading
Look for:
- `❌ [ERROR] Supabase error:` - Check Supabase connection
- `✅ [SUCCESS] Fetched 0 issues` - Database is empty or query filters too strict

### Slow loading
Look for:
- High values in `⏱️ [FETCH] Query completed in XXms`
- Check network tab in browser DevTools
- Verify Supabase indexes exist (created_at, status, priority)

### Infinite scroll not working
Look for:
- `👀 [OBSERVER] Observing scroll target` - Should appear
- `👁️ [SCROLL] Intersection detected` - Should appear when scrolling to bottom
- `⏸️ [LOAD MORE] Skipped` - Check the reason (loading or hasMore)
