/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const OpenAI = require('openai-api');
const openai = new OpenAI(process.env.OPEN);

module.exports._executeImageAltTextPrompt = async (metaData) =>{
    try {
        const gptResponse = await openai.complete({
            "engine" : "text-davinci-002",
            "prompt": `Create a description for an alternative text attribute of an <img /> element that conveys the contents of an NFT image to describe the image to visually impaired based on these traits. When writing alt text, keep in mind that its purpose is to relay information to blind users about the image’s contents and purpose - blind users should be able to get as much information from alt text as a sighted user gets from the image itself. Alt text should give the intent, purpose, and meaning of the image:\n${metaData}\ndescription: `,
            "temperature": 0,
            "max_tokens": 150,
            "top_p": 1,
            "frequency_penalty": 0.05,
            "presence_penalty": 0
          });
        return gptResponse;
    } catch (e) {
        throw e.response.data.error;
    }
};