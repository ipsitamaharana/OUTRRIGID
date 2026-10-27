with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Add corner button in header next to theme toggle
old_hdr = '<div class="header-divider"></div>\n\n        <button id="btnThemeToggle"'
if old_hdr not in content:
    # Try CRLF
    old_hdr = '<div class="header-divider"></div>\r\n\r\n        <button id="btnThemeToggle"'

corner_btn = '''<div class="header-divider"></div>

        <button id="btnScrollToGuide" class="btn-guide-corner" type="button" title="Quick-Start Workflow Guide (How to Use OUTRRIGID)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <span>How to Use</span>
        </button>

        <button id="btnThemeToggle"'''

if old_hdr in content:
    content = content.replace(old_hdr, corner_btn, 1)
    print("Inserted btnScrollToGuide in top-right header corner")
else:
    print("Could not find old_hdr in index.html!")

# Add floating corner button right before </body>
old_body = '</body>'
floating_btn = '''  <!-- Floating Bottom-Right Corner Quick-Help Trigger -->
  <button id="btnFloatingGuide" type="button" class="btn-floating-corner-guide" title="Quick-Start Workflow Guide">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
    <span>How to Use</span>
  </button>

</body>'''

content = content.replace(old_body, floating_btn, 1)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("index.html updated successfully!")

