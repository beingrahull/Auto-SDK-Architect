from contextlib import AsyncExitStack

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver

from app.config import settings
from app.models.user import User
from app.graph.builder import build_graph
from pymongo import AsyncMongoClient

# ---------------------------------------------------------------------------
# existing — MongoDB / Beanie (keep exactly as-is)
# ---------------------------------------------------------------------------


async def init_db() -> None:
    client = AsyncMongoClient(settings.mongo_uri)
    await init_beanie(
        database=client[settings.mongo_db_name],
        document_models=[User],
    )

# ---------------------------------------------------------------------------
# NEW — LangGraph checkpointer + compiled-graph singleton
# ---------------------------------------------------------------------------

_checkpointer_stack: AsyncExitStack | None = None
_graph = None


async def init_graph() -> None:
    """Open the SQLite checkpointer and compile the graph once at startup."""
    global _checkpointer_stack, _graph
    if _graph is not None:
        return  # already initialized

    _checkpointer_stack = AsyncExitStack()
    checkpointer = await _checkpointer_stack.enter_async_context(
        AsyncSqliteSaver.from_conn_string(settings.database_url)
    )
    _graph = build_graph(checkpointer)


def get_compiled_graph():
    """Return the singleton compiled graph. Raises if init_graph() hasn't run."""
    if _graph is None:
        raise RuntimeError("graph not initialized; call init_graph() in lifespan")
    return _graph