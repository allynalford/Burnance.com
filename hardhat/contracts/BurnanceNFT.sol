// contracts/BurnanceNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./base64.sol";

contract BurnanceNFT is ERC721 {
    uint256 private _currentTokenId = 0;//Token ID here will start from 1

    string _name = 'BurnanceNFT';
    string _symbol = 'Burnance';

    constructor() ERC721(_name, _symbol) {
    }

    /**
     * @dev Mints a token to an address with a tokenURI.
     * @param _to address of the future owner of the token
     */
    function mintTo(address _to, uint256 quantity) public {

    uint256 tks = 0; 

     while(tks < quantity) {

        uint256 newTokenId = _getNextTokenId();

         _mint(_to, newTokenId);

         _incrementTokenId();

        tks++;
     }
    }

    /**
     * @dev calculates the next token ID based on value of _currentTokenId
     * @return uint256 for the next token ID
     */
    function _getNextTokenId() private view returns (uint256) {
        return _currentTokenId+1;
    }

    /**
     * @dev increments the value of _currentTokenId
     */
    function _incrementTokenId() private {
        _currentTokenId++;
    }

     /**
     * @dev return tokenURI, image SVG data in it.
     */

    function tokenURI(uint256 tokenId) override public pure returns (string memory) {
        string[17] memory parts;
        parts[0] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style>.base { fill: white; font-family: serif; font-size: 14px; }</style><rect width="100%" height="100%" fill="black" /><text x="10" y="20" class="base">';

        parts[1] = Strings.toString(tokenId);

        parts[2] = '</text></svg>';

        string memory output = string(abi.encodePacked(parts[0], parts[1], parts[2]));

        string memory json = Base64.encode(bytes(string(abi.encodePacked('{"name": "Badge #', Strings.toString(tokenId), '", "description": "A concise Hardhat tutorial Badge NFT with on-chain SVG images like look.", "image": "data:image/svg+xml;base64,', Base64.encode(bytes(output)), '"}'))));
        output = string(abi.encodePacked('data:application/json;base64,', json));

        return output;
    }
}