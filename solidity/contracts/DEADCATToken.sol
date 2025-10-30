// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title DEADCATToken - Observed Dead Cat Token
/// @notice ERC-20 token representing observed cats in the dead state
/// @dev Only the controller contract can mint/burn. Immutable after deployment.
contract DEADCATToken is ERC20 {
    /// @notice Address of the controller contract (only address that can mint/burn)
    address public immutable controller;

    /// @notice Thrown when caller is not the controller
    error OnlyController();

    /// @notice Thrown when controller address is zero
    error ZeroAddress();

    /// @dev Restricts function access to controller only
    modifier onlyController() {
        if (msg.sender != controller) revert OnlyController();
        _;
    }

    /// @notice Initializes the DEADCAT token
    /// @param _controller Address of the QuantumCatController contract
    constructor(address _controller) ERC20("DeadCat", "DEADCAT") {
        if (_controller == address(0)) revert ZeroAddress();
        controller = _controller;
    }

    /// @notice Mint tokens (controller only)
    /// @param to Address to mint tokens to
    /// @param amount Amount of tokens to mint
    function mint(address to, uint256 amount) external onlyController {
        _mint(to, amount);
    }

    /// @notice Burn tokens from an address (controller only)
    /// @param from Address to burn tokens from
    /// @param amount Amount of tokens to burn
    function burn(address from, uint256 amount) external onlyController {
        _burn(from, amount);
    }
}

