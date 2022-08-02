const serverVars = {
  user: {
    addWaitlistApiUrl:
      process.env.REACT_APP_BASE_API_URL + '/waitlist/add',
  },
  chain: {
        eth: {
         viewNFTApiUrl: process.env.REACT_APP_BASE_API_URL + '/view/nft',
         //getWalletNFTsApiUrl: process.env.REACT_APP_BASE_API_URL + '/quicknode/qn_fetchNFTs',
         getNFTImageApiUrl: process.env.REACT_APP_BASE_API_URL + '/nft/image',
         getTokenNftTxApiUrl: process.env.REACT_APP_BASE_API_URL + '/utils/tokenNftTx',
         getEthPriceApiUrl: process.env.REACT_APP_BASE_API_URL + '/utils/ethprice',
         getGasPriceApiUrl: process.env.REACT_APP_BASE_API_URL + '/utils/gasprice',
         getWalletNFTsApiUrl: process.env.REACT_APP_BASE_API_URL + '/wallet/nfts',
         getWalletCollectionsApiUrl: process.env.REACT_APP_BASE_API_URL + '/collection',
         viewWalletCollectionApiUrl: process.env.REACT_APP_BASE_API_URL + '/collection/view',
         addWalletApiUrl: process.env.REACT_APP_BASE_API_URL + '/wallet',
         getWalletApiUrl: process.env.REACT_APP_BASE_API_URL + '/wallet',
         viewWalletCollectionNftsApiUrl: process.env.REACT_APP_BASE_API_URL + '/wallet/collection',
         addWalletSellTxApiUrl: process.env.REACT_APP_BASE_API_URL + '/wallet/tx',
         viewWalletGuarenteeSellTxApiUrl: process.env.REACT_APP_BASE_API_URL + '/wallet/txs/guarantees'
        }
  },
};

const localVars = {
  user: {
    addWaitlistApiUrl:
      process.env.REACT_APP_BASE_API_URL + '/waitlist/add',
  },
  chain: {
        eth: {
         viewNFTApiUrl: process.env.REACT_APP_BASE_API_URL + '/view/nft',
         //getWalletNFTsApiUrl: process.env.REACT_APP_BASE_API_URL + '/quicknode/qn_fetchNFTs',
         getNFTImageApiUrl: process.env.REACT_APP_BASE_API_URL + '/nft/image',
         getTokenNftTxApiUrl: process.env.REACT_APP_BASE_API_URL + '/utils/tokenNftTx',
         getEthPriceApiUrl: process.env.REACT_APP_BASE_API_URL + '/utils/ethprice',
         getGasPriceApiUrl: process.env.REACT_APP_BASE_API_URL + '/utils/gasprice',
         getWalletNFTsApiUrl: process.env.REACT_APP_BASE_API_URL + '/wallet/nfts',
         getWalletCollectionsApiUrl: process.env.REACT_APP_BASE_API_URL + '/collection',
         viewWalletCollectionApiUrl: process.env.REACT_APP_BASE_API_URL + '/collection/view',
         addWalletApiUrl: process.env.REACT_APP_BASE_API_URL + '/wallet',
         getWalletApiUrl: process.env.REACT_APP_BASE_API_URL + '/wallet',
         viewWalletCollectionNftsApiUrl: process.env.REACT_APP_BASE_API_URL + '/wallet/collection',
         addWalletSellTxApiUrl: process.env.REACT_APP_BASE_API_URL + '/wallet/tx',
         viewWalletGuarenteeSellTxApiUrl: process.env.REACT_APP_BASE_API_URL + '/wallet/txs/guarantees'
        }
  },
};


export function getConfiguration() {
  if (process.env.REACT_APP_STAGE === 'production') {
    return serverVars;
  }
  return localVars;
}



export function getUser() {
  if (process.env.REACT_APP_STAGE === 'production') {
    return serverVars.user;
  }
  return localVars.user;
}

export function getChain() {
  if (process.env.REACT_APP_STAGE === 'production') {
    return serverVars.chain;
  }
  return localVars.chain;
}