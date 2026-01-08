import asyncio
from temporalio.client import Client
from temporalio.worker import Worker

from workflows.music_generation import MusicGenerationWorkflow
from activities.modal_inference import (
    generate_composition,
    arrange_structure,
    mix_audio,
    master_audio,
    evaluate_quality,
)


async def main():
    # Connect to Temporal server
    client = await Client.connect("localhost:7233")

    # Create worker
    worker = Worker(
        client,
        task_queue="aura-x-tasks",
        workflows=[MusicGenerationWorkflow],
        activities=[
            generate_composition,
            arrange_structure,
            mix_audio,
            master_audio,
            evaluate_quality,
        ],
    )

    print("🎵 AURA-X Temporal worker started")
    print("Listening for workflow tasks on 'aura-x-tasks' queue...")

    # Run worker
    await worker.run()


if __name__ == "__main__":
    asyncio.run(main())
