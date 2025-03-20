// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// TextileSupplyChain contract to manage digital products on the blockchain.
contract TextileSupplyChain is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _productIdCounter;

    enum Status {
        IN_PRODUCTION,
        QUALITY_CHECK,
        IN_TRANSIT,
        DELIVERED
    }

    // DigitalProduct struct to store details of a digital product.
    struct DigitalProduct {
        string productName;
        string origin;
        string materialComposition;
        uint256 productionDate;
        Status currentStatus;
    }

    // Mapping to store digital products.
    mapping(uint256 => DigitalProduct) private digitalProducts;

    // events to log product issuance, updation and deletion.
    event ProductIssued(
        uint256 indexed productId,
        string productName,
        string origin,
        string materialComposition,
        uint256 productionDate,
        Status currentStatus
    );
    event ProductUpdated(
        uint256 indexed productId,
        string productName,
        string origin,
        string materialComposition,
        uint256 productionDate,
        Status newStatus
    );
    event ProductDeleted(uint256 indexed productId);

    // Modifier to check if the caller is the owner of the product.
    modifier onlyOwnerOf(uint256 productId) {
        require(
            ownerOf(productId) == msg.sender,
            "Not the owner of this product"
        );
        _;
    }

    // constructor to initialize the contract.
    constructor() ERC721("TextileProduct", "TXP") Ownable(msg.sender) {}

    /// Creates issue a new digital product on the blockchain.
    function issueProduct(
        string memory productName,
        string memory origin,
        string memory materialComposition
    ) external returns (uint256) {
        require(bytes(productName).length > 0, "Missing product name");
        require(bytes(origin).length > 0, "Missing origin details");
        require(
            bytes(materialComposition).length > 0,
            "Missing material composition"
        );

        _productIdCounter.increment();
        uint256 productId = _productIdCounter.current();
        _mint(msg.sender, productId);
        uint256 productionDate = block.timestamp;

        digitalProducts[productId] = DigitalProduct(
            productName,
            origin,
            materialComposition,
            productionDate,
            Status.IN_PRODUCTION
        );

        emit ProductIssued(
            productId,
            productName,
            origin,
            materialComposition,
            productionDate,
            Status.IN_PRODUCTION
        );
        return productId;
    }

    /// Updates details of an existing digital product.
    function updateProduct(
        uint256 productId,
        string memory newProductName,
        string memory newOrigin,
        string memory newMaterialComposition,
        Status newStatus
    ) external onlyOwnerOf(productId) nonReentrant {
        require(ownerOf(productId) != address(0), "Product not found");
        require(
            digitalProducts[productId].currentStatus != Status.DELIVERED,
            "Final status reached"
        );
        require(
            uint8(newStatus) > uint8(digitalProducts[productId].currentStatus),
            "Invalid status transition"
        );

        uint256 productionDate = block.timestamp;

        digitalProducts[productId] = DigitalProduct(
            newProductName,
            newOrigin,
            newMaterialComposition,
            productionDate,
            newStatus
        );

        emit ProductUpdated(
            productId,
            newProductName,
            newOrigin,
            newMaterialComposition,
            productionDate,
            newStatus
        );
    }

    /// Deletes a digital product from the blockchain.
    function deleteProduct(
        uint256 productId
    ) external onlyOwnerOf(productId) nonReentrant {
        require(ownerOf(productId) != address(0), "Product not found");
        require(
            digitalProducts[productId].currentStatus != Status.DELIVERED,
            "Cannot delete a delivered product"
        );
        _burn(productId);
        delete digitalProducts[productId];

        emit ProductDeleted(productId);
    }
}
