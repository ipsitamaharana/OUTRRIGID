import subprocess
import os

inject_code = """
<script>
window.addEventListener('load', function() {
  setTimeout(function() {
    var guide = document.getElementById('sectionHowToUse');
    var rect = guide.getBoundingClientRect();
    console.error('GUIDE_RECT_TOP:' + rect.top + ' RECT_HEIGHT:' + rect.height + ' DISPLAY:' + window.getComputedStyle(guide).display + ' VISIBLE:' + (guide.offsetWidth > 0));
  }, 500);
});
</script>
</body>
"""

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read().replace('</body>', inject_code)
with open('test_inspect.html', 'w', encoding='utf-8') as f:
    f.write(c)

chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
cmd = [chrome_path, '--headless=new', '--no-sandbox', '--disable-gpu', '--enable-logging=stderr', '--virtual-time-budget=2000', 'file:///c:/OUTRRIGID-FRIEND/test_inspect.html']
res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
for l in (res.stdout + res.stderr).splitlines():
    if 'GUIDE_RECT' in l:
        print(l)
if os.path.exists('test_inspect.html'):
    os.remove('test_inspect.html')

