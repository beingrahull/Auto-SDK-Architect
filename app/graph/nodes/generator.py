from app.graph.state import SDKState
from app.services.codegen import emit_sdk
from app.utils.scratchpad import make_entry

def generator_node(state: SDKState) -> dict:
    endpoints = state.get("endpoints") or []
    code = emit_sdk(endpoints, state["url"])
    
    return {
        "sdk_code": code,
        "status": "success",
        "scratchpad": [
            make_entry(
                state,
                node="GeneratorNode",
                event="generate.complete",
                payload={"filename": "sdk.py", "method_count": len(endpoints)},
            )
        ],
    }