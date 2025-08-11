require('dotenv').config();
const axios = require('axios');
const CryptoJS = require('crypto-js');

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const BASE_URL = 'https://open-api.bingx.com';

function sign(params, secretKey) {
  const sortedParams = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
  return CryptoJS.HmacSHA256(sortedParams, secretKey).toString(CryptoJS.enc.Hex);
}

async function getAccountBalance() {
  const endpoint = '/openApi/swap/v2/user/balance';
  const params = {
    timestamp: Date.now(),
  };

  const signature = sign(params, SECRET_KEY);
  
  // The apiKey is not sent as a query parameter, so we remove it after signing.
  params.signature = signature;

  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, { 
        params,
        headers: {
            'X-BX-APIKEY': API_KEY
        }
    });
    console.log('Account Balance:', response.data);
  } catch (error) {
    console.error('Error fetching account balance:', error.response ? error.response.data : error.message);
  }
}

getAccountBalance();
