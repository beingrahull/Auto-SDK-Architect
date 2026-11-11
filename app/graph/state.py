import operator
from typing import Annotated, Literal, TypedDict


class ScratchpadEntry(TypedDict):
    step: int
    node: str
    event: str
    ts: str
    payload: dict


class SDKState(TypedDict):
    url: str
    raw_doc: str | None
    endpoints: list[dict] | None
    validation_errors: list[str] | None
    retries: int
    sdk_code: str | None
    status: Literal["pending", "running", "success", "failed"]
    scratchpad: Annotated[list[ScratchpadEntry], operator.add]


def initial_state(url: str) -> SDKState:
    return {
        "url": url,
        "raw_doc": None,
        "endpoints": None,
        "validation_errors": None,
        "retries": 0,
        "sdk_code": None,
        "status": "pending",
        "scratchpad": [],
    }