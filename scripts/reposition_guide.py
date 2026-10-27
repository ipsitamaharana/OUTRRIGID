import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. First, remove the button from benchmark-strip-controls
btn_pattern = r'\s*<button id="btnScrollToGuide" type="button" class="btn-theory-guide"[^>]*>.*?</button>'
html, num_btn_removed = re.subn(btn_pattern, '', html, flags=re.DOTALL)
print(f"Removed {num_btn_removed} instances of btnScrollToGuide from executive bar")

# 2. Extract ONE pristine copy of sectionHowToUse
sec_pattern = r'\s*<!-- ====================================================================\s*HOW TO USE OUTRRIGID: SIMPLIFIED 4-STEP WORKFLOW GUIDE\s*==================================================================== -->\s*<section id="sectionHowToUse".*?</section>'

matches = list(re.finditer(sec_pattern, html, flags=re.DOTALL))
print(f"Found {len(matches)} occurrences of sectionHowToUse")

if len(matches) > 0:
    single_guide = matches[0].group(0).strip()
    # Remove all occurrences from html
    html = re.sub(sec_pattern, '', html, flags=re.DOTALL)
    print("Removed all duplicate sections")
else:
    print("Error: Could not find any sectionHowToUse!")
    exit(1)

# Clean up math text inside single_guide
single_guide = single_guide.replace('stiffness radius $l$', 'radius of relative stiffness (<em>l</em>)')
single_guide = single_guide.replace('radius of relative stiffness <em>l</em>l$', 'radius of relative stiffness (<em>l</em>)')
single_guide = single_guide.replace('stress ratios ($SR$)', 'stress ratios (<em>SR</em>)')
single_guide = single_guide.replace('stress ratios ($$SR$)', 'stress ratios (<em>SR</em>)')
single_guide = single_guide.replace('modulus $k$', 'modulus <em>k</em>')
single_guide = single_guide.replace('modulus <em>k</em>k$', 'modulus <em>k</em>')
single_guide = single_guide.replace('foundation modulus k k$', 'foundation modulus <em>k</em>')

# 3. Add btnScrollToGuide to the top-right corner (.header-actions)
# Find .header-actions
header_actions_target = '<div class="header-actions">'
corner_button_html = '''<div class="header-actions">
          <button id="btnScrollToGuide" type="button" class="btn-guide-corner"
            title="Open Quick-Start Workflow Guide (How to use OUTRRIGID)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>How to Use</span>
          </button>'''

if header_actions_target in html:
    html = html.replace(header_actions_target, corner_button_html, 1)
    print("Added btnScrollToGuide to .header-actions in the top-right corner")
else:
    print("Could not find .header-actions!")

# 4. Insert the single_guide at the very end of .app-wrapper
# Find the end of ws-variants and closing of app-wrapper
# Target before <!-- IRC:58 Theory & Mathematical Formulations Reference Modal -->
target_modal = '  <!-- IRC:58 Theory & Mathematical Formulations Reference Modal -->'
if target_modal in html:
    # We want to place it before the closing </div> of app-wrapper
    # Let's inspect what comes right before target_modal
    idx = html.find(target_modal)
    pre = html[:idx].rstrip()
    # pre ends with </div>\n  </div>
    # Let's see: ws-variants ends with </div>, app-wrapper ends with </div>
    # We want single_guide placed inside app-wrapper, after ws-variants
    # So: ... ws-variants closing </div> \n\n {single_guide} \n </div>\n\n target_modal
    if pre.endswith('</div>\n  </div>') or pre.endswith('</div>\r\n  </div>'):
        # Replace the last </div> with single_guide + '\n  </div>'
        last_div_idx = pre.rfind('</div>')
        pre_updated = pre[:last_div_idx] + '\n\n    <!-- ====================================================================\n         HOW TO USE OUTRRIGID: SIMPLIFIED 4-STEP WORKFLOW GUIDE (AT LAST)\n         ==================================================================== -->\n    ' + single_guide + '\n  </div>\n\n'
        html = pre_updated + html[idx:]
        print("Successfully placed single guide at the very end of app-wrapper (at last)")
    else:
        print("Pre does not end as expected:", repr(pre[-40:]))
else:
    print("Could not find target_modal!")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)
print("Updated index.html successfully")

