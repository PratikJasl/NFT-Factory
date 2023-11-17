const { expect } = require("chai");

describe("NFT contract", function () {
  it("Check contract", async function () {
    const [owner] = await ethers.getSigners();

    const NFT = await ethers.deployContract("NFT");

    const NFTaddress = await NFT.address;
    console.log("Contract Address:",NFTaddress);

    const name = await NFT.name();
    console.log("NFT name is:",name);
    expect(name).to.equal("Harmony of Elements");

    const symbol = await NFT.symbol();
    console.log("NFT symbol is:", symbol);
    expect(symbol).to.equal("HME");
  });
  it("should Mint",async function(){
    const [owner] = await ethers.getSigners();

    const NFT = await ethers.deployContract("NFT");

    const mint = await NFT.mint("QmRsYSYgPwwJTAR51ggvD9923633es4cbw9e9oFKEfok9r");

    const tokenID = await NFT.tokenID();
    console.log("Token ID is:", tokenID);
    expect(tokenID).to.equal(1);
  })
})