from datetime import timedelta
from temporalio import workflow
from temporalio.common import RetryPolicy
from typing import Dict, Any

# Import activities (Modal functions)
with workflow.unsafe.imports_passed_through():
    from activities.modal_inference import (
        generate_composition,
        arrange_structure,
        mix_audio,
        master_audio,
        evaluate_quality,
    )


@workflow.defn
class MusicGenerationWorkflow:
    """
    Level 5 Autonomous Music Generation Workflow
    
    This workflow orchestrates the complete music generation pipeline:
    1. Composition (MusicGen via Modal)
    2. Arrangement (structural analysis and enhancement)
    3. Mixing (balance, EQ, compression)
    4. Mastering (final polish)
    5. Quality evaluation (neural discriminator)
    """

    @workflow.run
    async def run(self, params: Dict[str, Any]) -> Dict[str, Any]:
        prompt = params["prompt"]
        style = params.get("style", "electronic")
        duration = params.get("duration", 60)
        quality_threshold = params.get("quality_threshold", 0.7)

        workflow.logger.info(f"Starting music generation: {prompt}")

        # Define retry policy for expensive GPU operations
        retry_policy = RetryPolicy(
            initial_interval=timedelta(seconds=5),
            maximum_interval=timedelta(seconds=60),
            maximum_attempts=3,
            backoff_coefficient=2.0,
        )

        # Stage 1: Composition (Modal GPU inference)
        composition_result = await workflow.execute_activity(
            generate_composition,
            args=[{"prompt": prompt, "style": style, "duration": duration}],
            start_to_close_timeout=timedelta(minutes=5),
            retry_policy=retry_policy,
        )

        workflow.logger.info(f"Composition completed: {composition_result['audio_url']}")

        # Stage 2: Arrangement
        arrangement_result = await workflow.execute_activity(
            arrange_structure,
            args=[{"audio_url": composition_result["audio_url"], "style": style}],
            start_to_close_timeout=timedelta(minutes=3),
            retry_policy=retry_policy,
        )

        workflow.logger.info("Arrangement completed")

        # Stage 3: Mixing
        mixing_result = await workflow.execute_activity(
            mix_audio,
            args=[{"audio_url": arrangement_result["audio_url"]}],
            start_to_close_timeout=timedelta(minutes=3),
            retry_policy=retry_policy,
        )

        workflow.logger.info("Mixing completed")

        # Stage 4: Mastering
        mastering_result = await workflow.execute_activity(
            master_audio,
            args=[{"audio_url": mixing_result["audio_url"]}],
            start_to_close_timeout=timedelta(minutes=3),
            retry_policy=retry_policy,
        )

        workflow.logger.info("Mastering completed")

        # Stage 5: Quality Evaluation (Level 5 autonomy)
        quality_result = await workflow.execute_activity(
            evaluate_quality,
            args=[{"audio_url": mastering_result["audio_url"], "prompt": prompt}],
            start_to_close_timeout=timedelta(minutes=2),
        )

        quality_score = quality_result["quality_score"]
        workflow.logger.info(f"Quality evaluation: {quality_score}")

        # Autonomous decision: regenerate if quality is below threshold
        if quality_score < quality_threshold:
            workflow.logger.warning(
                f"Quality {quality_score} below threshold {quality_threshold}. Regenerating..."
            )
            
            # Self-healing: Adjust prompt and retry composition
            adjusted_prompt = f"{prompt} (high quality, professional production)"
            return await self.run({
                **params,
                "prompt": adjusted_prompt,
                "quality_threshold": quality_threshold - 0.1,  # Lower threshold slightly
            })

        # Return final result
        return {
            "status": "completed",
            "audio_url": mastering_result["audio_url"],
            "quality_score": quality_score,
            "metadata": {
                "prompt": prompt,
                "style": style,
                "duration": duration,
                "composition_time": composition_result.get("processing_time"),
                "total_cost": sum([
                    composition_result.get("cost", 0),
                    arrangement_result.get("cost", 0),
                    mixing_result.get("cost", 0),
                    mastering_result.get("cost", 0),
                ]),
            },
        }
