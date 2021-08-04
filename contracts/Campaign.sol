// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./crowdsale/Crowdsale.sol";
import "./crowdsale/RefundableCrowdsale.sol";
import "./crowdsale/TimedCrowdsale.sol";

contract Campaign is RefundableCrowdsale {
    address private _author;
    string private _title;
    string private _description;
    address[] private _donors;
    mapping (address => uint256) private _donorAmounts;
    uint private constant _rate = 1;

    constructor(
        address payable wallet, IERC20 token,
        uint256 goal, uint256 openingTime, uint256 closingTime,
        string memory title, string memory description, address author
    )
        Crowdsale(_rate, wallet, token)
        TimedCrowdsale(openingTime, closingTime)
        RefundableCrowdsale(goal)
    {
        require(bytes(title).length > 0, "Campaign: title is empty");
        require(bytes(description).length > 0, "Campaign: description is empty");
        require(author != address(0), "Campaign: address is the zero addres");

        _title = title;
        _description = description;
        _author = author;
    }

    function author() public view returns (address) {
        return _author;
    }

    function title() public view returns (string memory) {
        return _title;
    }

    function description() public view returns (string memory) {
        return _description;
    }

    function donors() public view returns (address[] memory) {
        return _donors;
    }

    function donorAmount(address donor) public view returns (uint256) {
        return _donorAmounts[donor];
    }

    function _updatePurchasingState(address beneficiary, uint256 weiAmount) internal virtual override {
        if (_donorAmounts[beneficiary] == 0) _donors.push(beneficiary);
        _donorAmounts[beneficiary] += weiAmount;
        super._updatePurchasingState(beneficiary, weiAmount);
    }
}
