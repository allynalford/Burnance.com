/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const responses = require("../common/responses.js");
const alchemyUtils = require('./utils');


module.exports.getGasPrice = async (event) => {

  try {

    //Check if the NFT already exists for this wallet
    const gasPrice = await alchemyUtils.gasPrice();

    console.log('getGasPrice:gasPrice', gasPrice);


    //respond
    return responses.respond(
      {
        error: false,
        success: true,
        result: gasPrice
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
    console.error("module.exports.getGasPrice", res);
    return responses.respond(res, 201);
  }
};