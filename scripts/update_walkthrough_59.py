with open("WALKTHROUGH.md", "r", encoding="utf-8") as f:
    text = f.read()

target = "### Milestone 8: Quick-Start Workflow Guide Integration & Corner Positioning (Completed)"
idx = text.find(target)

if idx != -1:
    before = text[:idx]
    after = text[idx:]

    sec_59 = """### 5.9 Spatial Balancing of the Trial Slab Thickness Controller

To resolve button cramping where secondary options were squeezed into a narrow card header, the **Trial Slab Thickness Controller** was spatially re-engineered for optimal ergonomic density:

#### Key Layout Improvements:
1. **Separation of Header & Quick Options**:
   - **Header Row**: Kept strictly for the primary card title (*Trial Slab Thickness*) and the primary action button (`⚡ Auto-Optimize`). Both now display on single lines with zero wrapping or text clipping.
   - **Dedicated Quick Options Row**: Created a spacious sub-row between the slider and construction metadata housing `[ 📄 Load DLC Preset (280mm) ]` and `[ 📖 Theory Guide ]`. Each chip receives ~180px of dedicated width with generous internal padding and crisp icons.
2. **Expanded Grid Column Width**:
   - Increased the left controller column in `.trial-hub-container` from `340px` to `minmax(380px, 410px)`, preventing any horizontal crowding while maintaining balanced proportions with the 3-stage structural response pipeline.
3. **No Text Overflow or Clipping**:
   - Added explicit `white-space: nowrap` to all buttons and chips, ensuring labels never break onto multiple awkward lines.

#### Output Verification: Spacious Trial Slab Controller
Below is the browser capture in dark theme showing the balanced, spacious layout of the controller card:

![Spacious Trial Controller](assets/images/walkthrough/23-trial-card-dark.png)
*Figure 5.9.1: The redesigned Trial Slab Thickness controller showing ample spacing for the Auto-Optimize button, numeric controls, and dedicated quick options row.*

---

"""
    new_text = before + sec_59 + after
    # Add Milestone 9 checkbox under Milestone 8
    m9 = """
---

### Milestone 9: Spatial Balancing & Ergonomic Optimization (Completed)
- [x] **Relocated Secondary Chips**: Moved *Load DLC Preset* and *Theory Guide* to a dedicated sub-row below the slider, freeing the header.
- [x] **Expanded Controller Column**: Widened the card from 340px to 380px–410px for relaxed visual density.
- [x] **Eliminated Text Wrapping & Clipping**: Added `white-space: nowrap` and balanced flex padding across all action chips.
"""
    m8_end = "- [x] **Smooth-Scroll Without Popups**: Configured the corner button to smoothly scroll to the existing section without creating or popping up any duplicate cards."
    new_text = new_text.replace(m8_end, m8_end + m9)

    with open("WALKTHROUGH.md", "w", encoding="utf-8") as f:
        f.write(new_text)
    print("WALKTHROUGH.md updated with Section 5.9 and Milestone 9")
else:
    print("Target not found in WALKTHROUGH.md")

