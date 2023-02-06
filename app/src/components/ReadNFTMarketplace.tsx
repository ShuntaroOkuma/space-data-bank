import { NFTMarketplaceABI as abi } from "@/abi/NFTMarketplaceABI";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { useState, useEffect } from "react";
import { BigNumber, Contract, ethers } from "ethers";
import { Box, Button, Grid, GridItem, Text } from "@chakra-ui/react";
import CardERC721 from "./CardERC721";
import {
  addressNFTContract,
  addressMarketplaceContract,
} from "@/utils/constants";

interface Props {
  option: number;
}

const ReadNFTMarkeplace = (props: Props) => {
  const [items, setItems] = useState<[]>();

  const { account, active, library } = useWeb3React<Web3Provider>();

  // props.optionに応じてitemsをセット
  useEffect(() => {
    if (!active) setItems(undefined);
    if (!(active && account && library)) return;

    const market: Contract = new Contract(
      addressMarketplaceContract,
      abi,
      library
    );
    console.log("market.provider: ", market.provider);

    library.getCode(addressMarketplaceContract).then((result: string) => {
      if (result === "0x") return;

      switch (props.option) {
        case 0:
          market.fetchActiveItems({ from: account }).then((items: any) => {
            setItems(items);
          });
          break;
        case 1:
          market.fetchMyPurchasedItems({ from: account }).then((items: any) => {
            setItems(items);
          });
          break;
        case 2:
          market.fetchMyCreatedItems({ from: account }).then((items: any) => {
            setItems(items);
          });
          break;
        default:
      }
    });
  }, [active, account]);

  const buyInNFTMarket = async (event: React.FormEvent, itemId: BigNumber) => {
    event.preventDefault();
    if (!(active && account && library)) return;

    const market: Contract = new Contract(
      addressMarketplaceContract,
      abi,
      library.getSigner()
    );

    const auctionPrice = ethers.utils.parseUnits("1", "ether");

    market
      .buyItem(addressNFTContract, itemId, { value: auctionPrice })
      .catch("error", console.error);
  };

  const state = ["On Sale", "Sold", "Inactive"];

  return (
    <Grid templateColumns="repeat(3, 1fr)" gap={0} w="100%">
      {items ? (
        items.length == 0 ? (
          <Box>no item</Box>
        ) : (
          items.map((item: any) => {
            return (
              <GridItem key={item.id}>
                <CardERC721
                  addressContract={item.nftContract}
                  tokenId={item.tokenId}
                ></CardERC721>
                <Text fontSize="sm" px={5} pb={1}>
                  {" "}
                  {state[item.state]}{" "}
                </Text>
                {(item.seller == account &&
                  item.buyer == ethers.constants.AddressZero) ||
                item.buyer == account ? (
                  <Text fontSize="sm" px={5} pb={1}>
                    {" "}
                    owned by you{" "}
                  </Text>
                ) : (
                  <Text></Text>
                )}
                <Box>
                  {item.seller != account && item.state == 0 ? (
                    <Button
                      width={220}
                      type="submit"
                      onClick={(e) => buyInNFTMarket(e, item.id)}
                    >
                      Buy this!
                    </Button>
                  ) : (
                    <Text></Text>
                  )}
                </Box>
              </GridItem>
            );
          })
        )
      ) : (
        <Box></Box>
      )}
    </Grid>
  );
};

export default ReadNFTMarkeplace;
