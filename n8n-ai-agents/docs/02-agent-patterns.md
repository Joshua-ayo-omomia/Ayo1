# Multi-Agent Orchestration Patterns in n8n

## Table of Contents

1. [Single Agent Pattern](#1-single-agent-pattern)
2. [Sequential Chain Pattern](#2-sequential-chain-pattern)
3. [Router/Classifier Pattern](#3-routerclassifier-pattern)
4. [Orchestrator with Sub-Agents](#4-orchestrator-with-sub-agents)
5. [Parallel Agent Pattern](#5-parallel-agent-pattern)
6. [Plan and Execute Pattern](#6-plan-and-execute-pattern)
7. [Human-in-the-Loop Pattern](#7-human-in-the-loop-pattern)
8. [RAG Agent Pattern](#8-rag-agent-pattern)
9. [Choosing the Right Pattern](#9-choosing-the-right-pattern)

---

## 1. Single Agent Pattern

The simplest pattern. One agent handles everything.

```
[Trigger] → [AI Agent] → [Output]
                │
                ├── [LLM]
                ├── [Tool 1]
                ├── [Tool 2]
                └── [Memory]
```

**When to use:**
- Simple, well-defined tasks
- Few tools (< 5)
- Single domain of responsibility

**Example - FAQ Bot:**
```
[Chat Trigger] → [AI Agent: "Answer questions about license applications"]
                      ├── [Anthropic Chat Model]
                      ├── [Vector Store Tool: Policy Documents]
                      └── [Window Buffer Memory]
```

**Pros:** Simple to build and debug
**Cons:** Doesn't scale well with many tools; LLM can get confused with too many options

---

## 2. Sequential Chain Pattern

Multiple AI steps in sequence, each processing the output of the previous.

```
[Trigger] → [AI Step 1: Extract] → [AI Step 2: Analyze] → [AI Step 3: Decide] → [Output]
```

**When to use:**
- Pipeline processing (extract → transform → load)
- Each step has a clear, distinct responsibility
- Output of one step feeds into the next

**Example - Document Processing Pipeline:**
```
[Webhook: New Document]
    → [AI Agent 1: Extract text from document image]
    → [AI Agent 2: Validate extracted data against requirements]
    → [AI Agent 3: Generate verification report]
    → [Supabase: Store results]
```

**Pros:** Each step is focused and reliable; easy to debug individual steps
**Cons:** Linear only; no dynamic branching; total latency = sum of all steps

---

## 3. Router/Classifier Pattern

A classifier examines the input and routes to specialized handlers.

```
                          ┌→ [Agent A: License Queries]
[Trigger] → [Classifier] ├→ [Agent B: Document Help]
                          ├→ [Agent C: Test Scheduling]
                          └→ [Agent D: General Support]
```

**When to use:**
- Multiple distinct task categories
- Each category needs different tools/prompts
- You want to minimize irrelevant tools per agent

**Implementation in n8n:**

1. **Option A - AI Text Classifier Node:**
   ```
   [Chat Trigger] → [Text Classifier]
                          │
                          ├── "license_query" → [License Agent]
                          ├── "document_help" → [Document Agent]
                          ├── "scheduling"    → [Scheduling Agent]
                          └── "general"       → [General Agent]
   ```

2. **Option B - AI Agent as Router:**
   ```
   [Chat Trigger] → [Router Agent]
                          │
                          ├── [LLM: GPT-4o-mini]  (cheap, fast)
                          └── [Output Parser: { "category": "...", "query": "..." }]
                     → [Switch Node: route by category]
                          ├── [License Agent]
                          ├── [Document Agent]
                          └── [General Agent]
   ```

**Pros:** Each agent is specialized; fewer tools per agent improves accuracy
**Cons:** Classification errors cascade; extra latency from routing step

---

## 4. Orchestrator with Sub-Agents

A master agent delegates to specialized sub-agents based on its reasoning.

```
[Trigger] → [Orchestrator Agent]
                  │
                  ├── [LLM: Claude Sonnet]
                  ├── [AI Agent Tool: "document_expert"]
                  │        ├── [LLM: GPT-4o]
                  │        ├── [HTTP Tool: Supabase Documents API]
                  │        └── [Code Tool: Image Analysis]
                  ├── [AI Agent Tool: "scheduling_expert"]
                  │        ├── [LLM: GPT-4o-mini]
                  │        └── [HTTP Tool: Calendar API]
                  ├── [AI Agent Tool: "policy_expert"]
                  │        ├── [LLM: Claude Sonnet]
                  │        └── [Vector Store: Policy Documents]
                  └── [Window Buffer Memory]
```

**When to use:**
- Complex tasks requiring multiple domains of expertise
- Dynamic task decomposition (the agent decides what to delegate)
- Sub-tasks may need different LLMs or tools

**System prompt for the Orchestrator:**
```
You are the BLA Portal Orchestrator. You coordinate between specialized agents to handle user requests.

Available sub-agents:
1. document_expert: Handles document verification, validation, and status checks.
   Use when the user asks about documents, uploads, or verification status.

2. scheduling_expert: Manages test appointments and scheduling.
   Use when the user asks about booking, rescheduling, or availability.

3. policy_expert: Answers questions about licensing policies, requirements, and regulations.
   Use when the user asks about rules, eligibility, or procedures.

Delegation rules:
- Analyze the user's request and delegate to the most appropriate sub-agent
- You may call multiple sub-agents if the request spans multiple domains
- Synthesize sub-agent responses into a coherent final answer
- If no sub-agent is appropriate, answer directly
```

**Pros:** Most flexible; agents can have different LLMs; clean separation of concerns
**Cons:** Higher latency (orchestrator + sub-agent calls); more complex to debug; higher cost

---

## 5. Parallel Agent Pattern

Multiple agents process the same input simultaneously, results are merged.

```
                    ┌→ [Agent A: Sentiment Analysis]  ──┐
[Trigger] → [Split] ├→ [Agent B: Entity Extraction]    ├→ [Merge] → [Output]
                    └→ [Agent C: Classification]       ──┘
```

**Implementation in n8n:**

n8n doesn't have native parallel agent execution, but you can approximate it:

**Option A - Split into parallel branches:**
```
[Webhook]
    → [Set: Prepare input for all agents]
    → [Split In Batches: 1 item per batch]
         ├── Branch 1: [AI Agent: Analyze documents]
         ├── Branch 2: [AI Agent: Check compliance]
         └── Branch 3: [AI Agent: Generate summary]
    → [Merge: Combine results]
    → [Respond to Webhook]
```

**Option B - Multiple workflow calls:**
```
[Webhook]
    → [Execute Workflow: Agent A] (async)
    → [Execute Workflow: Agent B] (async)
    → [Execute Workflow: Agent C] (async)
    → [Wait for all]
    → [Merge results]
```

**Pros:** Faster for independent tasks; each agent is focused
**Cons:** Can't share context between parallel agents; merge logic needed

---

## 6. Plan and Execute Pattern

The agent first creates a plan, then executes each step.

```
[Trigger] → [Planner Agent] → [Loop: For each step]
                                    → [Executor Agent]
                                    → [Check: Step complete?]
                                         ├── Yes → Next step
                                         └── No → Retry/Adjust
                               → [Final Summary]
```

**Implementation via prompt engineering:**

```
System Prompt for Planner:
"You are a planning agent. Given a complex request, break it down into
numbered steps. Output ONLY the plan as a JSON array:
[
  { "step": 1, "action": "...", "tool": "...", "input": "..." },
  { "step": 2, "action": "...", "tool": "...", "input": "..." }
]"

System Prompt for Executor:
"You are an execution agent. You will receive a single step to execute.
Perform the action using the available tools and return the result."
```

**n8n implementation:**
```
[Trigger]
    → [AI Agent: Planner] (with Output Parser for JSON array)
    → [Split In Batches]
    → [Loop]
         → [AI Agent: Executor] (with tools)
         → [Append result to context]
    → [AI Agent: Summarizer] (compile final response)
```

**Pros:** Handles complex, multi-step tasks; transparent reasoning; can be debugged step-by-step
**Cons:** Slow (multiple LLM calls); plan may be wrong; rigid once plan is set

---

## 7. Human-in-the-Loop Pattern

The agent proposes actions, a human approves before execution.

```
[Trigger] → [AI Agent: Propose Action]
    → [IF: High-risk action?]
         ├── Yes → [Send Approval Request (Slack/Email)]
         │              → [Wait for Approval]
         │              → [IF: Approved?]
         │                   ├── Yes → [Execute Action]
         │                   └── No  → [Notify Agent: Rejected]
         └── No → [Execute Action directly]
```

**n8n v1.120+ supports gated tools natively:**

1. Mark specific tools as "gated" in the AI Agent configuration
2. When the agent tries to call a gated tool, execution pauses
3. A notification is sent to the approver (via Slack, email, etc.)
4. The workflow resumes only after explicit approval

**Example - Application approval with human review:**
```
[Supabase Trigger: New Application]
    → [AI Agent: Review Application]
         ├── [LLM: Claude Sonnet]
         ├── [HTTP Tool: Get applicant data]
         ├── [HTTP Tool: Get documents]
         └── [Code Tool: Check eligibility rules]
    → [AI produces recommendation: approve/reject/escalate]
    → [IF: AI confidence < 0.8 OR action = "escalate"]
         ├── Yes → [Slack: Send to admin for review]
         │              → [Wait: Form submission]
         │              → [Supabase: Update with human decision]
         └── No → [Auto-process with AI recommendation]
              → [Supabase: Update application status]
```

**Pros:** Safety for high-stakes decisions; builds trust; catches AI errors
**Cons:** Adds latency; requires human availability; needs approval UI

---

## 8. RAG Agent Pattern

Agent retrieves relevant context from a vector store before answering.

```
[Chat Trigger] → [AI Agent]
                      ├── [LLM: Claude Sonnet]
                      ├── [Vector Store Tool: Policy documents]
                      │        └── [Embeddings: OpenAI]
                      │        └── [Vector Store: Qdrant/Pinecone/Supabase pgvector]
                      ├── [HTTP Tool: Supabase API (live data)]
                      └── [Postgres Memory]
```

**Setting up RAG in n8n:**

1. **Ingest documents** (separate workflow):
   ```
   [Schedule/Manual Trigger]
       → [Read Files: Policy PDFs]
       → [Text Splitter: Recursive Character]
       → [Embeddings: OpenAI]
       → [Vector Store: Upsert to Qdrant]
   ```

2. **Query with agent:**
   ```
   [Chat Trigger]
       → [AI Agent]
            ├── [LLM]
            └── [Vector Store Tool]
                     ├── [Embeddings: OpenAI]
                     └── [Vector Store: Qdrant]
   ```

**When to use:**
- Knowledge-heavy applications (policies, regulations, FAQs)
- When the agent needs to reference specific documents
- Reducing hallucination by grounding answers in real data

**Pros:** Accurate, grounded answers; scales to large document sets
**Cons:** Requires vector store setup; embedding costs; retrieval quality varies

---

## 9. Choosing the Right Pattern

| Pattern | Complexity | Latency | Cost | Best For |
|---------|-----------|---------|------|----------|
| Single Agent | Low | Low | Low | Simple tasks, < 5 tools |
| Sequential Chain | Low-Med | Medium | Medium | Pipelines, ETL |
| Router/Classifier | Medium | Medium | Medium | Multi-category inputs |
| Orchestrator + Sub-Agents | High | High | High | Complex, multi-domain tasks |
| Parallel Agents | Medium | Low | High | Independent concurrent tasks |
| Plan and Execute | High | Very High | High | Complex multi-step tasks |
| Human-in-the-Loop | Medium | Variable | Medium | High-stakes decisions |
| RAG Agent | Medium | Medium | Medium | Knowledge-heavy Q&A |

### Decision Flowchart

```
Start
  │
  ├── Is it a single, focused task?
  │     └── Yes → Single Agent
  │
  ├── Is it a pipeline (A → B → C)?
  │     └── Yes → Sequential Chain
  │
  ├── Are there distinct input categories?
  │     └── Yes → Router/Classifier
  │
  ├── Does it need multiple expertise domains?
  │     └── Yes → Orchestrator + Sub-Agents
  │
  ├── Can sub-tasks run independently?
  │     └── Yes → Parallel Agents
  │
  ├── Is it a complex multi-step problem?
  │     └── Yes → Plan and Execute
  │
  ├── Are there high-stakes actions?
  │     └── Yes → Add Human-in-the-Loop
  │
  └── Does it need to reference documents?
        └── Yes → Add RAG
```

**Note:** These patterns can be combined. For example, an Orchestrator pattern where one sub-agent uses RAG and the overall workflow includes human-in-the-loop for approvals.
