from firecrawl import AsyncFirecrawl

from app.config import settings

_app = AsyncFirecrawl(api_key=settings.firecrawl_api_key)


async def fetch_doc(url: str) -> str:
    result = await _app.scrape(url, formats=["markdown"])
    markdown = getattr(result, "markdown", None) or ""
    return markdown