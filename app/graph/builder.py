from langgraph.graph import END, StateGraph
from app.graph.nodes.scraper import scraper_node
from app.graph.nodes.parser import parser_node
from app.graph.nodes.generator import generator_node # NEW
from app.graph.state import SDKState

def build_graph(checkpointer):
    g = StateGraph(SDKState)
    
    g.add_node("scrape", scraper_node)
    g.add_node("parse", parser_node)
    g.add_node("generate", generator_node) # NEW
    
    g.set_entry_point("scrape")
    g.add_edge("scrape", "parse")
    g.add_edge("parse", "generate") # NEW: was parse -> END
    g.add_edge("generate", END)     # NEW
    
    return g.compile(checkpointer=checkpointer)