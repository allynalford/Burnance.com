const axios = require("axios");

module.exports.getMetadatav2 = async (address) => {
    try {
      return await axios({
        method: "get",
        url: `${process.env.CMC_API_URL}/cryptocurrency/info`,
        params: {address},
        headers: {
          "X-CMC_PRO_API_KEY": process.env.CMC_KEY,
          Accept: "*/*",
          "Access-Control-Allow-Origin" : "*"
        }
      });
    } catch (e) {
      console.error(e.message);
      throw e;
    }
  };

  module.exports.getQuotesLatestv2 = async (symbols) => {
    try {
      const symbol = symbols.join(',');
      return await axios({
        method: "get",
        url: `${process.env.CMC_API_URL}/cryptocurrency/quotes/latest`,
        params: {symbol},
        headers: {
          "X-CMC_PRO_API_KEY": process.env.CMC_KEY,
          Accept: "*/*",
          "Access-Control-Allow-Origin" : "*"
        }
      });
    } catch (e) {
      console.error(e.message);
      throw e;
    }
  };