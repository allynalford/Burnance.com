
  const axios = require('axios');
  
/**
 * updateRating - send a rating for a completion in slack
 * @param {string} email
 * @param {string} completionid  
 * @param {number} rating  
 * @param {string} feedback  
 */
export const updateRating = async (email, completionid, rating, feedback) =>{

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
export const contactUs = async (email, name, subject, message) =>{

    let res = await axios.post(process.env.REACT_APP_SLACK_WEBHOOK, JSON.stringify({
        "text": `Email Address: ${email}\n Name: ${name} \nSubject: ${subject}\n Message: ${message}`,
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