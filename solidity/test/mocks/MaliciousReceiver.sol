// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/// @title MaliciousReceiver
/// @notice Mock contract that rejects ERC1155 token transfers
/// @dev Used to test error handling when receivers reject tokens
contract MaliciousReceiver is ERC165 {
    bool public shouldReject;
    bool public shouldRevert;
    bool public supportsIERC1155Receiver;

    constructor(bool _shouldReject, bool _shouldRevert, bool _supportsInterface) {
        shouldReject = _shouldReject;
        shouldRevert = _shouldRevert;
        supportsIERC1155Receiver = _supportsInterface;
    }

    /// @notice Rejects single token transfers
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) external view returns (bytes4) {
        if (shouldRevert) {
            revert("MaliciousReceiver: rejecting tokens");
        }
        if (shouldReject) {
            return bytes4(0);
        }
        return IERC1155Receiver.onERC1155Received.selector;
    }

    /// @notice Rejects batch token transfers
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) external view returns (bytes4) {
        if (shouldRevert) {
            revert("MaliciousReceiver: rejecting tokens");
        }
        if (shouldReject) {
            return bytes4(0);
        }
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }

    /// @notice Support IERC1155Receiver interface conditionally
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
