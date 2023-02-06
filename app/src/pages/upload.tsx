import type { NextPage } from "next";
import Head from "next/head";
import { VStack, Heading } from "@chakra-ui/layout";
import ConnectMetamask from "@/components/ConnectMetamask";
import { BigNumber, Signer } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { addressNFTContract } from "@/utils/constants";
import {
  TransactionResponse,
  TransactionReceipt,
} from "@ethersproject/abstract-provider";
import React, { useState } from "react";
import { SpaceDataBankABI as abi } from "@/abi/SpaceDataBankABI";
import { Button, FormControl, FormLabel, Textarea } from "@chakra-ui/react";
import lighthouse from "@lighthouse-web3/sdk";

const Upload = () => {
  const { account, active, library } = useWeb3React<Web3Provider>();

  const [file, setFile] = useState<File | null>(null);
  const [fileUploadEvent, setFileUploadEvent] =
    useState<React.ChangeEvent<HTMLInputElement> | null>(null);
  const [productMetadata, setProductMetadata] = useState<string | null>(null);
  const [dataHash, setDataHash] = useState<string | null>(null);
  const [signer, setSigner] = useState<Signer | undefined>(undefined);

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setFile(files[0]);
    }
    setFileUploadEvent(e);
  };

  const onChangeText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProductMetadata(e.target.value);
  };

  const progressCallback = (progressData: any) => {
    let percentageDone =
      100 - Number((progressData.total / progressData.uploaded).toFixed(2));
    console.log("progress:", percentageDone);
  };

  const uploadLighthouse = async () => {
    console.log("upload lighthouse...");
    const uploadSigner = library?.getSigner();
    const signerAddress = await uploadSigner?.getAddress();
    const messageRequested = (await lighthouse.getAuthMessage(signerAddress!))
      .data.message;
    const signedMessage = await uploadSigner?.signMessage(messageRequested);

    const response = await lighthouse.uploadEncrypted(
      fileUploadEvent,
      signerAddress,
      process.env.NEXT_PUBLIC_LIGHTHOUSE_API,
      signedMessage,
      progressCallback
    );

    console.log("response: ", response);
    setDataHash(response.data.Hash);
  };

  // mint NFT
  const mint = async () => {
    console.log("mint NFT...");
    const mintSigner = await library?.getSigner();
    const nft: Contract = new Contract(addressNFTContract, abi, mintSigner);

    // mint for connected user
    nft
      .mintTo(account, file?.name, file?.size, dataHash, productMetadata)
      .then((tr: TransactionResponse) => {
        console.log(`TransactionResponse TX hash: ${tr.hash}`);
        tr.wait().then((receipt: TransactionReceipt) => {
          console.log("transfer receipt", receipt);
        });
      })
      .catch((e: Error) => console.log(e));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!(active && account && library)) return;

    console.log(file?.size);
    console.log(file?.name);
    console.log(productMetadata);

    if (file && productMetadata) {
      await uploadLighthouse();
      await mint();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl>
        <FormLabel htmlFor="amount">Zip File: </FormLabel>
        <input
          name="file"
          type="file"
          accept="application/zip"
          onChange={onChangeFile}
        />
        <FormLabel>Product Metadata: </FormLabel>
        <Textarea
          placeholder="Here is product metadata"
          margin="10px"
          onChange={onChangeText}
        />
        <Button
          type="submit"
          isDisabled={!(account && file && productMetadata)}
        >
          Upload Data
        </Button>
      </FormControl>
    </form>
  );
};

const UploadPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Space Data Bank</title>
      </Head>

      <Heading as="h3" my={4}>
        Upload Data
      </Heading>

      <ConnectMetamask />

      <VStack>
        <Upload />
      </VStack>
    </>
  );
};

export default UploadPage;
