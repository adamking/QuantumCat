// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/// @title ThrowingReceiver
/// @notice Mock contract that throws/reverts when supportsInterface is called
/// @dev Used to test the catch block in _canReceive1155
contract ThrowingReceiver {
    /// @notice This contract intentionally doesn't implement IERC165
    /// so calling supportsInterface will revert and trigger the catch block
    function someFunction() external pure returns (uint256) {
        return 42;
    }
}

