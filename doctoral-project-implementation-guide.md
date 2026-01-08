# Doctoral Research Implementation Guide: Step-by-Step Platform Orchestration

## Executive Summary

This guide provides **exact prompts, sequences, and workflows** for implementing your doctoral research on "Computational Efficiency in AI-Driven Music Generation" using a hybrid platform approach. The implementation follows a **5-Phase, 20-Step** methodology spanning 36 months.

---

## Phase 0: Environment Setup (Weeks 1-2)

### Step 0.1: Google Cloud AI Setup

**Action:** Create Google Cloud account and enable Vertex AI

\`\`\`bash
# Terminal Commands (run locally)

# 1. Install Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# 2. Create project
gcloud projects create phd-audio-efficiency-2025 --name="PhD Audio Efficiency"
gcloud config set project phd-audio-efficiency-2025

# 3. Enable required APIs
gcloud services enable compute.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 4. Set up billing (required for TPU access)
gcloud billing accounts list
gcloud billing projects link phd-audio-efficiency-2025 --billing-account=YOUR_BILLING_ACCOUNT_ID

# 5. Request TPU quota increase (submit via Cloud Console)
# Navigate to: IAM & Admin > Quotas > Search "TPU v5e" > Request increase to 8 chips
\`\`\`

**Estimated Time:** 2-3 hours (plus 1-2 days for quota approval)

---

### Step 0.2: GitHub Repository Structure

**Action:** Create research repository with proper structure

\`\`\`bash
# Create repository structure
mkdir phd-audio-efficiency && cd phd-audio-efficiency

# Initialize structure
mkdir -p {src/{models,training,inference,evaluation},configs,scripts,notebooks,data,results,docs}

# Initialize git
git init
git remote add origin https://github.com/YOUR_USERNAME/phd-audio-efficiency.git
\`\`\`

**Repository Structure:**
\`\`\`
phd-audio-efficiency/
├── src/
│   ├── models/           # Model architectures
│   │   ├── svdquant/     # WP1: Quantization
│   │   ├── sige_audio/   # WP2: Sparse Inference
│   │   ├── radial_attn/  # WP3: Efficient Attention
│   │   └── dist_audio/   # WP4: Distributed Inference
│   ├── training/         # Training loops
│   ├── inference/        # Inference pipelines
│   └── evaluation/       # Benchmarking code
├── configs/              # Experiment configurations
├── scripts/              # Shell scripts for cloud jobs
├── notebooks/            # Jupyter notebooks for analysis
├── data/                 # Dataset manifests (not raw data)
├── results/              # Experiment outputs
└── docs/                 # Documentation
\`\`\`

---

### Step 0.3: v0.dev Workspace Setup

**Action:** Initialize v0 workspace for evaluation interfaces

**Prompt to v0:**
\`\`\`
Create a new Next.js project for my PhD research on AI Music Generation Efficiency. 
The project will contain:
1. A MUSHRA listening test interface for human evaluation
2. An efficiency metrics dashboard showing latency, memory, and quality trade-offs
3. A research portfolio page documenting my work packages

Set up the project with:
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Dark mode support
- Responsive design

Start with the folder structure and basic layout only.
\`\`\`

---

### Step 0.4: Manus.im Access Request

**Action:** Join Manus waitlist and prepare automation tasks

**Website:** https://manus.im

**After Access - Initial Configuration Prompt:**
\`\`\`
I am a PhD researcher studying computational efficiency in AI music generation. 
I need you to help me with:

1. Literature Review Automation:
   - Search for papers on: audio quantization, sparse inference, efficient transformers, music generation
   - Create a structured database of papers with: title, authors, year, venue, key contributions, relevance score
   - Update weekly with new arXiv submissions

2. Dataset Curation:
   - Identify open-source music datasets suitable for training diffusion models
   - Assess each dataset for: size, audio quality, licensing, genre diversity
   - Create a comparison matrix

3. Experiment Tracking:
   - Monitor my Weights & Biases dashboard
   - Summarize daily experiment results
   - Flag anomalies or promising configurations

Please start with Task 1: Create a literature database for "neural audio compression and quantization" papers from 2020-2025.
\`\`\`

---

## Phase 1: Baseline Replication (Months 1-4)

### Step 1.1: Replicate Stable Audio Open on Google Cloud

**Google Cloud Console > Vertex AI > Workbench > Create Notebook**

**Notebook Configuration:**
- Machine type: `n1-standard-8` (for initial setup)
- GPU: `NVIDIA T4` (for initial testing, upgrade to A100 later)
- Boot disk: 200GB SSD
- Framework: PyTorch 2.1+

**Jupyter Notebook - Cell 1: Environment Setup**
\`\`\`python
# Cell 1: Install dependencies
!pip install torch torchaudio transformers diffusers accelerate wandb einops

# Verify CUDA
import torch
print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"GPU: {torch.cuda.get_device_name(0)}")
\`\`\`

**Jupyter Notebook - Cell 2: Download Stable Audio Open**
\`\`\`python
# Cell 2: Load Stable Audio Open baseline
from diffusers import StableAudioPipeline
import torch

# Load model
pipe = StableAudioPipeline.from_pretrained(
    "stabilityai/stable-audio-open-1.0",
    torch_dtype=torch.float16
)
pipe = pipe.to("cuda")

# Baseline generation test
prompt = "A jazz piano trio playing a relaxed ballad"
audio = pipe(
    prompt,
    num_inference_steps=100,
    audio_length_in_s=10.0,
).audios[0]

# Save baseline
import scipy.io.wavfile as wav
wav.write("baseline_output.wav", 44100, audio.T)
print("Baseline generation complete!")
\`\`\`

**Jupyter Notebook - Cell 3: Baseline Benchmarking**
\`\`\`python
# Cell 3: Benchmark baseline performance
import time
import torch
from torch.profiler import profile, ProfilerActivity

def benchmark_baseline(pipe, prompt, num_runs=10):
    """Benchmark baseline model performance."""
    
    # Warmup
    _ = pipe(prompt, num_inference_steps=50, audio_length_in_s=5.0)
    
    # Memory baseline
    torch.cuda.reset_peak_memory_stats()
    
    latencies = []
    for i in range(num_runs):
        start = time.perf_counter()
        _ = pipe(prompt, num_inference_steps=100, audio_length_in_s=10.0)
        latencies.append(time.perf_counter() - start)
    
    peak_memory = torch.cuda.max_memory_allocated() / 1e9  # GB
    
    results = {
        "mean_latency_s": sum(latencies) / len(latencies),
        "std_latency_s": (sum((x - sum(latencies)/len(latencies))**2 for x in latencies) / len(latencies))**0.5,
        "peak_memory_gb": peak_memory,
        "throughput_samples_per_min": 60 / (sum(latencies) / len(latencies))
    }
    
    return results

# Run benchmark
baseline_metrics = benchmark_baseline(pipe, "A jazz piano trio playing a relaxed ballad")
print(f"Baseline Metrics:")
print(f"  Mean Latency: {baseline_metrics['mean_latency_s']:.2f}s")
print(f"  Peak Memory: {baseline_metrics['peak_memory_gb']:.2f}GB")
print(f"  Throughput: {baseline_metrics['throughput_samples_per_min']:.1f} samples/min")
\`\`\`

---

### Step 1.2: Set Up Weights & Biases Experiment Tracking

**Terminal:**
\`\`\`bash
pip install wandb
wandb login
\`\`\`

**Python - Tracking Configuration:**
\`\`\`python
# experiment_config.py
import wandb

def init_experiment(experiment_name, config):
    """Initialize W&B experiment tracking."""
    
    run = wandb.init(
        project="phd-audio-efficiency",
        name=experiment_name,
        config=config,
        tags=["baseline", "stable-audio-open"]
    )
    
    return run

# Example usage
config = {
    "model": "stable-audio-open-1.0",
    "quantization": "none",
    "precision": "fp16",
    "num_inference_steps": 100,
    "audio_length_s": 10.0,
    "batch_size": 1,
    "gpu": "NVIDIA-A100-40GB"
}

run = init_experiment("baseline-v1", config)
wandb.log(baseline_metrics)
wandb.finish()
\`\`\`

---

## Phase 2: WP1 - SVDQuant-Audio Implementation (Months 5-12)

### Step 2.1: Implement Phase-Coherent Quantization

**Prompt to Manus (Literature Research):**
\`\`\`
Find all papers on:
1. "SVD-based neural network quantization"
2. "Phase-aware audio processing"
3. "Low-rank decomposition for model compression"

For each paper, extract:
- The quantization algorithm pseudocode
- Reported compression ratios
- Quality metrics used
- Any audio-specific considerations

Compile into a comparative analysis table.
\`\`\`

**Google Cloud - Quantization Implementation:**

**File: `src/models/svdquant/phase_coherent_quant.py`**
\`\`\`python
"""
SVDQuant-Audio: Phase-Coherent Quantization for Audio Diffusion Models
Work Package 1 Implementation
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Tuple, Optional
import torchaudio.transforms as T

class PhaseCoherentQuantizer(nn.Module):
    """
    Quantization scheme that preserves phase coherence in audio.
    
    Key Innovation: Minimize Complex STFT Error rather than simple MSE
    to preserve stereo imaging and phase relationships.
    """
    
    def __init__(
        self,
        num_bits: int = 4,
        n_fft: int = 2048,
        hop_length: int = 512,
        symmetric: bool = True
    ):
        super().__init__()
        self.num_bits = num_bits
        self.n_fft = n_fft
        self.hop_length = hop_length
        self.symmetric = symmetric
        
        # Quantization levels
        self.num_levels = 2 ** num_bits
        
        # STFT transform for phase-aware calibration
        self.stft = T.Spectrogram(
            n_fft=n_fft,
            hop_length=hop_length,
            power=None  # Complex STFT
        )
        
    def compute_scale_and_zero_point(
        self, 
        weight: torch.Tensor,
        calibration_data: Optional[torch.Tensor] = None
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Compute quantization parameters using phase-aware calibration.
        """
        if self.symmetric:
            # Symmetric quantization
            max_val = weight.abs().max()
            scale = max_val / (self.num_levels // 2 - 1)
            zero_point = torch.zeros_like(scale)
        else:
            # Asymmetric quantization
            min_val, max_val = weight.min(), weight.max()
            scale = (max_val - min_val) / (self.num_levels - 1)
            zero_point = torch.round(-min_val / scale)
            
        return scale, zero_point
    
    def quantize(
        self, 
        weight: torch.Tensor,
        scale: torch.Tensor,
        zero_point: torch.Tensor
    ) -> torch.Tensor:
        """Quantize weights to n-bit integers."""
        q_weight = torch.clamp(
            torch.round(weight / scale) + zero_point,
            0, self.num_levels - 1
        )
        return q_weight.to(torch.int8)
    
    def dequantize(
        self,
        q_weight: torch.Tensor,
        scale: torch.Tensor,
        zero_point: torch.Tensor
    ) -> torch.Tensor:
        """Dequantize back to floating point."""
        return (q_weight.float() - zero_point) * scale
    
    def phase_coherence_loss(
        self,
        original_audio: torch.Tensor,
        reconstructed_audio: torch.Tensor
    ) -> torch.Tensor:
        """
        Compute phase-coherent loss using Complex STFT Error.
        
        This is the KEY INNOVATION of SVDQuant-Audio:
        Instead of MSE in time domain, we compute error in STFT domain
        to preserve phase relationships critical for audio quality.
        """
        # Compute complex STFTs
        orig_stft = self.stft(original_audio)
        recon_stft = self.stft(reconstructed_audio)
        
        # Magnitude loss
        mag_loss = F.mse_loss(orig_stft.abs(), recon_stft.abs())
        
        # Phase loss (wrapped difference)
        phase_diff = torch.angle(orig_stft) - torch.angle(recon_stft)
        phase_loss = (1 - torch.cos(phase_diff)).mean()
        
        # Combined loss with phase emphasis
        total_loss = mag_loss + 0.5 * phase_loss
        
        return total_loss


class SVDQuantLinear(nn.Module):
    """
    SVD-based quantized linear layer with low-rank branch recovery.
    
    Architecture:
    - Main branch: 4-bit quantized weights
    - Recovery branch: Full-precision LoRA for phase repair
    """
    
    def __init__(
        self,
        in_features: int,
        out_features: int,
        num_bits: int = 4,
        lora_rank: int = 16,
        bias: bool = True
    ):
        super().__init__()
        
        self.in_features = in_features
        self.out_features = out_features
        self.num_bits = num_bits
        self.lora_rank = lora_rank
        
        # Quantized main branch
        self.quantizer = PhaseCoherentQuantizer(num_bits=num_bits)
        self.register_buffer('q_weight', torch.zeros(out_features, in_features, dtype=torch.int8))
        self.register_buffer('scale', torch.ones(1))
        self.register_buffer('zero_point', torch.zeros(1))
        
        # LoRA recovery branch (full precision)
        self.lora_A = nn.Parameter(torch.zeros(lora_rank, in_features))
        self.lora_B = nn.Parameter(torch.zeros(out_features, lora_rank))
        
        # Bias
        if bias:
            self.bias = nn.Parameter(torch.zeros(out_features))
        else:
            self.register_parameter('bias', None)
            
        self._init_lora()
        
    def _init_lora(self):
        """Initialize LoRA weights."""
        nn.init.kaiming_uniform_(self.lora_A)
        nn.init.zeros_(self.lora_B)
        
    @classmethod
    def from_float(cls, linear: nn.Linear, num_bits: int = 4, lora_rank: int = 16):
        """Convert a floating-point linear layer to SVDQuant."""
        quant_linear = cls(
            linear.in_features,
            linear.out_features,
            num_bits=num_bits,
            lora_rank=lora_rank,
            bias=linear.bias is not None
        )
        
        # Quantize weights
        scale, zp = quant_linear.quantizer.compute_scale_and_zero_point(linear.weight)
        quant_linear.scale = scale
        quant_linear.zero_point = zp
        quant_linear.q_weight = quant_linear.quantizer.quantize(linear.weight, scale, zp)
        
        # Copy bias
        if linear.bias is not None:
            quant_linear.bias.data = linear.bias.data.clone()
            
        return quant_linear
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass with quantized weights + LoRA recovery."""
        
        # Dequantize main branch
        weight = self.quantizer.dequantize(self.q_weight, self.scale, self.zero_point)
        
        # Main branch computation
        out = F.linear(x, weight, self.bias)
        
        # LoRA recovery branch
        lora_out = F.linear(F.linear(x, self.lora_A), self.lora_B)
        
        return out + lora_out


def quantize_stable_audio(model, num_bits=4, lora_rank=16):
    """
    Quantize all linear layers in Stable Audio model.
    
    Args:
        model: Stable Audio pipeline model
        num_bits: Quantization bit-width
        lora_rank: Rank for LoRA recovery branches
        
    Returns:
        Quantized model
    """
    for name, module in model.named_modules():
        if isinstance(module, nn.Linear):
            # Get parent module
            parent_name = '.'.join(name.split('.')[:-1])
            child_name = name.split('.')[-1]
            parent = model.get_submodule(parent_name) if parent_name else model
            
            # Replace with quantized version
            quant_module = SVDQuantLinear.from_float(module, num_bits, lora_rank)
            setattr(parent, child_name, quant_module)
            
            print(f"Quantized: {name}")
    
    return model
\`\`\`

---

### Step 2.2: Training Script for Quantization-Aware Fine-Tuning

**File: `scripts/train_svdquant.py`**
\`\`\`python
"""
Training script for SVDQuant-Audio fine-tuning.
Run on Google Cloud with TPU or A100 GPU.
"""

import argparse
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
import wandb
from tqdm import tqdm

# Import custom modules
from src.models.svdquant.phase_coherent_quant import (
    quantize_stable_audio,
    PhaseCoherentQuantizer
)
from src.data.audio_dataset import AudioDataset
from src.evaluation.metrics import compute_fad, compute_lsd

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model_path", type=str, default="stabilityai/stable-audio-open-1.0")
    parser.add_argument("--data_path", type=str, required=True)
    parser.add_argument("--output_dir", type=str, default="./checkpoints")
    parser.add_argument("--num_bits", type=int, default=4)
    parser.add_argument("--lora_rank", type=int, default=16)
    parser.add_argument("--batch_size", type=int, default=4)
    parser.add_argument("--learning_rate", type=float, default=1e-4)
    parser.add_argument("--num_epochs", type=int, default=10)
    parser.add_argument("--wandb_project", type=str, default="phd-audio-efficiency")
    return parser.parse_args()

def train_epoch(model, dataloader, optimizer, quantizer, device):
    """Train for one epoch with phase-coherent loss."""
    model.train()
    total_loss = 0
    
    for batch in tqdm(dataloader, desc="Training"):
        audio = batch["audio"].to(device)
        prompts = batch["prompt"]
        
        optimizer.zero_grad()
        
        # Forward pass
        with torch.cuda.amp.autocast():
            generated = model(prompts, num_inference_steps=50).audios
            
            # Phase-coherent loss
            loss = quantizer.phase_coherence_loss(audio, generated)
        
        # Backward pass
        loss.backward()
        optimizer.step()
        
        total_loss += loss.item()
        
        # Log to W&B
        wandb.log({"train_loss": loss.item()})
    
    return total_loss / len(dataloader)

def evaluate(model, dataloader, device):
    """Evaluate model on validation set."""
    model.eval()
    
    all_generated = []
    all_reference = []
    
    with torch.no_grad():
        for batch in tqdm(dataloader, desc="Evaluating"):
            audio = batch["audio"].to(device)
            prompts = batch["prompt"]
            
            generated = model(prompts, num_inference_steps=100).audios
            
            all_generated.append(generated)
            all_reference.append(audio)
    
    # Compute metrics
    generated = torch.cat(all_generated)
    reference = torch.cat(all_reference)
    
    fad = compute_fad(generated, reference)
    lsd = compute_lsd(generated, reference)
    
    return {"fad": fad, "lsd": lsd}

def main():
    args = parse_args()
    
    # Initialize W&B
    wandb.init(
        project=args.wandb_project,
        name=f"svdquant-{args.num_bits}bit-lora{args.lora_rank}",
        config=vars(args)
    )
    
    # Device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # Load and quantize model
    print("Loading model...")
    from diffusers import StableAudioPipeline
    pipe = StableAudioPipeline.from_pretrained(args.model_path, torch_dtype=torch.float16)
    
    print(f"Quantizing to {args.num_bits}-bit...")
    pipe.unet = quantize_stable_audio(pipe.unet, args.num_bits, args.lora_rank)
    pipe = pipe.to(device)
    
    # Quantizer for loss computation
    quantizer = PhaseCoherentQuantizer(num_bits=args.num_bits).to(device)
    
    # Data
    train_dataset = AudioDataset(args.data_path, split="train")
    val_dataset = AudioDataset(args.data_path, split="val")
    
    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size)
    
    # Optimizer (only LoRA parameters)
    lora_params = [p for n, p in pipe.unet.named_parameters() if "lora" in n]
    optimizer = torch.optim.AdamW(lora_params, lr=args.learning_rate)
    
    # Training loop
    best_fad = float("inf")
    
    for epoch in range(args.num_epochs):
        print(f"\nEpoch {epoch + 1}/{args.num_epochs}")
        
        train_loss = train_epoch(pipe, train_loader, optimizer, quantizer, device)
        val_metrics = evaluate(pipe, val_loader, device)
        
        print(f"Train Loss: {train_loss:.4f}")
        print(f"Val FAD: {val_metrics['fad']:.4f}, Val LSD: {val_metrics['lsd']:.4f}")
        
        wandb.log({
            "epoch": epoch + 1,
            "train_loss": train_loss,
            "val_fad": val_metrics["fad"],
            "val_lsd": val_metrics["lsd"]
        })
        
        # Save best model
        if val_metrics["fad"] < best_fad:
            best_fad = val_metrics["fad"]
            torch.save(pipe.unet.state_dict(), f"{args.output_dir}/best_svdquant.pt")
            print(f"Saved best model with FAD: {best_fad:.4f}")
    
    wandb.finish()

if __name__ == "__main__":
    main()
\`\`\`

**Google Cloud - Launch Training Job:**
\`\`\`bash
# Submit training job to Vertex AI
gcloud ai custom-jobs create \
  --region=us-central1 \
  --display-name="svdquant-training-v1" \
  --worker-pool-spec="machine-type=a2-highgpu-1g,replica-count=1,container-image-uri=us-docker.pkg.dev/vertex-ai/training/pytorch-gpu.1-13:latest" \
  --args="--model_path=stabilityai/stable-audio-open-1.0,--data_path=gs://phd-audio-data/musiccaps,--num_bits=4,--lora_rank=16,--num_epochs=20"
\`\`\`

---

## Phase 3: Evaluation Interface Development (Months 8-10)

### Step 3.1: MUSHRA Listening Test Interface (v0)

**Prompt to v0:**
\`\`\`
Build a MUSHRA (Multiple Stimuli with Hidden Reference and Anchor) listening test interface for evaluating AI-generated music quality.

Requirements:
1. Audio Player Section:
   - Display 5-7 audio samples per trial (hidden reference, anchor, and test conditions)
   - Randomize order of samples
   - Allow looping and A/B comparison
   - Show waveform visualization for each sample

2. Rating Interface:
   - Vertical slider (0-100) for each sample
   - Labels: "Bad (0-20)", "Poor (20-40)", "Fair (40-60)", "Good (60-80)", "Excellent (80-100)"
   - Anchor at 0 (low-pass filtered reference)
   - Hidden reference should be one of the samples

3. Trial Management:
   - Progress indicator (e.g., "Trial 5 of 20")
   - "Next Trial" button (disabled until all samples rated)
   - Timer showing time spent on current trial
   - Auto-save progress to prevent data loss

4. Data Collection:
   - Participant ID input at start
   - Consent form checkbox
   - Store ratings with timestamps
   - Export results as CSV/JSON

5. Design:
   - Dark mode for listening fatigue reduction
   - Professional, academic aesthetic
   - Responsive for tablet use in listening rooms

Use React with TypeScript, Tailwind CSS, and the Web Audio API for playback.
\`\`\`

**Follow-up Prompt to v0 (after initial generation):**
\`\`\`
Now add the following features to the MUSHRA interface:

1. Backend API route to:
   - Store results in a database (use Supabase)
   - Generate unique participant IDs
   - Retrieve trial configurations from a config file

2. Admin Dashboard:
   - View all completed sessions
   - Download aggregated results
   - Visualize rating distributions per condition
   - Statistical analysis (mean, std, confidence intervals)

3. Audio Upload:
   - Admin can upload new audio files for trials
   - Support for WAV and MP3
   - Auto-generate waveform thumbnails

Connect to Supabase for data storage.
\`\`\`

---

### Step 3.2: Efficiency Metrics Dashboard (Lovable.dev)

**Prompt to Lovable.dev:**
\`\`\`
Create a real-time efficiency metrics dashboard for my PhD research on AI music generation.

The dashboard should display:

1. Header Section:
   - Project title: "Audio Generation Efficiency Research"
   - Model selector dropdown (Baseline, SVDQuant-4bit, SVDQuant-8bit, SIGE-Audio)
   - Date range filter

2. Key Metrics Cards (top row):
   - Latency (seconds per 10s audio)
   - Memory Usage (GB)
   - Quality Score (FAD)
   - Efficiency Ratio (Quality / Compute Cost)

3. Charts Section:
   - Line chart: Latency vs. Audio Length
   - Bar chart: Memory comparison across models
   - Scatter plot: Quality vs. Latency trade-off (Pareto frontier)
   - Heatmap: Bit-width vs. Quality degradation

4. Experiment Log Table:
   - Columns: Experiment ID, Model, Config, Latency, Memory, FAD, Date
   - Sortable and filterable
   - Click to view detailed results

5. Real-time Updates:
   - WebSocket connection to receive live experiment results
   - Toast notifications for completed experiments

Use a dark professional theme with blue accents. Connect to a REST API for data (I'll provide the endpoint later).
\`\`\`

---

## Phase 4: WP2-WP4 Implementation (Months 13-30)

### Step 4.1: SIGE-Audio (Sparse Inference) - Manus Research Prompt

**Prompt to Manus:**
\`\`\`
Conduct a comprehensive analysis of sparse inference techniques for generative models:

1. Literature Search:
   - Find all papers on "Spatially Sparse Inference for Generative Models"
   - Focus on SIGE (Spatially Sparse Inference for Efficient GANs) and derivatives
   - Include any audio-specific sparse inference work

2. Implementation Analysis:
   - For each technique, extract the core algorithm
   - Identify which components can be adapted for audio (1D vs 2D)
   - Note computational complexity and memory requirements

3. Gap Analysis:
   - What modifications are needed for audio diffusion models?
   - What are the unique challenges for temporal (vs spatial) sparsity?
   - How does tiled caching work for 1D convolutional networks?

4. Deliverable:
   - Create a technical report (5-10 pages) with pseudocode
   - Include architecture diagrams
   - Propose a specific adaptation strategy for Stable Audio Open

Save the report and share when complete.
\`\`\`

---

### Step 4.2: Radial Attention Implementation

**File: `src/models/radial_attn/radial_attention.py`**
\`\`\`python
"""
Radial Attention-Audio: Efficient Long-Context Attention for Music Generation
Work Package 3 Implementation

Key Innovation: Attend to local neighborhood + rhythmic strides for O(n) complexity
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import math
from typing import Optional, Tuple
from einops import rearrange

class RadialAttention(nn.Module):
    """
    Radial Attention for audio sequences.
    
    Attention pattern:
    1. Local window: ±w frames (captures local dependencies)
    2. Rhythmic strides: Every k frames back in time (captures bar/phrase repetition)
    
    Complexity: O(n * (2w + n/k)) ≈ O(n) for fixed w and k
    """
    
    def __init__(
        self,
        dim: int,
        num_heads: int = 8,
        head_dim: int = 64,
        local_window: int = 256,  # ±256 frames (~6 seconds at 44.1kHz/256)
        stride_interval: int = 512,  # Every 512 frames (~12 seconds = ~4 bars at 120 BPM)
        max_stride_hops: int = 16,  # Look back up to 16 bars
        dropout: float = 0.0
    ):
        super().__init__()
        
        self.dim = dim
        self.num_heads = num_heads
        self.head_dim = head_dim
        self.local_window = local_window
        self.stride_interval = stride_interval
        self.max_stride_hops = max_stride_hops
        self.scale = head_dim ** -0.5
        
        # Projections
        self.qkv = nn.Linear(dim, 3 * num_heads * head_dim, bias=False)
        self.out_proj = nn.Linear(num_heads * head_dim, dim)
        self.dropout = nn.Dropout(dropout)
        
        # Learnable relative position bias for local window
        self.rel_pos_bias = nn.Parameter(
            torch.zeros(num_heads, 2 * local_window + 1)
        )
        
    def _compute_local_attention(
        self,
        q: torch.Tensor,
        k: torch.Tensor,
        v: torch.Tensor,
        mask: Optional[torch.Tensor] = None
    ) -> torch.Tensor:
        """Compute attention within local windows."""
        B, H, N, D = q.shape
        w = self.local_window
        
        # Pad sequence for windowing
        k_padded = F.pad(k, (0, 0, w, w), value=0)
        v_padded = F.pad(v, (0, 0, w, w), value=0)
        
        # Extract local windows
        # Shape: (B, H, N, 2w+1, D)
        k_windows = k_padded.unfold(2, 2*w+1, 1)
        v_windows = v_padded.unfold(2, 2*w+1, 1)
        
        # Compute attention scores
        # q: (B, H, N, D) -> (B, H, N, 1, D)
        # k_windows: (B, H, N, 2w+1, D)
        attn = torch.einsum('bhnd,bhnwd->bhnw', q, k_windows) * self.scale
        
        # Add relative position bias
        attn = attn + self.rel_pos_bias.unsqueeze(0).unsqueeze(2)
        
        # Softmax
        attn = F.softmax(attn, dim=-1)
        attn = self.dropout(attn)
        
        # Compute output
        out = torch.einsum('bhnw,bhnwd->bhnd', attn, v_windows)
        
        return out
    
    def _compute_stride_attention(
        self,
        q: torch.Tensor,
        k: torch.Tensor,
        v: torch.Tensor
    ) -> torch.Tensor:
        """Compute attention to rhythmic stride positions."""
        B, H, N, D = q.shape
        s = self.stride_interval
        max_hops = self.max_stride_hops
        
        # Compute stride positions for each query
        # For position i, attend to positions: i-s, i-2s, i-3s, ..., i-max_hops*s
        stride_indices = torch.arange(N, device=q.device).unsqueeze(1)  # (N, 1)
        hop_offsets = torch.arange(1, max_hops + 1, device=q.device) * s  # (max_hops,)
        stride_positions = stride_indices - hop_offsets  # (N, max_hops)
        
        # Clamp to valid range
        stride_positions = stride_positions.clamp(min=0)
        
        # Gather keys and values at stride positions
        # k, v: (B, H, N, D)
        stride_positions_expanded = stride_positions.unsqueeze(0).unsqueeze(0).unsqueeze(-1)
        stride_positions_expanded = stride_positions_expanded.expand(B, H, -1, -1, D)
        
        k_strides = torch.gather(
            k.unsqueeze(3).expand(-1, -1, -1, max_hops, -1),
            2,
            stride_positions_expanded
        )  # (B, H, N, max_hops, D)
        
        v_strides = torch.gather(
            v.unsqueeze(3).expand(-1, -1, -1, max_hops, -1),
            2,
            stride_positions_expanded
        )  # (B, H, N, max_hops, D)
        
        # Compute attention
        attn = torch.einsum('bhnd,bhnmd->bhnm', q, k_strides) * self.scale
        attn = F.softmax(attn, dim=-1)
        attn = self.dropout(attn)
        
        out = torch.einsum('bhnm,bhnmd->bhnd', attn, v_strides)
        
        return out
    
    def forward(
        self,
        x: torch.Tensor,
        mask: Optional[torch.Tensor] = None
    ) -> torch.Tensor:
        """
        Forward pass with combined local + stride attention.
        
        Args:
            x: Input tensor of shape (B, N, D)
            mask: Optional attention mask
            
        Returns:
            Output tensor of shape (B, N, D)
        """
        B, N, _ = x.shape
        
        # Compute Q, K, V
        qkv = self.qkv(x)
        qkv = rearrange(qkv, 'b n (three h d) -> three b h n d', 
                       three=3, h=self.num_heads, d=self.head_dim)
        q, k, v = qkv[0], qkv[1], qkv[2]
        
        # Local attention
        local_out = self._compute_local_attention(q, k, v, mask)
        
        # Stride attention (only if sequence is long enough)
        if N > self.stride_interval:
            stride_out = self._compute_stride_attention(q, k, v)
            # Combine with learnable weighting
            out = 0.7 * local_out + 0.3 * stride_out
        else:
            out = local_out
        
        # Reshape and project
        out = rearrange(out, 'b h n d -> b n (h d)')
        out = self.out_proj(out)
        
        return out


def replace_attention_with_radial(model, **radial_kwargs):
    """Replace all attention layers in a model with RadialAttention."""
    for name, module in model.named_modules():
        if "attention" in name.lower() and isinstance(module, nn.MultiheadAttention):
            parent_name = '.'.join(name.split('.')[:-1])
            child_name = name.split('.')[-1]
            parent = model.get_submodule(parent_name) if parent_name else model
            
            radial_attn = RadialAttention(
                dim=module.embed_dim,
                num_heads=module.num_heads,
                **radial_kwargs
            )
            setattr(parent, child_name, radial_attn)
            print(f"Replaced: {name}")
    
    return model
\`\`\`

---

## Phase 5: Thesis Writing & Defense Prep (Months 31-36)

### Step 5.1: Research Portfolio Website (v0)

**Prompt to v0:**
\`\`\`
Build a professional academic portfolio website for my PhD research on "Computational Efficiency in AI-Driven Music Generation."

Pages needed:

1. Home Page:
   - Hero section with research title and abstract
   - Key contributions summary (4 cards)
   - Interactive demo embed (audio generation)
   - Recent publications list

2. Research Page:
   - Detailed description of each Work Package (WP1-WP5)
   - Architecture diagrams (I'll provide images)
   - Results tables with sortable columns
   - Interactive charts showing efficiency improvements

3. Publications Page:
   - List of papers with BibTeX export
   - Links to PDF, code, and datasets
   - Citation counts

4. Demos Page:
   - Embedded audio player for generated samples
   - Side-by-side comparison (Baseline vs Optimized)
   - Real-time generation demo (API connected)

5. About Page:
   - Bio and photo
   - Education timeline
   - Contact form

Design: Academic but modern. Use a serif font for headings (like Playfair Display) and sans-serif for body (Inter). Color scheme: Deep navy blue primary, gold accents.

Include SEO optimization and Open Graph tags for academic sharing.
\`\`\`

---

### Step 5.2: Thesis Document Automation (Manus)

**Prompt to Manus:**
\`\`\`
Help me organize and draft my PhD thesis on "Computational Efficiency in AI-Driven Music Generation."

Thesis Structure:
1. Introduction (10 pages)
2. Literature Review (30 pages)
3. Methodology (40 pages)
   - WP1: SVDQuant-Audio
   - WP2: SIGE-Audio
   - WP3: Radial Attention
   - WP4: Distributed Inference
4. Experiments & Results (40 pages)
5. Discussion (15 pages)
6. Conclusion (5 pages)
7. Appendices

Tasks:
1. Create a detailed outline for each chapter
2. Draft the Literature Review by synthesizing the papers in my database
3. Generate LaTeX templates for each chapter
4. Create a BibTeX file from my paper database
5. Generate figure captions from my experiment results

Start with the Literature Review outline. Group papers by theme:
- Audio Generation Models (Diffusion, GAN, Autoregressive)
- Model Compression (Quantization, Pruning, Distillation)
- Efficient Architectures (Sparse Attention, Linear Attention)
- Distributed Systems (Model Parallelism, Pipeline Parallelism)

Provide the outline with 3-5 key papers for each subsection.
\`\`\`

---

## Complete Implementation Timeline

| Phase | Months | Platform | Key Deliverable |
|-------|--------|----------|-----------------|
| **0: Setup** | 1-2 | All | Environments configured, repo structure |
| **1: Baseline** | 1-4 | Google Cloud | Stable Audio replicated, benchmarks established |
| **2: WP1** | 5-12 | Google Cloud | SVDQuant-Audio implementation, 4-bit model |
| **3: Evaluation** | 8-10 | v0 + Lovable | MUSHRA interface, metrics dashboard |
| **4: WP2-WP4** | 13-30 | Google Cloud + Manus | SIGE-Audio, Radial Attention, Distributed |
| **5: Thesis** | 31-36 | v0 + Manus | Portfolio, thesis document |

---

## Cost Projection (36 Months)

| Platform | Monthly | 36-Month Total |
|----------|---------|----------------|
| Google Cloud (TPU/GPU) | $800 avg | $28,800 |
| v0 Pro | $20 | $720 |
| Lovable | $50 | $1,800 |
| Manus (est.) | $30 | $1,080 |
| W&B Team | $50 | $1,800 |
| **TOTAL** | **$950** | **$34,200** |

*Note: Google Cloud costs vary significantly by experiment intensity. Budget $500/mo for light months, $2000/mo for heavy training periods.*

---

## Summary

This guide provides a complete roadmap for implementing your doctoral research using a hybrid platform approach:

1. **Google Cloud AI** handles all core ML research (quantization, sparse inference, attention mechanisms)
2. **v0** builds human evaluation interfaces and the research portfolio
3. **Lovable** creates the efficiency metrics dashboard
4. **Manus** automates literature reviews and thesis drafting
5. **Leap** (optional) deploys production APIs post-thesis

The key insight is that **no single platform can do everything**, but orchestrating them together creates a powerful research infrastructure that saves time on non-core activities while maintaining full control over the scientific contributions.
