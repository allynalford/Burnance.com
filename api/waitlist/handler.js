/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const responses = require("../common/responses.js");
const log = require("lambda-log");
const dateformat = require("dateformat");
const uuid = require("uuid");
const _ = require("lodash");
const cruds = require("./cruds");

module.exports.add = async (event) => {
  let req, dt, emailaddress, chain, timestamp;

  try {
    //Logging
    log.options.meta.event = event;
    // add additional tags to all logs
    log.options.tags.push(event.env);

    //Time
    dt = dateformat(new Date(), "isoUtcDateTime");
    timestamp = new Date().getTime();

    //Request
    req = JSON.parse(event.body);

    //Request Parameters
    chain = req.chain;
    emailaddress = req.emailaddress;

    //Validations
    if (typeof emailaddress === "undefined")
      throw new Error("contractAddress is undefined");
    if (typeof chain === "undefined") throw new Error("chain is undefined");
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
    //Let's see if the NFT already exists within the database
    const ADDRESS = await cruds._getAddress(chain, emailaddress);

    console.log('ADDRESS', ADDRESS)

    //Check if we have it, if so return it fast
    if (typeof ADDRESS !== "undefined" && ADDRESS.statusCode !== 400) {
      return responses.respond(
        { error: false, success: true, dt, exists: true, saved: false },
        200
      );
    }else if(typeof ADDRESS !== "undefined" && ADDRESS.statusCode == 400){
      return responses.respond(
        { error: true, success: false, dt,  code: ADDRESS.code, message: ADDRESS.message, statusCode: ADDRESS.statusCode},
        200
      );
    }

    await cruds._saveAddress({
      chain,
      emailaddress,
      emailaddressuuid: uuid.v4(),
      createdBy: "System",
      updatedBy: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdDateGMT: dateformat(new Date(), "isoUtcDateTime"),
    });

    //respond
    return responses.respond(
      {
        error: false,
        success: true,
        exists: false,
        saved: true,
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
    console.error("module.exports.add", res);
    return responses.respond(res, 201);
  }
};
