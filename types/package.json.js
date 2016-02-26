'use strict';

var cheerio = require('cheerio');

module.exports = function (buf) {
  var json = JSON.parse(buf.toString('utf8'));
  
  return {
    get: function () {
      return json.version;
    },
    put: function (val) {
      json.version = val;
    },
    stringify: function () {
      return JSON.stringify(json, null, 2);
    }
  };
};