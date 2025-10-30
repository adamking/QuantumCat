// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/// @title ReentrancyAttacker
/// @notice Mock contract to test reentrancy protection
/// @dev Attempts to re-enter QuantumCat functions during callbacks
contract ReentrancyAttacker is ERC165, IERC1155Receiver {
    address public target;
    bytes public attackData;
    bool public attackOnReceive;
    uint256 public attackType; // 0=commitObserve, 1=observe, 2=rebox

    constructor(address _target) {
        target = _target;
    }

    /// @notice Set up attack parameters
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
        require(success, "Attack failed");
    }

    /// @notice ERC1155 receive callback - attempts reentrancy here
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) external override returns (bytes4) {
        if (attackOnReceive && attackData.length > 0) {
            // Attempt reentrancy
            (bool success,) = target.call(attackData);
            // Don't revert even if reentrancy fails
        }
        return this.onERC1155Received.selector;
    }

    /// @notice ERC1155 batch receive callback
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) external override returns (bytes4) {
        if (attackOnReceive && attackData.length > 0) {
            // Attempt reentrancy
            (bool success,) = target.call(attackData);
        }
        return this.onERC1155BatchReceived.selector;
    }

    /// @notice Support IERC1155Receiver interface
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC165, IERC1155Receiver)
        returns (bool)
    {
        return interfaceId == type(IERC1155Receiver).interfaceId
            || super.supportsInterface(interfaceId);
    }
}
