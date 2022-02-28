pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

abstract contract freezeERC20 is ERC20 {
    event Freeze(address indexed from, uint256 value);
    event Unfreeze(address indexed from, uint256 value);

    mapping(address => uint256) private freezed;

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        require(
            balanceOf(from) - amount >= freezed[from],
            "ERC20Freeze: you have not enough unfreezed tokens"
        );
        super._transfer(from, to, amount);
    }

    // function freezedUnfreezed(address account, uint256 amount) public view virtual returns (bool) {
    //     uint256 balance = balanceOf(account);
    //     return balance - amount >= freezed[account];
    // }

    function freeze(uint256 amount) external {
        _freeze(_msgSender(), amount);
    }

    function unfreeze(uint256 amount) external {
        _unfreeze(_msgSender(), amount);
    }

    function _freeze(address from, uint256 amount) internal virtual {
        require(from != address(0), "ERC20: freezing from the zero address");
        uint256 fromBalance = this.balanceOf(from);
        require(
            fromBalance - freezed[from] >= amount,
            "ERC20: freezing amount exceeds balance"
        );

        freezed[from] += amount;
        emit Freeze(from, amount);
    }

    function _unfreeze(address from, uint256 amount) internal virtual {
        require(from != address(0), "ERC20: unfreezing from the zero address");
        uint256 fromFreezed = freezed[from];
        require(
            fromFreezed >= amount,
            "ERC20: unfreezing amount exceeds balance"
        );

        freezed[from] -= amount;
        emit Unfreeze(from, amount);
    }

    function freezedOf(address account) public view virtual returns (uint256) {
        return freezed[account];
    }
}

contract CYCOToken is freezeERC20, Ownable {
    // string public name     = "CryoCoin";
    // string public symbol   = "CYCO";

    constructor() ERC20("CryoCoin", "CYCO") {
        _mint(owner(), 100000000000 * 10**18); //100 billion * 10 ^ 18
    }

    receive() external payable {
        revert();
    }

    function burn(uint256 amount) external {
        _burn(_msgSender(), amount);
    }

    function mint(uint256 amount) external onlyOwner {
        _mint(owner(), amount);
    }
}
