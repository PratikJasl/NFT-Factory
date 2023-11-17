require("@nomicfoundation/hardhat-toolbox");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers:[
      {version:"0.8.19"},
      {version:"0.8.20"}
    ]
    },
  networks: {
    hardhat:{
    },
  }, 
  paths:{
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    tests: "./src/backend/tests",
    cache: "./src/backend/cache"
  }
};
