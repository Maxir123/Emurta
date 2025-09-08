"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * EmiCalculator (client-only)
 *
 * - Adds a Savings mode that calculates required monthly deposit to reach target
 *   (vehicle price minus down payment) in N months at a given APR (monthly compounding).
 * - Keeps original Loan (EMI) mode (years -> monthly EMI).
 * - Default term for both modes uses 12 months (Loan default 1 year).
 *
 * Props:
 * - price: number (price in NGN). Default 1_000_000
 * - vehicleId: optional id used in email subject / filename when sharing
 */
export default function EmiCalculator({ price = 1_000_000, vehicleId = null }) {
  // Mode: "loan" (EMI) or "savings"
  const [mode, setMode] = useState("savings");

  // Nigeria-tuned defaults
  const defaultDownPercent = 30;

  // Core fields
  const [loanAmount, setLoanAmount] = useState(Number(price || 1_000_000));
  const [downPayment, setDownPayment] = useState(Math.round((defaultDownPercent / 100) * (price || 1_000_000)));
  const [downPaymentPercent, setDownPaymentPercent] = useState(defaultDownPercent);

  // interest is APR for both modes; change default for savings to be lower
  const [interestRate, setInterestRate] = useState(mode === "savings" ? 10 : 30);

  // Loan tenor in YEARS (for EMI). Default 1 year => 12 months
  const [loanTenureYears, setLoanTenureYears] = useState(1);

  // Savings term in MONTHS. Default 12 months
  const [savingsMonths, setSavingsMonths] = useState(12);

  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // bounds tuned for Nigerian market
  const MIN_PRICE = 100_000;
  const MAX_PRICE = 200_000_000;
  const MIN_INTEREST = 0; // allow 0% for savings/loans
  const MAX_INTEREST = 200;
  const MIN_TENURE_YEARS = 1;
  const MAX_TENURE_YEARS = 8;
  const MIN_MONTHS = 1;
  const MAX_MONTHS = 120;

  const formatNGN = (val) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
      Math.round(Number(val) || 0)
    );

  // === Loan (EMI) calculation ===
  const calculateLoan = (principal, down, apr, years) => {
    const loanPrincipal = Number(principal) - Number(down);
    if (loanPrincipal <= 0 || years <= 0) {
      setResults(null);
      return;
    }

    const monthlyRate = Number(apr) / 100 / 12;
    const months = Number(years) * 12;

    let emi;
    if (monthlyRate === 0) emi = loanPrincipal / months;
    else
      emi =
        (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);

    const totalPayment = emi * months;
    const totalInterest = totalPayment - loanPrincipal;

    setResults({
      mode: "loan",
      emi,
      totalInterest,
      totalPayment,
      loanPrincipal,
      downPayment: down,
      months,
      apr,
      years,
    });
  };

  // === Savings calculation ===
  // Calculates monthly deposit required to reach target = loanAmount - downPayment
  // using monthly compounding and deposits made at end of period:
  // PMT = target * i / ((1+i)^n - 1)
  const calculateSavings = (targetPrice, down, apr, months) => {
    const target = Number(targetPrice) - Number(down);
    if (target <= 0 || months <= 0) {
      setResults(null);
      return;
    }

    const monthlyRate = Number(apr) / 100 / 12;
    let monthlyDeposit;
    if (monthlyRate === 0) monthlyDeposit = target / months;
    else monthlyDeposit = (target * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);

    const totalSaved = monthlyDeposit * months;
    const interestEarned = totalSaved - target;

    setResults({
      mode: "savings",
      monthlyDeposit,
      totalSaved,
      interestEarned,
      target,
      months,
      apr,
    });
  };

  // === Handlers ===
  const handleLoanAmountChange = (value) => {
    const v = Math.round(Math.min(Math.max(Number(value || 0), MIN_PRICE), MAX_PRICE));
    setLoanAmount(v);
    const pct = v ? Math.round((downPayment / v) * 100 * 10) / 10 : 0;
    setDownPaymentPercent(pct);
    if (mode === "loan") calculateLoan(v, downPayment, interestRate, loanTenureYears);
    else calculateSavings(v, downPayment, interestRate, savingsMonths);
  };

  const handleDownPaymentChange = (value) => {
    const v = Math.round(Math.min(Math.max(Number(value || 0), 0), loanAmount));
    setDownPayment(v);
    const pct = loanAmount ? Math.round((v / loanAmount) * 100 * 10) / 10 : 0;
    setDownPaymentPercent(pct);
    if (mode === "loan") calculateLoan(loanAmount, v, interestRate, loanTenureYears);
    else calculateSavings(loanAmount, v, interestRate, savingsMonths);
  };

  const handleDownPaymentPercentChange = (percent) => {
    const p = Math.min(Math.max(Number(percent || 0), 0), 100);
    setDownPaymentPercent(p);
    const dp = Math.round((p / 100) * loanAmount);
    setDownPayment(dp);
    if (mode === "loan") calculateLoan(loanAmount, dp, interestRate, loanTenureYears);
    else calculateSavings(loanAmount, dp, interestRate, savingsMonths);
  };

  const handleInterestRateChange = (value) => {
    const r = Math.min(Math.max(Number(value || 0), MIN_INTEREST), MAX_INTEREST);
    setInterestRate(r);
    if (mode === "loan") calculateLoan(loanAmount, downPayment, r, loanTenureYears);
    else calculateSavings(loanAmount, downPayment, r, savingsMonths);
  };

  const handleLoanTenureChange = (valueYears) => {
    const t = Math.min(Math.max(Number(valueYears || 1), MIN_TENURE_YEARS), MAX_TENURE_YEARS);
    setLoanTenureYears(t);
    calculateLoan(loanAmount, downPayment, interestRate, t);
  };

  const handleSavingsMonthsChange = (months) => {
    const m = Math.min(Math.max(Number(months || 1), MIN_MONTHS), MAX_MONTHS);
    setSavingsMonths(m);
    calculateSavings(loanAmount, downPayment, interestRate, m);
  };

  // mode toggle
  const switchMode = (m) => {
    setMode(m);
    // set sensible default APR and term when switching
    if (m === "savings") {
      setInterestRate((prev) => (prev <= 0 || prev > 50 ? 10 : prev)); // prefer lower APR
      setSavingsMonths((prev) => (prev ? prev : 12));
      calculateSavings(loanAmount, downPayment, interestRate <= 0 || interestRate > 50 ? 10 : interestRate, savingsMonths || 12);
    } else {
      setInterestRate((prev) => (prev <= 0 ? 30 : prev));
      setLoanTenureYears((prev) => (prev ? prev : 1));
      calculateLoan(loanAmount, downPayment, interestRate <= 0 ? 30 : interestRate, loanTenureYears || 1);
    }
  };

  // initial calc on mount or when price prop changes
  useEffect(() => {
    const p = Number(price || loanAmount);
    setLoanAmount(p);
    const dp = Math.round((downPaymentPercent / 100) * p);
    setDownPayment(dp);
    // default: savings mode with 12 months
    if (mode === "savings") {
      setSavingsMonths(12);
      setInterestRate((prev) => (prev <= 0 ? 10 : prev));
      calculateSavings(p, dp, interestRate <= 0 ? 10 : interestRate, 12);
    } else {
      setLoanTenureYears(1);
      setInterestRate((prev) => (prev <= 0 ? 30 : prev));
      calculateLoan(p, dp, interestRate <= 0 ? 30 : interestRate, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price]);

  // share helpers (client-side only)
  const planSummary = () => {
    if (!results) return null;
    if (results.mode === "loan") {
      return {
        vehicleId,
        vehiclePrice: loanAmount,
        downPayment,
        downPaymentPercent,
        interestRate,
        loanTenureYears,
        monthlyEMI: Math.round(results.emi),
        months: results.months,
        totalPayment: Math.round(results.totalPayment),
        totalInterest: Math.round(results.totalInterest),
        generatedAt: new Date().toISOString(),
      };
    } else {
      return {
        vehicleId,
        vehiclePrice: loanAmount,
        downPayment,
        downPaymentPercent,
        interestRate,
        months: results.months,
        monthlyDeposit: Math.round(results.monthlyDeposit),
        totalSaved: Math.round(results.totalSaved),
        interestEarned: Math.round(results.interestEarned),
        generatedAt: new Date().toISOString(),
      };
    }
  };

  const handleCopyPlan = async () => {
    if (!results) {
      toast.error("Calculate the plan first");
      return;
    }
    try {
      await navigator.clipboard.writeText(JSON.stringify(planSummary(), null, 2));
      toast.success("Plan copied to clipboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy");
    }
  };

  const handleEmailPlan = () => {
    if (!results) {
      toast.error("Calculate the plan first");
      return;
    }
    const summary = planSummary();
    const subject = `${mode === "loan" ? "Financing plan" : "Savings plan"}${vehicleId ? ` for vehicle #${vehicleId}` : ""}`;
    const body = [
      `${mode === "loan" ? "Financing plan" : "Savings plan"} generated on ${new Date().toLocaleString()}`,
      "",
      `Vehicle Price: ${formatNGN(summary.vehiclePrice)}`,
      `Down Payment (${summary.downPaymentPercent}%): ${formatNGN(summary.downPayment)}`,
      `Interest (APR): ${summary.interestRate}%`,
      mode === "loan"
        ? `Tenor: ${summary.loanTenureYears} years (${summary.months} months)\nEstimated Monthly Payment: ${formatNGN(summary.monthlyEMI)}\nTotal Interest: ${formatNGN(summary.totalInterest)}\nTotal Amount Payable: ${formatNGN(summary.totalPayment + summary.downPayment)}`
        : `Savings Term: ${summary.months} months\nMonthly Deposit: ${formatNGN(summary.monthlyDeposit)}\nTotal Saved: ${formatNGN(summary.totalSaved)}\nInterest Earned: ${formatNGN(summary.interestEarned)}`,
      "",
      "This is an estimate only.",
    ].join("\n");
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  const handleDownloadPlan = () => {
    if (!results) {
      toast.error("Calculate the plan first");
      return;
    }
    const filename = `${mode}-plan${vehicleId ? `-${vehicleId}` : ""}-${new Date().toISOString()}.json`;
    const data = JSON.stringify(planSummary(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Plan downloaded");
  };

  const handleSaveLocal = () => {
    if (!results) {
      toast.error("Calculate the plan first");
      return;
    }
    try {
      const key = `financePlan:${mode}${vehicleId ? `:${vehicleId}` : ""}`;
      localStorage.setItem(key, JSON.stringify(planSummary()));
      toast.success("Plan saved locally");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save locally");
    }
  };

  const handleReset = () => {
    const p = Number(price || 1_000_000);
    const dp = Math.round((defaultDownPercent / 100) * p);
    setLoanAmount(p);
    setDownPayment(dp);
    setDownPaymentPercent(defaultDownPercent);
    setInterestRate(mode === "savings" ? 10 : 30);
    setLoanTenureYears(1);
    setSavingsMonths(12);
    if (mode === "savings") calculateSavings(p, dp, 10, 12);
    else calculateLoan(p, dp, 30, 1);
    toast.success("Reset to recommended");
  };

  // Manual "Calculate" button (so user can tweak inputs before recalculation)
  const handleCalculate = () => {
    if (mode === "loan") {
      calculateLoan(loanAmount, downPayment, interestRate, loanTenureYears);
    } else {
      calculateSavings(loanAmount, downPayment, interestRate, savingsMonths);
    }
  };

  // render
  return (
    <div className="w-full max-h-[80vh] overflow-y-auto pr-1">
      <div className="w-full">
        <div className="space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              className={`flex-1 py-2 rounded ${mode === "savings" ? "bg-blue-600 text-white" : "bg-white border"}`}
              onClick={() => switchMode("savings")}
            >
              Savings
            </button>
            <button
              className={`flex-1 py-2 rounded ${mode === "loan" ? "bg-blue-600 text-white" : "bg-white border"}`}
              onClick={() => switchMode("loan")}
            >
              Loan (EMI)
            </button>
          </div>

          {/* Vehicle Price */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-3">Vehicle Price (₦)</h2>
            <div className="space-y-3">
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => handleLoanAmountChange(Number(e.target.value))}
                className="w-full pl-3 pr-4 py-2 rounded-md border border-gray-200 bg-white text-gray-900 focus:outline-none"
                min={MIN_PRICE}
                max={MAX_PRICE}
              />
              <input
                type="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                value={loanAmount}
                onChange={(e) => handleLoanAmountChange(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-600">Tip: many lenders expect equity/deposit (10–30%).</div>
            </div>
          </div>

          {/* Down Payment */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-3">Down Payment (₦)</h2>
            <div className="space-y-3">
              <input
                type="number"
                value={downPayment}
                onChange={(e) => handleDownPaymentChange(Number(e.target.value))}
                className="w-full pl-3 pr-4 py-2 rounded-md border border-gray-200 bg-white text-gray-900 focus:outline-none"
                min={0}
                max={loanAmount}
              />
              <input
                type="range"
                min={0}
                max={loanAmount}
                value={downPayment}
                onChange={(e) => handleDownPaymentChange(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>Down payment: {downPaymentPercent.toFixed(1)}%</div>
                <div>{formatNGN(downPayment)}</div>
              </div>
            </div>
          </div>

          {/* Interest & Term */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-3">Interest Rate (APR %)</h2>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => handleInterestRateChange(Number(e.target.value))}
                className="w-full pr-8 py-2 rounded-md border border-gray-200 bg-white text-gray-900 focus:outline-none"
                min={MIN_INTEREST}
                max={MAX_INTEREST}
              />
              <input
                type="range"
                min={MIN_INTEREST}
                max={MAX_INTEREST}
                step={0.1}
                value={interestRate}
                onChange={(e) => handleInterestRateChange(Number(e.target.value))}
                className="w-full mt-2"
              />
              <div className="text-sm text-gray-600 mt-2">APR used for monthly compounding.</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              {mode === "loan" ? (
                <>
                  <h2 className="text-lg font-semibold mb-3">Loan Term (years)</h2>
                  <input
                    type="number"
                    value={loanTenureYears}
                    onChange={(e) => handleLoanTenureChange(Number(e.target.value))}
                    className="w-full pr-12 py-2 rounded-md border border-gray-200 bg-white text-gray-900 focus:outline-none"
                    min={MIN_TENURE_YEARS}
                    max={MAX_TENURE_YEARS}
                  />
                  <input
                    type="range"
                    min={MIN_TENURE_YEARS}
                    max={MAX_TENURE_YEARS}
                    value={loanTenureYears}
                    onChange={(e) => handleLoanTenureChange(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                  <div className="text-sm text-gray-600 mt-2">Term in years — default = 1 year (12 months).</div>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold mb-3">Savings Term (months)</h2>
                  <input
                    type="number"
                    value={savingsMonths}
                    onChange={(e) => handleSavingsMonthsChange(Number(e.target.value))}
                    className="w-full pr-12 py-2 rounded-md border border-gray-200 bg-white text-gray-900 focus:outline-none"
                    min={MIN_MONTHS}
                    max={MAX_MONTHS}
                  />
                  <input
                    type="range"
                    min={MIN_MONTHS}
                    max={MAX_MONTHS}
                    value={savingsMonths}
                    onChange={(e) => handleSavingsMonthsChange(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                  <div className="text-sm text-gray-600 mt-2">Term in months — default = 12 months.</div>
                </>
              )}
            </div>
          </div>

          {/* Calculate Button */}
          <div className="flex gap-2">
            <button
              className="flex-1 py-2 rounded bg-blue-600 text-white"
              onClick={handleCalculate}
            >
              Calculate
            </button>

            <button
              className="py-2 px-3 rounded border"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>

          {/* Results */}
          {results && results.mode === "loan" && (
            <div className="bg-gray-50 rounded-xl p-4 mt-4">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-700">Estimated Monthly Payment</div>
                <div className="text-3xl font-bold mt-1">{formatNGN(results.emi)}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-white">
                  <div className="text-sm text-gray-600">Vehicle Price</div>
                  <div className="text-lg font-bold mt-1">{formatNGN(loanAmount)}</div>
                </div>

                <div className="p-3 rounded-lg bg-white">
                  <div className="text-sm text-gray-600">Down Payment</div>
                  <div className="text-lg font-bold mt-1">{formatNGN(downPayment)}</div>
                </div>

                <div className="p-3 rounded-lg bg-white">
                  <div className="text-sm text-gray-600">Loan Principal</div>
                  <div className="text-lg font-bold mt-1">{formatNGN(results.loanPrincipal)}</div>
                </div>

                <div className="p-3 rounded-lg bg-white">
                  <div className="text-sm text-gray-600">Total Interest</div>
                  <div className="text-lg font-bold mt-1">{formatNGN(results.totalInterest)}</div>
                </div>

                <div className="p-3 rounded-lg bg-white md:col-span-2">
                  <div className="text-sm text-gray-600">Total Amount (Down + Payments)</div>
                  <div className="text-lg font-bold mt-1">{formatNGN(Number(results.downPayment) + Number(results.totalPayment))}</div>
                </div>
              </div>
            </div>
          )}

          {results && results.mode === "savings" && (
            <div className="bg-gray-50 rounded-xl p-4 mt-4">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-700">Required Monthly Deposit</div>
                <div className="text-3xl font-bold mt-1">{formatNGN(results.monthlyDeposit)}</div>
                <div className="text-sm text-gray-600 mt-1">to reach {formatNGN(results.target)} in {results.months} months</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-white">
                  <div className="text-sm text-gray-600">Target (Price − Down)</div>
                  <div className="text-lg font-bold mt-1">{formatNGN(results.target)}</div>
                </div>

                <div className="p-3 rounded-lg bg-white">
                  <div className="text-sm text-gray-600">Total Saved</div>
                  <div className="text-lg font-bold mt-1">{formatNGN(results.totalSaved)}</div>
                </div>

                <div className="p-3 rounded-lg bg-white">
                  <div className="text-sm text-gray-600">Interest Earned</div>
                  <div className="text-lg font-bold mt-1">{formatNGN(results.interestEarned)}</div>
                </div>

                <div className="p-3 rounded-lg bg-white md:col-span-2">
                  <div className="text-sm text-gray-600">APR</div>
                  <div className="text-lg font-bold mt-1">{results.apr}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="mt-4 text-sm text-yellow-800 bg-yellow-50 p-3 rounded">
            <strong>Important:</strong> This is an estimate only. Actual offers or savings returns depend on lender, credit, documentation, product terms and tax. For savings, assumed monthly compounding and end-of-period deposits.
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-col md:flex-row gap-3">
            <button
              className="flex-1 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
              onClick={() => {
                if (!results) {
                  toast.error("Calculate the plan first");
                  return;
                }
                setSaving(true);
                try {
                  const key = `financePlan:${mode}${vehicleId ? `:${vehicleId}` : ""}`;
                  localStorage.setItem(key, JSON.stringify(planSummary()));
                  toast.success("Plan saved locally");
                } catch (err) {
                  console.error(err);
                  toast.error("Failed to save locally");
                } finally {
                  setSaving(false);
                }
              }}
              disabled={!results || saving}
            >
              {saving ? "Saving…" : "Save Locally"}
            </button>

            <button className="py-2 px-3 rounded border" onClick={handleCopyPlan}>
              Copy Plan
            </button>

            <button className="py-2 px-3 rounded border" onClick={handleEmailPlan}>
              Email Plan
            </button>

            <button className="py-2 px-3 rounded border" onClick={handleDownloadPlan}>
              Download JSON
            </button>

            <button className="py-2 px-3 rounded border" onClick={handleReset}>
              Reset
            </button>
          </div>

          {error && <div className="text-red-600 mt-2">{error}</div>}

          <p className="text-xs text-gray-500 mt-3">
            This is an estimate only. Actual offers depend on lender, income, credit, vehicle condition and documentation.
          </p>
        </div>
      </div>
    </div>
  );
}
