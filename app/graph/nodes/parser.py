from app.graph.state import SDKState
from app.services.parser import parse_endpoints
from app.utils.scratchpad import make_entry


def parser_node(state: SDKState) -> dict:
    endpoints = parse_endpoints(state["raw_doc"])
    return {
        "endpoints": endpoints,
        "scratchpad": [
            make_entry(
                state,
                node="ParserNode",
                event="parse.complete",
                payload={"endpoint_count": len(endpoints)},
            )
        ],
    }