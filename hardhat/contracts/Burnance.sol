// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
//import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "hardhat/console.sol";

interface IERC721{
      function safeTransferFrom(address from, address to, uint256 tokenId) external returns (bool success);
      function transferFrom(address from, address to, uint256 tokenId) external returns (bool success);
      function transfer(address from, address to, uint256 tokenId) external returns (bool success);
      function ownerOf(uint256 tokenId) external view returns (address);
      function approve(address to, uint256 tokenId) external returns (bool success);
}

abstract contract contractX{
  function approve(address to, uint256 tokenId) virtual public returns (bool success);
  function safeTransferFrom(address from, address to, uint256 tokenId) virtual public returns (bool success);
  function transferFrom(address from, address to, uint256 tokenId) virtual public returns (bool success);
  function transfer(address from, address to, uint256 tokenId) virtual public returns (bool success);
  function ownerOf(uint256 tokenId) virtual external view returns (address);
}

abstract contract BRCToken {
 function transfer(address to, uint tokens) virtual public;
}

//Burn Contract
contract Burnance is Ownable{

address burnTo = address(0x000000000000000000000000000000000000dEaD);
address _brcAddress;

   constructor(address brcAddress) {
        _brcAddress = brcAddress;
    }

function BurnAndTransfer(address _nftAddress, uint _tokenId, uint _quantity) public returns (bool success) {


                     

    console.log('sender:  ', msg.sender);
    console.log('ownerOf: ', contractX(_nftAddress).ownerOf(_tokenId));


    require(msg.sender == contractX(_nftAddress).ownerOf(_tokenId), "Not owner of NFT");

    console.log(
        "Transferring from %s to %s %s BRC tokens",
        msg.sender,
        burnTo,
        _quantity
    );

     //bool aprv = contractX(_nftAddress).approve(burnTo, _tokenId);

     //require(aprv, "Rejected");
     bool res = IERC721(_nftAddress).transfer(msg.sender, burnTo, _tokenId);
     //bool res = contractX(_nftAddress).transferFrom(msg.sender, burnTo, _tokenId);

     require(res, "NFT Not burned");

     //BRCToken(_brcAddress).transfer(msg.sender, _quantity);
     return true;
}

}