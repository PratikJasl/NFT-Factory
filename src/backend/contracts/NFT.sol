// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721URIStorage{

    uint256 public tokenID; 

    constructor() ERC721("Harmony of Elements","HME"){}

    function mint(string memory _tokenURI) external returns(uint256){
        tokenID++;
        _safeMint(_msgSender(), tokenID);
        _setTokenURI(tokenID, _tokenURI);
        return (tokenID);
    }

}
