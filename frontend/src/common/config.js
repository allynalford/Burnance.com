const serverVars = {
  user: {
    addWaitlistApiUrl: process.env.REACT_APP_BASE_API_URL + '/waitlist/add',
  },
  networkName: 'main',
  chainId: '1',
  network: {
    add: {
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '1',
          rpcUrls: ['https://mainnet.infura.io/v3/'],
          chainName: 'Ethereum Mainnet',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
          blockExplorerUrls: ['https://etherscan.io'],
        },
      ],
    },
    switch: {
      method: 'wallet_switchEthereumChain',
      params: [{chainId: '1'}],
    },
  },

  chain: {
    eth: {
      viewNFTApiUrl: process.env.REACT_APP_BASE_API_URL + '/view/nft',
      //getWalletNFTsApiUrl: process.env.REACT_APP_BASE_API_URL + '/quicknode/qn_fetchNFTs',
      getNFTImageApiUrl: process.env.REACT_APP_BASE_API_URL + '/nft/image',
      getTokenNftTxApiUrl:
        process.env.REACT_APP_BASE_API_URL + '/utils/tokenNftTx',
      getEthPriceApiUrl: process.env.REACT_APP_BASE_API_URL + '/utils/ethprice',
      getGasPriceApiUrl: process.env.REACT_APP_BASE_API_URL + '/utils/gasprice',
      getWalletNFTsApiUrl: process.env.REACT_APP_BASE_API_URL + '/wallet/nfts',
      getWalletCollectionsApiUrl:
        process.env.REACT_APP_BASE_API_URL + '/collection',
      viewWalletCollectionApiUrl:
        process.env.REACT_APP_BASE_API_URL + '/collection/view',
      addWalletApiUrl: process.env.REACT_APP_BASE_API_URL + '/wallet',
      getWalletApiUrl: process.env.REACT_APP_BASE_API_URL + '/wallet',
      viewWalletCollectionNftsApiUrl:
        process.env.REACT_APP_BASE_API_URL + '/wallet/collection',
      addWalletSellTxApiUrl: process.env.REACT_APP_BASE_API_URL + '/wallet/tx',
      viewWalletGuarenteeSellTxApiUrl:
        process.env.REACT_APP_BASE_API_URL + '/wallet/txs/guarantees',
      getIsCollectionApprovedApiUrl:
        process.env.REACT_APP_BASE_API_URL + '/collection/isapproved/',
    },
    coins: {
      getCMCCoinMetaDataApiUrl: process.env.REACT_APP_BASE_API_URL + '/cmc/metadata',
      getCMCQuotesApiUrl: process.env.REACT_APP_BASE_API_URL + '/cmc/quotes',
      deleteCoinApiUrl: process.env.REACT_APP_BASE_API_URL + '/wallet/coin/',
      getCoinsApiUrl:  process.env.REACT_APP_BASE_API_URL + '/wallet/coins/',
      addCoinApiUrl:  process.env.REACT_APP_BASE_API_URL + '/wallet/coin'

    },
    coinAbi: [
      {
        constant: true,
        inputs: [
          {
            name: '_owner',
            type: 'address',
          },
        ],
        name: 'balanceOf',
        outputs: [
          {
            name: 'balance',
            type: 'uint256',
          },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      },
    ]
  },
};

const localVars = {
  user: {
    addWaitlistApiUrl: process.env.REACT_APP_BASE_API_URL + '/waitlist/add',
  },
  networkName: 'rinkeby',
  chainId: '4',
  network: {
    add: {
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '4',
          rpcUrls: ['https://rinkeby.infura.io/v3/'],
          chainName: 'Rinkeby Test Network',
          nativeCurrency: {
            name: 'RinkebyETH',
            symbol: 'RinkebyETH',
            decimals: 18,
          },
          blockExplorerUrls: ['https://rinkeby.etherscan.io'],
        },
      ],
    },
    switch: {
      method: 'wallet_switchEthereumChain',
      params: [{chainId: '4'}],
    },
  },
  chain: {
    eth: {
      viewNFTApiUrl: process.env.REACT_APP_BASE_API_URL + '/view/nft',
      //getWalletNFTsApiUrl: process.env.REACT_APP_BASE_API_URL + '/quicknode/qn_fetchNFTs',
      getNFTImageApiUrl: process.env.REACT_APP_BASE_API_URL + '/nft/image',
      getTokenNftTxApiUrl:
        process.env.REACT_APP_BASE_API_URL + '/utils/tokenNftTx',
      getEthPriceApiUrl: process.env.REACT_APP_BASE_API_URL + '/utils/ethprice',
      getGasPriceApiUrl: process.env.REACT_APP_BASE_API_URL + '/utils/gasprice',
      getWalletNFTsApiUrl: process.env.REACT_APP_BASE_API_URL + '/wallet/nfts',
      getWalletCollectionsApiUrl:
        process.env.REACT_APP_BASE_API_URL + '/collection',
      viewWalletCollectionApiUrl:
        process.env.REACT_APP_BASE_API_URL + '/collection/view',
      addWalletApiUrl: process.env.REACT_APP_BASE_API_URL + '/wallet',
      getWalletApiUrl: process.env.REACT_APP_BASE_API_URL + '/wallet',
      viewWalletCollectionNftsApiUrl:
        process.env.REACT_APP_BASE_API_URL + '/wallet/collection',
      addWalletSellTxApiUrl: process.env.REACT_APP_BASE_API_URL + '/wallet/tx',
      viewWalletGuarenteeSellTxApiUrl:
        process.env.REACT_APP_BASE_API_URL + '/wallet/txs/guarantees',
      getIsCollectionApprovedApiUrl:
        process.env.REACT_APP_BASE_API_URL + '/collection/isapproved/',
    },
    coins: {
      getCMCCoinMetaDataApiUrl: process.env.REACT_APP_BASE_API_URL + '/cmc/metadata',
      getCMCQuotesApiUrl: process.env.REACT_APP_BASE_API_URL + '/cmc/quotes',
      deleteCoinApiUrl: process.env.REACT_APP_BASE_API_URL + '/wallet/coin/',
      getCoinsApiUrl:  process.env.REACT_APP_BASE_API_URL + '/wallet/coins/',
      addCoinApiUrl:  process.env.REACT_APP_BASE_API_URL + '/wallet/coin'
    },
    coinAbi: [
      {
        constant: true,
        inputs: [
          {
            name: '_owner',
            type: 'address',
          },
        ],
        name: 'balanceOf',
        outputs: [
          {
            name: 'balance',
            type: 'uint256',
          },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      },
    ]
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
};

export function getCoins() {
  if (process.env.REACT_APP_STAGE === 'production') {
    return serverVars.coins;
  }
  return localVars.coins;
}

export function getNetwork() {
  if (process.env.REACT_APP_STAGE === 'production') {
    return serverVars.network;
  }
  return localVars.network;
}

export function getNetworkName() {
  if (process.env.REACT_APP_STAGE === 'production') {
    return serverVars.networkName;
  }
  return localVars.networkName;
}

export function getChainId() {
  if (process.env.REACT_APP_STAGE === 'production') {
    return serverVars.chainId;
  }
  return localVars.chainId;
}