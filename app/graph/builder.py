from langgraph.graph import END, StateGraph

from app.graph.nodes.scraper import scraper_node
from app.graph.state import SDKState


def build_graph(checkpointer):
    g = StateGraph(SDKState)

    g.add_node("scrape", scraper_node)

    g.set_entry_point("scrape")
    g.add_edge("scrape", END)

    return g.compile(checkpointer=checkpointer)