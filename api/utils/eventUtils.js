const dynamo = require('../../common/dynamo'); 
const dateFormat = require('dateformat');


module.exports._subscribed_to_campaign = async (subscribed_to_campaign) => {
    try {
        //We need to check if the user has a refBy value, if so add it to the DB
        const userglobaluuid = subscribed_to_campaign.data.subscriber.id;
        const custom_fields = subscribed_to_campaign.data.subscriber.custom_fields;
        const creationdatetime = dateFormat(new Date(), "isoUtcDateTime");
        const properties = subscribed_to_campaign.data.properties;
        const original_referrer = subscribed_to_campaign.data.original_referrer;
        const landing_url = subscribed_to_campaign.data.landing_url;
        var refby = undefined;

        

        if(typeof custom_fields !== "undefined"){
           
            if(typeof custom_fields.refBy !== "undefined" && custom_fields.refBy !== custom_fields.ref){

                //Lets make sure the record doesn't exists already
                const exists = await dynamo.qetFromDB({
                  TableName: process.env.DYNAMODB_TABLE_DOMAIN_REFBY,
                  Key: {
                    ref: custom_fields.refBy,
                    userglobaluuid,
                  },
                });

                
                if(typeof exists === "undefined"){
                 var refId = undefined;
                //Check if the refBy exists in the table for other users
                const prev = await dynamo.queryDB({
                  TableName: process.env.DYNAMODB_TABLE_DOMAIN_REFBY,
                  KeyConditionExpression: "#dmn = :uuid",
                  FilterExpression: "#st <> :st",
                  ExpressionAttributeNames: {
                    "#dmn": "ref",
                    "#st": "valid",
                  },
                  ExpressionAttributeValues: {
                    ":uuid": custom_fields.refBy,
                    ":st": false,
                  },
                });

                //console.log(prev);

                //Look up the referee to check if it's a valid refBy if we don't have a record already
                if(prev.length !== 0 && typeof prev[0].refId !== "undefined"){
                    console.log('already have a rec', prev[0].refId);
                    //Set the ID to the existing
                    refId = prev[0].refId;
                }else{
                    //Call drip and get the referee data
                    var config = {
                        method: "get",
                        url: `https://api.getdrip.com/v2/${process.env.REACT_APP_DRIP_ID}/subscribers/?per_page=1000`,
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


                      const axios = require("axios");
                      const _ = require('lodash');


                      //Grab the list of all subscribers
                      const resp = await axios(config);
                      
                    
                      refId = _.result(
                        _.find(resp.data.subscribers, function (obj) {
                          return obj.custom_fields.ref === custom_fields.refBy;
                        }),
                        "id"
                      );

                      console.log("refId", refId);

                      //We need to update the drip user's tags
                      //Grab the subscriber
                      config.url = `https://api.getdrip.com/v2/${process.env.REACT_APP_DRIP_ID}/subscribers/${refId}`;
                      //Make the call to get the sub
                      var subscriber = await axios(config);

                      //Grab the record
                      subscriber = subscriber.data.subscribers[0];
                      
                      //Push the tag in
                      subscriber.tags.push("referred");
                      
                      //Now let's update the subscriber, change thr url
                      config.url = `https://api.getdrip.com/v2/${process.env.REACT_APP_DRIP_ID}/subscribers/`;
                      //change the method
                      config.method = "post";

                      //Setup the data we are changing, which is just the tags
                      var newSubscriber = {id: subscriber.id, tags: subscriber.tags};

                      //Add the data
                      config.data = {subscribers: [newSubscriber]};
                      //make the call
                      await axios(config);
                      
                }


                //Add the DB record
                await dynamo.saveItemInDB({
                    TableName: process.env.DYNAMODB_TABLE_DOMAIN_REFBY,
                    Item: {
                        ref: custom_fields.refBy,
                        userglobaluuid,
                        creationdatetime,
                        properties,
                        original_referrer,
                        landing_url,
                        refId,
                        valid: true
                    }
                  });
                  //We created a new record
                  return { error: false, success: true, creationdatetime, refby: custom_fields.refBy};
                }
            //user ref already exists
            return { error: false, success: false, message: "already exists", creationdatetime, refby: custom_fields.refBy};


            }
        }
        //No custom_field for refBy
        return { error: false, success: false, message: "no refBy", creationdatetime};


    }catch (e) {
        //console.error(e.message);
        return { error: true, message: e.message, e: e };
    }
};