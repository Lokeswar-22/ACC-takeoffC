
'use strict';   

const express = require('express');
const { database }= require('../config');

const MongoClient = require('mongodb').MongoClient;
const router = express.Router();

var mongoClient = new MongoClient(database.url, { useNewUrlParser: true, useUnifiedTopology: true });

/////////////////////////////////////////////////////////////////////
// get the price book info from database
/////////////////////////////////////////////////////////////////////
router.get('/pricebook/items', async (req, res, next) => {
    mongoClient.connect((err) => {
        if (err) {
            console.error(err);
            return (res.status(500).json({
                diagnostic: "failed to connect server"
            }));
        }
        const collection = mongoClient.db("PriceBook").collection("DinningRoom");
        // perform actions on the collection object
        collection.find({}).toArray(function (err, docs) {
            if (err) {
                console.error(err);
                mongoClient.close();
                return (res.status(500).json({
                    diagnostic: "failed to find the items in collection"
                }));
            }
            res.status(200).json(docs.filter(item => { return (item != null) }));
            return;
            // TBD   mongoClient.close();
        });
    });
});

module.exports = router;
