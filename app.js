/*
* WeatherStation-Archiver
* Retrieves Weather Station data from Things Network Storage Integration API at 11:59 PM EST each day, then archives it in a MongoDB database.
*/

const axios = require('axios');
const cron = require('node-cron');
// Store THINGSAPIKEY for Things Network, ENDPOINT for Things Network API endpoint (on Storage Integration page), MONGOURI for MongoDB, DATABASENAME and COLLECTIONNAME for MongoDB
// in file named ".env" in the format EXAMPLE="KeyGoesHere"
require('dotenv').config();
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGOURI, {});

/* makeGetRequest
*  Makes Get Request to Things Network API to get the current day's worth of data. Data is kept every 24 hours so this is the latest data.
*/
const makeGetRequest = async () => {
  try {
    // Current data in YYYY-MM-DD to be sent as part of request
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}T00:00:00Z`;
    
    const queryParams = {
      limit: null,
      after: formattedDate
    };
    
    const config = {
      headers: {
        'Authorization': `Bearer ${process.env.THINGSAPIKEY}`,
        'Accept': 'text/event-stream'
      },
      params: queryParams
    };

    const response = await axios.get(process.env.ENDPOINT, config);
    console.log(`GET request sent at ${new Date().toLocaleString()}`);
    const lines = response.data.split('\n').filter(line => line.trim() !== ''); // Format data (newline-separated json) into individual lines
    const parsedData = lines.map(line => JSON.parse(line)); // Put those lines into an array

    await storeDataInMongoDB(parsedData); // Send to mongodb

  } catch (error) {
    console.error('Error making GET request:', error.message);
    throw error; 
  }
};

// Stores data in MongoDB.
const storeDataInMongoDB = async (data) => {
  try {
    await client.connect();
    console.log('Connected to MongoDB');    
    const database = client.db(process.env.DATABASENAME);
    const collection = database.collection(process.env.COLLECTIONNAME);
    if (!data) {
      throw new Error('Data to store is undefined');
    }
    const result = await collection.insertMany(data);
    console.log(`${result.insertedCount} documents inserted`);
    
  } catch (error) {
    console.error('Error storing data in MongoDB:', error.message);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
};

// Archive each day at 11:59 PM EST
cron.schedule('59 23 * * *', async () => {
  try {
    await makeGetRequest();
  } catch (error) {
    console.error('Error occurred in scheduled task:', error.message);
  }
}, {
  timezone: 'America/New_York'
});

