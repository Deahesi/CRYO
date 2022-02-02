pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract CYCOToken is ERC20, Ownable {
    uint256 public updatedAt;
    uint256 public releasePerSecond;

    // string public name     = "CryoCoin";
    // string public symbol   = "CYCO";

    constructor() ERC20("CryoCoin", "CYCO") {
        _mint(owner(), 100000000 * 1000**18); //100 billion ^ 18
        /* We have a fixed inflation without compounding effect
         * There are 60 * 60 * 24 * 365 = 31536000 seconds in a year
         * 10,000,000 FIGHT release each year, so 10000000 * 10 ^ 18 / 31536000 = 317097919837645900
         * basically 0.3170979198376459 FIGHT release per second
         */
        releasePerSecond = 317097919837645900;
        updatedAt = block.timestamp;
    }

    receive() external payable {
        revert();
    }

    function burn(uint256 amount) external {
        _burn(_msgSender(), amount);
    }

    function releasedReadyAmount() public view returns (uint256) {
        return (block.timestamp - updatedAt) * releasePerSecond;
    }

    function mint() external onlyOwner {
        _mint(owner(), releasedReadyAmount());
        updatedAt = block.timestamp;
    }

    function transferAnyStuckERC20Token(address tokenAddress, uint256 tokens)
        external
        onlyOwner
    {
        IERC20(tokenAddress).transfer(owner(), tokens);
    }
}
