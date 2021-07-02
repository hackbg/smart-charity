// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import "./Campaign.sol";

contract CampaignFactory {
    address[] private _deployedCampaigns;

    event CampaignDeployed(address indexed campaign);

    function deployedCampaigns() public view returns (address[] memory) {
        return _deployedCampaigns;
    }

    function createCampaign(
        address payable wallet, IERC20 token, uint256 goal, uint256 openingTime, uint256 closingTime,
        string memory title, string memory description
    )
        public
    {
        Campaign campaign = new Campaign(wallet, token, goal, openingTime, closingTime, title, description, msg.sender);
        _deployedCampaigns.push(address(campaign));
        emit CampaignDeployed(address(campaign));
    }
}
