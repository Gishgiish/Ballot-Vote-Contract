/** @type import('hardhat/config').HardhatUserConfig */
require("@nomiclabs/hardhat-ethers");
//require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.17",
  paths: {
    sources: "./contracts",
    test: "./tests",
  },
  networks: {
    localhost: {
      url: "http://localhost:8545",
    },
  },
};
