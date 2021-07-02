pragma solidity ^0.8.0;

import "../crowdsale/Crowdsale.sol";

contract CrowdsaleMock is Crowdsale {
    constructor (uint256 rate, address payable wallet, IERC20 token) Crowdsale(rate, wallet, token) {
    }
}
