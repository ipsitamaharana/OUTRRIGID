/**
 * visualizer.js
 * Interactive canvas and SVG animations for JPCP stress analysis:
 * 1. Animated Pavement Slab Curling (Daytime BUC vs Nighttime TDC)
 * 2. Dynamic Pavement Cross-Section Scaled Schematic
 * Seamlessly adapts to Light and Dark themes.
 */

class PavementVisualizer {
  constructor(canvasId, crossSectionSvgId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.svgContainer = document.getElementById(crossSectionSvgId);
    this.mode = "day"; // "day" (BUC) or "night" (TDC)
    this.animationFrameId = null;
    this.phase = 0;
    this.curlExaggeration = 1.0;
    this.isPlaying = true;
    this.currentData = null;

    if (this.canvas) {
      this.resizeCanvas();
      window.addEventListener("resize", () => this.resizeCanvas());
      this.startAnimation();
    }
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * (window.devicePixelRatio || 1);
    this.canvas.height = 320 * (window.devicePixelRatio || 1);
    this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }

  setMode(mode) {
    this.mode = mode;
  }

  updateData(analysisResult) {
    this.currentData = analysisResult;
    this.renderCrossSection();
  }

  startAnimation() {
    const render = () => {
      this.phase += 0.025;
      this.drawCurlingCanvas();
      if (this.isPlaying) {
        this.animationFrameId = requestAnimationFrame(render);
      }
    };
    render();
  }

  isDarkTheme() {
    return document.documentElement.classList.contains("dark-theme");
  }

  drawCurlingCanvas() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);
    const isDark = this.isDarkTheme();

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Canvas Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (!isDark) {
      if (this.mode === "day") {
        bgGrad.addColorStop(0, "#f8fafc");
        bgGrad.addColorStop(1, "#f1f5f9");
      } else {
        bgGrad.addColorStop(0, "#f1f5f9");
        bgGrad.addColorStop(1, "#e2e8f0");
      }
    } else {
      if (this.mode === "day") {
        bgGrad.addColorStop(0, "rgba(24, 24, 24, 0.95)");
        bgGrad.addColorStop(1, "rgba(32, 32, 32, 0.95)");
      } else {
        bgGrad.addColorStop(0, "rgba(20, 20, 20, 0.95)");
        bgGrad.addColorStop(1, "rgba(26, 26, 26, 1.0)");
      }
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Coordinate settings
    const slabMarginX = 65;
    const slabWidth = width - slabMarginX * 2;
    const slabBaseY = height * 0.58;
    const slabThickness = 34;

    // Foundation line & springs
    const subgradeY = slabBaseY + slabThickness + 10;
    ctx.strokeStyle = isDark ? "rgba(71, 85, 105, 0.5)" : "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(slabMarginX - 25, subgradeY + 15);
    ctx.lineTo(width - slabMarginX + 25, subgradeY + 15);
    ctx.stroke();

    // Winkler foundation springs
    const numSprings = 14;
    const springSpacing = slabWidth / (numSprings - 1);
    for (let i = 0; i < numSprings; i++) {
      const sx = slabMarginX + i * springSpacing;
      this.drawWinklerSpring(ctx, sx, slabBaseY + slabThickness, subgradeY + 15, isDark);
    }

    // Slab Curling Profile
    const segments = 60;
    const isDay = this.mode === "day";
    const curlSign = isDay ? -1 : 1; // -1: convex, +1: concave
    const curlAmplitude = (isDay ? 14 : 18) * this.curlExaggeration;
    const bounce = Math.sin(this.phase * 2) * 2;

    ctx.save();

    // Generate upper and lower path points
    const topPoints = [];
    const botPoints = [];
    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const x = slabMarginX + u * slabWidth;
      const normalizedPos = (u - 0.5) * 2;
      const curlOffset = curlSign * curlAmplitude * (Math.pow(normalizedPos, 2) - 0.5) + (isDay ? bounce * (1 - Math.abs(normalizedPos)) : 0);
      const yTop = slabBaseY + curlOffset;
      const yBot = yTop + slabThickness;
      topPoints.push({ x, y: yTop });
      botPoints.push({ x, y: yBot });
    }

    // Draw Concrete Slab body
    ctx.beginPath();
    ctx.moveTo(topPoints[0].x, topPoints[0].y);
    for (let i = 1; i < topPoints.length; i++) {
      ctx.lineTo(topPoints[i].x, topPoints[i].y);
    }
    for (let i = botPoints.length - 1; i >= 0; i--) {
      ctx.lineTo(botPoints[i].x, botPoints[i].y);
    }
    ctx.closePath();

    // Internal stress color gradient inside slab
    const slabGrad = ctx.createLinearGradient(0, slabBaseY - 20, 0, slabBaseY + slabThickness + 20);
    if (isDay) {
      // BUC: Top is in compression (blue), bottom is high tension (coral/red)
      slabGrad.addColorStop(0, isDark ? "rgba(56, 189, 248, 0.75)" : "rgba(2, 132, 199, 0.75)");
      slabGrad.addColorStop(0.5, isDark ? "rgba(148, 163, 184, 0.85)" : "rgba(203, 213, 225, 0.9)");
      slabGrad.addColorStop(1, isDark ? "rgba(244, 63, 94, 0.85)" : "rgba(225, 29, 72, 0.85)");
    } else {
      // TDC: Top is in high tension (coral/red), bottom is in compression (blue)
      slabGrad.addColorStop(0, isDark ? "rgba(239, 68, 68, 0.85)" : "rgba(225, 29, 72, 0.85)");
      slabGrad.addColorStop(0.5, isDark ? "rgba(148, 163, 184, 0.85)" : "rgba(203, 213, 225, 0.9)");
      slabGrad.addColorStop(1, isDark ? "rgba(56, 189, 248, 0.75)" : "rgba(2, 132, 199, 0.75)");
    }
    ctx.fillStyle = slabGrad;
    ctx.fill();

    // Slab outline
    ctx.strokeStyle = isDay ? "#0284c7" : "#e11d48";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw Neutral Axis (dashed line)
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(15, 23, 42, 0.4)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= segments; i++) {
      const mx = (topPoints[i].x + botPoints[i].x) / 2;
      const my = (topPoints[i].y + botPoints[i].y) / 2;
      if (i === 0) ctx.moveTo(mx, my);
      else ctx.lineTo(mx, my);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Transverse joint indicators at slab edges
    ctx.strokeStyle = "#d97706";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(slabMarginX, topPoints[0].y - 12);
    ctx.lineTo(slabMarginX, botPoints[0].y + 12);
    ctx.moveTo(width - slabMarginX, topPoints[topPoints.length - 1].y - 12);
    ctx.lineTo(width - slabMarginX, botPoints[botPoints.length - 1].y + 12);
    ctx.stroke();

    // Wheel Load Position & Animated Axles
    if (isDay) {
      const midIdx = Math.floor(segments / 2);
      const loadX = topPoints[midIdx].x;
      const loadY = topPoints[midIdx].y;
      this.drawWheelLoad(ctx, loadX, loadY, "Midway Edge Load (BUC Critical)", "#e11d48", "Day Axle Load P", isDark);

      const botX = botPoints[midIdx].x;
      const botY = botPoints[midIdx].y;
      this.drawStressMarker(ctx, botX, botY + 8, "MAX TENSILE STRESS (BOTTOM-UP CRACKING)", "#e11d48", true, isDark);
    } else {
      const leftIdx = Math.floor(segments * 0.12);
      const rightIdx = Math.floor(segments * 0.88);

      const load1X = topPoints[leftIdx].x;
      const load1Y = topPoints[leftIdx].y;
      this.drawWheelLoad(ctx, load1X, load1Y, "Approaching Joint", "#0284c7", "Front Axle", isDark);

      const load2X = topPoints[rightIdx].x;
      const load2Y = topPoints[rightIdx].y;
      this.drawWheelLoad(ctx, load2X, load2Y, "Trailing Joint", "#e11d48", "Rear Axle P", isDark);

      const midIdx = Math.floor(segments / 2);
      const topX = topPoints[midIdx].x;
      const topY = topPoints[midIdx].y;
      this.drawStressMarker(ctx, topX, topY - 10, "MAX TENSILE STRESS (TOP-DOWN CRACKING)", "#e11d48", false, isDark);
    }

    // Overlay Temperature Differential Badge
    const dayText = this.currentData ? `Day Temp Diff: +${this.currentData.derived.dayDeltaT}°C` : "Day Temp Diff: +16.8°C";
    const nightText = this.currentData ? `Night Temp Diff: -${this.currentData.derived.nightDeltaT}°C (incl. 5°C curl)` : "Night Temp Diff: -13.4°C";
    const titleText = isDay ? "DAYTIME POSITIVE GRADIENT" : "NIGHTTIME NEGATIVE GRADIENT";
    const subtitleText = isDay ? dayText : nightText;

    ctx.font = "700 12.5px 'Plus Jakarta Sans', sans-serif";
    const titleW = ctx.measureText(titleText).width;
    ctx.font = "500 11.5px 'JetBrains Mono', monospace";
    const subW = ctx.measureText(subtitleText).width;
    const badgeW = Math.max(280, Math.ceil(Math.max(titleW, subW)) + 26);
    const badgeH = 50;

    ctx.fillStyle = isDark
      ? (isDay ? "rgba(234, 88, 12, 0.16)" : "rgba(14, 116, 144, 0.2)")
      : (isDay ? "rgba(255, 237, 213, 0.92)" : "rgba(224, 242, 254, 0.92)");
    ctx.strokeStyle = isDark
      ? (isDay ? "rgba(251, 146, 60, 0.6)" : "rgba(56, 189, 248, 0.6)")
      : (isDay ? "#ea580c" : "#0284c7");
    ctx.lineWidth = 1;
    this.roundRect(ctx, 16, 16, badgeW, badgeH, 8, true, true);

    ctx.fillStyle = isDark ? "#ffffff" : "#0f172a";
    ctx.font = "700 12.5px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(titleText, 26, 35);

    ctx.fillStyle = isDark
      ? (isDay ? "#fb923c" : "#38bdf8")
      : (isDay ? "#c2410c" : "#0284c7");
    ctx.font = "500 11.5px 'JetBrains Mono', monospace";
    ctx.fillText(subtitleText, 26, 52);

    ctx.restore();
  }

  drawWinklerSpring(ctx, x, topY, botY, isDark) {
    ctx.save();
    ctx.strokeStyle = isDark ? "rgba(100, 116, 139, 0.6)" : "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, topY);
    const height = botY - topY;
    const coils = 4;
    const coilH = height / (coils * 2);
    const amp = 4;
    for (let i = 0; i < coils * 2; i++) {
      const cy = topY + (i + 1) * coilH;
      const cx = x + (i % 2 === 0 ? amp : -amp);
      ctx.lineTo(cx, cy);
    }
    ctx.lineTo(x, botY);
    ctx.stroke();

    // Ground hatch
    ctx.beginPath();
    ctx.moveTo(x - 6, botY);
    ctx.lineTo(x + 6, botY);
    ctx.stroke();
    ctx.restore();
  }

  drawWheelLoad(ctx, x, y, label, color, subtitle, isDark) {
    ctx.save();
    ctx.fillStyle = isDark ? "#1e293b" : "#ffffff";
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y - 24, 12, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y - 24, 4, 0, Math.PI * 2);
    ctx.fill();

    // Downward Arrow
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y - 60);
    ctx.lineTo(x, y - 48);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y - 46);
    ctx.lineTo(x - 5, y - 53);
    ctx.lineTo(x + 5, y - 53);
    ctx.closePath();
    ctx.fill();

    // Label pill
    ctx.fillStyle = isDark ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)";
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    this.roundRect(ctx, x - 55, y - 86, 110, 22, 6, true, true);

    ctx.fillStyle = isDark ? "#ffffff" : "#0f172a";
    ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(subtitle, x, y - 71);

    ctx.restore();
  }

  drawStressMarker(ctx, x, y, text, color, isBottom, isDark) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    const pulse = Math.sin(this.phase * 3) * 3;
    ctx.beginPath();
    ctx.arc(x, y + (isBottom ? 8 : -8), 5 + pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y + (isBottom ? 8 : -8), 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Tag pill
    ctx.fillStyle = isDark ? "rgba(15, 23, 42, 0.92)" : "#ffffff";
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    const tagY = isBottom ? y + 26 : y - 36;
    this.roundRect(ctx, x - 130, tagY, 260, 22, 5, true, true);

    ctx.fillStyle = color;
    ctx.font = "bold 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(text, x, tagY + 15);

    ctx.restore();
  }

  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  /**
   * Renders dynamic SVG cross-section of pavement layers
   */
  renderCrossSection() {
    if (!this.svgContainer) return;
    const isDark = this.isDarkTheme();
    const h = this.currentData ? this.currentData.inputs.trialThickness : 310;
    const subbaseT = this.currentData ? this.currentData.inputs.subbaseThickness : 150;
    const subbaseName = this.currentData && this.currentData.inputs.subbaseType === "dlc" ? "Dry Lean Concrete (DLC)" : "Granular Subbase (GSB)";

    const pqcColor = isDark ? "#38bdf8" : "#0284c7";
    const textColor = isDark ? "#ffffff" : "#0f172a";

    const svg = `
      <svg viewBox="0 0 740 340" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pqcGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${pqcColor}" stop-opacity="${isDark ? 0.35 : 0.2}"/>
            <stop offset="100%" stop-color="${pqcColor}" stop-opacity="${isDark ? 0.6 : 0.4}"/>
          </linearGradient>
          <linearGradient id="shoulderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0284c7" stop-opacity="0.15"/>
            <stop offset="100%" stop-color="#0369a1" stop-opacity="0.3"/>
          </linearGradient>
          <linearGradient id="gsbGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#eab308" stop-opacity="${isDark ? 0.3 : 0.2}"/>
            <stop offset="100%" stop-color="#ca8a04" stop-opacity="${isDark ? 0.5 : 0.35}"/>
          </linearGradient>
          <linearGradient id="subgradeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#64748b" stop-opacity="${isDark ? 0.4 : 0.15}"/>
            <stop offset="100%" stop-color="#334155" stop-opacity="${isDark ? 0.8 : 0.3}"/>
          </linearGradient>
          <pattern id="concreteHatch" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="5" r="1.2" fill="${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)"}"/>
            <circle cx="15" cy="15" r="1.5" fill="${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)"}"/>
          </pattern>
        </defs>

        <!-- Main Carriageway PQC Slab -->
        <rect x="70" y="40" width="420" height="75" rx="3" fill="url(#pqcGrad)" stroke="${pqcColor}" stroke-width="2"/>
        <rect x="70" y="40" width="420" height="75" rx="3" fill="url(#concreteHatch)"/>

        <!-- Tied Concrete Shoulder -->
        <rect x="495" y="40" width="180" height="75" rx="3" fill="url(#shoulderGrad)" stroke="${pqcColor}" stroke-width="1.5" stroke-dasharray="4,2"/>
        <rect x="495" y="40" width="180" height="75" rx="3" fill="url(#concreteHatch)"/>

        <!-- Tie Bar connecting Slab and Tied Shoulder -->
        <rect x="440" y="72" width="110" height="6" rx="3" fill="#fbbf24" stroke="#d97706" stroke-width="1"/>
        <text x="495" y="66" fill="#b45309" font-size="11" font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold" text-anchor="middle">Tie Bar Ø16 @ 600mm</text>

        <!-- Longitudinal Joint Line -->
        <line x1="492" y1="35" x2="492" y2="120" stroke="#d97706" stroke-width="2" stroke-dasharray="3,3"/>

        <!-- Polythene Separation Membrane Layer -->
        <line x1="70" y1="117" x2="675" y2="117" stroke="#ec4899" stroke-width="2.5"/>
        <text x="380" y="130" fill="#db2777" font-size="10.5" font-family="'JetBrains Mono', monospace" text-anchor="middle">Debonding Layer: 125 Micron Polythene Sheet</text>

        <!-- Granular Subbase (GSB) Layer -->
        <rect x="70" y="138" width="605" height="50" rx="3" fill="url(#gsbGrad)" stroke="#ca8a04" stroke-width="1.5"/>

        <!-- Subgrade Layer -->
        <rect x="70" y="192" width="605" height="90" rx="3" fill="url(#subgradeGrad)" stroke="#64748b" stroke-width="1.5"/>

        <!-- Dimension Callouts -->
        <!-- PQC Slab Thickness -->
        <line x1="45" y1="40" x2="45" y2="115" stroke="${pqcColor}" stroke-width="1.5"/>
        <path d="M 45 40 L 41 48 M 45 40 L 49 48 M 45 115 L 41 107 M 45 115 L 49 107" stroke="${pqcColor}" stroke-width="1.5"/>
        <text x="35" y="82" fill="${pqcColor}" font-size="12" font-family="'JetBrains Mono', monospace" font-weight="bold" text-anchor="end">${h} mm</text>

        <!-- GSB Thickness -->
        <line x1="45" y1="138" x2="45" y2="188" stroke="#ca8a04" stroke-width="1.5"/>
        <path d="M 45 138 L 41 144 M 45 138 L 49 144 M 45 188 L 41 182 M 45 188 L 49 182" stroke="#ca8a04" stroke-width="1.5"/>
        <text x="35" y="166" fill="#ca8a04" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="bold" text-anchor="end">${subbaseT} mm</text>

        <!-- Subgrade 500mm -->
        <line x1="45" y1="192" x2="45" y2="282" stroke="#64748b" stroke-width="1.5"/>
        <path d="M 45 192 L 41 198 M 45 192 L 49 198 M 45 282 L 41 276 M 45 282 L 49 276" stroke="#64748b" stroke-width="1.5"/>
        <text x="35" y="242" fill="#64748b" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="bold" text-anchor="end">500 mm</text>

        <!-- Layer Labels -->
        <text x="280" y="82" fill="${textColor}" font-size="13" font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold" text-anchor="middle">PQC SLAB (Pavement Quality Concrete - M40)</text>
        <text x="585" y="82" fill="${isDark ? "#bae6fd" : "#0369a1"}" font-size="12" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" text-anchor="middle">TIED SHOULDER</text>
        <text x="372" y="168" fill="${isDark ? "#fef08a" : "#854d0e"}" font-size="12" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" text-anchor="middle">${subbaseName.toUpperCase()} (${subbaseT} mm)</text>
        <text x="372" y="242" fill="${textColor}" font-size="12" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" text-anchor="middle">COMPACTED SUBGRADE (500 mm Select Soil, CBR ≥ 8%)</text>

        <!-- Width Callout -->
        <line x1="70" y1="20" x2="490" y2="20" stroke="#94a3b8" stroke-width="1"/>
        <text x="280" y="14" fill="#64748b" font-size="11" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" text-anchor="middle">Lane Width = 3.5 m</text>
        <line x1="495" y1="20" x2="675" y2="20" stroke="#94a3b8" stroke-width="1"/>
        <text x="585" y="14" fill="#64748b" font-size="11" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" text-anchor="middle">Tied Shoulder = 1.5 m</text>
      </svg>
    `;
    this.svgContainer.innerHTML = svg;
  }
}

if (typeof window !== "undefined") {
  window.PavementVisualizer = PavementVisualizer;
}
