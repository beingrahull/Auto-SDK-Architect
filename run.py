import asyncio
from app.database import init_graph, get_compiled_graph

async def dump():
    await init_graph()
    s = await get_compiled_graph().aget_state(
        {"configurable": {"thread_id": "7db0a6ea-54d5-4c5a-a4ef-893bbd69cf1f"}}
    )
    raw = s.values["raw_doc"]
    with open("docs.md", "w", encoding="utf-8") as f:
        f.write(raw)
    print("wrote", len(raw), "chars to docs.md")
    print("first 60 lines:")
    print("=" * 60)
    print("\n".join(raw.splitlines()[:60]))

asyncio.run(dump())