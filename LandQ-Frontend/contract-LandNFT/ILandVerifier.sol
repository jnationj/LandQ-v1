// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ILandVerifier {
    function isVerified(uint256 tokenId) external view returns (bool);
    function getAppraisedPrice(uint256 tokenId) external view returns (uint256);
}
