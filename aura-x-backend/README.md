# AURA-X Backend

Level 5 Autonomous AI Music Generation Platform - Workflow Orchestration Layer

## Architecture

- **Temporal**: Workflow orchestration, state management, retry logic
- **Modal**: GPU inference functions (MusicGen, Demucs, discriminators)
- **FastAPI**: REST API for frontend communication
- **WebSockets**: Real-time status updates

## Setup

### 1. Install Dependencies

\`\`\`bash
uv pip install -e .
\`\`\`

### 2. Start Temporal Server

\`\`\`bash
temporal server start-dev
\`\`\`

### 3. Start Temporal Worker

\`\`\`bash
python worker.py
\`\`\`

### 4. Deploy Modal Functions

\`\`\`bash
modal deploy activities/modal_inference.py
\`\`\`

## Workflow Architecture

\`\`\`
User Input (Next.js)
      ↓
REST API (/api/aura-x/generate)
      ↓
Temporal Workflow (MusicGenerationWorkflow)
      ↓
┌─────────────────────────────────────────┐
│  Composition → Arrangement → Mixing     │
│       ↓             ↓          ↓        │
│  Modal GPU     Modal GPU   Modal GPU    │
│  (MusicGen)    (Analysis)  (Demucs)     │
└─────────────────────────────────────────┘
      ↓
Quality Evaluation (Neural Discriminator)
      ↓
Self-Healing Loop (if quality < threshold)
      ↓
Final Audio Output
\`\`\`

## Cost Estimation

- Composition: ~$0.40 (A100 × 2 min)
- Arrangement: ~$0.10 (CPU)
- Mixing: ~$0.05 (CPU)
- Mastering: ~$0.05 (CPU)

**Total per song: ~$0.60**
