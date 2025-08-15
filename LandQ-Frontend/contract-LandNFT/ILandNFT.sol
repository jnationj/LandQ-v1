// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ILandNFT {
    function balanceOf(address owner, uint256 tokenId) external view returns (uint256);
    function isVerified(uint256 tokenId) external view returns (bool);
    function loanLocked(uint256 tokenId) external view returns (bool);
    function lockForLoan(uint256 tokenId) external;
    function unlockFromLoan(uint256 tokenId) external;

    // NEW: Matches public variable in LandNFT
    function lendingContract() external view returns (address);

    // NEW: Matches onlyOwner setter in LandNFT
    function setLendingContract(address _lendingContract) external;
}
