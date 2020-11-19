pragma solidity >=0.4.22 <0.7.0;

import "./Campaign.sol";

contract ChangeBallot {
    event LogInitializeBallot(
        address indexed _campaign,
        uint256 indexed _timestamp
    );

    event LogVote(
        uint256 indexed _timestamp
    );

    uint256 public endTimestamp;
    uint32 public votesAgainst;
    mapping(address => bool) public voted;
    Campaign public campaign;

    constructor(uint256 _endTimestamp, address _campaign)
        public 
    {
        endTimestamp = _endTimestamp;
        campaign = Campaign(_campaign);

        emit LogInitializeBallot(_campaign, block.timestamp);
    }

    function voteAgainst()
        public
    {
        require(!hasFinished(), "Expired");
        require(campaign.isDonor(msg.sender), "Not eligible to vote");
        require(!voted[msg.sender], "Already voted");

        voted[msg.sender] = true;
        votesAgainst += 1;

        emit LogVote(block.timestamp);
    }

    function hasFinished()
        public
        view
        returns (bool) 
    {
        return now > endTimestamp;
    }

    function isAccepted()
        public
        view
        returns (bool)
    {
        // todo: add weight depending on donation size
        uint256 donorsCount = campaign.getDonorsCount();
        uint256 acceptedCount = donorsCount - votesAgainst;
        return (acceptedCount / donorsCount) * 100 > 50;
    }
}
