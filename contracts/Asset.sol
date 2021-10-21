pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract Asset is ERC1155 {
    uint256 public constant Gold_id = 0;
    uint256 public constant Silver_id = 1;
    uint256 public constant Earth_id = 2;

    constructor() public ERC1155("Some URI") {
        _mint(msg.sender, Gold_id, 10**9, "");
        _mint(msg.sender, Silver_id, 10**6, "");
        _mint(msg.sender, Earth_id, 1, "");
    }
}

