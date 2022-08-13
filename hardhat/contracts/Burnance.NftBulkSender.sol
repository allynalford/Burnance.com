// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NftBulkSender is Ownable{

    uint256 public adminFee = 0.0001 ether;    

    function batchTransferERC721(address[] memory _tokenAddress, uint256[] memory _tokenId, address _recipient) external payable {
        require(msg.value == adminFee, "Not enough ETH for fee");
        require(_tokenAddress.length == _tokenId.length, "Length must be the same");

        for (uint256 i = 0; i < _tokenAddress.length; i++) {
            IERC721(_tokenAddress[i]).transferFrom(msg.sender, _recipient, _tokenId[i]);
        }
    }

    function batchTransferERC1155(address[] memory _tokenAddress, uint256[] memory _tokenId, uint256[] memory _amounts, address _recipient) external payable {
        require(msg.value == adminFee, "Not enough ETH for fee");
        require(_tokenAddress.length == _tokenId.length, "Length must be the same");
        require(_tokenAddress.length == _amounts.length, "Length must be the same");

        for (uint256 i = 0; i < _tokenAddress.length; i++) {
            IERC1155(_tokenAddress[i]).safeTransferFrom(msg.sender, _recipient, _tokenId[i], _amounts[i], "");
        }
    }

    function setFee (uint256 _fee) external onlyOwner {
        adminFee = _fee;
    }

    function withdrawETH () external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}
