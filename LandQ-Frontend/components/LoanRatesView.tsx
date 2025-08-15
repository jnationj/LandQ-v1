import { useState, useEffect } from "react";

interface LoanPeriodRate {
  periodSeconds: number;
  interestBP: number; // basis points (e.g. 1000 = 10%)
}

interface LoanRatesViewProps {
  tokenId: number;
  appraisalPriceUSDT: number; // in 6 decimals
}

// Example data — replace or fetch dynamically
const loanPeriods: LoanPeriodRate[] = [
  { periodSeconds: 3600, interestBP: 1000 },   // 1 hour, 10%
  { periodSeconds: 21600, interestBP: 3000 },  // 6 hours, 30%
  { periodSeconds: 86400, interestBP: 5000 },  // 24 hours, 50%
];

export default function LoanRatesView({ tokenId, appraisalPriceUSDT }: LoanRatesViewProps) {
  // Convert basis points to percentage string
  const bpToPercent = (bp: number) => (bp / 100).toFixed(2);

  // Convert seconds to human readable (hours or days)
  const secondsToReadable = (sec: number) => {
    if (sec >= 86400) {
      return `${sec / 86400} day(s)`;
    }
    if (sec >= 3600) {
      return `${sec / 3600} hour(s)`;
    }
    if (sec >= 60) {
      return `${sec / 60} minute(s)`;
    }
    return `${sec} second(s)`;
  };

  // Convert appraisal price from 6 decimals to normal number
    const normalAppraisalPrice = appraisalPriceUSDT
    ? appraisalPriceUSDT / 1_000_000
    : 0;

    const maxLoan = normalAppraisalPrice / 2;

  return (
    <div className="mt-4 p-4 border rounded bg-gray-50">
      <h2 className="text-xl font-bold mb-2">Loan Periods & Interest Rates</h2>
      <p className="mb-4">
        Max. Loan: <strong>50% of Appraised Price in USDT</strong>
        <br />
        Maximum Loan Amount: <strong>{maxLoan.toLocaleString()} USDT</strong>

      </p>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Loan Period</th>
            <th className="border border-gray-300 px-4 py-2">Interest Rate</th>
          </tr>
        </thead>
        <tbody>
          {loanPeriods.map(({ periodSeconds, interestBP }) => (
            <tr key={periodSeconds}>
              <td className="border border-gray-300 px-4 py-2">{secondsToReadable(periodSeconds)}</td>
              <td className="border border-gray-300 px-4 py-2">{bpToPercent(interestBP)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
