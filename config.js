require('dotenv').config();

var config = {};

config.port = process.env.PORT || 3000;
config.clientId = process.env.CLIENT_ID;
config.clientSecret = process.env.CLIENT_SECRET;
config.slackHookUri = "https://hooks.slack.com/services/T5WFP7QS3/B5YJF456W/" + process.env.SLACK_HOOK_SECRET;

module.exports = config;
