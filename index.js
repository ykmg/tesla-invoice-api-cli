#!/usr/bin/env node
const { program } = require('commander');
const yargsInteractive = require('yargs-interactive');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const requestBody = require('./requestBody.json'); 
require('dotenv').config();

const moment = require('moment');
const getInvoices = async (token, vin, startDate) => new Promise ((resolve, reject) => {
    axios.post(
        `https://akamai-apigateway-charging-ownership.tesla.com/graphql?deviceLanguage=de&deviceCountry=DE&ttpLocale=en_US&vin=${vin}&operationName=getChargingHistoryV2`,
        requestBody,
        {
            headers: {
              'User-Agent': 'Tesla/1195 CFNetwork/1388 Darwin/22.0.0',
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              "Authorization": "Bearer " + token,
              "x-tesla-user-agent": "TeslaApp/4.11.1/12ad93c62a/ios/16.0",
            }
        }
    )
    .then((response) => {
        if(!response.data.data || !response.data.data.me.charging.historyV2.data) {
            console.log('No data found');
            resolve([]);
        }


        let invoices = response.data.data.me.charging.historyV2.data
        if(startDate && moment(startDate).isValid()) {
            invoices = invoices.filter((invoice) => {
                return moment(invoice.chargeStartDateTime).isSameOrAfter(startDate);
            })
        }

        let invoiceIds = invoices.map((invoice) => (invoice.invoices));
        invoiceIds = invoiceIds.flat().map((invoice) => (invoice.contentId));
        resolve(invoiceIds);
    })
    .catch((error) => {
        reject(error);
    })
})

const downloadInvoice = (token, id, vin) => new Promise ((resolve, reject) => {
    
    axios.get(
        `https://ownership.tesla.com/mobile-app/charging/invoice/${id}?deviceCountry=US&deviceLanguage=en&vin=${vin}`,
        {
            headers: {
                "Authorization": "Bearer " + token,
                "Accept": "application/pdf",
            },
            responseType: 'stream',
        }
    )
    .then((response) => {
        console.log('Downloading invoice ' + id);
        const pdfContents = response.data;
        if(!pdfContents) {
            console.log('No data found');
            reject(new Error('No data found'));
        } else {
            const writer = fs.createWriteStream(path.join(process.cwd(), `./invoices/${id}.pdf`))
            pdfContents.pipe(writer);
            writer.on('finish', () => {
                resolve();
            })
            writer.on('error', (error) => {
                reject(error);
            })
        }
    })
    .catch((error) => {
        reject(error);
    })
})

const downloadInvoiceBatch = (token, ids, vin) => new Promise ((resolve, reject) => {
    if(!fs.existsSync(path.join(process.cwd(), './invoices'))) {
        fs.mkdirSync(path.join(process.cwd(), './invoices'));
    }
    Promise.all(ids.map((id) => downloadInvoice(token, id, vin)))
    .then(() => {
        resolve();
    })
    .catch((error) => {
        reject(error);
    })
})



const options = {
    interactive: { default: true },
    startDate: {
        type: 'text',
        describe: "Start date",
    },
};

if(!process.env.TESLA_API_TOKEN){
    options.token = {
        type: 'text',
        describe: "Please provide your API token",
    }
}

if(!process.env.TESLA_API_VIN){
    options.token = {
        type: 'text',
        describe: "Please provide your VIN",
    }
}

program
    .command('download')
    .description('Download invoices from the API')
    .action(() => {
        console.log('Downloading invoices...');
        let token = '';
        let vin = '';
        let startDate = '';

        yargsInteractive()
            .usage('$0 <cmd> [args]')
            .interactive(options)
            .then((result) => {
                token = result.token || process.env.TESLA_API_TOKEN;
                vin = result.vin || process.env.TESLA_API_VIN;
                startDate = result.startDate;
                return getInvoices(token, vin, startDate);
            })
            .then((invoiceIds) => downloadInvoiceBatch(token, invoiceIds, vin))
            .then(() =>{
                console.log('Done');
                process.exit(0);
            })
            .catch((error) => {
                console.log(error);
                process.exit(1);
            })
    });

program.parse(process.argv);