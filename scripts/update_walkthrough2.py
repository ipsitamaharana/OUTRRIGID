with open("WALKTHROUGH.md", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace(
    'as well as a persistent **floating corner action pill** in the bottom-right.',
    'leaving the interface clean and clutter-free.'
)
text = text.replace(
    'Clicking either corner button smoothly scrolls down to the guide',
    'Clicking this corner button smoothly scrolls down to the guide'
)
text = text.replace(
    'Clicking *How to Use* in either corner instantly restores and smoothly scrolls to it.',
    'Clicking *How to Use* in the top-right corner instantly restores and smoothly scrolls to it.'
)
text = text.replace(
    '- [x] **Repositioned to Corner**: Relocated the "How to Use" button to the top-right corner of the header and added a floating action pill in the bottom-right corner.',
    '- [x] **Repositioned to Single Header Corner Button**: Relocated the "How to Use" button exclusively to the top-right corner of the header, removing redundant floating pills.'
)

with open("WALKTHROUGH.md", "w", encoding="utf-8") as f:
    f.write(text)

print("Updated WALKTHROUGH.md successfully")

