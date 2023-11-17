import fs from 'fs';
let Marketplace;
let token;
let itemCount;
async function main() {
    const [deployer,add1,add2] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    //@dev deploy contracts.
    Marketplace = await ethers.deployContract("Marketplace",[1]);
    token = await ethers.deployContract("NFT");
   
    const tokenID = await token.mint(deployer.address);

    const address1 = await token.getAddress();
    const address2 = await Marketplace.getAddress();

    console.log("Token address:", address1);
    console.log("Marketplace address:", address2);
    
    await saveFrontendFiles(Marketplace , "Marketplace");
    await saveFrontendFiles(token , "NFT");
  }
async function saveFrontendFiles(contract, name) 
{
  const contractsDir = new URL ("/../../contractsData",import.meta.url).pathname;

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  const address = await contract.getAddress();
  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

async function getItemCount(){
  itemCount = await Marketplace.getItemCount();
  return itemCount;
}

module.exports = {
  itemCount
};



main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });