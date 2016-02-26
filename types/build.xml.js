'use strict';

var cheerio = require('cheerio');

module.exports = function (buf) {
  var $ = cheerio.load(buf.toString('utf8'), { xmlMode: true });
  
  return {
    get: function () {
      return [
        $('project>property[name=majorVersion]').attr('value'),
        $('project>property[name=minorVersion]').attr('value'),
        $('project>property[name=patchVersion]').attr('value')
      ].filter(function (v) { return !!v; })
       .join('.');
    },
    put: function (val) {
      var vers = val.split('.');
      $('project>property[name=majorVersion]').attr('value', vers[0]);
      $('project>property[name=minorVersion]').attr('value', vers[1]);
      $('project>property[name=patchVersion]').attr('value', vers[2]);
    },
    stringify: function () {
      return $.xml();
    }
  };
};