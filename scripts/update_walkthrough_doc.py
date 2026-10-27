with open("WALKTHROUGH.md", "r", encoding="utf-8") as f:
    text = f.read()

target = "### 5.8 Quick-Start Workflow Guide (\"How to Use This Application\")"
idx = text.find(target)

if idx != -1:
    before = text[:idx]
    new_section = """### 5.8 Quick-Start Workflow Guide ("How to Use This Application")

To ensure all highway engineers and structural designers can immediately understand and operate the platform with zero friction, a dedicated **Quick-Start Workflow Guide** has been positioned at the **very end ("at last")** of the application, paired with an unobtrusive **corner access button** in the top-right header and a floating corner pill.

#### Key Design & Placement Updates:
1. **Corner Placement (Unobtrusive & Accessible)**:
   - The *How to Use* option was moved from the center executive bar and placed cleanly in the **top-right corner** of the header (next to the theme toggle), as well as a persistent **floating corner action pill** in the bottom-right.
   - Clicking either corner button smoothly scrolls down to the guide without popping up duplicate sections or altering active workspaces.
2. **Placed at the Very Last ("At Last")**:
   - The guide is situated at the bottom of the page container, outside individual workspace tabs, ensuring all 4 engineering workspaces remain completely uncluttered.
3. **Flawless Interactive Controls**:
   - **`^ Minimize` / `v Expand`**: Collapses the 4 step cards into a sleek, minimal header strip, saving vertical space while keeping the quick reference right at hand.
   - **`× Hide`**: Completely hides the guide. Clicking *How to Use* in either corner instantly restores and smoothly scrolls to it.
4. **4 Clear Sequential Steps**:
   - **Step 01 &bull; Select Location & Regional Climate**: Select your Indian State or UT in the Location bar. Automatically maps Climatic Zone (I–VII), daytime curling differential (+16.8°C), nighttime warping differential (-13.4°C), and subgrade CBR (8%).
   - **Step 02 &bull; Pick a Design Scenario or Baseline**: Use the *Design Scenarios ▾* dropdown to instantly load standard baselines (Trial I 310mm GSB, Trial II 275mm GSB, DLC Subbase 280mm, or Composite Bonded), or customize parameters in *Design Parameters*.
   - **Step 03 &bull; Adjust Slab Depth & Watch Live Response**: Fine-tune slab thickness via the numeric stepper or slider (e.g. 275 mm). The *Real-Time Structural Response Pipeline* continuously recomputes radius of relative stiffness ($l$), BUC/TDC fatigue damage, and overall safety verdict ($\Sigma\,\text{CFD} \le 1.000$).
   - **Step 04 &bull; Audit Stress Tables & Joint Details**: Switch to *Fatigue & Structural Audit* to inspect axle-by-axle stress ratios ($SR$) and customize repetitions. Review dowel bar and tie bar designs, or explore 4-option trade-offs in *Construction Variants*.
5. **Key Engineering Rules to Remember**:
   - Highlighted principles: Tied Shoulders stress reduction (~30%), Dry Lean Concrete foundation modulus ($k = 285\text{ MPa/m}$), and the Palmgren-Miner cumulative fatigue damage limit ($\Sigma\,\text{CFD} \le 1.000$).

#### Output Verification: Corner Placement & Minimized State
Below are the browser captures displaying the new corner placement, full layout, and minimized state:

![Header Corner Placement](assets/images/walkthrough/18-header-corner-how-to-use.png)
*Figure 5.8.1: Header top-right corner with the [How to Use] pill next to the theme toggle, keeping the executive bar clean.*

![Full Layout with Guide at Last](assets/images/walkthrough/19-bottom-guide-at-last.png)
*Figure 5.8.2: Full application layout with the Quick-Start Guide situated at the very last ("at last") and the floating corner pill.*

![Minimized Guide State](assets/images/walkthrough/20-guide-minimized.png)
*Figure 5.8.3: Minimized guide state collapsed into a sleek header strip with instantaneous Expand and Hide controls.*

---

### Milestone 7: Engine Harmonization & Inconsistency Elimination (Completed)
- [x] **Identified Root Cause**: Isolated the hardcoded banner text and TDC/BUC stress equation discrepancies that previously led to an artificial $\Sigma\,\text{CFD} = 23.366$.
- [x] **Corrected TDC Formulation**: Re-aligned the curling and wheel load terms with standard IRC:58 formulations ($l^2$ multiplication and whole-expression $\beta$ scaling).
- [x] **Standardized Design Flexural Strength**: Updated preset parameters to use 90-day design flexural strength $f_{cr} = 4.87\text{ MPa}$ and Zone III $\Delta T_{\text{night}} = 13.4^\circ\text{C}$.
- [x] **Fully Synchronized Indicators**: Ensured both the top verdict pill and the lower safety card dynamically read `cfd <= 1.000` so they never contradict each other.
- [x] **Verified Zero Red Bar on Safe Presets**: Verified that Trial II ($h = 275\text{ mm}$) cleanly renders as Safe Design with an 85.3% green/teal capacity fill.

---

### Milestone 8: Quick-Start Workflow Guide Integration & Corner Positioning (Completed)
- [x] **Eliminated All Duplicates**: Removed the accidental multiple copies from the individual workspaces, leaving exactly one pristine instance at the very end of the page.
- [x] **Repositioned to Corner**: Relocated the "How to Use" button to the top-right corner of the header and added a floating action pill in the bottom-right corner.
- [x] **Placed Guide at Last**: Moved the guide outside workspace panes to the very end of the page container.
- [x] **Fixed Minimize & Hide Controls**: Prevented double-event bubbling so Minimize, Expand, and Hide function instantaneously.
- [x] **Smooth-Scroll Without Popups**: Configured the corner button to smoothly scroll to the existing section without creating or popping up any duplicate cards.

---

## 8. Roadmap & Planned Next Steps
"""
    # Find next section or replace to end
    end_marker = "## 8. Roadmap & Planned Next Steps"
    end_idx = text.find(end_marker)
    if end_idx != -1:
        text = before + new_section + text[end_idx + len(end_marker):]
    else:
        text = before + new_section

    with open("WALKTHROUGH.md", "w", encoding="utf-8") as f:
        f.write(text)
    print("Updated WALKTHROUGH.md successfully")
else:
    print("Could not find target in WALKTHROUGH.md")

