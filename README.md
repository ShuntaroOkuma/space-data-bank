# Space Data Bank

A repository for buying and selling satellite data on Web3.

Users can encrypt and upload satellite data using Lighthouse. After uploading, mint the hash value received from Lighthouse and the metadata of satellite data. Minted NFTs can be bought and sold on the marketplace. NFT buyers can use Lighthouse's Share feature to download and unzip the uploaded data.

## Deploy contracts on local network

- Change working directory

  ```sh
  cd blockchain/
  ```

- Start node

  ```sh
  yarn hardhat node
  ```

- Compile contracts

  ```sh
  yarn hardhat compile
  ```

- Run unit tests

  ```sh
  yarn hardhat test --network hardhat
  ```

  Should be all green

  ```
    9 passing (881ms)
  ✨  Done in 1.53s.
  ```

- Deploy

  ```sh
  yarn hardhat run deploy/deploy.js --network localhost
  ```

## Deploy on hyperspace testnet

```sh
yarn hardhat deploy
```

- Write address info to app/src/utils/constants.ts as env vars

## Run apps

```sh
cd app/
yarn dev
```

## Upload file

You can access "http://localhost:3000/upload" after run apps.

## List up on Marketplace

TBD...

## Buy NFT and Download file

TBD...
