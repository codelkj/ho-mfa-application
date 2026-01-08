"""
Temporal Activities that bridge to Modal GPU functions
"""

from temporalio import activity
import modal

from ..types import GenerateRequest, StemRequest

# Lookup Modal app
modal_app = modal.Stub.lookup("aura-x-inference", create_if_missing=False)


@activity.defn
async def generate_music_modal(request: GenerateRequest) -> bytes:
    """
    Generate music using Modal MusicGen function
    
    This activity bridges Temporal (orchestration) to Modal (GPU compute)
    """
    activity.logger.info(
        "Calling Modal MusicGen",
        extra={
            "prompt": request.prompt,
            "duration": request.duration,
            "style": request.style,
        }
    )
    
    try:
        # Remote call to Modal GPU function
        audio_bytes = await modal_app.generate_music.remote.aio(
            prompt=request.prompt,
            duration=request.duration,
            style=request.style,
            temperature=request.temperature,
            top_k=request.top_k,
        )
        
        activity.logger.info("MusicGen complete", extra={"size_mb": len(audio_bytes) / 1e6})
        return audio_bytes
        
    except Exception as e:
        activity.logger.error(f"Modal MusicGen failed: {e}")
        raise


@activity.defn
async def separate_stems_modal(request: StemRequest) -> dict[str, bytes]:
    """
    Separate audio into stems using Modal Demucs function
    """
    activity.logger.info("Calling Modal Demucs")
    
    stems = await modal_app.separate_stems.remote.aio(
        audio_bytes=request.audio,
        model=request.model or "htdemucs",
    )
    
    activity.logger.info(f"Stem separation complete: {list(stems.keys())}")
    return stems
