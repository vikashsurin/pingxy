# Key Checks and Scenarios for Chat App Messaging System

## Pre-Conversation Creation Checks

### 1. **Check for Existing Conversation**
Before creating a new conversation between users, you need to verify if one already exists:

```sql
-- For 1-on-1 conversations
SELECT c.id, c.conversation_type
FROM conversations c
JOIN participants p1 ON c.id = p1.conversation_id
JOIN participants p2 ON c.id = p2.conversation_id
WHERE p1.user_id = :user1_id 
  AND p2.user_id = :user2_id
  AND c.conversation_type = 'direct'
  AND c.is_deleted = false
GROUP BY c.id
HAVING COUNT(DISTINCT p1.user_id) = 2;
```

**Important considerations:**
- Check if it's truly 1-on-1 (exactly 2 participants)
- Verify conversation isn't soft-deleted
- Handle cases where user left and rejoined

### 2. **User Validation Checks**

**Before allowing conversation creation:**
- Both users exist and are active
- Neither user is deleted/suspended
- Privacy settings allow communication
- Neither user has blocked the other
- Age restrictions (if applicable)
- User consent for first-time contact

```sql
-- Check if users can communicate
SELECT 
  u1.id as user1_id,
  u2.id as user2_id,
  u1.is_active,
  u2.is_active,
  EXISTS(SELECT 1 FROM blocked_users WHERE blocker_id = u1.id AND blocked_id = u2.id) as user1_blocked_user2,
  EXISTS(SELECT 1 FROM blocked_users WHERE blocker_id = u2.id AND blocked_id = u1.id) as user2_blocked_user1
FROM users u1, users u2
WHERE u1.id = :user1_id AND u2.id = :user2_id;
```

## Core Scenarios to Handle

### **Scenario 1: First-Time Direct Message**
- No existing conversation exists
- Create new conversation
- Add both users as participants
- Set appropriate metadata (created_at, last_activity, etc.)
- Send initial message
- Trigger notifications

### **Scenario 2: Conversation Already Exists**
- User tries to create duplicate conversation
- Return existing conversation ID
- Optionally navigate user to existing thread
- Don't create duplicate

### **Scenario 3: User Left Previous Conversation**
```sql
-- Check if user previously left
SELECT * FROM participants 
WHERE conversation_id = :conv_id 
  AND user_id = :user_id 
  AND left_at IS NOT NULL;
```

**Options:**
- Allow rejoining same conversation
- Create new conversation thread
- Depends on your UX design

### **Scenario 4: Group Conversations**
More complex than 1-on-1:
- Check for existing group with exact same members
- Verify group size limits
- Check permissions (who can create groups, add members)
- Handle group naming conflicts

### **Scenario 5: Archived/Deleted Conversations**
```sql
-- Check for soft-deleted conversations
SELECT * FROM conversations 
WHERE id = :conv_id 
  AND (is_deleted = true OR deleted_at IS NOT NULL);
```

**Decisions:**
- Allow unarchiving?
- Create new thread instead?
- Show history from old thread?

### **Scenario 6: Permission and Privacy Checks**

**Privacy levels:**
- Public profile (anyone can message)
- Friends only
- No one (DMs disabled)
- Custom allow/block lists

**Rate limiting:**
- Prevent spam conversation creation
- Limit conversations per user per time period
- Track failed attempts

### **Scenario 7: Cross-Platform Considerations**
- User on mobile creates conversation
- Desktop client needs to sync
- Handle race conditions (both users initiate simultaneously)

## Implementation Checklist

### **Before Creating Conversation:**

1. ✓ Validate both user IDs exist
2. ✓ Check users are not blocked
3. ✓ Verify privacy settings allow contact
4. ✓ Check for existing 1-on-1 conversation
5. ✓ Validate rate limits
6. ✓ Check user account status (active/suspended)
7. ✓ Verify business rules (age restrictions, etc.)

### **During Conversation Creation:**

```sql
-- Use transaction to ensure atomicity
BEGIN TRANSACTION;

-- Create conversation
INSERT INTO conversations (id, conversation_type, created_by, created_at)
VALUES (:conv_id, 'direct', :creator_id, NOW());

-- Add participants
INSERT INTO participants (conversation_id, user_id, joined_at, role)
VALUES 
  (:conv_id, :user1_id, NOW(), 'member'),
  (:conv_id, :user2_id, NOW(), 'member');

-- Create initial message if provided
INSERT INTO messages (conversation_id, sender_id, content, sent_at)
VALUES (:conv_id, :sender_id, :content, NOW());

COMMIT;
```

### **After Creation:**

1. Send real-time notifications
2. Update user's conversation list cache
3. Log conversation creation event
4. Trigger welcome message (if applicable)
5. Update analytics

## Edge Cases to Consider

**Concurrent Creation:**
- Use unique constraints on participant combinations
- Handle race condition where both users click "message" simultaneously
- Use database-level locking or unique indexes

```sql
-- Unique constraint to prevent duplicates
CREATE UNIQUE INDEX idx_unique_direct_conversation 
ON participants (conversation_id) 
WHERE conversation_id IN (
  SELECT conversation_id 
  FROM conversations 
  WHERE conversation_type = 'direct'
);
```

**User Self-Messaging:**
- Decide if users can message themselves
- Useful for notes/reminders
- Or block entirely

**Bot Conversations:**
- Special handling for bot participants
- May not need reciprocal checks

**Temporary/Ephemeral Chats:**
- Time-limited conversations
- Auto-delete after period
- Different validation rules

## Recommended Table Structure Additions

```sql
-- conversations table
ALTER TABLE conversations ADD COLUMN last_message_at TIMESTAMP;
ALTER TABLE conversations ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE conversations ADD COLUMN deleted_at TIMESTAMP;

-- participants table  
ALTER TABLE participants ADD COLUMN left_at TIMESTAMP;
ALTER TABLE participants ADD COLUMN role VARCHAR(50) DEFAULT 'member';

-- blocked_users table (if not exists)
CREATE TABLE blocked_users (
  blocker_id INT,
  blocked_id INT,
  blocked_at TIMESTAMP,
  PRIMARY KEY (blocker_id, blocked_id)
);
```

Would you like me to elaborate on any specific scenario or provide code examples for particular checks?
