from typing import Literal

from pydantic import BaseModel, HttpUrl


class GenerateRequest(BaseModel):
    url: HttpUrl


class GenerateResponse(BaseModel):
    job_id: str


class ScratchpadEntry(BaseModel):
    step: int
    node: str
    event: str
    ts: str
    payload: dict


class JobStatusResponse(BaseModel):
    job_id: str
    status: Literal["pending", "running", "success", "failed"]
    sdk_url: str | None
    scratchpad: list[ScratchpadEntry]