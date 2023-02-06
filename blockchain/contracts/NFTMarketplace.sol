pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract NFTMarketplace is ReentrancyGuard {
  // Variable
  using Counters for Counters.Counter;
  Counters.Counter private _itemCounter;
  Counters.Counter private _itemSoldCounter;

  address payable public marketowner;
  uint public listingFee = 0.001 ether;

  enum State { Created, Release, Inactive }

  struct MarketItem {
    uint id;
    uint tokenId;
    uint price;
    address nftContract;
    address payable seller;
    address payable buyer;
    State state;
  }

  mapping (uint => MarketItem) marketItems;


  // Event
  event EventMarketItemCreated (
    uint indexed id,
    uint indexed tokenId,
    uint price,
    address indexed nftContract,
    address seller,
    address buyer,
    State state
  );

  event EventMarketItemSold (
    uint indexed id,
    uint indexed tokenId,
    uint price,
    address indexed nftContract,
    address seller,
    address buyer,
    State state
  );

  constructor() {
    marketowner = payable(msg.sender);
  }

  function getListingFee() public view returns (uint) {
    return listingFee;
  }

  /*
  Functions related Transaction 
  */

  // List Item to marketplace
  function createMarketItem(
    address nftContract,
    uint tokenId,
    uint price
    ) public payable nonReentrant {
    require(price >= 0, "Price must be more than 0 wei");
    require(msg.value == listingFee, "Fee must be equal to listing fee");
    require(IERC721(nftContract).getApproved(tokenId) == address(this), "NFT must be approved to market");
    // ↑ NFTのコントラクト（ここでいうnftContractとして渡されるコントラクト）でIERC721に沿った実装がされている必要がある

    _itemCounter.increment();
    uint id = _itemCounter.current();

    marketItems[id] = MarketItem(
      id,
      tokenId,
      price,
      nftContract,
      payable(msg.sender),
      payable(address(0)), // 空アドレスを設定
      State.Created
    );

    emit EventMarketItemCreated(id, tokenId, price, nftContract, msg.sender, address(0), State.Created);
  }

  // Delete Item from marktplace
  function deleteMarketItem(uint itemId) public nonReentrant {
    require(itemId <= _itemCounter.current(), "id must be less than or equal to item count");
    require(marketItems[itemId].state == State.Created, "item must be on market");
    MarketItem storage item = marketItems[itemId]; // なぜstorage？つけないとstorageの情報が書きかわらない？

    require(IERC721(item.nftContract).ownerOf(item.tokenId) == msg.sender, "must be the owner");
    require(IERC721(item.nftContract).getApproved(item.tokenId) == address(this), "NFT must be approved to market");
    // ↑ NFTのコントラクト（ここでいうnftContractとして渡されるコントラクト）でIERC721に沿った実装がされている必要がある

    item.state = State.Inactive;
    // approve状態を戻すことはしていない
    // nftの所有者でないと戻すことはできないため

    emit EventMarketItemSold(itemId, item.tokenId, item.price, item.nftContract, item.seller, address(0), State.Inactive);
  }

  // Buy Item on markeplace
  function buyItem(address nftContract, uint id) public payable nonReentrant {
    MarketItem storage item = marketItems[id];
    uint price = item.price;
    uint tokenId = item.tokenId;

    require(msg.value == price, "Please submit the asking price");
    require(IERC721(nftContract).getApproved(tokenId) == address(this), "NFT must be approved to market");

    IERC721(nftContract).transferFrom(item.seller, msg.sender, tokenId);

    payable(marketowner).transfer(listingFee); // pay to marketowner
    item.seller.transfer(msg.value); // pay to seller
    
    item.buyer = payable(msg.sender);
    item.state = State.Release; // Soldout的な？
    _itemSoldCounter.increment();

    emit EventMarketItemSold(id, tokenId, price, nftContract, item.seller, item.buyer, State.Release);
  }


  /*
  Functions related Query 
  */

  enum FetchOperator { ActiveItems, MyPurchasedItems, MyCreatedItems}

  // check query condition
  function isCondition(MarketItem memory item, FetchOperator _op) private view returns (bool){
    if(_op == FetchOperator.MyCreatedItems){ 
      return 
        (item.seller == msg.sender
          && item.state != State.Inactive
        )? true
        : false;
    }else if(_op == FetchOperator.MyPurchasedItems){
      return
        (item.buyer ==  msg.sender) ? true: false;
    }else if(_op == FetchOperator.ActiveItems){
      return 
        (item.buyer == address(0) 
          && item.state == State.Created
          && (IERC721(item.nftContract).getApproved(item.tokenId) == address(this))
        )? true
        : false;
    }else{
      return false;
    }
  }
  
  // helper finds matching items
  function fetchHepler(FetchOperator _op) private view returns (MarketItem[] memory) {     
    uint total = _itemCounter.current();
    uint itemCount = 0;

    // conditionがtrueならカウントを増やす
    for (uint i = 1; i <= total; i++) {
      if (isCondition(marketItems[i], _op)) {
        itemCount ++;
      }
    }

    // condtionがtrueならitemsに実態を入れていく
    uint index = 0;
    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 1; i <= total; i++) {
      if (isCondition(marketItems[i], _op)) {
        items[index] = marketItems[i];
        index ++;
      }
    }
    return items;
  }

  function fetchActiveItems() public view returns (MarketItem[] memory) {
    return fetchHepler(FetchOperator.ActiveItems);
  }

  function fetchMyPurchasedItems() public view returns (MarketItem[] memory) {
    return fetchHepler(FetchOperator.MyPurchasedItems);
  }

  function fetchMyCreatedItems() public view returns (MarketItem[] memory) {
    return fetchHepler(FetchOperator.MyCreatedItems);
  }





}