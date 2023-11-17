const { expect } = require("chai");
describe("Marketplace Contract", function()
{
  let owner, add1, add2, add3;
  let MarketPlace;
  let NFT;
  let URI = "QmRsYSYgPwwJTAR51ggvD9923633es4cbw9e9oFKEfok9r";
  let toWei;
  beforeEach(async function(){
    [owner, add1, add2, add3] = await ethers.getSigners();
    MarketPlace = await ethers.deployContract("Marketplace",[1]);
    const Marketaddress = await MarketPlace.getAddress();
    NFT = await ethers.deployContract("NFT");
    await NFT.connect(owner).mint(URI);
    await NFT.connect(owner).setApprovalForAll(Marketaddress,true);
  }); 
    it("fee Percentage", async function(){
        const feeper = await MarketPlace.feePercentage();
        console.log("Fee Pecentage:",feeper);
        expect(feeper).to.equal(1);
    });
    it("fee account", async function(){
        const feeacc = await MarketPlace.feeAccount();
        console.log("Fee Account:",feeacc);
        expect(await owner.getAddress()).to.be.equals(feeacc);
    });
    it("Should List Item In Marketplace and get item count", async function(){
      toWei = (num) => ethers.parseEther(num.toString());
      await expect(MarketPlace.connect(owner).Listitems(NFT.getAddress(),1,toWei(1)))
      .to.emit(MarketPlace,"ItemListed");
      const itemcount = await MarketPlace.itemCount();
      console.log("Item Count is:", itemcount);
      expect(itemcount).to.be.equal(1);
    });
    it("Should return correct arguments when listed", async function(){
      toWei = (num) => ethers.parseEther(num.toString());
      const listitems = await (MarketPlace.connect(owner).Listitems(NFT.getAddress(),1,toWei(1)));
      expect(listitems).to.emit(MarketPlace,"ItemListed").withArgs(await 1,NFT.getAddress(),1,toWei(1),owner.getAddress());
    });
    it("Should revert when price is zero", async function(){
      await expect (MarketPlace.connect(owner).Listitems(NFT.getAddress(),1,0))
      .to.be.revertedWith("Price must be greater than zero");
    });
    it("Should revert when caller is not the owner", async function(){
      toWei = (num) => ethers.parseEther(num.toString());
      await expect(MarketPlace.connect(add1).Listitems(NFT.getAddress(),1,toWei(1)))
      .to.be.revertedWith("Only Token Owner can list Item.");
    });
    it("Should revert when ItemID is invalid", async function(){
      const listitems = await (MarketPlace.connect(owner).Listitems(NFT.getAddress(),1,toWei(1)));
      await expect(MarketPlace.connect(add1).PurchaseItems(3))
      .to.be.revertedWith("ItemId Does not exist"); 
    });
    it("Should revert if Item is already sold", async function(){
      toWei = (num) => ethers.parseEther(num.toString());
      const listitems = await (MarketPlace.connect(owner).Listitems(NFT.getAddress(),1,toWei(1)));
      const _items = await MarketPlace.items(1); // Retrieve the struct
      const _itemId = await _items.itemId; // Access the property
      //Purchase the Item.
      const PurchaseItems = await MarketPlace.connect(add1).PurchaseItems(_itemId,{value:toWei(100)});
      //Try to Purchase Again.
      await expect(MarketPlace.connect(add1).PurchaseItems(_itemId))
      .to.be.revertedWith("Item already Sold!");
    });
    it("Should revert if values send is less than price", async function(){
      toWei = (num) => ethers.parseEther(num.toString());
      const listitems = await (MarketPlace.connect(owner).Listitems(NFT.getAddress(),1,toWei(1)));
      const _items = await MarketPlace.items(1); // Retrieve the struct
      const _itemId = await _items.itemId; // Access the property
      //Purchase the Item.
      await expect (MarketPlace.connect(add1).PurchaseItems(_itemId,{value:toWei(1)}))
      .to.be.revertedWith("Amount send is not enough to purchase items");
    });
    it("should emit the event when purchase occurs", async function(){
      const listitems = await (MarketPlace.connect(owner).Listitems(NFT.getAddress(),1,toWei(1)));
      const _items = await MarketPlace.items(1); // Retrieve the struct
      const _itemId = await _items.itemId; // Access the property
      await expect (MarketPlace.connect(add1).PurchaseItems(_itemId,{value:toWei(100)}))
      .to.emit(MarketPlace,"ItemSold")
    })
    
});
describe("Purchase Item",function(){
  let owner, add1, add2, add3;
  let MarketPlace;
  let NFT;
  let URI = "QmRsYSYgPwwJTAR51ggvD9923633es4cbw9e9oFKEfok9r";
  let toWei = (num) => ethers.parseEther(num.toString());
  beforeEach(async function(){
    [owner, add1, add2, add3] = await ethers.getSigners();
    MarketPlace = await ethers.deployContract("Marketplace",[1]);
    const Marketaddress = await MarketPlace.getAddress();
    NFT = await ethers.deployContract("NFT");
    await NFT.connect(add1).mint(URI);
    await NFT.connect(add1).setApprovalForAll(Marketaddress,true);
    await (MarketPlace.connect(add1).Listitems(NFT.getAddress(),1,toWei(1)));
  });
  it("Should pay the fee account",async function(){
    let balancebefore = await ethers.provider.getBalance(owner);
    const Purchase = await(MarketPlace.connect(add2).PurchaseItems(1,{value:toWei(100)}));
    let balanceafter = await ethers.provider.getBalance(owner);
    //expect(balanceafter).to.be.greaterThan(balancebefore);
    console.log("Balance Before:",balancebefore.toString());
    console.log("Balance After:",balanceafter.toString());
    console.log("Difference:",(balanceafter-balancebefore).toString());
    //Get total price of item.
    let totalprice = await MarketPlace.getprice(1);
    const _items = await MarketPlace.items(1); // Retrieve the struct
    const _price = await _items.price; // Access the property
    expect(balanceafter).to.equal(balancebefore+(totalprice-_price));
  });
  it("should Transfer the NFT to Buyer",async function(){
    const Purchase = await(MarketPlace.connect(add2).PurchaseItems(1,{value:toWei(100)}));
    let NFT_Owner = await NFT.ownerOf(1);
    expect(NFT_Owner).to.equal(await add2.getAddress());
  });
  it("Should emit the correct arguments",async function(){
    let totalprice = await MarketPlace.getprice(1);
    await expect(MarketPlace.connect(add2).PurchaseItems(1,{value:toWei(100)}))
    .to.emit(MarketPlace,"ItemSold")
    .withArgs( 1,await NFT.getAddress(),1,toWei(1),await add1.getAddress(),await add2.getAddress());
  })
})