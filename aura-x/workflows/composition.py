"""
AURA-X Composition Workflow
Temporal workflow for autonomous music composition
"""

from datetime import timedelta
from temporalio import workflow
from temporalio.common import RetryPolicy

from .activities import (
    analyze_user_intent,
    generate_music_modal,
    evaluate_quality,
    enhance_prompt,
)
from .types import CompositionResult, GenerateRequest, Intent


@workflow.defn
class CompositionWorkflow:
    """
    Level 5 Autonomous Composition Workflow
    
    This workflow demonstrates true autonomy:
    - Analyzes user intent
    - Generates music via Modal MusicGen
    - Evaluates quality
    - Makes autonomous decisions to regenerate if quality is insufficient
    """
    
    def __init__(self):
        self.attempts = 0
        self.max_attempts = 3
        
    @workflow.run
    async def run(self, user_prompt: str, style: str = "default") -> CompositionResult:
        """
        Main workflow execution
        
        Args:
            user_prompt: Natural language description from user
            style: Musical style (cinematic, lo-fi, rock, etc.)
            
        Returns:
            CompositionResult with audio and metadata
        """
        self.attempts += 1
        workflow.logger.info(
            f"Starting composition workflow (attempt {self.attempts})",
            extra={"prompt": user_prompt, "style": style}
        )
        
        # Step 1: Agent analyzes user intent (30s timeout)
        intent = await workflow.execute_activity(
            analyze_user_intent,
            user_prompt,
            start_to_close_timeout=timedelta(seconds=30),
            retry_policy=RetryPolicy(
                maximum_attempts=2,
                backoff_coefficient=1.5,
            ),
        )
        
        workflow.logger.info("Intent analyzed", extra={"intent": intent.dict()})
        
        # Step 2: Generate music using Modal MusicGen (5min timeout for GPU)
        audio = await workflow.execute_activity(
            generate_music_modal,
            GenerateRequest(
                prompt=intent.enhanced_prompt,
                duration=intent.duration,
                style=style or intent.inferred_style,
                temperature=0.8,
                top_k=250,
            ),
            start_to_close_timeout=timedelta(minutes=5),
            retry_policy=RetryPolicy(
                maximum_attempts=3,
                backoff_coefficient=2.0,
                non_retryable_error_types=["OutOfMemoryError"],
            ),
        )
        
        workflow.logger.info("Music generated", extra={"audio_size": len(audio)})
        
        # Step 3: Agent evaluates quality (Level 5 autonomy)
        quality = await workflow.execute_activity(
            evaluate_quality,
            audio,
            start_to_close_timeout=timedelta(seconds=60),
        )
        
        workflow.logger.info(
            "Quality evaluation complete",
            extra={"score": quality.score, "metrics": quality.metrics}
        )
        
        # Step 4: Autonomous decision - regenerate if quality insufficient
        if quality.score < 0.7 and self.attempts < self.max_attempts:
            workflow.logger.warning(
                f"Quality below threshold ({quality.score} < 0.7), regenerating..."
            )
            
            # Agent enhances prompt based on quality feedback
            enhanced = await workflow.execute_activity(
                enhance_prompt,
                {"original": intent.enhanced_prompt, "feedback": quality.feedback},
                start_to_close_timeout=timedelta(seconds=20),
            )
            
            # Recursive regeneration with enhanced parameters
            return await self.run(enhanced, style=intent.alternative_style)
        
        # Return final result
        return CompositionResult(
            audio=audio,
            metadata=intent,
            quality_score=quality.score,
            attempts=self.attempts,
            workflow_id=workflow.info().workflow_id,
        )
    
    @workflow.query
    def get_progress(self) -> dict:
        """Query for real-time progress updates"""
        return {
            "attempts": self.attempts,
            "max_attempts": self.max_attempts,
            "status": "generating" if self.attempts < self.max_attempts else "complete",
        }
