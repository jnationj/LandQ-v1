// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/token/ERC20/IERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/token/ERC20/utils/SafeERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/access/Ownable.sol";

import "./ILandNFT.sol";
import "./ILandVerifier.sol";

/// @title LandLending - demo-friendly lending contract for LandNFT collateral
/// @notice Loans denominated in USDT (accounting). Borrowers may repay in USDT or BTC (BTC converted via mock price).
contract LandLending is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable USDT; // assumed 6 decimals in demo
    IERC20 public immutable BTC;  // assumed 8 decimals in demo
    ILandNFT public immutable landNFT;
    ILandVerifier public immutable landVerifier;

    uint256 public constant BTC_DISCOUNT_BP = 500; // 5% discount (benefit) for BTC repayment (basis points)
    uint256 public constant BASIS_POINTS = 10000;

    // Loan periods allowed
    uint256 public constant PERIOD_1H = 1 hours;
    uint256 public constant PERIOD_6H = 6 hours;
    uint256 public constant PERIOD_24H = 24 hours;

    // Variable interest rates per period (in basis points annualized)
    mapping(uint256 => uint256) public interestRateBP;

    // Owner-set mock BTC price in USDT (6 decimals). Example: $29,000 => 29000 * 1e6
    // This is used for demo conversions (replace with Pyth later).
    uint256 public btcPriceUSDT;

    enum LoanStatus { NotIssued, Active, Repaid, Defaulted }

    struct Loan {
        address borrower;
        uint256 principalUSDT;   // stored in USDT smallest units (6 decimals)
        uint256 amountOwedUSDT;  // principal + interest in USDT smallest units
        uint256 dueTimestamp;
        uint256 tokenId;
        LoanStatus status;
    }

    mapping(uint256 => Loan) public loans;

    event LoanIssued(
        address indexed borrower,
        uint256 tokenId,
        uint256 principalUSDT,
        uint256 totalOwedUSDT,
        uint256 duration,
        uint256 dueTimestamp
    );
    event LoanRepaid(address indexed borrower, uint256 tokenId, uint256 amountPaidUSDT);
    event LoanDefaulted(address indexed borrower, uint256 tokenId);
    event NativeDeposit(address indexed sender, uint256 amount);
    event USDTDeposited(address indexed sender, uint256 amount);
    event BtcPriceUpdated(uint256 price6);

    constructor(
        address _usdt,
        address _btc,
        address _landNFT,
        address _landVerifier
    ) {
        require(_usdt != address(0), "Invalid USDT address");
        require(_btc != address(0), "Invalid BTC address");
        require(_landNFT != address(0), "Invalid LandNFT address");
        require(_landVerifier != address(0), "Invalid LandVerifier address");

        USDT = IERC20(_usdt);
        BTC = IERC20(_btc);
        landNFT = ILandNFT(_landNFT);
        landVerifier = ILandVerifier(_landVerifier);

        // Default interest rates for demo (basis points)
        interestRateBP[PERIOD_1H] = 1000;   // 10% (annualized representation for demo)
        interestRateBP[PERIOD_6H] = 3000;   // 30%
        interestRateBP[PERIOD_24H] = 5000;  // 50%
    }

    // Allow contract to receive native token
    receive() external payable {
        emit NativeDeposit(msg.sender, msg.value);
    }

    fallback() external payable {
        emit NativeDeposit(msg.sender, msg.value);
    }

    // Owner can deposit USDT for lending (uses safeTransferFrom)
    function depositUSDT(uint256 amount) external onlyOwner {
        require(amount > 0, "Invalid amount");
        USDT.safeTransferFrom(msg.sender, address(this), amount);
        emit USDTDeposited(msg.sender, amount);
    }

    /// @notice Set mock BTC price (USDT units, 6 decimals) for demo conversions
    /// @dev Example: for $29,000 -> pass 29000 * 1e6
    function setBtcPriceUSDT(uint256 _price6) external onlyOwner {
        require(_price6 > 0, "Invalid price");
        btcPriceUSDT = _price6;
        emit BtcPriceUpdated(_price6);
    }

    /// @notice Convert BTC token units (assumes BTC token has 8 decimals) -> USDT smallest units (6 decimals)
    /// @param btcAmount amount in BTC token units (1 BTC = 1e8)
    function btcToUsdtMock(uint256 btcAmount) public view returns (uint256) {
        require(btcPriceUSDT > 0, "BTC price not set");
        // usdt = (btcAmount * price) / 1e8
        return (btcAmount * btcPriceUSDT) / 1e8;
    }

    /// @notice Convert USDT smallest units (6 decimals) -> BTC token units (1e8)
    function usdtToBtcMock(uint256 usdtAmount) public view returns (uint256) {
        require(btcPriceUSDT > 0, "BTC price not set");
        // btc = (usdtAmount * 1e8) / price
        return (usdtAmount * 1e8) / btcPriceUSDT;
    }

    /// @notice Issue loan to borrower for verified LandNFT collateral
    function issueLoan(uint256 tokenId, uint256 requestedLoanAmountUSDT, uint256 loanPeriod) external {
        require(requestedLoanAmountUSDT > 0, "Loan amount must be > 0");
        require(
            loanPeriod == PERIOD_1H || loanPeriod == PERIOD_6H || loanPeriod == PERIOD_24H,
            "Invalid loan period"
        );
        require(loans[tokenId].borrower == address(0), "Loan exists");
        require(landNFT.balanceOf(msg.sender, tokenId) > 0, "Not NFT owner");
        require(landNFT.isVerified(tokenId), "NFT not verified");
        require(!landNFT.loanLocked(tokenId), "NFT locked for loan");

        uint256 appraisalPrice = landVerifier.getAppraisedPrice(tokenId);
        uint256 maxLoan = appraisalPrice / 2; // 50% max
        require(requestedLoanAmountUSDT <= maxLoan, "Loan exceeds 50% appraisal");

        // ensure contract has enough USDT to disburse
        uint256 poolBalance = USDT.balanceOf(address(this));
        require(poolBalance >= requestedLoanAmountUSDT, "Insufficient contract USDT balance");

        // Interest calculation
        uint256 interestBP = interestRateBP[loanPeriod];
        uint256 interest = (requestedLoanAmountUSDT * interestBP * loanPeriod) / (BASIS_POINTS * 365 days);

        uint256 totalOwed = requestedLoanAmountUSDT + interest;

        // make sure LandNFT points to this contract (guard)
        require(landNFT.lendingContract() == address(this), "LandNFT must reference this lending contract");

        // lock NFT
        landNFT.lockForLoan(tokenId);

        // store loan (USDT-denominated)
        loans[tokenId] = Loan({
            borrower: msg.sender,
            principalUSDT: requestedLoanAmountUSDT,
            amountOwedUSDT: totalOwed,
            dueTimestamp: block.timestamp + loanPeriod,
            tokenId: tokenId,
            status: LoanStatus.Active
        });

        // disburse principal in USDT
        USDT.safeTransfer(msg.sender, requestedLoanAmountUSDT);

        emit LoanIssued(msg.sender, tokenId, requestedLoanAmountUSDT, totalOwed, loanPeriod, block.timestamp + loanPeriod);
    }

    /// @notice Repay loan using USDT or BTC (BTC converted by mock price; BTC repayment receives discount)
    /// @param tokenId loan token id (NFT collateral)
    /// @param amount amount in token units (if isBTC==false: USDT smallest units (6 decimals). if isBTC==true: BTC token units (1e8))
    /// @param isBTC true if paying with BTC token, false for USDT
    function repayLoan(uint256 tokenId, uint256 amount, bool isBTC) external {
        Loan storage loan = loans[tokenId];

        // 1. Check loan exists
        if (loan.borrower == address(0)) {
            revert("No loan issued for this tokenId");
        }

        require(loan.borrower == msg.sender, "Not borrower");

        // Do not allow repayment if already fully repaid
        require(loan.status != LoanStatus.Repaid, "Loan already repaid");

        // If past due, mark defaulted (so UI shows it) but still accept repayment
        _autoMarkDefault(loan);

        // Accept repayment if loan is Active or Defaulted
        require(loan.status == LoanStatus.Active || loan.status == LoanStatus.Defaulted, "Loan not active or defaulted");

        uint256 amountUSDT; // USDT equivalent of incoming payment

        if (isBTC) {
            // amount is BTC token units (1e8). Convert to USDT using mock price:
            uint256 usdtFromBtc = btcToUsdtMock(amount);

            // Apply BTC discount benefit (borrower advantage): treat the BTC-derived USDT as slightly more valuable.
            // We compute the effective USDT credit consistent with a discount:
            // Example: BTC_DISCOUNT_BP = 500 (5%) means borrower needs to pay 95% in USDT-terms to clear 100% owed.
            // To compute the credit amount from btc USDT value:
            amountUSDT = (usdtFromBtc * BASIS_POINTS) / (BASIS_POINTS - BTC_DISCOUNT_BP);

            // pull BTC tokens from borrower
            BTC.safeTransferFrom(msg.sender, address(this), amount);
        } else {
            // USDT path
            amountUSDT = amount;
            USDT.safeTransferFrom(msg.sender, address(this), amount);
        }

        // 3. Apply payment
        if (amountUSDT >= loan.amountOwedUSDT) {
            // full repayment (handle overpayment refund)
            uint256 paid = loan.amountOwedUSDT;
            loan.amountOwedUSDT = 0;
            loan.status = LoanStatus.Repaid;
            landNFT.unlockFromLoan(tokenId);

            uint256 excessUSDT = amountUSDT - paid;
            if (excessUSDT > 0) {
                // refund excess in same currency if possible
                if (isBTC) {
                    // convert excess USDT back to BTC units and refund BTC
                    uint256 refundBtc = usdtToBtcMock(excessUSDT);
                    // if contract has enough BTC, refund; if not, skip (demo)
                    if (refundBtc > 0 && BTC.balanceOf(address(this)) >= refundBtc) {
                        BTC.safeTransfer(msg.sender, refundBtc);
                    }
                } else {
                    if (USDT.balanceOf(address(this)) >= excessUSDT) {
                        USDT.safeTransfer(msg.sender, excessUSDT);
                    }
                }
            }

            emit LoanRepaid(msg.sender, tokenId, paid);
        } else {
            // partial repayment
            loan.amountOwedUSDT -= amountUSDT;
            emit LoanRepaid(msg.sender, tokenId, amountUSDT);
        }
    }

    /// @notice Auto-detect and mark default
    function _autoMarkDefault(Loan storage loan) internal {
        if (loan.status == LoanStatus.Active && block.timestamp > loan.dueTimestamp) {
            loan.status = LoanStatus.Defaulted;
            emit LoanDefaulted(loan.borrower, loan.tokenId);
        }
    }

    /// @notice View function to check current status (auto-computes)
    function getLoanStatus(uint256 tokenId) public view returns (LoanStatus) {
        Loan memory loan = loans[tokenId];

        if (loan.borrower == address(0)) {
            return LoanStatus.NotIssued;
        }
        if (loan.status == LoanStatus.Active && block.timestamp > loan.dueTimestamp) {
            return LoanStatus.Defaulted;
        }
        return loan.status;
    }

    /// @notice Update interest rate for a given period
    function setInterestRate(uint256 period, uint256 interestBP) external onlyOwner {
        interestRateBP[period] = interestBP;
    }

    /// @notice Withdraw tokens (owner) — uses safeTransfer
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    /// @notice Read contract USDT balance
    function contractUSDTBalance() external view returns (uint256) {
        return USDT.balanceOf(address(this));
    }

    /// @notice Read contract BTC balance
    function contractBTCBalance() external view returns (uint256) {
        return BTC.balanceOf(address(this));
    }
}
