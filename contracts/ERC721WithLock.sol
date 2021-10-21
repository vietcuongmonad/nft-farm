pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract ERC721WithLock is ERC721URIStorage {
    uint256 private _total = 0; // Total items

    // locked[contract][player] = how many item `player` lock in `contract`
    mapping(address => mapping(address => uint256)) private _locked;
    mapping(uint256 => address) private _itemLockedAt;

    constructor (string memory name, string memory symbol) public ERC721(name, symbol) {}

    function giveNewItem(address player, string memory tokenURI) public returns (uint256) {
        _total+=1;

        uint256 newItemId = _total;
        _mint(player, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    function lockItem(uint256 itemId, address contractAddress) public {
        address ownerItem = ownerOf(itemId);
        require(msg.sender == ownerItem, "Must be owner");
        require(0 < itemId && itemId <= _total, "Item does not exist");
        require(_itemLockedAt[itemId] == address(0), "Item already locked");

        _itemLockedAt[itemId] = contractAddress;
        _locked[ownerItem][contractAddress] += 1;
    }

    function getLockedNum(address player, address contractAddress) public view returns (uint256) {
        return _locked[player][contractAddress];
    }
}