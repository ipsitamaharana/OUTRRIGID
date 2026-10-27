with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'class="workspace-pane' in l or 'id="ws-' in l:
        print(f"Line {i+1}: {l.strip()}")
    if 'id="theoryModal"' in l:
        print(f"theoryModal at Line {i+1}")
    if '</main>' in l or '</div><!-- end app-wrapper' in l:
        print(f"Line {i+1}: {l.strip()}")

