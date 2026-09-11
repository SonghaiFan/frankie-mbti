import json

with open("scripts/build_consolidation_and_relations.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

code_part = "".join(lines[:573])
scope = {}
exec(code_part, scope)

data = {
    "dimensions": scope["dimensions_data"],
    "letters": scope["letters_data"],
    "groups": scope["groups_data"],
    "typeRelations": scope["type_relations_data"],
    "functionAxes": scope["function_axes"],
    "beebeStacks": scope["beebe_stacks"],
    "beebeRoles": scope["beebe_roles"]
}

with open("scripts/consolidation_data.json", "w", encoding="utf-8") as out:
    json.dump(data, out, ensure_ascii=False, indent=2)

print("Wrote scripts/consolidation_data.json successfully!")
