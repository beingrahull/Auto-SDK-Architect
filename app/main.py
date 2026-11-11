from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth            # existing
from app.routers import jobs            # NEW
from app.routers import health          # NEW
from app.database import init_graph,init_db     # NEW


@asynccontextmanager
async def lifespan(app: FastAPI):   
    await init_db()    # NEW
    await init_graph()                  # NEW
    yield                               # NEW


app = FastAPI(title="aiSDK", lifespan=lifespan)   # CHANGED: added lifespan=

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)         # existing
app.include_router(jobs.router)         # NEW
app.include_router(health.router)       # NEW


@app.get("/")                           # existing
async def root():
    return {"status": "operational"}