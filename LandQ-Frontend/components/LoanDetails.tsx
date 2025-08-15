import { LoanData } from "@/hooks/useLoan";
import { format } from "date-fns";

interface LoanDetailsProps {
  loan: LoanData;
}

export default function LoanDetails({ loan }: LoanDetailsProps) {
  if (!loan || loan.status === 0) return <p>No active loan for this NFT.</p>;

  return (
    <div className="mt-4 p-4 border rounded bg-gray-50">
      <h3 className="font-bold mb-2">Loan Details</h3>
      <p><strong>Borrower:</strong> {loan.borrower}</p>
      <p><strong>Principal:</strong> {(Number(loan.principalUSDT) / 1_000_000).toLocaleString()} USDT</p>
      <p><strong>Amount Owed:</strong> {(Number(loan.amountOwedUSDT) / 1_000_000).toLocaleString()} USDT</p>
      <p><strong>Due Date:</strong> {format(new Date(Number(loan.dueTimestamp) * 1000), "PPpp")}</p>
      <p><strong>Status:</strong> {loan.status === 1 ? "Active" : "Repaid"}</p>
    </div>
  );
}
