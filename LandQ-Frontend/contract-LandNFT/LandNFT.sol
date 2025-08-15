// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/token/ERC1155/ERC1155.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/access/Ownable.sol";

contract LandNFT is ERC1155, Ownable {
    uint256 private currentTokenId;
    uint256 public mintFee = 0.001 ether;

    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => bytes32) private _tokenRegions;
    mapping(uint256 => bool) private _isVerified;
    mapping(address => bool) public verifiers;

    // Store both original purchase price and current asking price in USD
    mapping(uint256 => uint256) public purchasePriceUSD;
    mapping(uint256 => uint256) public askingPriceUSD;

    // Track if a land NFT is locked for a loan
    mapping(uint256 => bool) public loanLocked;

    // Address of the lending contract
    address public lendingContract;

    event LandVerified(uint256 indexed tokenId, bool status);
    event VerificationRequested(uint256 indexed tokenId, address indexed requester);
    event AskingPriceUpdated(uint256 indexed tokenId, uint256 newPriceUSD, string newMetadataURI);

    constructor(address initialOwner) ERC1155("") {
        _transferOwnership(initialOwner);
    }


    /**
     * @notice Mint land NFT with original purchase price (USD)
     */
    function mintLand(
        address to,
        string calldata metadataURI,
        uint256 amount,
        bytes32 region,
        uint256 _purchasePriceUSD
    ) external payable {
        require(msg.value >= mintFee, "Insufficient mint fee");

        currentTokenId++;
        uint256 tokenId = currentTokenId;

        _mint(to, tokenId, amount, "");
        _tokenURIs[tokenId] = metadataURI;
        _tokenRegions[tokenId] = region;

        purchasePriceUSD[tokenId] = _purchasePriceUSD;
        askingPriceUSD[tokenId] = _purchasePriceUSD;
    }

    /**
     * @notice Request verification for a land NFT, requires owner to hold token
     */
    function requestVerification(address owner, uint256 tokenId) external {
        require(balanceOf(owner, tokenId) > 0, "Owner must hold token");
        emit VerificationRequested(tokenId, owner);
    }

    /**
     * @notice Update asking price and metadata URI, only owner of token can call
     */
    function updateAskingPrice(uint256 tokenId, uint256 newPriceUSD, string calldata newMetadataURI) external {
        require(balanceOf(msg.sender, tokenId) > 0, "Not land owner");
        askingPriceUSD[tokenId] = newPriceUSD;
        _tokenURIs[tokenId] = newMetadataURI;
        emit AskingPriceUpdated(tokenId, newPriceUSD, newMetadataURI);
    }

    /**
     * @notice Returns the metadata URI for a given tokenId
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    /**
     * @notice Set or unset an authorized verifier address (onlyOwner)
     */
    function setVerifier(address verifier, bool status) external onlyOwner {
        verifiers[verifier] = status;
    }

    /**
     * @notice Set verification status for a tokenId, only authorized verifiers can call
     */
    function setVerified(uint256 tokenId, bool status) external {
        require(verifiers[msg.sender], "Caller not authorized verifier");
        _isVerified[tokenId] = status;
        emit LandVerified(tokenId, status);
    }

    /**
     * @notice Check verification status of a tokenId
     */
    function isVerified(uint256 tokenId) external view returns (bool) {
        return _isVerified[tokenId];
    }

    /**
     * @notice Get region bytes32 for a tokenId
     */
    function getRegion(uint256 tokenId) external view returns (bytes32) {
        return _tokenRegions[tokenId];
    }

    /**
     * @notice Change the mint fee (onlyOwner)
     */
    function setMintFee(uint256 newFee) external onlyOwner {
        mintFee = newFee;
    }

    /**
     * @notice View current mint fee
     */
    function viewMintFee() external view returns (uint256) {
        return mintFee;
    }

    /**
     * @notice Set the lending contract address (onlyOwner)
     */
    event LendingContractSet(address indexed previous, address indexed newAddress);

    function setLendingContract(address _lendingContract) external onlyOwner {
        require(_lendingContract != address(0), "Zero address");
        address prev = lendingContract;
        lendingContract = _lendingContract;
        emit LendingContractSet(prev, _lendingContract);
    }


    /**
     * @notice Lock NFT for loan collateral (only lending contract)
     */
    function lockForLoan(uint256 tokenId) external {
        require(msg.sender == lendingContract, "Not authorized");
        loanLocked[tokenId] = true;
    }

    /**
     * @notice Unlock NFT after loan repayment (only lending contract)
     */
    function unlockFromLoan(uint256 tokenId) external {
        require(msg.sender == lendingContract, "Not authorized");
        loanLocked[tokenId] = false;
    }

    /**
     * @notice Hook to prevent transfer of loan locked NFTs
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

        if (from != address(0) && to != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                require(!loanLocked[ids[i]], "Token is locked for loan");
            }
        }
    }


    /**
     * @notice Withdraw contract balance (onlyOwner)
     */
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
