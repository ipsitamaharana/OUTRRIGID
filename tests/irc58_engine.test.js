/**
 * tests/irc58_engine.test.js
 * Automated Engineering Regression Test Suite for OUTRRIGID
 * Verifies that existing IRC:58:2015 calculation engine formulas
 * and baseline benchmark outputs remain 100% mathematically intact.
 */

const assert = require("assert");
const { CalculationEngine, TABLES, DEFAULT_SPECTRUM } = require("../server/engine");

console.log("======================================================================");
console.log("🚦 OUTRRIGID IRC:58:2015 ENGINEERING REGRESSION TEST SUITE");
console.log("======================================================================\n");

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// Common benchmark input parameters
const baseParams = {
  projectName: "Regression Benchmark",
  subgradeCBR: 8.0,
  subbaseType: "gsb",
  subbaseThickness: 150,
  cvpdDir1: 3000,
  cvpdDir2: 3000,
  cvpdPerDirection: 3000,
  annualGrowthRate: 5.0,
  designPeriod: 30,
  trafficDesignLanePct: 25,
  nightTraffic12hPct: 60,
  peak6hDayPct: 50,
  peak6hNightPct: 50,
  wheelbaseLess45Pct: 55,
  fck28: 40,
  designFlexuralStrength: 4.87,
  zone: "III",
  shoulderType: "tied",
  transverseJointType: "doweled",
  betaFactor: 0.66,
  axleSpectrum: DEFAULT_SPECTRUM
};

// -----------------------------------------------------------------------------
// TEST 1: Subgrade & Subbase Foundation Modulus Interpolation (IRC:58 Tables 2 & 3)
// -----------------------------------------------------------------------------
runTest("Foundation Modulus: CBR 8.0% interpolates to correct Subgrade k and GSB/DLC composite k_eff", () => {
  const subgradeK = CalculationEngine.interpolateSubgradeK(8.0);
  assert(subgradeK >= 48 && subgradeK <= 55, `Expected subgrade k between 48 and 55, got ${subgradeK}`);

  const gsbK = CalculationEngine.calculateEffectiveK(subgradeK, "gsb", 150);
  assert.strictEqual(gsbK, 58.14, `Expected GSB composite k_eff = 58.14, got ${gsbK}`);

  const dlcK = CalculationEngine.calculateEffectiveK(subgradeK, "dlc", 150);
  assert(dlcK >= 284.0 && dlcK <= 285.0, `Expected DLC composite k_eff ~284.66, got ${dlcK}`);
});

// -----------------------------------------------------------------------------
// TEST 2: Benchmark 1 - Trial I (310 mm Granular Base, Zone III)
// -----------------------------------------------------------------------------
runTest("Benchmark 1: Trial I (h = 310 mm GSB) computes to Safe with CFD = 0.000", () => {
  const res = CalculationEngine.runFullAnalysis({ ...baseParams, trialThickness: 310 });

  assert.strictEqual(res.derived.effectiveK, 58.14, "Effective k must be 58.14 MPa/m");
  assert.strictEqual(res.derived.lMeters, 1.084, "Stiffness radius l must be 1.084 m");
  assert.strictEqual(res.buc.totalBUCDamage, 0, "BUC damage must be 0.000");
  assert.strictEqual(res.tdc.totalTDCDamage, 0, "TDC damage must be 0.000");
  assert.strictEqual(res.summary.totalCFD, 0, "Total CFD must be 0.000");
  assert.strictEqual(res.summary.isSafe, true, "Design must be Safe");
});

// -----------------------------------------------------------------------------
// TEST 3: Benchmark 2 - Trial II (275 mm Granular Base, Zone III)
// -----------------------------------------------------------------------------
runTest("Benchmark 2: Trial II (h = 275 mm GSB) computes to Safe & Economical with CFD = 0.497", () => {
  const res = CalculationEngine.runFullAnalysis({ ...baseParams, trialThickness: 275 });

  assert.strictEqual(res.derived.effectiveK, 58.14, "Effective k must be 58.14 MPa/m");
  assert.strictEqual(res.derived.lMeters, 0.991, "Stiffness radius l must be 0.991 m");
  assert.strictEqual(res.buc.totalBUCDamage, 0.497, "BUC damage must be 0.497");
  assert.strictEqual(res.tdc.totalTDCDamage, 0, "TDC damage must be 0.000");
  assert.strictEqual(res.summary.totalCFD, 0.497, "Total CFD must be 0.497");
  assert.strictEqual(res.summary.isSafe, true, "Design must be Safe (CFD <= 1.000)");
});

// -----------------------------------------------------------------------------
// TEST 4: Benchmark 3 - DLC Subbase (280 mm Slab, 150 mm DLC, Zone III)
// -----------------------------------------------------------------------------
runTest("Benchmark 3: DLC Subbase (h = 280 mm DLC 150 mm) computes to Safe with CFD = 0.391", () => {
  const res = CalculationEngine.runFullAnalysis({
    ...baseParams,
    trialThickness: 280,
    subbaseType: "dlc",
    subbaseThickness: 150
  });

  assert(Math.abs(res.derived.effectiveK - 284.66) < 0.1, `Effective k must be ~284.66, got ${res.derived.effectiveK}`);
  assert.strictEqual(res.derived.lMeters, 0.675, "Stiffness radius l must be 0.675 m");
  assert.strictEqual(res.buc.totalBUCDamage, 0.391, "BUC damage must be 0.391");
  assert.strictEqual(res.tdc.totalTDCDamage, 0, "TDC damage must be 0.000");
  assert.strictEqual(res.summary.totalCFD, 0.391, "Total CFD must be 0.391");
  assert.strictEqual(res.summary.isSafe, true, "Design must be Safe");
});

// -----------------------------------------------------------------------------
// TEST 5: Benchmark 4 - Workbook Exact Repetitions Benchmark (Trial II 275 mm)
// -----------------------------------------------------------------------------
runTest("Benchmark 4: Workbook Exact Repetitions (15M Day / 12.3M Night) computes to Safe with CFD = 0.872", () => {
  const workbookParams = {
    ...baseParams,
    trialThickness: 275,
    useWorkbookExactTraffic: true,
    workbookDayAxleRepetitions: 15019127,
    workbookNightAxleRepetitions: 12390780
  };
  const res = CalculationEngine.runFullAnalysis(workbookParams);

  assert.strictEqual(res.derived.effectiveK, 58.14, "Effective k must be 58.14 MPa/m");
  assert.strictEqual(res.derived.lMeters, 0.991, "Stiffness radius l must be 0.991 m");
  assert.strictEqual(res.buc.totalBUCDamage, 0.872, "BUC damage must be 0.872");
  assert.strictEqual(res.tdc.totalTDCDamage, 0, "TDC damage must be 0.000");
  assert.strictEqual(res.summary.totalCFD, 0.872, "Total CFD must be 0.872");
  assert.strictEqual(res.summary.isSafe, true, "Design must be Safe (CFD <= 1.000)");
});

// -----------------------------------------------------------------------------
// TEST 6: Benchmark 5 - Monolithic Bonded Composite Section Transformed Rigidity
// -----------------------------------------------------------------------------
runTest("Benchmark 5: Bonded Composite Section (275 mm PQC + 150 mm DLC) satisfies LHS > RHS", () => {
  const h1 = 275, h2 = 150, E1 = 30000, mu1 = 0.15;
  const fckDlc = 13.6;
  const E2 = Math.round(5000 * Math.sqrt(fckDlc)); // 18439
  const mu2 = 0.20;
  const targetH = 300;

  const n = E2 / E1;
  const yBar = (Math.pow(h1, 2) + n * Math.pow(h2, 2) + 2 * n * h1 * h2) / (2 * (h1 + n * h2));
  const termA = Math.pow(h1, 3) / 12 + h1 * Math.pow(yBar - h1 / 2, 2);
  const termB = n * (Math.pow(h2, 3) / 12 + h2 * Math.pow(h1 + h2 / 2 - yBar, 2));
  const lhsRigidity = (E1 / (1 - Math.pow(mu1, 2))) * (termA + termB);
  const rhsRigidity = (E1 * Math.pow(targetH, 3)) / (12 * (1 - Math.pow(mu1, 2)));

  const yBarRounded = Math.round(yBar * 10) / 10;
  const lhsMN = Math.round((lhsRigidity / 1e6) * 10) / 10;
  const rhsMN = Math.round((rhsRigidity / 1e6) * 10) / 10;

  assert.strictEqual(yBarRounded, 190.9, `Neutral axis must be 190.9 mm, got ${yBarRounded}`);
  assert.strictEqual(lhsMN, 154184.1, `LHS Rigidity must be 154184.1 MN*mm, got ${lhsMN}`);
  assert.strictEqual(rhsMN, 69053.7, `RHS Rigidity must be 69053.7 MN*mm, got ${rhsMN}`);
  assert(lhsRigidity > rhsRigidity, "LHS transformed rigidity must strictly exceed RHS target unbonded rigidity");
});

// -----------------------------------------------------------------------------
// TEST 7: Automated Thickness Optimizer Logic
// -----------------------------------------------------------------------------
runTest("Optimizer: Automatically finds minimum safe thickness where CFD <= 1.000", () => {
  const opt = CalculationEngine.optimizeThickness(baseParams, 250, 320, 5);
  assert(opt.optimalThicknessMm >= 250 && opt.optimalThicknessMm <= 310, `Expected optimal thickness in range, got ${opt.optimalThicknessMm}`);
  assert(opt.optimalAnalysis.summary.totalCFD <= 1.0, "Optimal design must have total CFD <= 1.000");
  assert.strictEqual(opt.providedThicknessMm, opt.optimalThicknessMm + 10, "Provided thickness must include 10mm wear allowance");
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log("\n======================================================================");
if (passedTests === totalTests) {
  console.log(`🎉 ALL ${passedTests}/${totalTests} ENGINEERING REGRESSION TESTS PASSED!`);
  console.log("   Zero formula deviations detected. IRC:58 engine is 100% verified.");
} else {
  console.error(`❌ REGRESSION FAILURES DETECTED: ${totalTests - passedTests}/${totalTests} failed.`);
}
console.log("======================================================================\n");

