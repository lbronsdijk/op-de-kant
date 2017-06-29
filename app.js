// Require modules
var config = require('./config');
var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var phantom = require('phantom');
var striptags = require('striptags');

// Init Express
var app = express();

// Support json encoded bodies
app.use(bodyParser.json());
// Support encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Lets start our server
app.listen(config.port, function () {
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Op De Kant app listening on port " + config.port);
});

// Status command
app.get('/', function(req, res) {
    res.send({
        'message': "Op De Kant server up and running!",
        'request_path': req.url
    })
});

// Op De Kant command
app.post('/opdekant', function(req, res) {
    // Create PhantomJs scrape instance
    phantom.create().then(function (ph) {
        // Create page
        ph.createPage().then(function (page) {
            // Open url
            page.open(config.opdekantUrl).then(function (status) {
                // Evaluate DOM
                // Get DOM elm by id
                page.evaluate(function() {
                    return document.getElementById('generated').innerHTML;
                }).then(function(html){
                    res.send({
                        'response_type': "in_channel",
                        'text': striptags(html)
                    })
                });

                // Close page
                page.close();

                // Exit!
                ph.exit();
            });
        });
    });
});

// Slack oAuth
app.get('/oauth', function(req, res) {
    // When a user authorizes an app, a code query parameter is passed on the oAuth endpoint. 
    // If that code is not there, we respond with an error message
    if (!req.query.code) {
        res.status(500);
        res.send({'error': "Looks like we're not getting code."});
        console.log("Looks like we're not getting code.");
    } else {
        // We'll do a GET call to Slack's `oauth.access` endpoint.
        request({
            url: 'https://slack.com/api/oauth.access',
            qs: {
                code: req.query.code,
                client_id: config.clientId,
                client_secret: config.clientSecret
            },
            method: 'GET',
        }, function (error, response, body) {
            if (error) {
                console.log(error);
            } else {
                res.json(body);
            }
        })
    }
});
