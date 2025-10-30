// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/// @title MockERC1155Receiver
/// @notice Mock contract that properly implements IERC1155Receiver
/// @dev Used for testing contract-to-contract interactions
contract MockERC1155Receiver is ERC165, IERC1155Receiver {
    /// @notice Last received token data
    struct ReceivedData {
        address operator;
        address from;
        uint256 id;
        uint256 value;
        bytes data;
    }

    ReceivedData public lastReceived;
    uint256 public receiveCount;

    /// @notice Handle single token receipt
    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes memory data
    ) external override returns (bytes4) {
        lastReceived = ReceivedData(operator, from, id, value, data);
        receiveCount++;
        return this.onERC1155Received.selector;
    }

    /// @notice Handle batch token receipt
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) external override returns (bytes4) {
        receiveCount++;
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
