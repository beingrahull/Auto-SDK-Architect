from app.services.parser import parse_endpoints

md = open("test_docs.md", encoding="utf-8").read()
endpoints = parse_endpoints(md)

print(f"found {len(endpoints)} endpoints\n")
for ep in endpoints:
    print(f"{ep['method']} {ep['path']}")
    for p in ep["params"]:
        print(f"    - {p['name']}: {p['type']} ({p['location']})")
    print()