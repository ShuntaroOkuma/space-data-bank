import { expect } from "chai";
import { BigNumber, Signer } from "ethers";
import {
  TransactionResponse,
  TransactionReceipt,
} from "@ethersproject/providers";

const _name = "SpaceDataBank";
const _symbol = "SDB";

describe("NFTMarketplace", function () {
  let nft: SpaceDataBank;
  let market: NFTMarketplace;
  let account0: Signer, account1: Signer, account2: Signer;
  let address0: string, address1: string, address2: string;

  let listingFee: BigNumber;
  const auctionPrice = ethers.utils.parseUnits("1", "ether");

  beforeEach(async function () {
    [account0, account1, account2] = await ethers.getSigners();
    address0 = await account0.getAddress();
    address1 = await account1.getAddress();
    address2 = await account2.getAddress();

    const SpaceDataBank = await ethers.getContractFactory("SpaceDataBank");
    nft = await SpaceDataBank.deploy(_name, _symbol);

    const Market = await ethers.getContractFactory("NFTMarketplace");
    market = await Market.deploy();
    listingFee = await market.getListingFee();
  });

  it("Should create market item successfully", async function () {
    await nft.mintTo(address0);
    await nft.approve(market.address, 1); // tokenId = 1
    await market.createMarketItem(nft.address, 1, auctionPrice, {
      value: listingFee,
    });

    const items = await market.fetchMyCreatedItems();
    expect(items.length).to.be.equal(1);
  });

  it("Should create market item with EVENT", async function () {
    await nft.mintTo(address0);
    await nft.approve(market.address, 1);
    await expect(
      market.createMarketItem(nft.address, 1, auctionPrice, {
        value: listingFee,
      })
    )
      .to.emit(market, "EventMarketItemCreated")
      .withArgs(
        1,
        1,
        auctionPrice,
        nft.address,
        address0,
        ethers.constants.AddressZero,
        0
      );
  });

  it("Should revert to create market item if nft is not approved", async function () {
    await nft.mintTo(address0);
    // await nft.approve(market.address,1)
    await expect(
      market.createMarketItem(nft.address, 1, auctionPrice, {
        value: listingFee,
      })
    ).to.be.revertedWith("NFT must be approved to market");
  });

  it("Should create market item and buy (by address#1) successfully", async function () {
    await nft.mintTo(address0);
    await nft.approve(market.address, 1);
    await market.createMarketItem(nft.address, 1, auctionPrice, {
      value: listingFee,
    });

    await expect(
      market.connect(account1).buyItem(nft.address, 1, { value: auctionPrice })
    )
      .to.emit(market, "EventMarketItemSold")
      .withArgs(1, 1, auctionPrice, nft.address, address0, address1, 1);

    expect(await nft.ownerOf(1)).to.be.equal(address1);
  });

  it("Should revert buy if seller remove approve", async function () {
    await nft.mintTo(address0);
    await nft.approve(market.address, 1);
    await market.createMarketItem(nft.address, 1, auctionPrice, {
      value: listingFee,
    });

    await nft.approve(ethers.constants.AddressZero, 1); // 0x0によるapproveに変更 = not approved

    await expect(
      market.connect(account1).buyItem(nft.address, 1, { value: auctionPrice })
    ).to.be.reverted;
  });

  it("Should revert buy if seller transfer the token out", async function () {
    await nft.mintTo(address0);
    await nft.approve(market.address, 1);
    await market.createMarketItem(nft.address, 1, auctionPrice, {
      value: listingFee,
    });

    await nft.transferFrom(address0, address2, 1);

    await expect(
      market.connect(account1).buyItem(nft.address, 1, { value: auctionPrice })
    ).to.be.reverted;
  });

  it("Should revert to delete(de-list) with wrong params", async function () {
    await nft.mintTo(address0);
    await nft.approve(market.address, 1);
    await market.createMarketItem(nft.address, 1, auctionPrice, {
      value: listingFee,
    });

    // not a correct id
    await expect(market.deleteMarketItem(2)).to.be.reverted;

    // not owner
    await expect(market.connect(account1).deleteMarketItem(1)).to.be.reverted;

    await nft.transferFrom(address0, address1, 1);
    // not approved to market now
    await expect(market.deleteMarketItem(1)).to.be.reverted;
  });

  it("Should create market item and delete(de-list) successfully", async function () {
    await nft.mintTo(address0); //tokenId=1
    await nft.approve(market.address, 1);

    await market.createMarketItem(nft.address, 1, auctionPrice, {
      value: listingFee,
    });
    await market.deleteMarketItem(1);

    await nft.approve(ethers.constants.AddressZero, 1);

    // should revert if trying to delete again
    await expect(market.deleteMarketItem(1)).to.be.reverted;
  });

  it("Should seller, buyer and market owner correct ETH value after sale", async function () {
    let txresponse: TransactionResponse, txreceipt: TransactionReceipt;
    let gas;
    const marketownerBalance = await ethers.provider.getBalance(address0);

    // token1をaccount1がmintしapprove
    await nft.connect(account1).mintTo(address1);
    await nft.connect(account1).approve(market.address, 1);

    let sellerBalance = await ethers.provider.getBalance(address1);
    // token1をリスティング
    txresponse = await market
      .connect(account1)
      .createMarketItem(nft.address, 1, auctionPrice, { value: listingFee });

    const sellerAfter = await ethers.provider.getBalance(address1);

    txreceipt = await txresponse.wait();
    gas = txreceipt.gasUsed.mul(txreceipt.effectiveGasPrice);

    // sellerAfter = sellerBalance - listingFee - gas
    expect(sellerAfter).to.equal(sellerBalance.sub(listingFee).sub(gas));

    const buyerBalance = await ethers.provider.getBalance(address2);

    txresponse = await market
      .connect(account2)
      .buyItem(nft.address, 1, { value: auctionPrice });
    const buyerAfter = await ethers.provider.getBalance(address2);

    txreceipt = await txresponse.wait();
    gas = txreceipt.gasUsed.mul(txreceipt.effectiveGasPrice);
    expect(buyerAfter).to.equal(buyerBalance.sub(auctionPrice).sub(gas));

    const marketownerAfter = await ethers.provider.getBalance(address0);
    expect(marketownerAfter).to.equal(marketownerBalance.add(listingFee));
  });
});
