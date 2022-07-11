'use strict';
const responses = require('../common/responses.js');
const dynamo = require('../common/dynamo.js');
const log = require('lambda-log');
const dateformat = require('dateformat');
const s3Utils = require('../common/s3Utils.js');

module.exports.handler = async event => {
  let req, dt;

  try {
    log.options.meta.event = event;
    // add additional tags to all logs
    log.options.tags.push(event.env);
    req = JSON.parse(event.body);
    dt = dateformat(new Date(), "isoUtcDateTime");
    if (typeof req === 'undefined') throw new Error("request is undefined");
    if (typeof req.event === 'undefined') throw new Error("event is undefined");
} catch (e) {
    console.error(e);
    return responses.respond({
        success: false,
        error: true,
        message: e.message,
        e
    }, 416);
};


  try {

    if(req.event === "subscriber.subscribed_to_campaign" && req.data.properties.campaign_id === "450379256"){
      const eventUtils = require('./utils/eventUtils');
      const earlyAccessUpdate = await eventUtils._subscribed_to_campaign(req);
      console.log("earlyAccessUpdate", earlyAccessUpdate);
    }

    
    const Key = req.event + "/" + req.data.account_id + "/" + req.data.subscriber.id + "_" + req.occurred_at + ".json";
    console.log("Payload Key:", Key);
    //Add the payload to an S3 repo
    //Now lets place the results in S3 for display later
    const s3 = await s3Utils._put({
      Bucket: process.env.S3_DRIP_CDN_BUCKET,
      Key,
      Body: JSON.stringify(req),
      ContentType: "application/json"
    });
   

    if (s3.response.error !== null) {
      log.warn("Error saving to Drip Event Payload", req);

      log.error('s3.response.error', {
        error: true,
        message: s3.response.error,
        key: Key,
      });
    }


    return responses.respond({ error: false, success: true, dt}, 200);
  } catch (err) {
    console.error(err);
    const res = {
      error: true,
      success: false,
      message: err.message,
      e: err,
      code: 201
    };
    log.error('module.exports.handler', res);
    return responses.respond(res, 201);
  }
};




