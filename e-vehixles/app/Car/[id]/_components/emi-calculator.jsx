"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * EmiCalculator (client-only)
 *
 * Props:
 * - price: number (price in NGN). Default 1_000_000
 * - vehicleId: optional id used in email subject / filename when sharing
 *
 * No server actions — all client side: copy, mailto, download, save to localStorage.
 */
export default function EmiCalculator({ price = 1_000_000, vehicleId = null }) {
  // Nigeria-tuned defaults
  const defaultDownPercent = 30;
  const [loanAmount, setLoanAmount] = useState(Number(price || 1_000_000));
  const [downPayment, setDownPayment] = useState(Math.round((defaultDownPercent / 100) * (price || 1_000_000)));
  const [downPaymentPercent, setDownPaymentPercent] = useState(defaultDownPercent);
  const [interestRate, setInterestRate] = useState(30); // APR %
  const [loanTenure, setLoanTenure] = useState(3); // years
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // bounds tuned for Nigerian market
  const MIN_PRICE = 100_000;
  const MAX_PRICE = 200_000_000;
  const MIN_INTEREST = 5;
  const MAX_INTEREST = 120;
  const MIN_TENURE = 1;
  const MAX_TENURE = 8;

  const formatNGN = (val) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
      Math.round(Number(val) || 0)
    );

  // Calculate amortizing loan EMI
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
      emi,
      totalInterest,
      totalPayment,
      loanPrincipal,
      downPayment: down,
      months,
      apr,
    });
  };

  // handlers
  const handleLoanAmountChange = (value) => {
    const v = Math.round(Math.min(Math.max(Number(value || 0), MIN_PRICE), MAX_PRICE));
    setLoanAmount(v);
    const pct = v ? Math.round((downPayment / v) * 100 * 10) / 10 : 0;
    setDownPaymentPercent(pct);
    calculateLoan(v, downPayment, interestRate, loanTenure);
  };

  const handleDownPaymentChange = (value) => {
    const v = Math.round(Math.min(Math.max(Number(value || 0), 0), loanAmount));
    setDownPayment(v);
    const pct = loanAmount ? Math.round((v / loanAmount) * 100 * 10) / 10 : 0;
    setDownPaymentPercent(pct);
    calculateLoan(loanAmount, v, interestRate, loanTenure);
  };

  const handleDownPaymentPercentChange = (percent) => {
    const p = Math.min(Math.max(Number(percent || 0), 0), 100);
    setDownPaymentPercent(p);
    const dp = Math.round((p / 100) * loanAmount);
    setDownPayment(dp);
    calculateLoan(loanAmount, dp, interestRate, loanTenure);
  };

  const handleInterestRateChange = (value) => {
    const r = Math.min(Math.max(Number(value || 0.1), MIN_INTEREST), MAX_INTEREST);
    setInterestRate(r);
    calculateLoan(loanAmount, downPayment, r, loanTenure);
  };

  const handleLoanTenureChange = (value) => {
    const t = Math.min(Math.max(Number(value || 1), MIN_TENURE), MAX_TENURE);
    setLoanTenure(t);
    calculateLoan(loanAmount, downPayment, interestRate, t);
  };

  // initial calc on mount or when price prop changes
  useEffect(() => {
    const p = Number(price || loanAmount);
    setLoanAmount(p);
    const dp = Math.round((downPaymentPercent / 100) * p);
    setDownPayment(dp);
    calculateLoan(p, dp, interestRate, loanTenure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price]);

  // share helpers (client-side only)
  const planSummary = () => {
    if (!results) return null;
    return {
      vehicleId,
      vehiclePrice: loanAmount,
      downPayment,
      downPaymentPercent,
      interestRate,
      loanTenure,
      monthlyEMI: Math.round(results.emi),
      months: results.months,
      totalPayment: Math.round(results.totalPayment),
      totalInterest: Math.round(results.totalInterest),
      generatedAt: new Date().toISOString(),
    };
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
    const subject = `Financing plan${vehicleId ? ` for vehicle #${vehicleId}` : ""}`;
    const body = [
      `Financing plan generated on ${new Date().toLocaleString()}`,
      "",
      `Vehicle Price: ${formatNGN(summary.vehiclePrice)}`,
      `Down Payment (${summary.downPaymentPercent}%): ${formatNGN(summary.downPayment)}`,
      `Interest (APR): ${summary.interestRate}%`,
      `Tenor: ${summary.loanTenure} years (${summary.months} months)`,
      `Estimated Monthly Payment: ${formatNGN(summary.monthlyEMI)}`,
      `Total Interest: ${formatNGN(summary.totalInterest)}`,
      `Total Amount Payable: ${formatNGN(summary.totalPayment + summary.downPayment)}`,
      "",
      "This is an estimate only. Actual offers depend on lender, credit, documentation and vehicle condition.",
    ].join("\n");
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  const handleDownloadPlan = () => {
    if (!results) {
      toast.error("Calculate the plan first");
      return;
    }
    const filename = `financing-plan${vehicleId ? `-${vehicleId}` : ""}-${new Date().toISOString()}.json`;
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
      const key = `financingPlan${vehicleId ? `:${vehicleId}` : ""}`;
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
    setInterestRate(30);
    setLoanTenure(3);
    calculateLoan(p, dp, 30, 3);
    toast.success("Reset to recommended");
  };

  // render
  return (
    <div className="w-full max-h-[80vh] overflow-y-auto pr-1">
      <div className="w-full">
        <div className="space-y-4">
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

          {/* Interest & Tenor */}
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
              <div className="text-sm text-gray-600 mt-2">Interest in Nigeria can be high — compare offers.</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-3">Loan Term (years)</h2>
              <input
                type="number"
                value={loanTenure}
                onChange={(e) => handleLoanTenureChange(Number(e.target.value))}
                className="w-full pr-12 py-2 rounded-md border border-gray-200 bg-white text-gray-900 focus:outline-none"
                min={MIN_TENURE}
                max={MAX_TENURE}
              />
              <input
                type="range"
                min={MIN_TENURE}
                max={MAX_TENURE}
                value={loanTenure}
                onChange={(e) => handleLoanTenureChange(Number(e.target.value))}
                className="w-full mt-2"
              />
              <div className="text-sm text-gray-600 mt-2">Shorter tenors reduce total interest paid.</div>
            </div>
          </div>

          {/* Results */}
          {results && (
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

          {/* Warning */}
          <div className="mt-4 text-sm text-yellow-800 bg-yellow-50 p-3 rounded">
            <strong>Important (Nigeria):</strong> vehicle loans can be expensive due to high benchmark rates.
            Consider alternatives: save for a larger down payment, buy used with cash, rent-to-own, or dealer finance. Compare offers before committing.
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
                // client-side "save" to localStorage
                try {
                  const key = `financingPlan${vehicleId ? `:${vehicleId}` : ""}`;
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

            <button
              className="py-2 px-3 rounded border"
              onClick={() => {
                handleReset();
              }}
            >
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
