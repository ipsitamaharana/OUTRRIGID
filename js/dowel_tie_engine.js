/**
 * dowel_tie_engine.js
 * Design of Dowel Bars (Transverse Joints) and Tie Bars (Longitudinal Joints)
 * Conforming to IRC:58:2015 Clauses & Guidelines (Slides 60-65).
 */

class JointDesignEngine {
  constructor(data = IRC58_DATA) {
    this.data = data;
  }

  /**
   * Recommend Dowel Bar Dimensions based on slab thickness
   * @param {number} slabThicknessMm
   */
  getDowelBarRecommendation(slabThicknessMm) {
    const table = this.data.dowelBarTable;
    if (slabThicknessMm < 200) {
      return {
        applicable: false,
        message: "Dowel bars are not recommended for slab thickness less than 200 mm."
      };
    }

    let match = table[0];
    for (let i = 0; i < table.length; i++) {
      if (slabThicknessMm >= table[i].slabThickness) {
        match = table[i];
      }
    }

    return {
      applicable: true,
      diameterMm: match.diameter,
      lengthMm: match.length,
      spacingMm: match.spacing,
      jointWidthContractionMm: 5,
      jointWidthExpansionMm: 20,
      steelModulusE: 200000 // MPa
    };
  }

  /**
   * Design Tie Bars for Longitudinal Joints (IRC:58:2015 Slides 63-65)
   * @param {number} laneWidthM - Lane width (m), default 3.5
   * @param {number} slabThicknessMm - Slab thickness (mm), e.g. 310
   * @param {number} gamma - Concrete unit weight (kN/m3), default 24
   * @param {number} frictionCoeff - Friction factor f, default 1.5
   * @param {number} barDiaMm - Bar diameter (mm), default 12 or 16
   * @param {string} barType - 'deformed' or 'plain'
   */
  designTieBars(params) {
    const b = params.laneWidthM || 3.5;
    const h = (params.slabThicknessMm || 310) / 1000; // in meters
    const gamma = params.gamma || 24.0;
    const f = params.frictionCoeff || 1.5;
    const barType = params.barType || "deformed";
    const d = params.barDiaMm || (params.slabThicknessMm >= 300 ? 16 : 12);

    // Weight of slab W in kN/m2
    const W = gamma * h;

    // Working stress S_st (MPa)
    const Sst = barType === "deformed" ? 200 : 125;

    // Bond stress B* (MPa)
    const Bstar = barType === "deformed" ? 2.46 : 1.75;

    // Required area of steel per meter of joint (mm2/m): As = (b * f * W * 1000) / Sst
    // Note: W is in kN/m2, so multiplying by 1000 gives N/m2.
    // Force per meter = b * f * (W * 1000) N/m
    // As = Force / Sst
    const totalForcePerMeter = b * f * W * 1000; // N/m
    const AsRequired = totalForcePerMeter / Sst; // mm2/m

    // Area of single bar: Acs = pi * d^2 / 4
    const Acs = (Math.PI * Math.pow(d, 2)) / 4;

    // Spacing of tie bars = (1000 * Acs) / AsRequired
    let calculatedSpacing = (1000 * Acs) / AsRequired;
    // IRC limit: spacing should not exceed 750 mm (Slide 65)
    const maxPermittedSpacing = 750;
    const providedSpacing = Math.min(Math.floor(calculatedSpacing / 10) * 10, maxPermittedSpacing);

    // Minimum Length of Tie Bar: L = (2 * Sst * Acs) / (B* * Pptb) + placement allowance (50-80mm)
    // Pptb = pi * d => Acs / Pptb = d / 4 => L = (Sst * d) / (2 * B*) + allowance
    const allowance = 50; // mm
    const theoreticalLength = (Sst * d) / (2 * Bstar) + allowance;
    const providedLength = Math.ceil(theoreticalLength / 10) * 10;

    return {
      laneWidthM: b,
      slabThicknessMm: params.slabThicknessMm,
      slabWeightKnm2: Math.round(W * 100) / 100,
      barType,
      barDiaMm: d,
      workingStressMpa: Sst,
      bondStressMpa: Bstar,
      areaRequiredMm2PerM: Math.round(AsRequired * 10) / 10,
      singleBarAreaMm2: Math.round(Acs * 10) / 10,
      theoreticalSpacingMm: Math.round(calculatedSpacing),
      providedSpacingMm: providedSpacing,
      theoreticalLengthMm: Math.round(theoreticalLength),
      providedLengthMm: providedLength,
      codeLimitNotes: "Spacing capped at maximum 750 mm as per IRC:58 guidelines to prevent stress concentration."
    };
  }
}

// Attach to window
if (typeof window !== "undefined") {
  window.JointDesignEngine = JointDesignEngine;
}
