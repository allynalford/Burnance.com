
const responses = require('../common/responses.js');
const dateformat = require('dateformat');
const axios = require("axios");
const voucher = require('../common/voucher');



module.exports.addSubscriber = async (email, refBy) => {

  try {
 


    if (typeof email === "undefined") throw new Error("email is undefined");
    if (typeof refBy === "undefined") throw new Error("refBy is undefined");

  } catch (e) {
    console.error(e);
    return {
      success: false,
      error: true,
      message: e.message,
      e,
    };
  }

  try {
    const ref = voucher._generate(6,1)[0];
    const data = {
      subscribers: [
        {
          email,
          tags: ["waitlisted"],
          status: "active",
          custom_fields: {
            waitlist: true,
            waitlist_date_time: dateformat(new Date(), "isoUtcDateTime"),
            ref,
            refBy
          },
          tags: [refBy, "waitlisted"],
          prospect: true,
          base_lead_score: (typeof refBy !== "undefined" ? 50 : 35),
        },
      ],
    };

    var config = {
      method: "post",
      url: `https://api.getdrip.com/v2/${process.env.REACT_APP_DRIP_ID}/subscribers/`,
      headers: {
        "User-Agent": "www.explaincode.app",
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      data,
      auth: {
        username: process.env.REACT_APP_DRIP,
        password: "",
      },
    };

      try {
        const resp = await axios(config);
        console.log(resp.data);
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
      } catch (error) {
        console.log(error);
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