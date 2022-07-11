
  const axios = require('axios');
  
/**
 * updateWaitlist - add user to waitlist slack channel
 * @param {string} email  
 */
 module.exports.updateWaitlist = async (email) =>{
    let res = await axios.post(process.env.REACT_APP_SLACK_CONTACTUS_WEBHOOK, JSON.stringify({
        "text": `Email Address: ${email}`,
    }), {
        withCredentials: false,
        transformRequest: [(data, headers) => {
            delete headers.post["Content-Type"]
            return data
        }]
    })

    if (res.status === 200) {
        return {success: true, res}
    } else {
        return {success: false, res}
    }
}
/**
 * updateRating - send a rating for a completion in slack
 * @param {string} email
 * @param {string} completionid  
 * @param {number} rating  
 * @param {string} feedback  
 */
 module.exports.updateRating = async (email, completionid, rating, feedback) =>{

    let res = await axios.post(process.env.REACT_APP_SLACK_RATING_WEBHOOK, JSON.stringify({
        "text": `Email Address: ${email}\n Completion: ${completionid} \nRating: ${rating}\n Feedback: ${feedback}`,
    }), {
        withCredentials: false,
        transformRequest: [(data, headers) => {
            delete headers.post["Content-Type"]
            return data
        }]
    })

    if (res.status === 200) {
        return {success: true, res}
    } else {
        return {success: false, res}
    }
}
/**
 * contactUs - send contact us details to slack channel
 * @param {string} email
 * @param {string} name  
 * @param {string} subject  
 * @param {string} message  
 */
 module.exports.apiWaitList = async (name, email, build) =>{

    let res = await axios.post(process.env.SLACK_API_WAITLIST_WEBHOOK, JSON.stringify({
        "text": `Email Address: ${email}\n Name: ${name} \n Building: ${build}`,
    }), {
        withCredentials: false,
        transformRequest: [(data, headers) => {
            delete headers.post["Content-Type"]
            return data
        }]
    })

    if (res.status === 200) {
        return {success: true, res}
    } else {
        return {success: false, res}
    }
}