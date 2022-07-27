'use strict';
const dateFormat = require('dateformat');
const chromium = require('chrome-aws-lambda');
const log = require('lambda-log');

const agents = [
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 
    'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) `Version/12.1.1 Safari/605.1.15'
  ];

  module.exports.randomAgent = () => {
    const max = agents.length - 1;
    return Math.floor(Math.random() * Math.floor(max));
  };

  module.exports.getRandomAgent = () => {
    const max = agents.length - 1;
    return agents[Math.floor(Math.random() * Math.floor(max))];
  };

  module.exports.getBrowser = async () => {
    let args = chromium.args;
    const addArgs = ['--ignore-certificate-errors', '--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-features=AudioServiceOutOfProcess'];
    addArgs.forEach(function (item) {
        args.push(item);
    });
    return await chromium.puppeteer.launch({
        args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: true,
        devtools: false,
        userDataDir: 'cache'
    })
}


module.exports.getTxTransactionFee = async (url, page) => {
    let dt, txFee, closingPrice, gasPrice, value = "";
    try {
        log.options.tags = ['log', '<<level>>'];
        //Get a browser


        console.info(`URL: ${url}`);

        await page.goto(url, { waitUntil: 'domcontentloaded', referer: url });

        await page.waitForSelector('body', {
            visible: true,
        });

        //Grab the transaction fee
        // #ContentPlaceHolder1_spanTxFee > span
        // /html/body/div[1]/main/div[3]/div[1]/div[2]/div[1]/div/div[10]/div/div[2]/span/span
        // //*[@id="ContentPlaceHolder1_spanTxFee"]/span
        const [spanTxFeeElement] = await page.$x('//*[@id="ContentPlaceHolder1_spanTxFee"]/span');
        
        if (typeof spanTxFeeElement !== "undefined") {
            //id = await (await spanTxFeeElement.getProperty('id')).jsonValue();
            //console.log(`spanTxFeeElement`, spanTxFeeElement);
            txFee = await page.evaluate(name => name.innerText, spanTxFeeElement);
        };

        //Grab the Gas Price
        // //*[@id="ContentPlaceHolder1_spanGasPrice"]
        const [spanGasPriceElement] = await page.$x('//*[@id="ContentPlaceHolder1_spanGasPrice"]');
        
        if (typeof spanGasPriceElement !== "undefined") {
            //id = await (await spanTxFeeElement.getProperty('id')).jsonValue();
            //console.log(`spanTxFeeElement`, spanTxFeeElement);
            gasPrice = await page.evaluate(name => name.innerText, spanGasPriceElement);
        };

        //Grab the Ether Price
        // //*[@id="ContentPlaceHolder1_spanClosingPrice"]
        const [spanClosingPriceElement] = await page.$x('//*[@id="ContentPlaceHolder1_spanClosingPrice"]');
        
        if (typeof spanClosingPriceElement !== "undefined") {
            //id = await (await spanTxFeeElement.getProperty('id')).jsonValue();
            //console.log(`spanTxFeeElement`, spanTxFeeElement);
            closingPrice = await page.evaluate(name => name.innerText, spanClosingPriceElement);
        };

        //Grab the transaction value in ETH
        // //*[@id="ContentPlaceHolder1_spanValue"]/span
        const [spanValueElement] = await page.$x('//*[@id="ContentPlaceHolder1_spanValue"]/span');
        
        if (typeof spanValueElement !== "undefined") {
            //id = await (await spanTxFeeElement.getProperty('id')).jsonValue();
            //console.log(`spanTxFeeElement`, spanTxFeeElement);
            value = await page.evaluate(name => name.innerText, spanValueElement);
        };

        //Check if we had a problem
        if(typeof txFee === "undefined"){
            return {
                retry: true,
                dt: dateFormat(dt, "isoDateTime")
            }
        }


        console.info('RAW Data',{txFee, closingPrice, gasPrice, value});

        if(typeof txFee !== "undefined"){
         //Clean Up the fee
         txFee = txFee.replace(' Ether', '');
         //txFee = txFee.replace('0.', '');
        }

        if(typeof closingPrice !== "undefined"){
         //Ether Price at transaction
         closingPrice = closingPrice.replace(' / ETH', '');
         closingPrice = closingPrice.replace('$', '');
         closingPrice = closingPrice.replace(',', '');           
        }

        if (typeof gasPrice !== "undefined") {
            //Gas price at transaction
            gasPrice = gasPrice.split('Ether')[0].trim();
        }

        if (typeof value !== "undefined") {
          //value of transaction
          value = value.replace(' Ether','');
        }




        console.info('Clean Data',{txFee, closingPrice, gasPrice, value});

        //Return the data
        return {
            value: Number(value),
            txFee: Number(txFee),
            gasPrice: Number(gasPrice),
            closingPrice: Number(closingPrice),
            dt: dateFormat(dt, "isoDateTime")
        }
    } catch (err) {
        console.error(err.message);
        log.error('module.exports.getTxTransactionFee', err);
        return {
            success: false,
            error: true,
            message: err.message,
            dt: dateFormat(dt, "isoDateTime"),
            e: err
        }
    }
};

  
module.exports.check = async (url, page) => {
    let dt, id;
    try {

       

        await page.goto(url, { waitUntil: 'domcontentloaded', referer: url });

        await page.waitForSelector('body', {
            visible: true,
        });

        const [shopifySectionHeaderElement] = await page.$x('//*[@id="shopify-section-header"]');

        if (typeof shopifySectionHeaderElement !== "undefined") {
            id = await (await shopifySectionHeaderElement.getProperty('id')).jsonValue();
        };


        return {
            success: true,
            error: false,
            id,
            url,
            valid: (typeof id !== "undefined" && id === "shopify-section-header" ? true : false),
            dt: dateFormat(dt, "isoDateTime"),
        };

    } catch (err) {
        console.error(err.message);
        //log.error('module.exports.create', err);
        return {
            success: false,
            error: true,
            message: err.message,
            dt: dateFormat(dt, "isoDateTime"),
            e: err
        }
    }
};