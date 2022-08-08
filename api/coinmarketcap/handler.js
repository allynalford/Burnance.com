/*jshint esversion: 6 */
/* jshint -W117 */
'use strict';
const dateFormat = require('dateformat');
const responses = require('../common/responses.js');
const cmcUtils = require('./coinMarketCap');


module.exports.getMetadatav2 = async (event) => {
  let req, dt, address, metaData;
  try {
    req = JSON.parse(event.body);
    dt = dateFormat(new Date(), "isoUtcDateTime");

    address = event.pathParameters.address;

    if (typeof address === "undefined") throw new Error("address is undefined");

  } catch (e) {
    console.error(e);
    return respond(
      {
        success: false,
        error: true,
        message: e.message,
        e,
      },
      416
    );
  }

  try {

    const metaDataResp = await cmcUtils.getMetadatav2(address);

    //console.log(metaDataResp.data)

    metaData = metaDataResp.data


    return responses.respond({ error: false, success: true, metaData, dt}, 200);
  } catch (err) {
    console.error(err);
    const res = {
      error: true,
      success: false,
      message: err.message,
      e: err,
      code: 201,
    };
    console.error("module.exports.getMetadatav2", err.response.data);

    if(typeof err.response.data !== "undefined"){
      return responses.respond({metaData: err.response.data, error: true, success: false}, 200);
    }
    return responses.respond(res, 201);
  }
};

module.exports.getQuotesLatestv2 = async (event) => {
  let req, symbols, dt;
  try {
    req = JSON.parse(event.body);
    dt = dateFormat(new Date(), "isoUtcDateTime");

    symbols = req.symbols;

    if (typeof symbols === "undefined") throw new Error("symbols is undefined");
    if (symbols.length === 0) throw new Error("symbols list is empty");

  } catch (e) {
    console.error(e);
    return respond(
      {
        success: false,
        error: true,
        message: e.message,
        e,
      },
      416
    );
  }

  try {

    const quotesResp = await cmcUtils.getQuotesLatestv2(symbols);

    //console.log(metaDataResp.data)

    const results = quotesResp.data;


    return responses.respond({ error: false, success: true, results}, 200);
  } catch (err) {
    console.error(err);
    const res = {
      error: true,
      success: false,
      message: err.message,
      e: err,
      code: 201,
    };
    console.error("module.exports.getMetadatav2", err.response.data);

    if(typeof err.response.data !== "undefined"){
      return responses.respond({metaData: err.response.data, error: true, success: false}, 200);
    }
    return responses.respond(res, 201);
  }
};




