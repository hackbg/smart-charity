pragma solidity >=0.5.22 <0.7.0;

import "../node_modules/@openzeppelin/contracts/math/SafeMath.sol";

import "./BeneficiaryRepository.sol";

contract Campaign {
    using SafeMath for uint256;

    event LogInitializeCampaign(
        string indexed _title,
        uint256 indexed _timestamp
    );

    event LogDonate(
        address indexed _donor,
        uint256 indexed _amount,
        uint256 indexed _timestamp
    );

    event LogClaimFunds(
        address indexed _beneficiary,
        uint256 indexed _amount,
        uint256 indexed _timestamp
    );

    event LogClaimRefund(
        address indexed _donor,
        uint256 indexed _amount,
        uint256 indexed _timestamp
    );

    string public title;
    string public description;
    uint256 public targetAmount;
    uint256 public endTimestamp;
    address public author;
    address[] public donorIndices;
    mapping(address => uint256) public donorsAmounts;
    BeneficiaryRepository public beneficiaryRepo;

    modifier isAuthor() {
        require(msg.sender == author, "Restricted access");
        _;
    }

    constructor(
        string memory _title,
        string memory _description,
        uint256 _targetAmount,
        uint32 _endTimestamp,
        address _author
    ) 
        public
    {
        require(bytes(_title).length > 0, "Title is required");
        require(bytes(_description).length > 0, "Description is required");
        require(_targetAmount > 0, "Target amount greater thatn 0 is required");
        require(_endTimestamp > now, "End timestamp must be in the future");
        require(_author != address(0), "Author address is required");

        author = _author;
        title = _title;
        description = _description;
        targetAmount = _targetAmount;
        endTimestamp = _endTimestamp;
        beneficiaryRepo = new BeneficiaryRepository();

        emit LogInitializeCampaign(title, block.timestamp);
    }

    function donate()
        public
        payable
    {
        require(isActive(), "Expired");
        require(msg.value > 0, "Insufficient amount");
        uint256 initialBalance = SafeMath.sub(getBalance(), msg.value);
        require(initialBalance < targetAmount, "Fulfilled");

        if (donorsAmounts[msg.sender] == 0) {
            donorIndices.push(msg.sender);
        }
        donorsAmounts[msg.sender] = SafeMath.add(msg.value, donorsAmounts[msg.sender]);

        emit LogDonate(msg.sender, msg.value, block.timestamp);
    }

    function claimFunds()
        public
    {
        (, , uint256 amount, bool paid) = beneficiaryRepo.getBeneficiaryByAddress(msg.sender);
        require(amount > 0, "Not a beneficiary");
        require(!paid, "Already paid");
        require(isFulfilled(), "Unfulfilled");

        beneficiaryRepo.markBeneficiaryAsPaid(msg.sender);

        address payable beneficiary = address(uint160(msg.sender));
        beneficiary.transfer(amount);

        emit LogClaimFunds(msg.sender, amount, block.timestamp);
    }

    function claimRefund()
        public
    {
        require(isDonor(msg.sender), "Not a donor");
        require(!isActive(), "Active campaign");
        require(!isFulfilled(), "Fulfilled");

        uint256 amount = donorsAmounts[msg.sender];
        donorsAmounts[msg.sender] = 0;

        address payable donor = address(uint160(msg.sender));
        donor.transfer(amount);

        emit LogClaimRefund(msg.sender, amount, block.timestamp);
    }

    function isDonor(address _address)
        public
        view
        returns (bool)
    {
        return donorsAmounts[_address] > 0;
    }

    function getDonorsCount()
        public
        view
        returns (uint256)
    {
        return donorIndices.length;
    }

    function getBalance()
        public
        view
        returns (uint256)
    {
        return address(this).balance;
    }

    function isActive()
        public
        view
        returns (bool)
    {
        return now < endTimestamp;
    }

    function isFulfilled()
        public
        view
        returns (bool)
    {
        return getBalance() >= targetAmount;
    }
}
