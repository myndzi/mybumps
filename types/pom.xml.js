'use strict';

var cheerio = require('cheerio');

module.exports = function (buf) {
  var $ = cheerio.load(buf.toString('utf8'), { xmlMode: true });
  
  return {
    get: function () {
      return $('project>version').text();
    },
    put: function (val) {
      $('project>version').text(val);
    },
    stringify: function () {
      return $.xml();
    }
  };
};