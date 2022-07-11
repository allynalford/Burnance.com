/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const AWS = require('aws-sdk');

//DynamoDB
function deleteItemFromDB(params){
  try {
    const dynamoDB = new AWS.DynamoDB.DocumentClient();
    return dynamoDB
      .delete(params)
      .promise()
      .then(res => res)
      .catch(err => err);
  } catch (err) {
    return {error: true, message: err.message, e: err};
  }
}

//Save the item
function saveItemInDB(params) {
    try {
      const dynamoDB = new AWS.DynamoDB.DocumentClient();
      return dynamoDB
        .put(params)
        .promise()
        .then(res => res)
        .catch(err => err);
    } catch (err) {
      return {error: true, message: err.message, e: err};
    }
  };
    //Get an Item
 function qetFromDB(params) {
    try {
      const dynamoDB = new AWS.DynamoDB.DocumentClient();
      return dynamoDB
        .get(params)
        .promise()
        .then(res => res.Item)
        .catch(err => err);
    } catch (err) {
        return {error: true, message: err.message, e: err};
    }
  };
  //Update and Item
function updateDB(params) {
    try {
      const dynamoDB = new AWS.DynamoDB.DocumentClient();
      return dynamoDB
        .update(params)
        .promise()
        .then(res => res.Items)
        .catch(err => err);
    } catch (err) {
        return {error: true, message: err.message, e: err};
    }
  };
  //Query DB
function queryDB(params) {
    try {
      const dynamoDB = new AWS.DynamoDB.DocumentClient();
      return dynamoDB
        .query(params)
        .promise()
        .then(res => res.Items)
        .catch(err => err);
    } catch (err) {
        return {error: true, message: err.message, e: err};
    }
  };

  function fullyQueryDB(params) {
    try {
      const dynamoDB = new AWS.DynamoDB.DocumentClient();
      return dynamoDB
        .query(params)
        .promise()
        .then(res => res)
        .catch(err => err);
    } catch (err) {
        return {error: true, message: err.message, e: err};
    }
  };

    //Scan DB
function scanDB(params) {
  try {
    const dynamoDB = new AWS.DynamoDB.DocumentClient();
    return dynamoDB
      .scan(params)
      .promise()
      .then(res => res.Items)
      .catch(err => err);
  } catch (err) {
      return {error: true, message: err.message, e: err};
  }
};

  module.exports.saveItemInDB = saveItemInDB;
  module.exports.qetFromDB = qetFromDB;
  module.exports.updateDB = updateDB;
  module.exports.queryDB = queryDB;
  module.exports.deleteItemFromDB = deleteItemFromDB;
  module.exports.scanDB = scanDB;
module.exports.fullyQueryDB = fullyQueryDB;