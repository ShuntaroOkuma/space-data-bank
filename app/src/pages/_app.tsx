import { ChakraProvider } from "@chakra-ui/react";
import { Layout } from "@/components/layout";
import type { AppProps } from "next/app";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

// Web3ProviderのContextを設定
// ReactのContextを使ってどのコンポーネントからでもproviderを使えるようにしている
function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  return library;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ChakraProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </Web3ReactProvider>
  );
}
