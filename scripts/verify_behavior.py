import subprocess
import os
import tempfile

inject_code = """
<script>
window.addEventListener('load', function() {
  setTimeout(function() {
    var btnCorner = document.getElementById('btnScrollToGuide');
    var btnFloat = document.getElementById('btnFloatingGuide');
    var guide = document.getElementById('sectionHowToUse');
    var body = document.getElementById('howToUseBody');
    var btnToggle = document.getElementById('btnToggleHowToUse');
    var btnDismiss = document.getElementById('btnDismissHowToUse');
    
    console.error('TEST:btnCorner_exists=' + (!!btnCorner));
    console.error('TEST:btnFloat_exists=' + (!!btnFloat));
    console.error('TEST:guide_exists=' + (!!guide));
    console.error('TEST:section_count=' + document.querySelectorAll('#sectionHowToUse').length);

    // Test Minimize
    if (btnToggle) {
      btnToggle.click();
      var isMin = guide.classList.contains('is-minimized');
      var bodyDisplay = window.getComputedStyle(body).display;
      console.error('TEST:after_minimize_click min=' + isMin + ' bodyDisplay=' + bodyDisplay);
      
      // Test Expand
      btnToggle.click();
      console.error('TEST:after_expand_click min=' + guide.classList.contains('is-minimized') + ' bodyDisplay=' + window.getComputedStyle(body).display);
    }

    // Test Hide
    if (btnDismiss) {
      btnDismiss.click();
      console.error('TEST:after_dismiss_click guideDisplay=' + window.getComputedStyle(guide).display);
    }

    // Test Open from Corner
    if (btnCorner) {
      btnCorner.click();
      console.error('TEST:after_corner_click guideDisplay=' + window.getComputedStyle(guide).display + ' min=' + guide.classList.contains('is-minimized'));
    }
  }, 600);
});
</script>
</body>
"""

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read().replace('</body>', inject_code)
with open('test_verify.html', 'w', encoding='utf-8') as f:
    f.write(c)

chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
temp_dir = os.path.join(tempfile.gettempdir(), 'chrome_verify_dir2')
cmd = [chrome_path, '--headless=new', '--no-sandbox', '--disable-gpu', '--enable-logging=stderr', '--user-data-dir=' + temp_dir, '--virtual-time-budget=3000', 'file:///c:/OUTRRIGID-FRIEND/test_verify.html']
res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
for l in (res.stdout + res.stderr).splitlines():
    if 'TEST:' in l:
        print(l)
if os.path.exists('test_verify.html'):
    os.remove('test_verify.html')
