import matplotlib.pyplot as plt
import matplotlib.patches as patches

def draw_pipeline():
    fig, ax = plt.subplots(figsize=(12, 4))
    
    steps = [
        "Model\nCompression", 
        "Quantization", 
        "Sparse\nInference", 
        "Efficient\nAttention", 
        "Distributed\nInference"
    ]
    
    # Draw boxes
    for i, step in enumerate(steps):
        rect = patches.Rectangle((i*3, 1), 2, 1, linewidth=2, edgecolor='black', facecolor='white')
        ax.add_patch(rect)
        ax.text(i*3 + 1, 1.5, step, ha='center', va='center', fontsize=10, fontweight='bold')
        
        # Draw arrows
        if i < len(steps) - 1:
            ax.arrow(i*3 + 2, 1.5, 1, 0, head_width=0.1, head_length=0.2, fc='black', ec='black')

    ax.set_xlim(0, len(steps)*3)
    ax.set_ylim(0, 3)
    ax.axis('off')
    plt.title("Research Methodology Pipeline", fontsize=14)
    plt.tight_layout()
    plt.savefig('public/images/methodology_pipeline_recreated.png')
    print("Pipeline diagram generated at public/images/methodology_pipeline_recreated.png")

if __name__ == "__main__":
    draw_pipeline()
