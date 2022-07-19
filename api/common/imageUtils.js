/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const cruds = require('./cruds');
const s3 = require('./s3Utils');
const log = require('lambda-log');
const axios = require('axios');
var path = require('path');

module.exports._getNFTUrl = async (chain, contractAddress, tokenId, imageUrl) => {
    try {
        
        var imageExt = path.extname(imageUrl);

        //Make sure there is an ext
        if (imageExt === "") {
            imageExt = ".png"
        };


        const cleanExt = imageExt.replace(".", "");
        //Create the key to store it
        const Key = `${chain}/${contractAddress}/${tokenId}${imageExt}`;

        //Create the content type
        const ContentType = `image/${cleanExt === "jpg" ? "jpeg" : cleanExt}`;

        //Download the image
        const resp = await axios.get(imageUrl, {
            decompress: false,
            responseType: "arraybuffer",
        });

        //Upload the image to S3
        const saved = await s3._put({
            Bucket: process.env.NFT_IMAGE_CDN_BUCKET,
            Key,
            Body: resp.data,
            ContentType,
            ACL: 'public-read'
        });

        //console.log(`Saved(${Key}):`, saved);


        //Save the Image key data to DB
        await cruds._saveNFTImage(chain, contractAddress, tokenId, Key);

        // const generatedImageUrl = s3._generateGetUrl(
        //     process.env.NFT_IMAGE_CDN_BUCKET,
        //     Key,
        //     Expires
        // );

       return `https://${process.env.NFT_IMAGE_CDN_BUCKET}/${Key}`;


    } catch (e) {
        console.error('module.exports._getNFTUrl', e);
        log.error(e);
        throw e;
    }
};