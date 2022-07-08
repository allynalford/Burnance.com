// SPDX-License-Identifier: MIT
//pragma solidity ^0.4.24;
pragma solidity ^0.8.9;
//pragma solidity ^0.8.4;
//pragma solidity ^0.8.15;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
//Safe Math Interface
 
contract SafeMath {
 
    function safeAdd(uint a, uint b) public pure returns (uint c) {
        c = a + b;
        require(c >= a);
    }
 
    function safeSub(uint a, uint b) public pure returns (uint c) {
        require(b <= a);
        c = a - b;
    }
 
    function safeMul(uint a, uint b) public pure returns (uint c) {
        c = a * b;
        require(a == 0 || c / a == b);
    }
 
    function safeDiv(uint a, uint b) public pure returns (uint c) {
        require(b > 0);
        c = a / b;
    }
}
 
 
 
 
//Actual token contract
contract BRCToken is ERC20, SafeMath {
    uint public _totalSupply;
    uint private _circulatingSupply;
 
    mapping(address => uint) balances;
    mapping(address => mapping(address => uint)) allowed;

    constructor() ERC20("Burn Coin", "BRC"){
        _mint(msg.sender,10000*10**18);
    }

}