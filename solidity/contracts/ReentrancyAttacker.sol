// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/// @title ReentrancyAttacker
/// @author QuantumCat Team
/// @notice Mock contract to test reentrancy protection
/// @dev Attempts to re-enter QuantumCat functions during callbacks
contract ReentrancyAttacker is ERC165, IERC1155Receiver {
    /// @notice Target contract address
    address public target;
    /// @notice Encoded attack call data
    bytes public attackData;
    /// @notice Whether to attack during receive callback
    bool public attackOnReceive;
    /// @notice Attack type: 0=commitObserve, 1=observe, 2=rebox
    uint256 public attackType;

    /// @notice Constructor to set target contract
    /// @param _target Address of the target contract
    constructor(address _target) {
        target = _target;
    }

    /// @notice Set up attack parameters
    /// @param _attackData Encoded function call data
    /// @param _attackOnReceive Whether to trigger during receive
    /// @param _attackType Type of attack to perform
    function setupAttack(
        bytes calldata _attackData,
        bool _attackOnReceive,
        uint256 _attackType
    ) external {
        attackData = _attackData;
        attackOnReceive = _attackOnReceive;
        attackType = _attackType;
    }

    /// @notice Initiate attack by calling commitObserve
    function attack() external {
        (bool success,) = target.call(attackData);
        if (!success) revert AttackFailed();
    }

    /// @notice Custom error for failed attacks
    error AttackFailed();

    /// @notice ERC1155 receive callback - attempts reentrancy here
    /// @return bytes4 selector to confirm receipt
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external override returns (bytes4) {
        if (attackOnReceive && attackData.length > 0) {
            // Attempt reentrancy
            (bool success,) = target.call(attackData);
            // Don't revert even if reentrancy fails
            success; // silence unused variable warning
        }
        return this.onERC1155Received.selector;
    }

    /// @notice ERC1155 batch receive callback
    /// @return bytes4 selector to confirm receipt
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external override returns (bytes4) {
        if (attackOnReceive && attackData.length > 0) {
            // Attempt reentrancy
            (bool success,) = target.call(attackData);
            success; // silence unused variable warning
        }
        return this.onERC1155BatchReceived.selector;
    }

    /// @notice Support IERC1155Receiver interface
    /// @param interfaceId Interface identifier to check
    /// @return bool True if interface is supported
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC165, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC1155Receiver).interfaceId
            || super.supportsInterface(interfaceId);
    }
}
