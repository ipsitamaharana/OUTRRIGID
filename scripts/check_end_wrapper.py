with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos_theory = text.find('id="theoryModal"')
print('pos_theory:', pos_theory)
print(text[pos_theory-250:pos_theory+50])

