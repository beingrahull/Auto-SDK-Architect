from datetime import datetime, timezone

from app.graph.state import SDKState, ScratchpadEntry


def make_entry(
    state: SDKState,
    node: str,
    event: str,
    payload: dict,
) -> ScratchpadEntry:
    return {
        "step": len(state.get("scratchpad", [])) + 1,
        "node": node,
        "event": event,
        "ts": datetime.now(timezone.utc).isoformat(),
        "payload": payload,
    }