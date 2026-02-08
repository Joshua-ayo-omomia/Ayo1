# BLA Portal + n8n AI Agent Integration Guide

This guide details how to integrate n8n AI agents with the BLA (Business Licensing Authority) Portal built on Next.js + Supabase.

## Table of Contents

1. [Integration Architecture](#integration-architecture)
2. [Setting Up n8n with Supabase](#setting-up-n8n-with-supabase)
3. [Agent 1: Document Verification](#agent-1-document-verification)
4. [Agent 2: Application Review](#agent-2-application-review)
5. [Agent 3: Notification Orchestrator](#agent-3-notification-orchestrator)
6. [Agent 4: Customer Support Chatbot](#agent-4-customer-support-chatbot)
7. [Connecting Next.js to n8n](#connecting-nextjs-to-n8n)
8. [Environment Variables](#environment-variables)

---

## Integration Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   BLA Portal (Next.js)                   │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ Apply    │  │ Upload   │  │ Track    │  │ Chat   │  │
│  │ Page     │  │ Docs     │  │ Status   │  │ Widget │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘  │
│       │              │              │             │       │
│       └──────────────┴──────────────┴─────────────┘       │
│                          │                                │
│                   [Supabase Client]                       │
└──────────────────────────┬───────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
┌──────────────────────┐  ┌──────────────────────────┐
│     Supabase         │  │         n8n              │
│  ┌────────────────┐  │  │                          │
│  │  PostgreSQL    │──┼──┼→ [DB Triggers/Webhooks]  │
│  │  (Database)    │  │  │         │                │
│  ├────────────────┤  │  │         ▼                │
│  │  Auth          │  │  │  ┌─────────────┐         │
│  ├────────────────┤  │  │  │ AI Agent    │         │
│  │  Storage       │  │  │  │ Orchestrator│         │
│  │  (Documents)   │  │  │  └──────┬──────┘         │
│  ├────────────────┤  │  │         │                │
│  │  Edge Functions│  │  │  ┌──────┴──────┐         │
│  │  (Webhooks)    │──┼──┼→ │ Sub-Agents  │         │
│  └────────────────┘  │  │  └─────────────┘         │
└──────────────────────┘  └──────────────────────────┘
```

### Communication Methods

| Method | Direction | Use Case |
|--------|-----------|----------|
| **Webhook** | Portal → n8n | User actions (submit application, upload doc) |
| **Supabase Trigger** | Database → n8n | Database changes (new row, status update) |
| **Direct API** | n8n → Supabase | Read/write data from agent workflows |
| **Webhook Response** | n8n → Portal | Synchronous responses (chat, instant results) |

---

## Setting Up n8n with Supabase

### 1. Create Supabase REST API Credential in n8n

```
Credential Type: Header Auth
Name: Supabase API
Header Name: apikey
Header Value: [your-supabase-anon-key]

Additional Headers:
  Authorization: Bearer [your-supabase-service-role-key]
  Content-Type: application/json
```

### 2. Common Supabase API Patterns in n8n

**Read applications:**
```
HTTP Request Node:
  Method: GET
  URL: https://[project-ref].supabase.co/rest/v1/applications
  Query Parameters:
    select: *,users(full_name,email),documents(*)
    status: eq.submitted
    order: created_at.desc
  Authentication: Header Auth (Supabase API)
```

**Update application status:**
```
HTTP Request Node:
  Method: PATCH
  URL: https://[project-ref].supabase.co/rest/v1/applications?id=eq.{{ $json.applicationId }}
  Body:
    {
      "status": "{{ $json.newStatus }}",
      "reviewed_at": "{{ $now.toISO() }}",
      "reviewer_notes": "{{ $json.agentNotes }}"
    }
  Authentication: Header Auth (Supabase API)
```

**Insert notification:**
```
HTTP Request Node:
  Method: POST
  URL: https://[project-ref].supabase.co/rest/v1/notifications
  Body:
    {
      "user_id": "{{ $json.userId }}",
      "type": "{{ $json.notificationType }}",
      "title": "{{ $json.title }}",
      "message": "{{ $json.message }}",
      "read": false
    }
  Authentication: Header Auth (Supabase API)
```

---

## Agent 1: Document Verification

Automatically verifies uploaded documents for completeness and validity.

### Workflow Design

```
[Supabase Trigger: documents.INSERT]
    → [HTTP Request: Get document details + storage URL]
    → [AI Agent: Verify Document]
         ├── [LLM: GPT-4o (vision capable)]
         ├── [Code Tool: Check file metadata]
         ├── [Code Tool: Validate expiry dates]
         └── [Output Parser: Verification result schema]
    → [HTTP Request: Update document status in Supabase]
    → [IF: Issues found?]
         ├── Yes → [HTTP Request: Create notification for user]
         └── No  → [HTTP Request: Mark as verified]
```

### System Prompt

```
You are a document verification agent for the BLA Portal. Your job is to
verify submitted documents for driver license applications.

Document types you verify:
1. Photo ID (passport, national ID): Check for clear image, matching name
2. Proof of age: Verify date of birth matches application
3. Proof of residence: Check address, document recency (< 3 months old)
4. Medical certificate: Verify it's from an authorized provider, not expired

Verification checklist:
- Is the document legible and clear?
- Does the document type match what was requested?
- Are all required fields visible?
- Is the document within its validity period?
- Does the name/information match the application?

Output your findings as a structured verification report.
```

### Output Schema

```json
{
  "status": "verified | rejected | needs_review",
  "document_type_match": true,
  "legibility": "good | fair | poor",
  "issues": ["list of specific issues found"],
  "expiry_check": {
    "has_expiry": true,
    "expiry_date": "2025-12-31",
    "is_valid": true
  },
  "confidence": 0.92,
  "notes": "Free-text notes for human reviewer"
}
```

---

## Agent 2: Application Review

Reviews complete applications for eligibility and completeness.

### Workflow Design

```
[Schedule: Every 30 min] OR [Webhook: POST /review-application]
    → [HTTP Request: Get submitted applications with documents]
    → [Loop Over Items]
         → [AI Agent: Review Application]
              ├── [LLM: Claude Sonnet]
              ├── [Code Tool: Eligibility rules checker]
              ├── [HTTP Tool: Get user profile]
              ├── [HTTP Tool: Get all documents for application]
              ├── [HTTP Tool: Check for prior applications]
              └── [Output Parser: Review decision schema]
         → [Switch: Decision]
              ├── "approve" → [Update status: approved]
              ├── "reject"  → [Update status: rejected]
              └── "escalate" → [Notify admin + Update status: under_review]
    → [Create notifications for each processed application]
```

### System Prompt

```
You are an application review agent for the BLA Portal. You review driver
license applications for completeness and eligibility.

Application types:
1. Learner's Permit: Applicant must be 16+, valid ID, medical cert
2. Driver's License: Must have learner's permit, passed regulations test,
   passed driving test, all documents verified
3. License Renewal: Existing license within renewal window, updated medical cert

Review checklist:
1. All required documents uploaded and verified
2. Applicant meets age requirements
3. No conflicting active applications
4. All prerequisite tests passed (for full license)
5. Application data is complete and consistent

Decision rules:
- APPROVE: All requirements met, all documents verified, confidence > 0.9
- ESCALATE: Requirements mostly met but some ambiguity, confidence 0.6-0.9
- REJECT: Clear disqualification (age, missing critical docs, failed tests)

Always explain your reasoning clearly.
```

---

## Agent 3: Notification Orchestrator

Multi-agent system that handles all portal notifications.

### Workflow Design

```
[Orchestrator Agent]
    ├── [LLM: GPT-4o-mini] (fast, cheap for routing)
    ├── [AI Agent Tool: "compose_notification"]
    │        ├── [LLM: Claude Sonnet]
    │        └── [Code Tool: Template engine]
    ├── [Workflow Tool: "send_email"]
    │        → [Sub-workflow: SendGrid/SMTP integration]
    ├── [Workflow Tool: "send_sms"]
    │        → [Sub-workflow: Twilio integration]
    ├── [Workflow Tool: "push_in_app"]
    │        → [Sub-workflow: Supabase notification insert]
    └── [HTTP Tool: Get user notification preferences]
```

### Notification Types (from BLA Portal schema)

```
- application_update: Status change on an application
- document_request: Additional documents needed
- appointment_reminder: Upcoming test/appointment
- test_result: Regulations or driving test results
- license_expiry: License approaching expiry date
- general: System announcements
```

### System Prompt

```
You are the notification orchestrator for the BLA Portal. When triggered
with a notification event, you:

1. Look up the user's notification preferences (email, SMS, in-app)
2. Compose an appropriate message using the compose_notification agent
3. Deliver via the user's preferred channels

Message guidelines:
- Be professional but friendly
- Include relevant details (application ID, dates, next steps)
- For urgent notifications (test results, document requests), use all enabled channels
- For routine notifications (reminders), respect quiet hours (10pm-8am)
- Always include a link to the relevant portal page
```

---

## Agent 4: Customer Support Chatbot

Interactive chat agent embedded in the BLA Portal.

### Workflow Design

```
[Webhook: POST /api/chat]
    → [AI Agent: Customer Support]
         ├── [LLM: Claude Sonnet]
         ├── [HTTP Tool: Get user's applications]
         ├── [HTTP Tool: Get user's documents]
         ├── [HTTP Tool: Get user's appointments]
         ├── [HTTP Tool: Get user's test results]
         ├── [Vector Store Tool: Policy & FAQ knowledge base]
         ├── [Workflow Tool: Schedule appointment]
         ├── [Workflow Tool: Send notification to admin]
         └── [Postgres Chat Memory]
    → [Respond to Webhook: { "reply": "..." }]
```

### System Prompt

```
You are the BLA Portal customer support assistant. You help users with
their driver license applications.

You can:
1. Check application status and provide updates
2. Explain document requirements and why documents were rejected
3. Answer questions about licensing policies and procedures
4. Help schedule test appointments
5. Explain test results and next steps
6. Escalate complex issues to human administrators

You cannot:
1. Approve or reject applications
2. Modify application data
3. Access other users' information
4. Make promises about processing times

Current user context:
- User ID: {{ $json.userId }}
- User Name: {{ $json.userName }}

Always be professional, helpful, and accurate. If you're unsure about
something, say so and offer to connect the user with a human agent.
```

---

## Connecting Next.js to n8n

### Create an n8n Client Library

```typescript
// src/lib/n8n.ts

const N8N_BASE_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678';

interface N8nResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Trigger an n8n webhook workflow
 */
async function triggerWebhook<T>(
  path: string,
  payload: Record<string, unknown>
): Promise<N8nResponse<T>> {
  try {
    const response = await fetch(`${N8N_BASE_URL}/webhook/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data: data as T };
  } catch (error) {
    console.error(`n8n webhook error (${path}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Request AI review of a document
 */
export async function requestDocumentReview(documentId: string, userId: string) {
  return triggerWebhook('ai/review-document', { documentId, userId });
}

/**
 * Request AI review of an application
 */
export async function requestApplicationReview(applicationId: string) {
  return triggerWebhook('ai/review-application', { applicationId });
}

/**
 * Send a chat message to the AI support agent
 */
export async function sendChatMessage(
  userId: string,
  sessionId: string,
  message: string
) {
  return triggerWebhook<{ reply: string }>('ai/chat', {
    userId,
    sessionId,
    message,
  });
}

/**
 * Trigger a notification via the AI orchestrator
 */
export async function triggerNotification(
  userId: string,
  type: string,
  context: Record<string, unknown>
) {
  return triggerWebhook('ai/notify', { userId, type, context });
}
```

### Chat Component Integration

```typescript
// Example: Integrating chat in a Next.js page
// src/app/support/page.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '@/lib/n8n';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function SupportChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const sessionId = useRef(crypto.randomUUID());

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await sendChatMessage(
        'current-user-id', // Replace with actual user ID from auth
        sessionId.current,
        input
      );

      if (result.success && result.data) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.data!.reply,
          timestamp: new Date(),
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] rounded-lg p-3 ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask about your application..."
          className="flex-1 border rounded-lg px-4 py-2"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
```

---

## Environment Variables

Add these to your `.env.local`:

```bash
# n8n Integration
N8N_WEBHOOK_URL=http://localhost:5678      # n8n instance URL
N8N_API_KEY=your-n8n-api-key               # For authenticated webhooks

# LLM Providers (configured in n8n, listed here for reference)
# OPENAI_API_KEY=sk-...                    # If using OpenAI
# ANTHROPIC_API_KEY=sk-ant-...             # If using Anthropic Claude
```

Add to n8n environment:

```bash
# Supabase (for n8n to access your database)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...           # For admin operations

# LLM API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```
