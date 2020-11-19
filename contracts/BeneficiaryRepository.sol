pragma solidity >=0.4.22 <0.7.0;

import "./Campaign.sol";
import "./ChangeBallot.sol";

contract BeneficiaryRepository {
    struct Beneficiary {
        string name;
        string reason;
        bool paid;
        uint256 amount;
        uint256 index;
    }

    struct ChangeRequest {
        string description;
        address removeBeneficiary;
        address addPendingBeneficiary;
        address ballot;
    }

    event LogAddBeneficiary(
        address indexed _address,
        uint256 indexed _timestamp
    );

    event LogAddPendingBeneficiary(
        address indexed _address,
        uint256 indexed _timestamp
    );

    event LogRequestBeneficiaryChange(
        address indexed _removeBeneficiary,
        address indexed _addPendingBeneficiary,
        uint256 indexed _timestamp
    );

    event LogCommitBeneficiaryChange(
        address indexed _removeBeneficiary,
        address indexed _addPendingBeneficiary,
        uint256 indexed _timestamp
    );

    address[] public beneficiaryIndices;
    mapping(address => Beneficiary) public beneficieries;
    mapping(address => Beneficiary) public pendingBeneficiaries;
    ChangeRequest[] public changeRequests;
    Campaign public campaign;

    modifier isAuthor() {
        require(msg.sender == campaign.author(), "Restricted access");
        _;
    }

    modifier isCampaign() {
        require(msg.sender == address(campaign), "Restricted access");
        _;
    }

    constructor()
        public
    {
        campaign = Campaign(msg.sender);
    }

    function addBeneficiary(
        string memory _name,
        string memory _reason,
        uint256 _amount,
        address _address
    ) 
        public
        isAuthor
    {
        require(campaign.getDonorsCount() == 0, "Already have donors. Propose a new change.");
        requireBeneficiaryData(_name, _reason, _amount, _address);
        // todo: check if amount not exceeding target

        beneficiaryIndices.push(_address);
        beneficieries[_address] = Beneficiary({
            name: _name,
            reason: _reason,
            amount: _amount,
            paid: false,
            index: beneficiaryIndices.length - 1
        });

        emit LogAddBeneficiary(_address, block.timestamp);
    }

    function markBeneficiaryAsPaid(address _address)
        public
        isCampaign
    {
        Beneficiary storage beneficiary = beneficieries[_address];
        beneficiary.paid = true;
    }

    function addPendingBeneficiary(
        string memory _name,
        string memory _reason,
        uint256 _amount,
        address _address
    )
        public
        isAuthor
    {
        requireBeneficiaryData(_name, _reason, _amount, _address);
        pendingBeneficiaries[_address] = Beneficiary({
            name: _name,
            reason: _reason,
            amount: _amount,
            paid: false,
            index: 0
        });

        emit LogAddPendingBeneficiary(_address, block.timestamp);
    }

    function requireBeneficiaryData(
        string memory _name,
        string memory _reason,
        uint256 _amount,
        address _address
    )
        internal
        pure
    {
        require(bytes(_name).length > 0, "Name is required");
        require(bytes(_reason).length > 0, "Reason is required");
        require(_amount > 0, "Amount greater than 0 is required");
        require(_address != address(0), "Address is required");
    }

    function requestBeneficiaryChange(
        address _removeBeneficiary,
        address _addPendingBeneficiary,
        string memory _description,
        uint256 _ballotEndTimestamp
    )
        public
        isAuthor
    {
        require(campaign.getDonorsCount() > 0, "Campaign must have at least one donor");
        require(bytes(_description).length > 0, "Description is required");
        require(_ballotEndTimestamp > now, "Ballot end must be in the future");
        // todo: check if the new amount will exceed the target

        address ballot = address(new ChangeBallot(_ballotEndTimestamp, address(campaign)));

        changeRequests.push(
            ChangeRequest({
                removeBeneficiary: _removeBeneficiary,
                addPendingBeneficiary: _addPendingBeneficiary,
                description: _description,
                ballot: ballot
            })
        );

        emit LogRequestBeneficiaryChange(
            _removeBeneficiary,
            _addPendingBeneficiary,
            block.timestamp
        );
    }

    function commitBeneficiaryChange(uint256 _index)
        public
        isAuthor
    {
        ChangeRequest storage request = changeRequests[_index];
        ChangeBallot ballot = ChangeBallot(request.ballot);

        require(ballot.hasFinished(), "Ballot not finished yet");
        require(ballot.isAccepted(), "Donors rejected request");

        if (request.removeBeneficiary != address(0)) {
            removeBeneficiary(request.removeBeneficiary);
        }
        if (request.addPendingBeneficiary != address(0)) {
            addRequestedBeneficiary(request.addPendingBeneficiary);
            removePendingBeneficiary(request.addPendingBeneficiary);
        }

        emit LogCommitBeneficiaryChange(
            request.removeBeneficiary,
            request.addPendingBeneficiary,
            block.timestamp
        );
    }

    function removeBeneficiary(address _address)
        internal
    {
        uint indexToRemove = beneficieries[_address].index;
        address keyToMove = beneficiaryIndices[beneficiaryIndices.length - 1];
        beneficiaryIndices[indexToRemove] = keyToMove;
        beneficieries[keyToMove].index = indexToRemove;
        beneficiaryIndices.pop();
        delete beneficieries[_address];
    }

    function addRequestedBeneficiary(address _address)
        internal
    {
        Beneficiary storage pendingBeneficiary = pendingBeneficiaries[_address];
        beneficiaryIndices.push(_address);
        beneficieries[_address] = pendingBeneficiary;
    }

    function removePendingBeneficiary(address _address)
        internal
    {
        delete pendingBeneficiaries[_address];
    }

    function getBeneficiaryAddresses()
        public
        view
        returns (address[] memory) 
    {
        return beneficiaryIndices;
    }

    function getBeneficiaryByAddress(address _address)
        public
        view
        returns (string memory, string memory, uint256, bool)
    {
        Beneficiary storage beneficiary = beneficieries[_address];
        return (
            beneficiary.name,
            beneficiary.reason,
            beneficiary.amount,
            beneficiary.paid
        );
    }
}
