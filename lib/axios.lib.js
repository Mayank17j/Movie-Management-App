const axios = require("axios");
require("dotenv").config();
//TODO: update baseUrl, header format
//create axiosInstance to get request
//Provides ACCESS_TOKEN, API_KEY
const axiosInstance = axios.create({
  baseURL: process.env.MICROSERVICE_BASE_URL, //baseURL, headers must be exactly same as client want to verify
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.ACCESS_TOKEN}`, //Case sensetive
  },
});

// Debugging Axios instance configuration
/*
if (
  !axiosInstance.defaults.baseURL ||
  !axiosInstance.defaults.headers.Authorization
) {
  console.error("LOG: Axios. axiosInstance incorrect:", {
    baseURL: axiosInstance.defaults.baseURL,
    Authorization: axiosInstance.defaults.headers.Authorization,
  });
} else {
  console.log("LOG: Axios. axiosInstance  successfully configured:", {
    baseURL: axiosInstance.defaults.baseURL,
    Authorization: axiosInstance.defaults.headers.Authorization,
  });
}
*/
module.exports = axiosInstance;
