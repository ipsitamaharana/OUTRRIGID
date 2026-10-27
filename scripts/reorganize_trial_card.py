with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Replace the entire trial-controller-card block
old_card = '''      <!-- Zone 1: Interactive Trial Slab Controller (Input Driver) -->
      <div class="trial-controller-card">
        <div class="trial-card-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg class="app-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            <span class="trial-hub-label">Trial Slab Thickness</span>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <button id="btnLoadDlcBenchmark" type="button" class="btn-preset-chip"
              title="Load the 6000 CVPD DLC Subbase spreadsheet benchmark (h=280mm, CFD=0.859)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span>Load DLC 6000 CVPD Case</span>
            </button>
            <button type="button" class="formula-btn-chip btn-open-theory-trigger" title="View Westergaard Radius of Relative Stiffness Formulation & Theory">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              <span>Theory Guide</span>
            </button>
            <button id="btnAutoOptimize" class="btn-optimize-chip"
              title="Automatically solve for minimal safe slab thickness">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>Auto-Optimize</span>
            </button>
          </div>
        </div>

        <div class="trial-input-row">
          <div class="trial-numeric-wrap">
            <input type="number" id="inputNumericThickness" class="trial-numeric-input" min="100" max="700" step="1"
              value="310" aria-label="Trial Slab Thickness in mm">
            <span class="trial-unit-tag">mm</span>
          </div>
          <div class="trial-stepper-group">
            <button type="button" id="btnStepMinus" class="trial-step-btn"
              title="Decrease Thickness by 5mm">&minus;5</button>
            <button type="button" id="btnStepPlus" class="trial-step-btn" title="Increase Thickness by 5mm">+5</button>
          </div>
        </div>

        <div class="trial-slider-row">
          <input type="range" id="sliderThickness" class="custom-range-slider" min="100" max="700" step="0.5"
            value="310" aria-label="Slab Thickness Slider">
          <div class="trial-slider-labels">
            <span>100 mm</span>
            <span id="displayThickness" style="display:none;">310 mm</span>
            <span>700 mm</span>
          </div>
        </div>

        <div class="trial-meta-row">
          <div class="trial-meta-item">
            <span class="meta-label">Total Construction:</span>
            <strong class="meta-val" id="kpiFinalThickness">320 mm (+10mm wear)</strong>
          </div>
          <div class="trial-live-badge">
            <span class="live-indicator-dot"></span>
            <span>Live Recalculation</span>
          </div>
        </div>
      </div>'''

new_card = '''      <!-- Zone 1: Interactive Trial Slab Controller (Input Driver) -->
      <div class="trial-controller-card">
        <div class="trial-card-header">
          <div class="trial-title-wrap">
            <svg class="app-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            <span class="trial-hub-label">Trial Slab Thickness</span>
          </div>
          <button id="btnAutoOptimize" class="btn-optimize-chip"
            title="Automatically solve for minimal safe slab thickness (IRC:58 CFD <= 1.000)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>Auto-Optimize</span>
          </button>
        </div>

        <div class="trial-input-row">
          <div class="trial-numeric-wrap">
            <input type="number" id="inputNumericThickness" class="trial-numeric-input" min="100" max="700" step="1"
              value="310" aria-label="Trial Slab Thickness in mm">
            <span class="trial-unit-tag">mm</span>
          </div>
          <div class="trial-stepper-group">
            <button type="button" id="btnStepMinus" class="trial-step-btn"
              title="Decrease Thickness by 5mm">&minus;5</button>
            <button type="button" id="btnStepPlus" class="trial-step-btn" title="Increase Thickness by 5mm">+5</button>
          </div>
        </div>

        <div class="trial-slider-row">
          <input type="range" id="sliderThickness" class="custom-range-slider" min="100" max="700" step="0.5"
            value="310" aria-label="Slab Thickness Slider">
          <div class="trial-slider-labels">
            <span>100 mm</span>
            <span id="displayThickness" style="display:none;">310 mm</span>
            <span>700 mm</span>
          </div>
        </div>

        <!-- Dedicated Quick Options Row with Generous Space -->
        <div class="trial-quick-options-row">
          <button id="btnLoadDlcBenchmark" type="button" class="btn-preset-chip"
            title="Load standard 6000 CVPD DLC Subbase configuration (h=280mm, CFD=0.859)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Load DLC Preset (280mm)</span>
          </button>
          <button type="button" class="formula-btn-chip btn-open-theory-trigger"
            title="View Westergaard Radius of Relative Stiffness Formulation & Theory">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span>Theory Guide</span>
          </button>
        </div>

        <div class="trial-meta-row">
          <div class="trial-meta-item">
            <span class="meta-label">Total Construction:</span>
            <strong class="meta-val" id="kpiFinalThickness">320 mm (+10mm wear)</strong>
          </div>
          <div class="trial-live-badge">
            <span class="live-indicator-dot"></span>
            <span>Live Recalculation</span>
          </div>
        </div>
      </div>'''

# Handle LF vs CRLF
if old_card in html:
    html = html.replace(old_card, new_card)
    print("Replaced old_card (LF)")
elif old_card.replace('\n', '\r\n') in html:
    html = html.replace(old_card.replace('\n', '\r\n'), new_card.replace('\n', '\r\n'))
    print("Replaced old_card (CRLF)")
else:
    print("Could not match old_card directly! Trying relaxed pattern match...")
    import re
    m = re.search(r'<!-- Zone 1: Interactive Trial Slab Controller.*?</div>\s*<!-- Zone 2:', html, re.DOTALL)
    if m:
        html = html[:m.start()] + new_card + '\n\n      <!-- Zone 2:' + html[m.end():]
        print("Replaced with regex")
    else:
        print("Failed to find block!")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)
print("index.html updated")

# Now update css/styles.css
with open("css/styles.css", "r", encoding="utf-8") as f:
    css = f.read()

# 1. Update trial-hub-container grid columns
css = css.replace(
    'grid-template-columns: 340px 1fr;',
    'grid-template-columns: minmax(380px, 410px) 1fr;'
)

# 2. Append styles for trial-quick-options-row, trial-title-wrap, and ensure btn-optimize-chip doesn't wrap
extra_css = """
/* Trial Controller Enhanced Spacing & Quick Options Layout */
.trial-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.trial-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-subtle);
}

.btn-optimize-chip {
  white-space: nowrap !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 6px 14px !important;
  font-size: 11.5px !important;
  font-weight: 700 !important;
}

.trial-quick-options-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-light);
}

.trial-quick-options-row .btn-preset-chip,
.trial-quick-options-row .formula-btn-chip {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 12px;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.trial-quick-options-row .btn-preset-chip:hover,
.trial-quick-options-row .formula-btn-chip:hover {
  transform: translateY(-1px);
}
"""

css = css + "\n" + extra_css

with open("css/styles.css", "w", encoding="utf-8") as f:
    f.write(css)
print("css/styles.css updated")

