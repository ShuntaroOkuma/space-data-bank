import { expect } from "chai";
import { Signer } from "ethers";
import { ethers } from "hardhat";
import { base64 } from "ethers/lib/utils";

const _name = "SpaceDataBank";
const _symbol = "sdb";

describe("SpaceDataBank", function () {
  let sdb: SpaceDataBank;
  let account0: Signer, account1: Signer;

  beforeEach(async function () {
    [account0, account1] = await ethers.getSigners();
    const SpaceDataBank = await ethers.getContractFactory("SpaceDataBank");
    sdb = await SpaceDataBank.deploy(_name, _symbol);
  });

  it("Should have the correct name and symbol ", async function () {
    expect(await sdb.name()).to.equal(_name);
    expect(await sdb.symbol()).to.equal(_symbol);
  });

  it("Should tokenId start from 1 and auto increment", async function () {
    const address1 = await account1.getAddress();
    await sdb.mintTo(address1);
    expect(await sdb.ownerOf(1)).to.equal(address1);

    await sdb.mintTo(address1);
    expect(await sdb.ownerOf(2)).to.equal(address1);
    expect(await sdb.balanceOf(address1)).to.equal(2);
  });

  it("Should mint a token with event", async function () {
    const address1 = await account1.getAddress();
    await expect(sdb.mintTo(address1))
      .to.emit(sdb, "Transfer")
      .withArgs(ethers.constants.AddressZero, address1, 1);
  });
});
