import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Let's extract the single complete <section id="sectionHowToUse" ... </section> block
pattern = r'(      <!-- ====================================================================\n           HOW TO USE OUTRRIGID: SIMPLIFIED 4-STEP WORKFLOW GUIDE\n           ==================================================================== -->\n      <section id="sectionHowToUse".*?</section>)'

matches = list(re.finditer(pattern, html, flags=re.DOTALL))
print(f"Regex matched {len(matches)} guide blocks.")

if len(matches) == 6:
    # We want to keep the FIRST occurrence (matches[0]) and remove the other 5
    # Let's rebuild the string
    guide_block = matches[0].group(0)
    
    # Replace all matches with empty, then insert it once before `    <!-- ====================================================================\n         WORKSPACE 2: DESIGN PARAMETERS`
    html_cleaned = re.sub(pattern, '', html, flags=re.DOTALL)
    
    target = '    <!-- ====================================================================\n         WORKSPACE 2: DESIGN PARAMETERS'
    if target in html_cleaned:
        html_cleaned = html_cleaned.replace(target, guide_block + '\n    </div>\n\n' + target)
        # Note: we need to verify the closing </div> of ws-studio
    
    # Wait, let's look closely at where matches[0] was placed.

