// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/// @title ReentrancyAttacker
/// @notice Mock contract to test reentrancy protection in ERC-20 system
/// @dev Attempts to re-enter QuantumCat functions during callbacks
contract ReentrancyAttacker {
    address public target;
    bytes public attackData;
    uint256 public attackType; // 0=commitObserve, 1=observe, 2=rebox

    constructor(address _target) {
        target = _target;
    }

    /// @notice Set up attack parameters
    function setupAttack(
        bytes calldata _attackData,
        uint256 _attackType
    ) external {
        attackData = _attackData;
        attackType = _attackType;
    }

    /// @notice Initiate attack by calling target contract
    function attack() external {
        (bool success,) = target.call(attackData);
        require(success, "Attack failed");
    }

    /// @notice Fallback to attempt reentrancy when receiving callbacks
    fallback() external payable {
        if (attackData.length > 0) {
            // Attempt reentrancy
            target.call(attackData);
        }
    }

    /// @notice Receive function to handle plain ETH transfers
    receive() external payable {
        if (attackData.length > 0) {
            // Attempt reentrancy
            target.call(attackData);
        }
    }
}


