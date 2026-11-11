from app.graph.state import SDKState
from app.services.scraper import fetch_doc
from app.utils.scratchpad import make_entry


async def scraper_node(state: SDKState) -> dict:
    raw = await fetch_doc(state["url"])
    return {
        "raw_doc": raw,
        "status": "running",
        "scratchpad": [
            make_entry(
                state,
                node="ScraperNode",
                event="scrape.complete",
                payload={"bytes": len(raw)},
            )
        ],
    }