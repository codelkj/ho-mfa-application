Statement of Purpose
Massachusetts Institute of Technology
Department: Electrical Engineering and Computer Science (EECS)
Program Track: Music Technology and Computation Graduate Program (MTCGP)
Applicant: Johnson Mabgwe

**Research Motivation: Breaking the VRAM Wall**

The trajectory of generative AI in music faces a critical hardware paradox: while models like Suno and Lyria achieve professional fidelity, they have hit a "VRAM Wall." As state-of-the-art diffusion models scale to billions of parameters, high-fidelity music generation is becoming the exclusive domain of organizations with massive GPU clusters, effectively locking out independent researchers and artists. My research ambition is to dismantle this barrier. I aim to pioneer "Green AI" architectures for audio—specifically through Phase-Aware Quantization and Agentic Task Decomposition—to enable real-time, high-fidelity interaction on consumer hardware. I seek to join the MIT EECS PhD program to develop these democratized systems, specifically indicating my intent to conduct research with Music-affiliated faculty members, Professors Mark Rau, Anna Huang, and Paris Smaragdis.

**Research Vision: Algorithm-System Co-Design**

My proposed research challenges the prevailing trend of simply scaling parameters. Instead, I propose a systems-aware approach that integrates Digital Signal Processing (DSP) constraints directly into the deep learning stack.

First, I aim to address the limitations of model compression in the audio domain. Unlike computer vision, where pixel-wise quantization noise is often imperceptible, audio suffers from phase incoherence and transient smearing at lower precisions. Standard INT8 quantization destroys the "air" and rhythmic drive of a track. My primary objective is to develop "SVDQuant-Audio," a spectral quantization method that utilizes Hessian-based sensitivity analysis to isolate and protect outlier features responsible for high-frequency transients, while aggressively compressing the stable harmonic background. This ensures that mathematical efficiency does not compromise the physical integrity of the sound.

Second, I intend to explore Agentic AI for efficient orchestration. Current "black box" music generators are computationally wasteful because they utilize monolithic models for every sub-task. I envision a modular "Mixture of Experts" system governed by a lightweight "Architect Agent." This agent decomposes a prompt (e.g., "Jazz drums with a synth pad") and routes tasks to specialized, smaller models—using deterministic DSP for the drums and diffusion only for the abstract textures. This approach minimizes the "GPU-seconds per song" metric, aligning with the principles of Green AI.

**Academic Journey: From Systems Architecture to Audio Efficiency**

My path to Audio AI is rooted in a rigorous foundation of systems architecture and constraint management. My academic record at the University of the People (MSIT) reflects a deliberate focus on the full stack of computing. To support my vision of "System-Algorithm Co-Design," I prioritized courses that bridge theory with low-level implementation. My performance in Operating Systems (A+) and Programming Languages (A+) provided the requisite low-level systems knowledge to optimize inference kernels and manage memory constraints. Simultaneously, my A grades in Foundations of Machine Learning and Algorithms demonstrate my grasp of the optimization techniques central to my proposed quantization work.

Critically, my A in Foundations of HCI provided the user-centric perspective necessary for designing interactive creative tools, directly supporting my interest in Human-AI co-creation. My current Capstone Project serves as the pilot implementation of these concepts. While rooted in my cybersecurity background—specifically "Healthcare-Optimized Multi-Factor Authentication"—the engineering core is identical to real-time audio: optimizing high-performance systems under strict latency and resource constraints. Through rigorous latency profiling and load testing, I learned that "theoretical best" models often fail in production without careful resource allocation. I am now pivoting this "systems-first" philosophy to the domain of Music Technology, convinced that the next breakthrough in Generative Audio will come from the rigorous application of these resource-constrained engineering principles.

**Why MIT EECS?**

MIT’s culture of interdisciplinary rigor—bridging the gap between the raw math of EECS and the artistic application of the Media Lab—is the only environment where this "Full-Stack" research can thrive.

I am specifically interested in the work of **Professor Mark Rau**. His expertise in instrument acoustics and physical modeling is crucial for my work on quantization. I aim to collaborate with him to define objective metrics for "transient integrity," ensuring that my compression algorithms preserve the acoustic properties of modeled instruments.

Simultaneously, my "Agentic Orchestration" proposal finds a natural home with **Professor Anna Huang**. Her pioneering work on Human-AI creative partnerships provides the ideal framework for testing my efficiency optimizations. My background in HCI and systems allows me to contribute to her vision by proving that reducing inference latency is not just a technical metric, but a creative one: lower latency enables the "call-and-response" interactivity central to her research.

Finally, the foundational signal processing rigor of **Professor Paris Smaragdis** is essential for my proposed "Sparse Inference" work. His insights into source separation and auditory perception will be invaluable in designing loss functions that prioritize perceptual efficiency over mere mathematical reconstruction.

I am eager to bring my background in robust systems design to the Music Technology group, moving the field from "bigger is better" to "smarter is sustainable."
