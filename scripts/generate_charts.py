import matplotlib.pyplot as plt
import numpy as np

# Data simulation for the proposal visualization
# Comparing Inference Time vs. Audio Quality (Fréchet Audio Distance - Lower is better)

models = ['Baseline (Suno-like)', 'Compressed', 'Quantized (INT8)', 'Sparse Attn', 'Fully Optimized']
inference_time_ms = [1200, 800, 400, 300, 150]  # ms per second of audio
fad_score = [2.5, 2.8, 3.1, 3.0, 3.2]  # Lower is better

fig, ax1 = plt.subplots(figsize=(10, 6))

color = 'tab:red'
ax1.set_xlabel('Optimization Stage')
ax1.set_ylabel('Inference Latency (ms)', color=color)
ax1.bar(models, inference_time_ms, color=color, alpha=0.6, label='Latency')
ax1.tick_params(axis='y', labelcolor=color)

ax2 = ax1.twinx()  # instantiate a second axes that shares the same x-axis

color = 'tab:blue'
ax2.set_ylabel('FAD Score (Lower is Better)', color=color)  # we already handled the x-label with ax1
ax2.plot(models, fad_score, color=color, marker='o', linewidth=2, label='Quality Degradation')
ax2.tick_params(axis='y', labelcolor=color)

plt.title('Projected Trade-off: Latency vs. Audio Quality')
fig.tight_layout()  # otherwise the right y-label is slightly clipped
plt.grid(True, alpha=0.3)
plt.savefig('public/images/tradeoff_chart.png')
print("Chart generated at public/images/tradeoff_chart.png")
