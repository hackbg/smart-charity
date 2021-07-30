// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/finance/PaymentSplitter.sol";

contract CampaignWallet is PaymentSplitter {
    Beneficiary[] _beneficiaries;

    struct Beneficiary {
        address id;
        string name;
        string reason;
    }

    constructor(
        address[] memory payees, uint256[] memory shares,
        string[] memory names, string[] memory reasons
    )
        PaymentSplitter(payees, shares) payable 
    {
        for (uint256 i = 0; i < payees.length; i++) {
            _beneficiaries.push(Beneficiary({ id: payees[i], name: names[i], reason: reasons[i] }));
        }
    }

    function beneficiaries() public view returns (Beneficiary[] memory) {
        return _beneficiaries;
    }
}
