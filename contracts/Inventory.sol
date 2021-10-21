pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Inventory is ERC721URIStorage {
    uint256 private _total = 0;

    constructor () public ERC721("Inventory", "IVT") {}

    function giveNewItem(address player, string memory tokenURI) public returns (uint256) {
        _total+=1;

        uint256 newItemId = _total;
        _mint(player, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
}