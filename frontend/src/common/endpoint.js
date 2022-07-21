import axios from 'axios';
//import { aws4Interceptor } from "aws4-axios";
const apigClientFactory = require('aws-api-gateway-client').default;
const aws4  = require('aws4')
const parseURL = require("url-parse")


export const generateApiClient = (url, region, path, method) => {
    try {
        var apigClient = apigClientFactory.newClient(
            {
                invokeUrl: url,
                region: region,
                accessKey: process.env.REACT_APP_KEY,
                secretKey: process.env.REACT_APP_ACCESS,
            });
        return {
            apigClient, args: {
                pathParams: {},
                pathTemplate: parseURL(path).pathname,
                method: method,
                additionalParams: {
                    headers: {
                        //"Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Allow-Origin, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization",
                        //Origin: process.env.REACT_APP_BASE_ACCEPT,
                        //"Access-Control-Allow-Origin": process.env.REACT_APP_BASE_ACCEPT,
                        //Accept: process.env.REACT_APP_BASE_ACCEPT
                    },
                    queryParams: {
                    }
                },
                body: ''
            }
        };

    } catch (e) {
        console.log(e);
        throw e;
    }
};

  export const _getSigned = (url) =>{
    try{
        let signedRequest = aws4.sign({
            host: parseURL(url).hostname,
            method: 'GET',
            url: url,
            path: parseURL(url).pathname
        },
            {
                // assumes user has authenticated and we have called
                // AWS.config.credentials.get to retrieve keys and
                // session tokens
                secretAccessKey: process.env.REACT_APP_ACCESS,
                accessKeyId: process.env.REACT_APP_KEY
                //sessionToken: AWS.config.credentials.sessionToken
            });
          
          delete signedRequest.headers['Host']
          delete signedRequest.headers['Content-Length']
          
          return axios(signedRequest)
    }catch(e){
        console.log(e);
        throw e;
    }
  };

  export const _postSigned = (url, payload) =>{
    try{
        let signedRequest = aws4.sign({
            host: parseURL(url).hostname,
            method: 'PUT',
            url: url,
            data: payload, // object describing the foo
            body: JSON.stringify(payload), // aws4 looks for body; axios for data
            path: parseURL(url).pathname,
            headers: {
                'content-type': 'application/json'
            }
        },
            {
                // assumes user has authenticated and we have called
                // AWS.config.credentials.get to retrieve keys and
                // session tokens
                secretAccessKey: process.env.REACT_APP_ACCESS,
                accessKeyId: process.env.REACT_APP_KEY
                //sessionToken: AWS.config.credentials.sessionToken
            })
          
          delete signedRequest.headers['Host']
          delete signedRequest.headers['Content-Length']
          
          
          return axios(signedRequest)
    }catch(e){
        console.log(e);
        throw e;
    }
  };

/**
 * _get - GET request to a AWS auth URL
 * Base API URL (REACT_APP_BASE_API_URL) and REGION (REACT_APP_REGION) are pulled from environment file settings
 * @param {string} path 
 * @param {Array} req 
 */
    export const _get = (path) => {
        try {
            return _getApiClient(path);
        } catch (e) {
            console.log(e.message);
            return {error: true, message: e.message, e: e};
        }
    };
/**
 * _getExternal - GET request to an external URL
 * @param {string} path  
 */
    export const _getExternal = (path) => {
        try {
            return axios.get(path);
        } catch (e) {
            console.log(e.message);
            throw e;
        }
    };
/**
 * Event - POST a request to a AWS auth URL
 * Base API URL (REACT_APP_BASE_API_URL) and REGION (REACT_APP_REGION) are pulled from environment file settings
 * @param {string} path 
 * @param {Array} req 
 */
    export const _post = (path, req) => {
        try {
            return _postApiClient(path, req);
        } catch (e) {
            return {error: true, message: e.message, e: e};
        }
    };
/**
 * Event - postIAM a request to a AWS auth URL
 * Base API URL (REACT_APP_BASE_API_URL) and REGION (REACT_APP_REGION) are pulled from environment file settings
 * @param {string} path 
 * @param {Array} req 
 */
    export const postIAM = async (path, req)  => {
        try {
            const resp = generateApiClient(process.env.REACT_APP_BASE_API_URL, process.env.REACT_APP_REGION, path, 'POST');
            return await resp.apigClient.invokeApi(resp.args.pathParams, resp.args.pathTemplate, resp.args.method, resp.args.additionalParams, req);
        } catch (e) {
            console.log(e)
            return {error: true, message: e.message, e: e};
        }
    };
/**
 * Event - getIAM a request to a AWS auth URL
 * Base API URL (REACT_APP_BASE_API_URL) and REGION (REACT_APP_REGION) are pulled from environment file settings
 * @param {string} path
 */
    export const getIAM = async (path) => {
        try {
            const resp = generateApiClient(process.env.REACT_APP_BASE_API_URL, process.env.REACT_APP_REGION, path, 'GET');
            return await resp.apigClient.invokeApi(resp.args.pathParams, resp.args.pathTemplate, resp.args.method, resp.args.additionalParams, resp.args.body);
        } catch (e) {
            return {error: true, message: e.message, e: e};
        }
    };
/**
 * _postExternal - POST request to an external URL
 * @param {string} path 
 * @param {Array} req 
 */
    export const _postExternal = (path, req) => {
        try {
            return axios.post(path, req);
        } catch (e) {
            return {error: true, message: e.message, e: e};
        }
    };
    /**
 * _postOptions - POST request to a AWS URL with options
 * @param {string} path 
 * @param {Array} req 
 * @param {Array} options 
 */
    export const _postOptions = (path, req, options) => {
        try {
            return axios.post(path, req, options);
        } catch (e) {
            return {error: true, message: e.message, e: e};
        }
    };
    /**
 * _putOptions - PUT request to a AWS URL with options
 * @param {string} path 
 * @param {Array} req 
 * @param {Array} options 
 */
    export const _putOptions = (path, req, options) => {
        try {
            return axios.put(path, req, options);
        } catch (e) {
            return {error: true, message: e.message, e: e};
        }
    };

    export const _getApiClient = async (path) => {
        try {
            const resp = generateApiClient(process.env.REACT_APP_BASE_API_URL, process.env.REACT_APP_REGION, path, 'GET')
            return await resp.apigClient.invokeApi(resp.args.pathParams, resp.args.pathTemplate, resp.args.method, resp.args.additionalParams, resp.args.body);
        } catch (e) {
            return {error: true, message: e.message, e: e};
        }
    };

    export const _postApiClient = async (path, req) => {
        try {
            const resp = generateApiClient(process.env.REACT_APP_BASE_API_URL, process.env.REACT_APP_REGION, path, 'POST');
            return await resp.apigClient.invokeApi(resp.args.pathParams, resp.args.pathTemplate, resp.args.method, resp.args.additionalParams, req);
        } catch (e) {
            console.log(e)
            return {error: true, message: e.message, e: e};
        }
    };









