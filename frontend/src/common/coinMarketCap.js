const axios = require("axios");

module.exports.getMetadatav2 = async (address) => {
    try {
  
  
      

      const resp = await axios({
        method: "get",
        url: `${process.env.REACT_APP_CMC_API_URL}/cryptocurrency/info`,
        params: {address},
        headers: {
          "X-CMC_PRO_API_KEY": process.env.REACT_APP_CMC_KEY,
          Accept: "*/*",
          "Access-Control-Allow-Origin" : "*"
        }
      });

      return resp;
  
        
    } catch (e) {
      console.error(e);
      throw e;
    }
  };