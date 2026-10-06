// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FlightInsurance {

    // =========================================================
    // POLICY STRUCTURE
    // =========================================================

    struct Policy {
        uint256 policyId;
        address customer;

        string flightNumber;
        string plan;

        uint256 premium;
        uint256 coverage;
        uint256 delayThreshold;

        uint256 actualDelay;

        bool active;
        bool eligible;
        bool paid;
    }

    // =========================================================
    // STORAGE
    // =========================================================

    uint256 public policyCount;

    mapping(uint256 => Policy) public policies;

    // =========================================================
    // EVENTS
    // =========================================================

    event PolicyCreated(
        uint256 indexed policyId,
        address indexed customer,
        string flightNumber,
        string plan,
        uint256 premium,
        uint256 coverage,
        uint256 delayThreshold
    );

    event FlightDelayUpdated(
        uint256 indexed policyId,
        uint256 actualDelay,
        bool eligible
    );

    event PayoutProcessed(
        uint256 indexed policyId,
        address indexed customer,
        uint256 amount
    );

    // =========================================================
    // BUY INSURANCE
    // =========================================================

    function buyPolicy(
        string memory _flightNumber,
        string memory _plan,
        uint256 _premium,
        uint256 _coverage,
        uint256 _delayThreshold
    ) external payable returns (uint256) {

        require(_premium > 0, "Premium must be greater than zero");
        require(_coverage > 0, "Coverage must be greater than zero");
        require(
            msg.value == _premium,
            "Incorrect testnet ETH premium"
        );

        policyCount++;

        policies[policyCount] = Policy({
            policyId: policyCount,
            customer: msg.sender,
            flightNumber: _flightNumber,
            plan: _plan,
            premium: _premium,
            coverage: _coverage,
            delayThreshold: _delayThreshold,
            actualDelay: 0,
            active: true,
            eligible: false,
            paid: false
        });

        emit PolicyCreated(
            policyCount,
            msg.sender,
            _flightNumber,
            _plan,
            _premium,
            _coverage,
            _delayThreshold
        );

        return policyCount;
    }

    // =========================================================
    // UPDATE FLIGHT DELAY
    // =========================================================

    function updateFlightDelay(
        uint256 _policyId,
        uint256 _actualDelay
    ) external {

        require(
            _policyId > 0 && _policyId <= policyCount,
            "Invalid policy"
        );

        Policy storage policy = policies[_policyId];

        require(policy.active, "Policy is not active");

        policy.actualDelay = _actualDelay;

        if (_actualDelay >= policy.delayThreshold) {
            policy.eligible = true;
        } else {
            policy.eligible = false;
        }

        emit FlightDelayUpdated(
            _policyId,
            _actualDelay,
            policy.eligible
        );
    }

    // =========================================================
    // PROCESS PAYOUT
    // =========================================================

    function processPayout(uint256 _policyId) external {

        require(
            _policyId > 0 && _policyId <= policyCount,
            "Invalid policy"
        );

        Policy storage policy = policies[_policyId];

        require(policy.active, "Policy is not active");
        require(policy.eligible, "Policy is not eligible");
        require(!policy.paid, "Payout already processed");

        require(
            address(this).balance >= policy.coverage,
            "Insufficient contract balance"
        );

        policy.paid = true;
        policy.active = false;

        payable(policy.customer).transfer(policy.coverage);

        emit PayoutProcessed(
            _policyId,
            policy.customer,
            policy.coverage
        );
    }

    // =========================================================
    // GET POLICY
    // =========================================================

    function getPolicy(
        uint256 _policyId
    )
        external
        view
        returns (
            uint256 policyId,
            address customer,
            string memory flightNumber,
            string memory plan,
            uint256 premium,
            uint256 coverage,
            uint256 delayThreshold,
            uint256 actualDelay,
            bool active,
            bool eligible,
            bool paid
        )
    {
        require(
            _policyId > 0 && _policyId <= policyCount,
            "Invalid policy"
        );

        Policy memory policy = policies[_policyId];

        return (
            policy.policyId,
            policy.customer,
            policy.flightNumber,
            policy.plan,
            policy.premium,
            policy.coverage,
            policy.delayThreshold,
            policy.actualDelay,
            policy.active,
            policy.eligible,
            policy.paid
        );
    }

    // =========================================================
    // FUND CONTRACT
    // =========================================================

    receive() external payable {}
}