pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Impl is ERC20 {
    constructor() ERC20('Simple Token', 'STK') {
        _mint(msg.sender, 10000 * (10 ** 18));
    }
}
