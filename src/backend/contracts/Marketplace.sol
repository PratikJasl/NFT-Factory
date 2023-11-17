// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
//import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace {
    address payable public immutable feeAccount; //account that receives fee.
    uint public immutable feePercentage;        // the fee percentage on sales.
    uint public itemCount;

    //Strucure to hold data about each NFT in Marketplace.
    struct Item{      
        uint itemId;
        IERC721 nft;
        uint tokenID;
        uint price;
        address payable seller;
        bool sold;
    } 
    //Events
    event ItemListed(
        uint itemId, 
        address indexed nft,
        uint tokenID,
        uint price,
        address indexed seller
    );

    event ItemSold(
        uint itemId,
        address indexed nft,
        uint tokenID,
        uint soldPrice,
        address indexed seller,
        address indexed buyer
    );

    //ItemId to Structure mapping.
    mapping(uint => Item) public items; 
    constructor(uint _feePercentage){
        feeAccount = payable(msg.sender);
        feePercentage=_feePercentage;
    }

    function Listitems(IERC721 _nft, uint _tokenId, uint _price) external {
        require(_price>0, "Price must be greater than zero");
        require(msg.sender==_nft.ownerOf(_tokenId),"Only Token Owner can list Item.");
        //increment count of Items in Marketplace.
        itemCount++;
        //Transfers ownership of NFT from owner to Marketplace.
        _nft.transferFrom(msg.sender,address(this),_tokenId);
        //Fills the NFT details.
        items[itemCount] = Item
        (
            itemCount,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false
        );

        emit ItemListed(
            itemCount,
            address(_nft),
            _tokenId,
            _price,
            payable(msg.sender)
        );
    }

    function PurchaseItems(uint _itemId) external payable {
        Item storage item = items[_itemId];
        uint _totalprice = getprice(_itemId);

        require(_itemId>0 && _itemId<=itemCount,"ItemId Does not exist");
        require(!item.sold,"Item already Sold!");
        require(msg.sender != address(0),"You are not allowed");
        require(msg.value >= _totalprice,"Amount send is not enough to purchase items");

        //Pay the Seller of the NFT and feeAccount.
        item.seller.transfer(item.price);
        feeAccount.transfer(_totalprice-item.price);

        //Transfer the NFT to the seller.
        //itemCount--;
        item.sold = true;
        item.nft.transferFrom(address(this), msg.sender, item.tokenID);
       
        //Emit ItemSold Event.
        emit ItemSold(
            _itemId,
            address(item.nft),
            item.tokenID,
            item.price,
            item.seller,
            msg.sender
        );
    }

    function getprice(uint _itemId) view public returns(uint){
        return ((items[_itemId].price*(100+feePercentage))/100);
    }

    function getContractBalance() public view returns (uint) {
    return address(this).balance;
    }

    function getItemCount() public view returns (uint){
        return(itemCount);
    }
}