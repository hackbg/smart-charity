// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./token/ERC20Mintable.sol";
import "./Campaign.sol";

contract CampaignFactory {
    address[] private _deployedCampaigns;
    ERC20Mintable private _token;

    event CampaignDeployed(address indexed campaign);

    constructor() {
        _token = new ERC20Mintable("Smart Charity Token", "SCT");
    }

    function token() public view returns (address) {
        return address(_token);
    }

    function deployedCampaigns() public view returns (address[] memory) {
        return _deployedCampaigns;
    }

    function createCampaign(
        address payable wallet, uint256 goal, uint256 openingTime, uint256 closingTime,
        string memory title, string memory description
    )
        public
    {
        Campaign campaign = new Campaign(wallet, _token, goal, openingTime, closingTime, title, description, msg.sender);
        _deployedCampaigns.push(address(campaign));
        _token.mint(address(campaign), goal);
        emit CampaignDeployed(address(campaign));
    }
}
