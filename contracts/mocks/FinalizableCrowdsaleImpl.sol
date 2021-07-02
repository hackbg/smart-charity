pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../crowdsale/FinalizableCrowdsale.sol";

contract FinalizableCrowdsaleImpl is FinalizableCrowdsale {
    constructor (uint256 openingTime, uint256 closingTime, uint256 rate, address payable wallet, IERC20 token)
        Crowdsale(rate, wallet, token)
        TimedCrowdsale(openingTime, closingTime)
    {
    }
}
