with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('id="theoryModal"')
print('theoryModal found at char:', pos)
if pos != -1:
    print(text[pos-100:pos+600])

