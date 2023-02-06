import type { NextPage } from "next";
import Head from "next/head";
import { VStack, Heading, Box, HStack } from "@chakra-ui/layout";
import { Text } from "@chakra-ui/react";
import ReadERC721 from "@/components/ReadERC721";
import ReadNFTMarketplace from "@/components/ReadNFTMarketplace";
import ConnectMetamask from "@/components/ConnectMetamask";
import { addressNFTContract } from "@/utils/constants";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Space Data Bank</title>
      </Head>

      <Heading as="h3" my={4}>
        NFT Marketplace
      </Heading>

      <ConnectMetamask />

      <VStack>
        <Box mb={0} p={4} w="100%" borderWidth="1px" borderRadius="lg">
          <Heading my={4} fontSize="xl">
            NFT Market - all
          </Heading>
          <ReadNFTMarketplace option={0} />
        </Box>

        <Box mb={0} p={4} w="100%" borderWidth="1px" borderRadius="lg">
          <Heading my={4} fontSize="xl">
            NFT Market - my bought
          </Heading>
          <ReadNFTMarketplace option={1} />
        </Box>

        <Box mb={0} p={4} w="100%" borderWidth="1px" borderRadius="lg">
          <Heading my={4} fontSize="xl">
            NFT Market - my created
          </Heading>
          <ReadNFTMarketplace option={2} />
        </Box>

        <Box my={4} p={4} w="100%" borderWidth="1px" borderRadius="lg">
          <Heading my={4} fontSize="xl">
            SpaceDataBank: ERC721 Smart Contract Info
          </Heading>
          <ReadERC721 addressContract={addressNFTContract} />
        </Box>
      </VStack>
    </>
  );
};

export default Home;
