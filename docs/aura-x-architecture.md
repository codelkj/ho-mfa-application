# AURA-X Architecture: Level 5 Autonomous Music Generation

## System Overview

AURA-X combines Modal (GPU compute), Temporal (orchestration), and Pipecat/Daily (real-time streaming) to create a fully autonomous music production agent.

## Architecture Diagram

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     User Interface                          │
│              (Next.js + WebSocket Client)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                 Pipecat + Daily Layer                       │
│         (Real-time Audio I/O & Streaming)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│              Temporal Workflow Engine                       │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Composition  │→ │ Arrangement  │→ │   Mixing     │    │
│  │  Workflow    │  │   Workflow   │  │  Workflow    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  Agent Decision Engine (Python Activities)                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│               Modal GPU Functions                           │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  MusicGen    │  │   Demucs     │  │ Neural Disc. │    │
│  │  (A100 40GB) │  │  (T4 16GB)   │  │  (A10G 24GB) │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │  Stem Sep.   │  │  Mastering   │                       │
│  │  (V100 32GB) │  │  (A100 40GB) │                       │
│  └──────────────┘  └──────────────┘                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│              Storage & State                                │
│  • Temporal: Workflow state, activity history               │
│  • S3/R2: Audio files, stems, project assets                │
│  • PostgreSQL: User sessions, project metadata              │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## Component Breakdown

### 1. Temporal Workflows (Orchestration)

**CompositionWorkflow:**
\`\`\`python
@workflow.defn
class CompositionWorkflow:
    """
    Orchestrates the composition phase:
    - User intent analysis
    - Style selection
    - MusicGen inference
    - Quality evaluation
    """
    
    @workflow.run
    async def run(self, user_prompt: str, style: str) -> CompositionResult:
        # Step 1: Analyze user intent
        intent = await workflow.execute_activity(
            analyze_user_intent,
            user_prompt,
            start_to_close_timeout=timedelta(seconds=30),
        )
        
        # Step 2: Generate music with MusicGen (Modal)
        audio = await workflow.execute_activity(
            generate_music_modal,
            GenerateRequest(
                prompt=intent.enhanced_prompt,
                duration=intent.duration,
                style=style,
            ),
            start_to_close_timeout=timedelta(minutes=5),
            retry_policy=RetryPolicy(
                maximum_attempts=3,
                backoff_coefficient=2.0,
            ),
        )
        
        # Step 3: Quality evaluation
        quality = await workflow.execute_activity(
            evaluate_quality,
            audio,
            start_to_close_timeout=timedelta(seconds=60),
        )
        
        # Step 4: Decide if regeneration needed
        if quality.score < 0.7:
            # Agent decides to regenerate with adjusted parameters
            workflow.logger.info("Quality below threshold, regenerating...")
            return await self.run(
                intent.enhanced_prompt,
                style=intent.alternative_style
            )
        
        return CompositionResult(
            audio=audio,
            metadata=intent,
            quality_score=quality.score,
        )
\`\`\`

**ArrangementWorkflow:**
\`\`\`python
@workflow.defn
class ArrangementWorkflow:
    """
    Orchestrates arrangement phase:
    - Stem separation (Demucs)
    - Track organization
    - Dynamic mixing decisions
    """
    
    @workflow.run
    async def run(self, composition: CompositionResult) -> ArrangementResult:
        # Parallel stem separation
        stems = await asyncio.gather(*[
            workflow.execute_activity(
                separate_stems_modal,
                StemRequest(audio=composition.audio, model="htdemucs"),
                start_to_close_timeout=timedelta(minutes=3),
            )
        ])
        
        # Agent arranges stems based on musical theory
        arrangement = await workflow.execute_activity(
            arrange_stems,
            stems,
            start_to_close_timeout=timedelta(minutes=2),
        )
        
        return ArrangementResult(stems=stems, arrangement=arrangement)
\`\`\`

### 2. Modal GPU Functions

**MusicGen Inference:**
\`\`\`python
import modal

stub = modal.Stub("aura-x-inference")

musicgen_image = (
    modal.Image.debian_slim()
    .pip_install("audiocraft", "torch", "torchaudio")
)

@stub.function(
    gpu="A100",
    timeout=600,
    image=musicgen_image,
    secrets=[modal.Secret.from_name("huggingface-token")],
)
def generate_music(prompt: str, duration: float, style: str) -> bytes:
    """
    Generate music using MusicGen on Modal A100 GPU
    """
    from audiocraft.models import MusicGen
    import torch
    
    # Load model (cached across invocations)
    model = MusicGen.get_pretrained('facebook/musicgen-large')
    model.set_generation_params(duration=duration)
    
    # Generate
    wav = model.generate([prompt])
    
    # Convert to bytes for return
    import io
    buffer = io.BytesIO()
    torchaudio.save(buffer, wav[0].cpu(), model.sample_rate, format="wav")
    return buffer.getvalue()
\`\`\`

**Demucs Stem Separation:**
\`\`\`python
@stub.function(
    gpu="T4",
    timeout=300,
    image=modal.Image.debian_slim().pip_install("demucs", "torch"),
)
def separate_stems(audio_bytes: bytes) -> dict[str, bytes]:
    """
    Separate audio into stems using Demucs
    """
    from demucs import pretrained
    import torchaudio
    import io
    
    # Load model
    model = pretrained.get_model('htdemucs')
    
    # Process audio
    wav, sr = torchaudio.load(io.BytesIO(audio_bytes))
    stems = model(wav.unsqueeze(0))[0]
    
    # Return stems as dict
    return {
        "vocals": stem_to_bytes(stems[0]),
        "drums": stem_to_bytes(stems[1]),
        "bass": stem_to_bytes(stems[2]),
        "other": stem_to_bytes(stems[3]),
    }
\`\`\`

### 3. Temporal Activities (Bridge Layer)

\`\`\`python
from temporalio import activity
import modal

# Initialize Modal client
modal_app = modal.Stub.lookup("aura-x-inference")

@activity.defn
async def generate_music_modal(request: GenerateRequest) -> bytes:
    """
    Temporal Activity that calls Modal GPU function
    """
    activity.logger.info(f"Generating music: {request.prompt}")
    
    # Call Modal function
    audio_bytes = modal_app.generate_music.remote(
        prompt=request.prompt,
        duration=request.duration,
        style=request.style,
    )
    
    activity.logger.info("Music generation complete")
    return audio_bytes

@activity.defn
async def separate_stems_modal(request: StemRequest) -> dict[str, bytes]:
    """
    Temporal Activity for stem separation via Modal
    """
    return modal_app.separate_stems.remote(request.audio)
\`\`\`

### 4. Agent Decision Engine

\`\`\`python
@activity.defn
async def analyze_user_intent(prompt: str) -> Intent:
    """
    Level 5 Agent: Autonomous intent understanding
    """
    # Use LLM to extract musical intent
    import anthropic
    
    client = anthropic.Anthropic()
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        messages=[{
            "role": "user",
            "content": f"""Analyze this music generation request: "{prompt}"
            
            Extract:
            - Genre/style
            - Mood/emotion
            - Duration preference
            - Instrumentation
            - Production style
            
            Return as JSON."""
        }]
    )
    
    return Intent.from_json(response.content[0].text)

@activity.defn
async def evaluate_quality(audio: bytes) -> QualityScore:
    """
    Level 5 Agent: Autonomous quality evaluation
    """
    # Neural discriminator + music theory analysis
    # Decides if output meets production standards
    pass
\`\`\`

### 5. Pipecat Integration (Real-Time Streaming)

\`\`\`python
from pipecat.transports.daily import DailyTransport
from pipecat.audio.filters import AudioFilter

class AuraXPipeline:
    def __init__(self, temporal_client):
        self.temporal = temporal_client
        self.transport = DailyTransport(room_url=DAILY_ROOM_URL)
        
    async def stream_generation(self, user_prompt: str):
        """
        Stream audio generation in real-time to user
        """
        # Start Temporal workflow
        handle = await self.temporal.start_workflow(
            CompositionWorkflow.run,
            user_prompt,
            id=f"composition-{uuid.uuid4()}",
            task_queue="aura-x",
        )
        
        # Stream intermediate results
        async for event in handle.query(get_progress):
            if event.type == "audio_chunk":
                await self.transport.send_audio(event.data)
            elif event.type == "status":
                await self.transport.send_message(event.message)
        
        # Final result
        result = await handle.result()
        await self.transport.send_audio(result.audio)
\`\`\`

## Key Design Decisions

### Why Temporal for Orchestration?

1. **Durable Execution**: If Modal GPU function fails, Temporal automatically retries with exponential backoff
2. **Workflow Versioning**: As agent logic improves, old sessions continue with old code
3. **State Management**: 60-minute sessions persist across worker restarts
4. **Saga Pattern**: Multi-step compensation (e.g., if mastering fails, roll back to mixing stage)

### Why Modal for GPU Compute?

1. **Cost Efficiency**: Pay-per-second billing ($0.0001/sec for T4)
2. **Auto-scaling**: 0 to 100 GPUs in seconds
3. **Model Caching**: Models stay warm across invocations
4. **Research Budget**: No upfront GPU cluster costs

### Integration Patterns

\`\`\`python
# Pattern 1: Temporal orchestrates, Modal executes
workflow (Temporal) → activity (bridge) → GPU function (Modal)

# Pattern 2: Parallel GPU inference
workflow.gather([
    generate_music.remote(),
    separate_stems.remote(),
]) # Modal auto-scales GPUs

# Pattern 3: Agent decision-making
quality = await evaluate_quality(audio)
if quality.score < threshold:
    # Agent decides to regenerate
    return await workflow.continue_as_new(adjusted_params)
\`\`\`

## Cost Estimation (PhD Budget)

**Per Generation (3-minute song):**
- MusicGen (A100, 120s): $0.48
- Demucs (T4, 30s): $0.003
- Mixing/Mastering (A10G, 60s): $0.12
- Temporal Cloud: $0.00025/workflow
- **Total: ~$0.60 per song**

**Monthly (100 generations):**
- GPU compute: $60
- Temporal Cloud: $25 (includes 100k workflow executions)
- **Total: $85/month**

## Next Steps

1. **Set up Temporal Cloud account** (free tier includes 200 workflow hours)
2. **Deploy Modal functions** (`modal deploy inference.py`)
3. **Implement first workflow** (CompositionWorkflow)
4. **Integrate Pipecat** for real-time streaming
5. **Build agent decision logic** (quality evaluation, style adaptation)

## References

- Temporal Docs: https://docs.temporal.io
- Modal Docs: https://modal.com/docs
- Pipecat: https://github.com/pipecat-ai/pipecat
- MusicGen Paper: https://arxiv.org/abs/2306.05284
