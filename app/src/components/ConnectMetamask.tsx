import { useEffect } from "react";

import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { Box, Button, Text } from "@chakra-ui/react";
import { UserRejectedRequestError } from "@web3-react/injected-connector";
import { formatAddress } from "@/utils/helpers";
import { InjectedConnector } from "@web3-react/injected-connector";

// web3-reactを使ったWallet接続方法
const ConnectMetamask = () => {
  // Context情報を取得
  const {
    chainId,
    account,
    activate,
    deactivate,
    setError,
    active,
    library,
    connector,
  } = useWeb3React<Web3Provider>();

  // ブロックチェーンのChainIdを設定
  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 10, 42, 3141, 31337, 42161],
  });

  const onClickConnect = () => {
    // Walletを有効化
    activate(
      injected,
      (error) => {
        if (error instanceof UserRejectedRequestError) {
          console.log("user refused");
        } else {
          setError(error);
        }
      },
      false
    );
  };

  const onClickDisconnect = () => {
    deactivate();
  };

  useEffect(() => {
    console.log(chainId, account, active, library, connector);
  });

  return (
    <div>
      {active && typeof account === "string" ? (
        <Box>
          <Button type="button" w="100%" onClick={onClickDisconnect}>
            Account: {formatAddress(account, 4)}
          </Button>
          <Text fontSize="sm" w="100%" my="2" align="center">
            ChainID: {chainId} connected
          </Text>
        </Box>
      ) : (
        <Box>
          <Button type="button" w="100%" onClick={onClickConnect}>
            Connect MetaMask
          </Button>
          <Text fontSize="sm" w="100%" my="2" align="center">
            {" "}
            not connected{" "}
          </Text>
        </Box>
      )}
    </div>
  );
};

export default ConnectMetamask;
