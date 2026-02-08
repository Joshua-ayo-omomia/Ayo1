# n8n AI Agent Orchestration for BLA Portal

This directory contains AI agent workflows, documentation, and configuration for automating the BLA (Business Licensing Authority) Portal using n8n's AI capabilities.

## Directory Structure

```
n8n-ai-agents/
├── README.md                          # This file
├── docs/
│   ├── 01-n8n-ai-agents-guide.md      # Complete guide to building AI agents in n8n
│   ├── 02-agent-patterns.md           # Multi-agent orchestration patterns
│   └── 03-bla-portal-integration.md   # BLA Portal-specific integration guide
└── workflows/
    ├── 01-document-verification-agent.json    # AI agent for document verification
    ├── 02-application-review-agent.json       # AI agent for application review
    ├── 03-notification-orchestrator.json      # Multi-agent notification system
    └── 04-customer-support-agent.json         # Conversational support agent
```

## Quick Start

1. **Install n8n** (self-hosted or cloud):
   ```bash
   # Docker (recommended for production)
   docker run -it --rm --name n8n -p 5678:5678 \
     -v n8n_data:/home/node/.n8n \
     docker.n8n.io/n8nio/n8n

   # npm (for development)
   npx n8n
   ```

2. **Import workflows**: Open n8n UI → Workflows → Import → select any JSON from `workflows/`

3. **Configure credentials**: Set up API keys for your LLM provider (OpenAI, Anthropic, etc.) and Supabase

4. **Read the docs**: Start with `docs/01-n8n-ai-agents-guide.md` for a complete walkthrough

## LLM Providers Supported

| Provider | Node Name | Best For |
|----------|-----------|----------|
| OpenAI | `OpenAI Chat Model` | General-purpose, tool calling |
| Anthropic (Claude) | `Anthropic Chat Model` | Complex reasoning, long context |
| Google Gemini | `Google Gemini Chat Model` | Multimodal tasks |
| Ollama | `Ollama Chat Model` | Local/private deployment |
| OpenRouter | `OpenRouter Chat Model` | Multi-provider routing |

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                  BLA Portal (Next.js)                 │
│                                                      │
│  Users → Applications → Documents → Tests → License  │
└─────────────────────┬────────────────────────────────┘
                      │ Webhooks / Supabase Triggers
                      ▼
┌──────────────────────────────────────────────────────┐
│                n8n AI Orchestrator                    │
│                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  Document    │  │  Application │  │  Customer   │  │
│  │  Verification│  │  Review      │  │  Support    │  │
│  │  Agent       │  │  Agent       │  │  Agent      │  │
│  └─────────────┘  └──────────────┘  └────────────┘  │
│                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ Notification │  │  Scheduling  │  │  Reporting  │  │
│  │ Agent        │  │  Agent       │  │  Agent      │  │
│  └─────────────┘  └──────────────┘  └────────────┘  │
└──────────────────────────────────────────────────────┘
```
