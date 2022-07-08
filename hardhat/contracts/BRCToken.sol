// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

 
//Actual token contract
contract BRCToken is ERC20 {
   
    constructor() ERC20("Burn Coin", "BRC"){
        _mint(msg.sender,21000000*10**18);
    }
}