// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/access/Ownable.sol";
import "./LandNFT.sol";

contract LandVerifier is Ownable {
    struct Agency {
        address payable addr;
        uint256 fee; // in wei
    }

    LandNFT public landNFT;

    // region => agency info
    mapping(bytes32 => Agency) public agencies;

    // tokenId => pending verification request
    mapping(uint256 => bool) public verificationRequests;

    // tokenId => pending reappraisal request
    mapping(uint256 => bool) public reappraisalRequests;

    // tokenId => appraised price in USD
    mapping(uint256 => uint256) public agencyAppraisedPriceUSD;

    event AgencySet(bytes32 indexed region, address indexed agency, uint256 fee);
    event AgencyFeeChanged(bytes32 indexed region, uint256 oldFee, uint256 newFee);
    event VerificationRequested(address indexed requester, uint256 indexed tokenId, bytes32 indexed region);
    event LandVerified(uint256 indexed tokenId, address indexed agency, bytes32 indexed region);
    event AppraisedPriceSet(uint256 indexed tokenId, uint256 priceUSD);
    event ReappraisalRequested(address indexed requester, uint256 indexed tokenId, bytes32 indexed region);
    event ReappraisalUpdated(uint256 indexed tokenId, uint256 newPriceUSD);

    /**
     * @param _landNFT Address of the deployed LandNFT contract
     */
    constructor(address _landNFT) Ownable() {
        require(_landNFT != address(0), "Invalid LandNFT address");
        landNFT = LandNFT(_landNFT);
    }

    /**
     * @notice Set or update agency and fee for a given region
     */
    function setAgency(bytes32 region, address payable agencyAddr, uint256 fee) external onlyOwner {
        require(agencyAddr != address(0), "Invalid agency address");
        agencies[region] = Agency(agencyAddr, fee);
        emit AgencySet(region, agencyAddr, fee);
    }

    /**
     * @notice Change fee only for a region's agency
     */
    function changeAgencyFee(bytes32 region, uint256 newFee) external onlyOwner {
        Agency storage agency = agencies[region];
        require(agency.addr != address(0), "Agency not set");
        uint256 oldFee = agency.fee;
        agency.fee = newFee;
        emit AgencyFeeChanged(region, oldFee, newFee);
    }

    /**
     * @notice Land owner requests verification by paying agency fee, fee forwarded immediately
     */
    function requestVerification(uint256 tokenId) external payable {
        bytes32 region = landNFT.getRegion(tokenId);
        Agency storage agency = agencies[region];
        require(agency.addr != address(0), "No agency assigned");
        require(landNFT.balanceOf(msg.sender, tokenId) > 0, "Not land owner");
        require(msg.value >= agency.fee, "Insufficient fee sent");

        (bool sent, ) = agency.addr.call{value: msg.value}("");
        require(sent, "ETH transfer failed");

        verificationRequests[tokenId] = true;
        landNFT.requestVerification(msg.sender, tokenId);

        emit VerificationRequested(msg.sender, tokenId, region);
    }

    /**
     * @notice Agency verifies land NFT and sets appraised price
     */
    function verifyAndAppraise(uint256 tokenId, uint256 priceUSD) external {
        bytes32 region = landNFT.getRegion(tokenId);
        Agency storage agency = agencies[region];
        require(msg.sender == agency.addr, "Not assigned agency");
        require(verificationRequests[tokenId], "No verification request found");

        landNFT.setVerified(tokenId, true);
        verificationRequests[tokenId] = false;

        agencyAppraisedPriceUSD[tokenId] = priceUSD;
        emit LandVerified(tokenId, msg.sender, region);
        emit AppraisedPriceSet(tokenId, priceUSD);
    }

    /**
     * @notice Land owner requests reappraisal by paying agency fee
     */
    function requestReappraisal(uint256 tokenId) external payable {
        bytes32 region = landNFT.getRegion(tokenId);
        Agency storage agency = agencies[region];
        require(agency.addr != address(0), "No agency assigned");
        require(landNFT.balanceOf(msg.sender, tokenId) > 0, "Not land owner");
        require(landNFT.isVerified(tokenId), "Land not verified");
        require(msg.value >= agency.fee, "Insufficient fee sent");

        (bool sent, ) = agency.addr.call{value: msg.value}("");
        require(sent, "ETH transfer failed");

        reappraisalRequests[tokenId] = true;
        emit ReappraisalRequested(msg.sender, tokenId, region);
    }

    /**
     * @notice Agency updates appraised price after reappraisal
     */
    function updateAppraisal(uint256 tokenId, uint256 newPriceUSD) external {
        bytes32 region = landNFT.getRegion(tokenId);
        Agency storage agency = agencies[region];
        require(msg.sender == agency.addr, "Not assigned agency");
        require(reappraisalRequests[tokenId], "No reappraisal request found");

        agencyAppraisedPriceUSD[tokenId] = newPriceUSD;
        reappraisalRequests[tokenId] = false;

        emit ReappraisalUpdated(tokenId, newPriceUSD);
    }

    /// View helpers
    function getAgency(bytes32 region) external view returns (address, uint256) {
        Agency memory agency = agencies[region];
        return (agency.addr, agency.fee);
    }

    function hasPendingRequest(uint256 tokenId) external view returns (bool) {
        return verificationRequests[tokenId];
    }

    function hasPendingReappraisal(uint256 tokenId) external view returns (bool) {
        return reappraisalRequests[tokenId];
    }

    function getAppraisedPrice(uint256 tokenId) external view returns (uint256) {
        return agencyAppraisedPriceUSD[tokenId];
    }
}
