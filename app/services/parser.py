import re

HEADING_RE = re.compile(
    r"^#{2,4}\s+`?\s*(GET|POST|PUT|PATCH|DELETE)\s+(/\S*?)\s*`?\s*$",
    re.MULTILINE,
)

TABLE_ROW_RE = re.compile(r"^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$")

TYPE_MAP = {
    "str": "str",
    "string": "str",
    "int": "int",
    "integer": "int",
    "float": "float",
    "number": "float",
    "bool": "bool",
    "boolean": "bool",
    "dict": "dict",
    "object": "dict",
    "list": "list",
    "array": "list",
}


def parse_endpoints(markdown: str) -> list[dict]:
    endpoints = []
    matches = list(HEADING_RE.finditer(markdown))

    for i, m in enumerate(matches):
        method = m.group(1)
        path = m.group(2)

        # Body between this heading and the next heading (or EOF)
        body_start = m.end()
        body_end = matches[i + 1].start() if i + 1 < len(matches) else len(markdown)
        body = markdown[body_start:body_end]

        params = _parse_params(body, path)

        endpoints.append({
            "method": method,
            "path": path,
            "params": params,
            "description": None,
        })

    return endpoints


def _parse_params(body: str, path: str) -> list[dict]:
    params = []
    seen = set()

    for line in body.splitlines():
        row = TABLE_ROW_RE.match(line.strip())
        if not row:
            continue

        name, raw_type, required = row.groups()
        name = name.strip().strip("`")
        raw_type = raw_type.strip().strip("`")
        required = required.strip().lower()

        # NEW: Skip invalid Python identifiers (like numbers '400', '401')
        if name.isdigit() or not name.isidentifier():
            continue

        # Skip header row and separator row
        if name.startswith("-") or (name.lower() in ("name", "parameter", "param") and raw_type.lower() in ("type", "kind")):
            continue
        if not name or not raw_type:
            continue
        if name in seen:
            continue
        seen.add(name)

        py_type = TYPE_MAP.get(raw_type.lower(), "str")

        if f"{{{name}}}" in path:
            location = "path"
        elif required in ("no", "false"):
            location = "query"
        else:
            location = "body"

        params.append({
            "name": name,
            "type": py_type,
            "location": location,
        })

    return params