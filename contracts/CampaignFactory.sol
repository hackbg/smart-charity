pragma solidity >=0.4.22 <0.7.0;

import "./Campaign.sol";

contract CampaignFactory {
    address[] public deployedCampaigns;

    event LogCreateCampaign(
        address indexed _campaignAddress,
        uint256 indexed _timestamp
    );

    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _targetAmount,
        uint32 _endsTimestamp
    ) 
        public 
    {
        address newCampaign = address(
            new Campaign(
                _title,
                _description,
                _targetAmount,
                _endsTimestamp,
                msg.sender
            )
        );
        deployedCampaigns.push(newCampaign);

        emit LogCreateCampaign(newCampaign, block.timestamp);
    }

    function getDeployedCampaigns()
        public
        view
        returns (address[] memory)
    {
        return deployedCampaigns;
    }
}
