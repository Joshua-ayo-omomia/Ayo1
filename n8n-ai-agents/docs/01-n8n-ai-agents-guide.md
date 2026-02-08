# Complete Guide to Building AI Agents in n8n

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [The AI Agent Node](#the-ai-agent-node)
3. [Sub-Node Architecture](#sub-node-architecture)
4. [Building Your First Agent](#building-your-first-agent)
5. [Tool Nodes](#tool-nodes)
6. [Memory Nodes](#memory-nodes)
7. [Output Parsers](#output-parsers)
8. [Connecting to LLM Providers](#connecting-to-llm-providers)
9. [Triggers for AI Workflows](#triggers-for-ai-workflows)
10. [Error Handling](#error-handling)
11. [Production Deployment](#production-deployment)

---

## Core Concepts

n8n's AI agent system is built on the **LangChain JavaScript framework** and uses a modular sub-node architecture. The key idea: an AI Agent node acts as the "brain" that receives input, reasons about it using an LLM, decides which tools to call, inspects results, and iterates until it produces a final answer.

### Key Terminology

| Term | Definition |
|------|-----------|
| **Agent** | An autonomous AI system that receives input, reasons, and acts to achieve goals |
| **Tools** | External capabilities the agent can invoke (APIs, databases, code execution) |
| **Memory** | Context retention across conversation turns |
| **Sub-nodes** | Nodes that connect below an Agent node (LLM, tools, memory, output parser) |
| **System Prompt** | Instructions that define the agent's behavior, personality, and constraints |
| **Tool Calling** | The LLM's ability to select and invoke tools with structured parameters |

---

## The AI Agent Node

As of n8n v1.82.0, all agent types have been consolidated into the **Tools Agent**. This is the single agent node you'll use.

### Configuration Options

```
AI Agent Node
├── Prompt (System Message): Defines agent behavior
├── Max Iterations: Limits tool-calling rounds (default: 10)
├── Return Intermediate Steps: Include reasoning chain in output
└── Sub-node connections:
    ├── Chat Model (required): LLM provider
    ├── Memory (optional): Conversation history
    ├── Tool (optional, multiple): Available capabilities
    └── Output Parser (optional): Structured output formatting
```

### System Prompt Best Practices

```
You are a [role] agent for the BLA Portal system.

Your responsibilities:
- [Specific task 1]
- [Specific task 2]

Rules:
- Always verify data before taking action
- If uncertain, ask for clarification
- Never modify records without proper authorization

Available context:
- Current date: {{$now.toISO()}}
- User ID: {{$json.userId}}

Output format:
- Provide clear, structured responses
- Include relevant record IDs in your response
```

**Tips for effective system prompts:**
- Be specific about the agent's role and boundaries
- List available tools and when to use each one
- Define output format expectations
- Include dynamic context using n8n expressions (`{{$json.field}}`)
- Set guardrails (what the agent should NOT do)

---

## Sub-Node Architecture

n8n uses a unique "cluster node" pattern where sub-nodes attach below the main Agent node:

```
[Trigger] → [AI Agent Node]
                 │
                 ├── [Chat Model]        ← Required: The LLM
                 ├── [Memory]            ← Optional: Context retention
                 ├── [Tool 1]            ← Optional: API calls
                 ├── [Tool 2]            ← Optional: Database queries
                 ├── [Tool 3]            ← Optional: Code execution
                 └── [Output Parser]     ← Optional: Structured output
```

### How to connect sub-nodes

1. Add an **AI Agent** node to your canvas
2. Click the `+` button on the bottom of the Agent node
3. Select the sub-node type (Model, Memory, Tool, Output Parser)
4. Configure each sub-node with its specific settings
5. Sub-nodes appear visually attached below the Agent node

---

## Building Your First Agent

### Step 1: Create the Trigger

Every workflow needs a trigger. For AI agents, common triggers are:

```
Chat Trigger       → Interactive chat interface (built-in n8n chat UI)
Webhook            → External HTTP requests from your app
Schedule Trigger   → Periodic automated tasks
Supabase Trigger   → Database change events (INSERT, UPDATE, DELETE)
```

### Step 2: Add the AI Agent Node

1. Add "AI Agent" from the node palette
2. Connect it to your trigger
3. Set the **Prompt** field to reference trigger data:
   ```
   {{ $json.chatInput }}       // From Chat Trigger
   {{ $json.body.message }}    // From Webhook
   ```

### Step 3: Attach a Chat Model

1. Click `+` below the Agent → "Chat Model"
2. Select your provider (OpenAI, Anthropic, etc.)
3. Configure:
   - **Credential**: Your API key
   - **Model**: e.g., `gpt-4o`, `claude-sonnet-4-20250514`
   - **Temperature**: 0 for deterministic, 0.7 for creative
   - **Max Tokens**: Limit response length

### Step 4: Add Tools

1. Click `+` below the Agent → "Tool"
2. Select a tool type:

   **HTTP Request Tool** (call any API):
   ```
   Name: "get_application_status"
   Description: "Retrieves the current status of a license application by ID"
   Method: GET
   URL: https://your-supabase-url.supabase.co/rest/v1/applications?id=eq.{applicationId}
   Headers: apikey: {{$credentials.supabaseApi.apiKey}}
   ```

   **Code Tool** (run JavaScript/Python):
   ```javascript
   // Validate document expiry
   const expiryDate = new Date($input.item.json.expiry_date);
   const now = new Date();
   return {
     isExpired: expiryDate < now,
     daysUntilExpiry: Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24))
   };
   ```

   **Workflow Tool** (call another n8n workflow):
   ```
   Name: "send_notification"
   Description: "Sends a notification to a user via email or SMS"
   Workflow: [Select your notification workflow]
   ```

### Step 5: Add Memory (Optional)

1. Click `+` below the Agent → "Memory"
2. Select memory type:
   - **Window Buffer Memory**: Stores last N messages (simple, fast)
   - **Postgres Chat Memory**: Persistent storage using PostgreSQL
   - **Redis Chat Memory**: Fast, distributed memory

3. Configure the **Session ID** to isolate conversations:
   ```
   {{ $json.userId }}_{{ $json.sessionId }}
   ```

### Step 6: Test

1. Click "Execute Workflow" or open the built-in Chat UI
2. Send a test message
3. Inspect the execution log to see:
   - What the agent received
   - Which tools it called
   - The LLM's reasoning process
   - The final output

---

## Tool Nodes

### Built-in Tool Nodes

| Tool | Use Case | Example |
|------|----------|---------|
| **HTTP Request** | Call any REST API | Query Supabase, send emails via SendGrid |
| **Code (JS/Python)** | Custom logic | Data validation, calculations, formatting |
| **Calculator** | Math operations | Fee calculations, date math |
| **SerpAPI** | Web search | Look up regulations, policies |
| **Wikipedia** | Knowledge lookup | Reference information |
| **Workflow Tool** | Call sub-workflow | Delegate to specialized workflows |
| **AI Agent Tool** | Call sub-agent | Delegate to specialized AI agent |
| **MCP Client** | External MCP server | Connect to MCP-compatible tools |
| **Vector Store** | Semantic search | RAG over documents |

### HTTP Request Tool - Detailed Example

```json
{
  "name": "query_applications",
  "description": "Query license applications from the database. Parameters: status (string, optional), user_id (string, optional), date_from (ISO date, optional)",
  "method": "GET",
  "url": "={{ $json.supabaseUrl }}/rest/v1/applications",
  "queryParameters": {
    "select": "*",
    "status": "eq.{{ $json.toolInput.status }}",
    "user_id": "eq.{{ $json.toolInput.user_id }}"
  },
  "headers": {
    "apikey": "={{ $credentials.supabaseApi.apiKey }}",
    "Authorization": "Bearer {{ $credentials.supabaseApi.apiKey }}"
  }
}
```

### Workflow Tool - Sub-Workflow as a Tool

This is one of the most powerful patterns. You create a separate workflow and expose it as a tool:

**Parent workflow (Orchestrator):**
```
[Chat Trigger] → [AI Agent]
                      ├── [Chat Model: GPT-4o]
                      ├── [Workflow Tool: "verify_document"]
                      ├── [Workflow Tool: "send_notification"]
                      └── [Workflow Tool: "schedule_appointment"]
```

**Child workflow (verify_document):**
```
[Execute Workflow Trigger] → [Supabase: Get Document] → [AI: Analyze Image] → [Supabase: Update Status] → [Return Result]
```

**Configuration:**
1. In the child workflow, use "Execute Workflow Trigger" as the trigger
2. In the parent, add a "Workflow Tool" sub-node
3. Set Name: `verify_document`
4. Set Description: `Verifies a submitted document (photo ID, proof of residence, medical certificate). Input: document_id (string). Returns verification result with status and issues found.`
5. Select the child workflow

### AI Agent Tool - Sub-Agent

For complex delegation where the sub-task needs its own reasoning:

```
[Chat Trigger] → [Orchestrator Agent]
                      ├── [Chat Model: Claude Sonnet]
                      ├── [AI Agent Tool: "research_agent"]
                      │        ├── [Chat Model: GPT-4o]
                      │        ├── [SerpAPI Tool]
                      │        └── [Wikipedia Tool]
                      ├── [AI Agent Tool: "writing_agent"]
                      │        ├── [Chat Model: Claude Sonnet]
                      │        └── [Code Tool]
                      └── [Workflow Tool: "send_email"]
```

---

## Memory Nodes

### Memory Types Compared

| Type | Persistence | Speed | Best For |
|------|------------|-------|----------|
| **Window Buffer** | In-memory (lost on restart) | Fastest | Development, short sessions |
| **Postgres** | Database | Good | Production with existing Postgres |
| **Redis** | In-memory + optional persistence | Fast | High-throughput production |
| **Vector Store** | Vector DB | Varies | Semantic search over history |

### Session Management

Memory is keyed by **Session ID**. This determines which conversations share context:

```
// Per-user sessions (each user has their own memory)
Session ID: {{ $json.userId }}

// Per-conversation sessions (each chat session is isolated)
Session ID: {{ $json.userId }}_{{ $json.conversationId }}

// Global session (all users share memory - rarely wanted)
Session ID: "global"
```

### Window Buffer Memory Configuration

```
Context Window Length: 10          // Keep last 10 message pairs
Session ID: {{ $json.sessionId }}  // Isolate conversations
```

### Postgres Chat Memory Configuration

```
Connection: [Your Postgres credential]
Session ID: {{ $json.userId }}_{{ $json.sessionId }}
Table Name: n8n_chat_histories     // Default table name
```

**Important**: Memory does NOT persist between workflow executions by default. For production chatbots, use Postgres or Redis memory with consistent session IDs.

---

## Output Parsers

Output parsers transform raw LLM text into structured data. In the Tools Agent, the parser is passed to the model as a formatting tool.

### Structured Output Parser

Define a JSON schema, and the agent's output will conform to it:

```json
{
  "type": "object",
  "properties": {
    "decision": {
      "type": "string",
      "enum": ["approve", "reject", "request_more_info"]
    },
    "reason": {
      "type": "string",
      "description": "Explanation for the decision"
    },
    "missing_documents": {
      "type": "array",
      "items": { "type": "string" },
      "description": "List of required documents not yet submitted"
    },
    "confidence": {
      "type": "number",
      "minimum": 0,
      "maximum": 1
    }
  },
  "required": ["decision", "reason", "confidence"]
}
```

### Auto-fixing Output Parser

Wraps another parser and uses the LLM to fix malformed output. Useful when the agent occasionally returns invalid JSON.

---

## Connecting to LLM Providers

### OpenAI

```
Node: OpenAI Chat Model
Credential: OpenAI API → API Key
Model: gpt-4o (recommended) | gpt-4o-mini (budget)
Temperature: 0-1
```

### Anthropic (Claude)

```
Node: Anthropic Chat Model
Credential: Anthropic API → API Key
Model: claude-sonnet-4-20250514 (balanced) | claude-opus-4-20250514 (best reasoning)
Temperature: 0-1
Max Tokens: 4096
```

### Ollama (Local/Self-Hosted)

```
Node: Ollama Chat Model
Base URL: http://localhost:11434
Model: llama3.1 | mistral | codellama
```

### OpenRouter (Multi-Provider)

```
Node: OpenRouter Chat Model
Credential: OpenRouter API → API Key
Model: anthropic/claude-sonnet-4-20250514 | openai/gpt-4o | google/gemini-pro
```

**Cost optimization tip**: Use OpenRouter or implement a routing workflow that sends simple queries to cheaper models (GPT-4o-mini, Claude Haiku) and complex queries to powerful models (GPT-4o, Claude Sonnet/Opus).

---

## Triggers for AI Workflows

### Chat Trigger (Interactive)

Built-in chat interface for testing and internal use:

```
[Chat Trigger] → [AI Agent] → ...
```

- Opens a chat window in n8n UI
- Supports message history
- Good for development and internal tools

### Webhook Trigger (External Integration)

Connect your BLA Portal to n8n:

```
[Webhook: POST /ai/review-application] → [AI Agent] → [Respond to Webhook]
```

**In your Next.js app:**
```typescript
// src/lib/n8n.ts
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

export async function triggerDocumentReview(documentId: string, userId: string) {
  const response = await fetch(`${N8N_WEBHOOK_URL}/webhook/ai/review-document`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, userId }),
  });
  return response.json();
}
```

### Supabase Trigger (Database Events)

React to database changes automatically:

```
[Supabase Trigger: documents.INSERT] → [AI Agent: Verify Document] → [Supabase: Update Status]
```

### Schedule Trigger (Periodic Tasks)

Run agents on a schedule:

```
[Schedule: Every hour] → [Supabase: Get pending applications] → [AI Agent: Review batch] → [Update results]
```

---

## Error Handling

### Agent-Level Error Handling

1. **Max Iterations**: Set a reasonable limit (5-15) to prevent infinite loops
2. **Timeout**: Configure workflow timeout in settings
3. **Error Workflow**: Create a dedicated error-handling workflow

```
[Error Trigger] → [Extract Error Details] → [Log to Database] → [Send Alert via Slack/Email]
```

### Tool-Level Error Handling

For HTTP Request tools, handle API failures gracefully:

```
System Prompt addition:
"If a tool call fails, report the error clearly and suggest alternative actions.
Never retry a failed tool call more than once."
```

### Fallback Patterns

```
[AI Agent] → [IF: Agent succeeded?]
                ├── True → [Process Result]
                └── False → [Fallback: Manual Review Queue]
```

---

## Production Deployment

### Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
      - N8N_ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: n8n
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  n8n-worker:
    image: docker.n8n.io/n8nio/n8n
    command: worker
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
      - N8N_ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
    depends_on:
      - n8n
      - redis

volumes:
  n8n_data:
  postgres_data:
  redis_data:
```

### Queue Mode (Horizontal Scaling)

Enable queue mode for production workloads:
- Uses Redis to separate scheduling from execution
- Workers pull jobs independently
- Add more `n8n-worker` instances for more throughput
- A single instance handles ~100 concurrent executions; queue mode with 3 workers achieves ~72 req/s

### Security Checklist

- [ ] Enable HTTPS/TLS
- [ ] Set `N8N_ENCRYPTION_KEY` for credential encryption
- [ ] Enable basic auth or SSO
- [ ] Use environment variables for all secrets
- [ ] Configure CORS for webhook endpoints
- [ ] Set up role-based access control
- [ ] Implement rate limiting on webhook endpoints
- [ ] Never log sensitive data in plain text
