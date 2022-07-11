const DATA_BUCKET_NAME = process.env.S3_CDN_BUCKET;
const AWS = require('aws-sdk');
const S3Client = new AWS.S3();

const parseDataAsJSON = (data) => {
  let result;

  try {
    result = JSON.parse(data);
  } catch (e) {
    throw new Error('Parsing data error: ' + e.message);
  }

  return result;
};


module.exports = {
  putObject(bucket, key, data, modifier) {
    let dataString = '';
    let contentType = 'application/json';

    switch ( modifier ) {
      case 'athena-json' :
        dataString = JSON.stringify(data).replace(/\},\{/g, '}\n{').slice(1, -1);
        break;
      case 'html' :
        contentType = 'text/html';
        dataString = data;
        break;
      case 'image' :
        contentType = 'image/png';
        dataString = data;
        break;
      default :
        dataString = JSON.stringify(data);
        break;
    }

    return S3Client.putObject({
      Bucket              : bucket || DATA_BUCKET_NAME,
      Key                 : key,
      Body                : dataString,
      ContentType         : contentType,
    })
      .promise()
      .then(result => {
        return result;
      })
      .catch(error => {
        return error;
      });
  },
}
