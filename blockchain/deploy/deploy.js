require("hardhat-deploy");
require("hardhat-deploy-ethers");

const { ethers, network } = require("hardhat");

const private_key = network.config.accounts[0];
const wallet = new ethers.Wallet(private_key, ethers.provider);

module.exports = async function main() {
  console.log("Wallet Ethereum Address:", wallet.address);

  const SpaceDataBank = await ethers.getContractFactory(
    "SpaceDataBank",
    wallet
  );
  console.log("Deploying SpaceDataBank...");
  const delployedSpaceDataBank = await SpaceDataBank.deploy(
    "SpaceDataBank",
    "SDB"
  );
  await delployedSpaceDataBank.deployed();
  console.log("SpaceDataBank Address:", delployedSpaceDataBank.address);

  const NFTMarketplace = await ethers.getContractFactory(
    "NFTMarketplace",
    wallet
  );
  console.log("Deploying SpaceDataBank...");
  const delployedNFTMarketplace = await NFTMarketplace.deploy();
  await delployedNFTMarketplace.deployed();
  console.log("NFTMarketplace Address:", delployedNFTMarketplace.address);
};
