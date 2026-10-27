with open("css/styles.css", "r", encoding="utf-8") as f:
    css = f.read()

# Replace or add is-minimized with !important and add corner button styles
corner_css = """
/* Top-Right Header Corner How-to-Use Pill Button */
.btn-guide-corner {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 9999px !important;
  color: #10b981;
  font-family: var(--font-body);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-guide-corner:hover {
  background: rgba(16, 185, 129, 0.22);
  border-color: #10b981;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
  color: #10b981;
}

/* Floating Bottom-Right Corner Action Pill */
.btn-floating-corner-guide {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 990;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  background: var(--bg-card-glass, rgba(30, 41, 59, 0.85));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-medium, rgba(255, 255, 255, 0.15));
  border-radius: 9999px !important;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  transition: all 0.22s ease;
}

.btn-floating-corner-guide svg {
  color: #10b981;
}

.btn-floating-corner-guide:hover {
  background: var(--bg-card-hover, rgba(51, 65, 85, 0.9));
  border-color: #10b981;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
  color: #10b981;
}

/* Strict minimize & hide rules */
.how-to-use-section.is-minimized .how-to-use-body {
  display: none !important;
}

.how-to-use-section.is-hidden {
  display: none !important;
}
"""

with open("css/styles.css", "a", encoding="utf-8") as f:
    f.write("\n" + corner_css)

print("Appended corner button styles and strict display rules to css/styles.css")

