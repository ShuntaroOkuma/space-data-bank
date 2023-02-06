// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract SpaceDataBank is ERC721 {
  uint private _currentTokenId = 0;

  constructor(
    string memory _name,
    string memory _symbol
  ) ERC721(_name, _symbol){}

  mapping(uint => string) private _filenames;
  mapping(uint => uint) private _sizes;
  mapping(uint => string) private _dataHashes;
  mapping(uint => string) private _productInfoList;

/**
   * @dev calculates the next token ID based on value of _currentTokenId
   * @return uint256 for the next token ID
   */
  function _getNextTokenId() private view returns (uint256) {
      return _currentTokenId+1;
  }

  /**
   * @dev increments the value of _currentTokenId
   */
  function _incrementTokenId() private {
      _currentTokenId++;
  }

  /** 
  * @dev Mints a token and set metadata.
  * @param _to address of the future owner of the token
  */
  function mintTo(address _to, string memory filename, uint size, string memory dataHash, string memory productInfo) public {
    uint newTokenId = _getNextTokenId();

    _filenames[newTokenId] = filename;
    _sizes[newTokenId] = size;
    _dataHashes[newTokenId] = dataHash;
    _productInfoList[newTokenId] = productInfo;

    _mint(_to, newTokenId);
    _incrementTokenId();
  }

  /**
  * @dev return tokenURI, data url in lighthouse.
  */
  function tokenURI(uint tokenId) override public view returns (string memory) {
    return string(abi.encodePacked("https://gateway.lighthouse.storage/ipfs/", _dataHashes[tokenId]));
  }

  /**
  * @dev return filename in lighthouse.
  */
  function getFilename(uint tokenId) public view returns (string memory) {
    return string(_filenames[tokenId]);
  }

  /**
  * @dev return filesize in lighthouse.
  */
  function getSize(uint tokenId) public view returns (uint) {
    return _sizes[tokenId];
  }

  /**
  * @dev return product info of satellite data in lighthouse.
  */
  function getProductInfo(uint tokenId) public view returns (string memory) {
    return string(_productInfoList[tokenId]);
  }
}