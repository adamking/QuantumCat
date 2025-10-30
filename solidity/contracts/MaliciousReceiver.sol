// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/// @title MaliciousReceiver
/// @author QuantumCat Team
/// @notice Mock contract that rejects ERC1155 token transfers
/// @dev Used to test error handling when receivers reject tokens
contract MaliciousReceiver is ERC165 {
    /// @notice Whether to reject transfers by returning wrong selector
    bool public shouldReject;
    /// @notice Whether to revert on transfers
    bool public shouldRevert;
    /// @notice Whether to claim IERC1155Receiver support
    bool public supportsIERC1155Receiver;

    /// @notice Constructor to set rejection behavior
    /// @param _shouldReject Whether to reject by returning wrong selector
    /// @param _shouldRevert Whether to revert on receive
    /// @param _supportsInterface Whether to claim interface support
    constructor(bool _shouldReject, bool _shouldRevert, bool _supportsInterface) {
        shouldReject = _shouldReject;
        shouldRevert = _shouldRevert;
        supportsIERC1155Receiver = _supportsInterface;
    }

    /// @notice Rejects single token transfers
    /// @return bytes4 selector (may be invalid if rejecting)
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external view returns (bytes4) {
        if (shouldRevert) {
            revert MaliciousReceiverRejectingTokens();
        }
        if (shouldReject) {
            return bytes4(0);
        }
        return IERC1155Receiver.onERC1155Received.selector;
    }

    /// @notice Custom error for token rejection
    error MaliciousReceiverRejectingTokens();

    /// @notice Rejects batch token transfers
    /// @return bytes4 selector (may be invalid if rejecting)
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external view returns (bytes4) {
        if (shouldRevert) {
            revert MaliciousReceiverRejectingTokens();
        }
        if (shouldReject) {
            return bytes4(0);
        }
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }

    /// @notice Support IERC1155Receiver interface conditionally
    /// @param interfaceId Interface identifier to check
    /// @return bool True if interface is supported
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override
        returns (bool)
    {
        if (interfaceId == type(IERC1155Receiver).interfaceId) {
            return supportsIERC1155Receiver;
        }
        return super.supportsInterface(interfaceId);
    }
}
