// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/// @title MockERC1155Receiver
/// @author QuantumCat Team
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

    /// @notice Last received token data
    ReceivedData public lastReceived;
    /// @notice Number of tokens received
    uint256 public receiveCount;

    /// @notice Handle single token receipt
    /// @param operator Address that initiated the transfer
    /// @param from Address tokens are transferred from
    /// @param id Token ID being transferred
    /// @param value Amount of tokens being transferred
    /// @param data Additional data with no specified format
    /// @return bytes4 selector to confirm receipt
    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external override returns (bytes4) {
        lastReceived = ReceivedData(operator, from, id, value, data);
        unchecked {
            ++receiveCount;
        }
        return this.onERC1155Received.selector;
    }

    /// @notice Handle batch token receipt
    /// @return bytes4 selector to confirm receipt
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external override returns (bytes4) {
        unchecked {
            ++receiveCount;
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
