# WeatherStation-Archiver
WeatherStation-Archiver is a tool to archive data from The Things Network Storage Integration API to a MongoDB database. 
In our case, it retrieves Weather Station data from The Things Network Storage Integration API at 11:59 PM EST each day, then archives it in a MongoDB database. 
However, this should theoretically work for any device on The Things Network.

# How to Run 🏃:
1. Install all dependencies (node.js, `npm install cron axios mongodb dotenv` should cover everything)
2. Create a Things Network API Key and save it somewhere secure.
3. Find the MongoURI for your MongoDB database, and create a database and collection name for where you want the data to go.
4. Create a file called .env in the project folder. 
5. Store THINGSAPIKEY for Things Network, ENDPOINT for Things Network API endpoint (on Storage Integration page), MONGOURI for MongoDB, DATABASENAME and COLLECTIONNAME for MongoDB in this file in the format EXAMPLE="KeyGoesHere"
6. Run `node app.js`. Wait for 11:59 PM EST and your data should update.
