/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const responses = require("../common/responses.js");
const log = require("lambda-log");
const _ = require('lodash');
const s3 = require('../common/s3Utils');
var path = require('path');
var axios = require('axios');

module.exports.generateGetUrl = async (event) => {
  let req, address, chain, tokenId, imageUrl;

  try {
    //Logging
    log.options.meta.event = event;
    // add additional tags to all logs
    log.options.tags.push(event.env);


    //Request
    req = JSON.parse(event.body);

    //Request Parameters
    chain = req.chain;
    address = req.contractAddress;
    tokenId = req.tokenId;
    imageUrl = req.imageUrl;

    //Validations
    if (typeof address === "undefined") throw new Error("address is undefined");
    if (typeof chain === "undefined") throw new Error("chain is undefined");
    if (typeof tokenId === "undefined") throw new Error("tokenId is undefined");
  } catch (e) {
    console.error(e);
    return responses.respond(
      {
        success: false,
        error: true,
        message: e.message,
      },
      416
    );
  }

  try {

    const imageExt = path.extname(imageUrl);
    console.log('EXT',imageExt);
    const Key = `${chain}/${address}/${tokenId}${imageExt}`;
    const ContentType = `image/${(imageExt.replace('.','') === "jpg" ? "jpeg" : imageExt.replace('.',''))}`
    
    
    const resp = await axios.get(imageUrl, {
        decompress: false,
        responseType: "arraybuffer",
      });

      const upload = await s3._put({
        Bucket: process.env.NFT_IMAGE_CDN_BUCKET,
        Key,
        Body: resp.data,
        ContentType
      });

      console.log('upload', upload);

    
    
    const url = s3._generateGetUrl(process.env.NFT_IMAGE_CDN_BUCKET, Key, 180);
    //const url = s3._generateGetUrl(process.env.NFT_IMAGE_CDN_BUCKET,process.env.NFT_IMAGE_CDN_BUCKET, '0xPunk_2647.png', 180);

    //respond
    return responses.respond(
      {
        error: false,
        success: true,
        url
      },
      200
    );
  } catch (err) {
    console.error(err);
    const res = {
      error: true,
      success: false,
      message: err.message,
      e: err,
      code: 201,
    };
    console.error("module.exports.qn_fetchNFTs", res);
    return responses.respond(res, 201);
  }
};
