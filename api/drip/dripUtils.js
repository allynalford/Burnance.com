'use strict';
const responses = require('../common/responses.js');
const log = require('lambda-log');
const dateformat = require('dateformat');
const axios = require("axios");
const uuid = require('uuid');



module.exports.addSubscriber = async (event) => {
  let req, email, name, build, subscribe;

  try {
    log.options.meta.event = event;

    // add additional tags to all logs
    log.options.tags.push(event.env);

    req = JSON.parse(event.body);

    email = req.email;
    name = req.name;
    build = req.build;
    subscribe = req.subscribe;

    if (typeof email === "undefined") throw new Error("email is undefined");
    if (typeof name === "undefined") throw new Error("name is undefined");
    if (typeof build === "undefined") throw new Error("build is undefined");
    if (typeof subscribe === "undefined") subscribe = true;

  } catch (e) {
    console.error(e);
    return responses.respond(
      {
        success: false,
        error: true,
        message: e.message,
        e,
      },
      416,
      "OPTIONS,POST"
    );
  }

  try {
    const data = {
      subscribers: [
        {
          email,
          first_name: name.split(" ")[0],
          last_name: name.split(" ")[1],
          user_id: uuid.v4(),
          status: "active",
          custom_fields: {
            build,
            subscribe
          },
          tags: ["nft.tenably.app"],
          prospect: true,
          base_lead_score: 50,
        },
      ],
    };

    var config = {
      method: "post",
      url: `https://api.getdrip.com/v2/${process.env.DRIP_ID}/subscribers/`,
      headers: {
        "User-Agent": "nft.tenably.app",
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      data,
      auth: {
        username: process.env.DRIP,
        password: "",
      },
    };

      try {
        const resp = await axios(config);

        //Send Slack notification
        const slack = require('../slack/slack');
        //Send the message
        await slack.apiWaitList(name, email, build);
       
        return responses.respond(
          {
            success: true,
            exists: true,
            error: false,
            subscriber: resp.data.subscribers[0],
          },
          200,
          "OPTIONS,POST"
        );
      } catch (error) {
        console.error(error);
        return responses.respond(
          {
            success: false,
            error: true,
            message: error.message,
            e: error,
          },
          200,
          "OPTIONS,POST"
        );
      }
  } catch (e) {
    console.error(e);
    return responses.respond(
      {
        success: false,
        error: true,
        message: e.message,
        e,
      },
      200,
      "OPTIONS,POST"
    );
  }
};

module.exports.getSubscriber = async (event) => {
  let email, req;

  try {
    log.options.meta.event = event;

    // add additional tags to all logs
    log.options.tags.push(event.env);

    req = JSON.parse(event.body);

    email = req.email;

    if (typeof email === "undefined") throw new Error("email is undefined");
    //const ref = voucher._generate(6,1);
    //console.log(ref);
  } catch (e) {
    console.error(e);
    return responses.respond(
      {
        success: false,
        error: true,
        message: e.message,
        e
      },
      416,
      "OPTIONS,POST"
    );
  }

  try {


    var config = {
      method: "get",
      url: `https://api.getdrip.com/v2/${process.env.REACT_APP_DRIP_ID}/subscribers/${email}`,
      headers: {
        "User-Agent": "www.explaincode.app",
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      auth: {
        username: process.env.REACT_APP_DRIP,
        password: "",
      },
    };

      try {
        const resp = await axios(config);
        if(typeof resp.data.subscribers !== "undefined" && resp.data.subscribers.length !== 0){
          return responses.respond(
            {
              success: true,
              exists: true,
              error: false,
              resp: resp.data.subscribers[0],
            },
            200,
            "OPTIONS,POST"
          );
        }else{
          return responses.respond(
            {
              success: true,
              exists: false,
              error: false
            },
            200,
            "OPTIONS,POST"
          );
        }
      } catch (error) {
        console.log("Error", error);
        return responses.respond(
          {
            success: true,
            exists: false,
            error: false
          },
          200,
          "OPTIONS,POST"
        );
      }
  } catch (e) {
    console.error(e);
    return responses.respond(
      {
        success: false,
        error: true,
        message: e.message,
        e,
      },
      200,
      "OPTIONS,POST"
    );
  }
};