/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const responses = require("../common/responses.js");
const log = require("lambda-log");
const dateformat = require("dateformat");


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
