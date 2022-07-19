const serverVars = {
  user: {
    addWaitlistApiUrl:
      process.env.REACT_APP_BASE_API_URL + '/waitlist/add',
  },
  chain: {
        eth: {
         viewNFTApiUrl: process.env.REACT_APP_BASE_API_URL + '/view/nft',
         getWalletNFTsApiUrl: process.env.REACT_APP_BASE_API_URL + '/quicknode/qn_fetchNFTs',
         getNFTImageApiUrl: process.env.REACT_APP_BASE_API_URL + '/nft/image',
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
         getWalletNFTsApiUrl: process.env.REACT_APP_BASE_API_URL + '/quicknode/qn_fetchNFTs',
         getNFTImageApiUrl: process.env.REACT_APP_BASE_API_URL + '/nft/image',
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