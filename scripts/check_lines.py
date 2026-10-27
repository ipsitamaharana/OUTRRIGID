import re

with open("index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'id="ws-studio"' in line:
        print(f"ws-studio starts at line {i+1}")
    if 'id="ws-inputs"' in line:
        print(f"ws-inputs starts at line {i+1}")
    if 'id="sectionHowToUse"' in line:
        print(f"sectionHowToUse at line {i+1}")
    if 'id="visualizerCard"' in line or 'Pavement Slab Temperature' in line:
        print(f"visualizer at line {i+1}")

