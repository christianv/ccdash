var request = require('request');
var sharedEvents = require('./sharedEventEmitter.js');

var scrapePullsResponse = [];

var username = process.env.GITHUB_USERNAME;
var password = process.env.GITHUB_PASSWORD;

var sendEvent = function() {
  sharedEvents.emit('scraped.github', {
    pulls: scrapePullsResponse
  });
};

var parsePulls = function(body) {
  body = JSON.parse(body);

  scrapePullsResponse = [];

  body.forEach(function(element) {
    var pullResponse = {
      url: element.html_url,
      state: element.state,
      title: element.title,
      user: {
        avatar: element.user.avatar_url,
        name: element.user.login,
        url: element.user.html_url
      }
    };
    scrapePullsResponse.push(pullResponse);
  });

  sendEvent();
};

var scrapePulls = function() {
  request({
    url: 'https://api.github.com/repos/ets-berkeley-edu/calcentral/pulls',
    rejectUnauthorized: false,
    headers: {
      'User-Agent': 'request'
    }
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      parsePulls(body);
    }
  }).auth(username, password, true);
};

var init = function() {
  setInterval(scrapePulls, 4000);
};

module.exports = {
  init: init
};
