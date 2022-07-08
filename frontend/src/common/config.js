const serverVars = {
  user: {
    addUserApiUrl:
      process.env.REACT_APP_BASE_API_URL + '/user/add',
    getUserApiUrl:
      process.env.REACT_APP_BASE_API_URL + '/user/get/',
    checkUserApiUrl:
      process.env.REACT_APP_BASE_API_URL + '/user/check',
  },
  billing: {
    checkoutApiUrl:
      process.env.REACT_APP_BASE_API_URL + '/billing/checkout',
    manageApiUrl:
      process.env.REACT_APP_BASE_API_URL + '/billing/manage',
  },
  drip: {
    addSubscriberApiUrl:
      process.env.REACT_APP_BASE_API_URL + '/drip/subscriber/add',
    getSubscriberApiUrl:
      process.env.REACT_APP_BASE_API_URL + '/drip/subscriber/get',
  },
  gtp3: {
    post_EnglishToSql_Prompt: process.env.REACT_APP_BASE_API_URL + '/tool/englishtosql',
    post_ExplainFunction_Prompt: process.env.REACT_APP_BASE_API_URL + '/tool/function/explain',
    post_JS_To_Python_Prompt: process.env.REACT_APP_BASE_API_URL + '/tool/javascripttopython',
    post_Python_Bug_Prompt: process.env.REACT_APP_BASE_API_URL + '/tool/pythonbugfixer',
    post_Summary_Prompt: process.env.REACT_APP_BASE_API_URL + '/tool/summary',
    post_Line_Prompt: process.env.REACT_APP_BASE_API_URL + '/tool/linebyline',
    post_Freeform_Prompt: process.env.REACT_APP_BASE_API_URL + '/tool/freeform',
    post_javadoc_comment_Prompt: process.env.REACT_APP_BASE_API_URL + '/tool/javadoc/comment',
  },
  auth0: {
    updateProfile: process.env.REACT_APP_BASE_API_URL + '/profile/update',
    profileAuth: process.env.REACT_APP_BASE_API_URL + '/profile/auth',
    changeUserAuth: process.env.REACT_APP_BASE_API_URL + '/profile/auth/cred',
  },
  completions: {
    updateCompletionRating:
      process.env.REACT_APP_BASE_API_URL + '/completions/rating/update',
    userCompletionCount:
      process.env.REACT_APP_BASE_API_URL + '/completions/user/count',
  },
  snippets: {
    saveSnippet: process.env.REACT_APP_BASE_API_URL + '/snippet/save',
    getSnippets: process.env.REACT_APP_BASE_API_URL + '/snippets/user/',
    getSnippet: process.env.REACT_APP_BASE_API_URL + '/snippet/',
    getSnippetsCount:
      process.env.REACT_APP_BASE_API_URL + '/snippet/user/count/',
    updateSnippet: process.env.REACT_APP_BASE_API_URL + '/snippet/update',
    deleteSnippet: process.env.REACT_APP_BASE_API_URL + '/snippet/delete/',
    snippetsPagination:
      process.env.REACT_APP_BASE_API_URL + '/snippets/user/pagination',
  },
  tiers: {
    free: {
      codelength: 200,
      snippets: 10,
      projects: 1,
      explanations: 10,
    },
    trial: {
      codelength: 500,
      snippets: 10,
      projects: 1,
      explanations: 15,
      days: 3,
    },
    earlyaccess: {
      codelength: 1000,
      snippets: 0,
      projects: 0,
      explanations: 20,
      days: 3,
    },
    starter: {
      codelength: 750,
      snippets: 35,
      projects: 1,
      explanations: 200,
    },
    pro: {
      codelength: 1500,
      snippets: 0,
      projects: 0,
      explanations: 0,
    },
  },
  yearly:['price_1KGVA2CneYX9jOaELYm5eaW2','price_1KGVB4CneYX9jOaEjQbB4TGB'],
  monthly: ['price_1KE0eCCneYX9jOaEZj1FjE6H', 'price_1KGVAeCneYX9jOaESzU0eXiI'],
  products: {prod_Kx4fxD4Aiig9ad: 'starter', prod_Kx4g5i2ulYDJcX: 'pro', prod_Kx4giZw4VBrsGb: 'free'},
  pricing: [
    {
      header: 'Free Plan',
      active: false,
      isActive: false,
      isFree: true,
      buttonText: 'Free Account',
      product: 'prod_Kx4giZw4VBrsGb',
      price: {
        monthly: '$0',
        monthId: 'price_1KHAWlCneYX9jOaEQr2AzAyw',
        yearly: '$0',
        yearId: 'price_1KHAWlCneYX9jOaEQr2AzAyw',
        yearlyEarly: '$0',
        yearlyEarlyId: 'price_1KHAWlCneYX9jOaEQr2AzAyw'
      },
      subheader: 'Start testing',
      features: [
                'Full Access to all Tools', 
                '200 Character Snippets',
                '10 Explanations/Month',
                '15 Saved Snippets',
                '1 Project'
                ]
    },
    {
      header: 'Starter',
      product: 'prod_Kx4fxD4Aiig9ad',
      active: true,
      isActive: false,
      buttonText: 'Upgrade',
      price: {
        monthly: '$7.00',
        monthId: 'price_1KsW8BCneYX9jOaEVQxRlbTp',
        yearly: '$70.00',
        yearId: 'price_1KsW7MCneYX9jOaEEeSGFwhY',
        yearlyEarly: '$60.00',
        yearlyEarlyId: 'price_1KgxEgCneYX9jOaECetNGjvu'
      },
      subheader: 'Perfect for getting started.',
      features: [
                'Full Access to all Tools', 
                '750 Character limit',
                '200 Explanations/Month',
                '35 Saved Snippets',
                '1 Project'
                ]
    },
    {
      header: 'Pro',
      product: 'prod_Kx4g5i2ulYDJcX',
      active: false,
      isActive: false,
      buttonText: 'Upgrade',
      price: {
        monthly: '$19.00',
        monthId: 'price_1KgxHNCneYX9jOaEC1cyMagJ',
        yearly: '$190.00',
        yearId: 'price_1KgxIQCneYX9jOaEwOdVKUNA',
        yearlyEarly: '$170.00',
        yearlyEarlyId: 'price_1KgxIsCneYX9jOaEpjH54nqy'
      },
      subheader: 'Best for large code',
      features: [
        'Full Access to all Tools', 
        '1,500 Character limit',
        'Unlimited Explanations',
        'Unlimited Saved Snippets',
        'Unlimited Projects'
        ]
    },
    {
      header: 'Teams',
      active: false,
      custom: true,
      isActive: false,
      buttonText: 'Contact Us',
      product: 'custom',
      link:'mailto:sales@tenablylabs.com?subject=Explain Code App Custom Team Plan',
      price: {
        monthly: '$0.00',
        yearly: '$0.00',
      },
      subheader: 'Great for Startups, Schools and Enterprise.',
      features: [
        'Full Access to all Tools', 
        '1,500 Character limit',
        'Unlimited Explanations',
        'Unlimited Saved Snippets',
        'Unlimited Projects',
        'Multiple Team Members'
        ]
    },
    
  ],
  waitlistText: 'Early Access',
};

const localVars = {
  user: {
    addUserApiUrl:
      process.env.REACT_APP_BASE_API_URL + '/user/add',
    getUserApiUrl:
      process.env.REACT_APP_BASE_API_URL + '/user/get/',
    checkUserApiUrl:
      process.env.REACT_APP_BASE_API_URL + '/user/check',
  },
  billing: {
    checkoutApiUrl:
      process.env.REACT_APP_BASE_API_URL + '/billing/checkout',
    manageApiUrl:
      process.env.REACT_APP_BASE_API_URL + '/billing/manage',
  },
  drip: {
    addSubscriberApiUrl:
      process.env.REACT_APP_BASE_API_URL + '/drip/subscriber/add',
    getSubscriberApiUrl:
      process.env.REACT_APP_BASE_API_URL + '/drip/subscriber/get',
  },
  gtp3: {
    post_EnglishToSql_Prompt: process.env.REACT_APP_BASE_API_URL + '/tool/englishtosql',
    post_ExplainFunction_Prompt:process.env.REACT_APP_BASE_API_URL + '/tool/function/explain',
    post_JS_To_Python_Prompt: process.env.REACT_APP_BASE_API_URL + '/tool/javascripttopython',  
    post_Python_Bug_Prompt: process.env.REACT_APP_BASE_API_URL + '/tool/pythonbugfixer',  
    post_Summary_Prompt: process.env.REACT_APP_BASE_API_URL + '/tool/summary',
    post_Line_Prompt: process.env.REACT_APP_BASE_API_URL + '/tool/linebyline',
    post_Freeform_Prompt: process.env.REACT_APP_BASE_API_URL + '/tool/freeform',
    post_javadoc_comment_Prompt: process.env.REACT_APP_BASE_API_URL + '/tool/javadoc/comment',
  },
  auth0: {
    updateProfile: process.env.REACT_APP_BASE_API_URL + '/profile/update',
    profileAuth: process.env.REACT_APP_BASE_API_URL + '/profile/auth',
    changeUserAuth: process.env.REACT_APP_BASE_API_URL + '/profile/auth/cred',
  },
  completions: {
    updateCompletionRating:
      process.env.REACT_APP_BASE_API_URL + '/completions/rating/update',
    userCompletionCount:
      process.env.REACT_APP_BASE_API_URL + '/completions/user/count',
  },
  snippets: {
    saveSnippet: process.env.REACT_APP_BASE_API_URL + '/snippet/save',
    getSnippets: process.env.REACT_APP_BASE_API_URL + '/snippets/user/',
    getSnippet: process.env.REACT_APP_BASE_API_URL + '/snippet/',
    getSnippetsCount:
      process.env.REACT_APP_BASE_API_URL + '/snippet/user/count/',
    updateSnippet: process.env.REACT_APP_BASE_API_URL + '/snippet/update',
    deleteSnippet: process.env.REACT_APP_BASE_API_URL + '/snippet/delete/',
    snippetsPagination:
      process.env.REACT_APP_BASE_API_URL + '/snippets/user/pagination',
  },
  tiers: {
    free: {
      codelength: 200,
      snippets: 15,
      projects: 1,
      explanations: 10,
    },
    trial: {
      codelength: 1500,
      snippets: 50,
      projects: 1,
      explanations: 20,
      days: 7,
    },
    earlyaccess: {
      codelength: 1500,
      snippets: 0,
      projects: 0,
      explanations: 0,
      days: 14,
    },
    starter: {
      codelength: 500,
      snippets: 35,
      projects: 1,
      explanations: 200,
    },
    pro: {
      codelength: 1500,
      snippets: 0,
      projects: 0,
      explanations: 0,
    },
  },
  yearly:['price_1KGVA2CneYX9jOaELYm5eaW2','price_1KGVB4CneYX9jOaEjQbB4TGB'],
  monthly: ['price_1KE0eCCneYX9jOaEZj1FjE6H', 'price_1KGVAeCneYX9jOaESzU0eXiI'],
  products: {prod_KtoGID0Sj9MmA4: 'starter', prod_Ku5hPkvud8Svl0: 'pro'},
  pricing: [
    {
      header: 'Free Plan',
      active: true,
      isActive: false,
      isFree: true,
      buttonText: 'Free Account',
      product: 'prod_Kx41kIUpFB85Uf',
      price: {
        monthly: '$0',
        monthId: 'price_1KH9tBCneYX9jOaE64jAuS38',
        yearly: '$0',
        yearId: 'price_1KH9tBCneYX9jOaE64jAuS38',
        yearlyEarly: '$0',
        yearlyEarlyId: 'price_1KH9tBCneYX9jOaE64jAuS38'
      },
      subheader: 'Start testing',
      features: [
                'Full Access to all Tools', 
                '200 Character limit',
                '10 Explanations/Month',
                '15 Saved Snippets',
                '1 Project'
                ]
    },
    {
      header: 'Starter',
      active: true,
      isActive: false,
      buttonText: 'Upgrade',
      product: 'prod_KtoGID0Sj9MmA4',
      price: {
        monthly: '$12.00',
        monthId: 'price_1KE0eCCneYX9jOaEZj1FjE6H',
        yearly: '$120.00',
        yearId: 'price_1KGVA2CneYX9jOaELYm5eaW2',
        yearlyEarly: '$99.00',
        yearlyEarlyId: 'price_1KGa1BCneYX9jOaEBnzQEGGA'
      },
      subheader: 'Perfect for getting started.',
      features: [
                'Full Access to all Tools', 
                '500 Character limit',
                '200 Explanations/Month',
                '35 Saved Snippets',
                '1 Project'
                ]
    },
    {
      header: 'Pro',
      active: true,
      isActive: true,
      buttonText: 'Upgrade',
      product: 'prod_Ku5hPkvud8Svl0',
      price: {
        monthly: '$36.00',
        monthId: 'price_1KGVAeCneYX9jOaESzU0eXiI',
        yearly: '$360.00',
        yearId: 'price_1KGVB4CneYX9jOaEjQbB4TGB',
        yearlyEarly: '$300.00',
        yearlyEarlyId: 'price_1KGa0gCneYX9jOaE1zCMqCtd'
      },
      subheader: 'Best for large code',
      features: [
        'Full Access to all Tools', 
        '1,500 Character limit',
        'Unlimited Explanations',
        'Unlimited Saved Snippets',
        'Unlimited Projects'
        ]
    },
    {
      header: 'Teams',
      buttonText: 'Contact Us',
      isActive: false,
      link:'mailto:sales@tenablylabs.com?subject=Explain Code App Custom Team Plan',
      product: 'custom',
      active: false,
      custom: true,
      price: {
        monthly: '$0.00',
        yearly: '$0.00',
      },
      subheader: 'Great for Startups, Schools and Enterprise.',
      features: [
        'Full Access to all Tools', 
        '1,500 Character limit',
        'Unlimited Explanations',
        'Unlimited Saved Snippets',
        'Unlimited Projects',
        'Multiple Team Members'
        ]
    },
    
  ],
  waitlistText: 'Get Early Access',
};

export const WAITLIST_TEXT =
  process.env.REACT_APP_STAGE === 'production'
    ? serverVars.waitlistText
    : localVars.waitlistText;

    export const MONTHLY_PRICES =
  process.env.REACT_APP_STAGE === 'production'
    ? serverVars.monthly
    : localVars.monthly;

    export const YEARLY_PRICES =
    process.env.REACT_APP_STAGE === 'production'
      ? serverVars.yearly
      : localVars.yearly;
//export const SAVE_SNIPPET_ENABLED = process.env.REACT_APP_SAVE_SNIPPET_ENABLED;
//export const SAVE_EXPLANATION_ENABLED = process.env.REACT_APP_SAVE_EXPLANATION_ENABLED;

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

export function getBilling() {
  if (process.env.REACT_APP_STAGE === 'production') {
    return serverVars.billing;
  }
  return localVars.billing;
}

export function getDrip() {
  if (process.env.REACT_APP_STAGE === 'production') {
    return serverVars.drip;
  }
  return localVars.drip;
}

export function getGTP3() {
  if (process.env.REACT_APP_STAGE === 'production') {
    return serverVars.gtp3;
  }
  return localVars.gtp3;
}

export function getAuth0() {
  if (process.env.REACT_APP_STAGE === 'production') {
    return serverVars.auth0;
  }
  return localVars.auth0;
}

export function getCompletions() {
  if (process.env.REACT_APP_STAGE === 'production') {
    return serverVars.completions;
  }
  return localVars.completions;
}

export function getSnippets() {
  if (process.env.REACT_APP_STAGE === 'production') {
    return serverVars.snippets;
  }
  return localVars.snippets;
}

export function getTier(tier) {
  if (process.env.REACT_APP_STAGE === 'production') {
    return serverVars.tiers[tier];
  }
  return localVars.tiers[tier];
}

export function getPricing() {
  if (process.env.REACT_APP_STAGE === 'production') {
    return serverVars.pricing;
  }
  return localVars.pricing;
}
