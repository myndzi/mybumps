'use strict';

var fs = require('fs'),
    PATH = require('path'),
    semver = require('semver');

var TYPES = {
  'json': [
    require('./types/package.json.js')
  ],
  'xml': [
    require('./types/build.xml.js'),
    require('./types/pom.xml.js'),
    require('./types/child-pom.xml.js')
  ]
};

module.exports = function (workDir) {
  function load(path, content) {
    var exts = Object.keys(TYPES).join('|'),
        matches = path.match(new RegExp('\\.('+exts+')$', 'i')),
        shortName = PATH.relative(workDir, path);

    if (!matches) {
      throw new Error('Unknown file type: ' + shortName);
    }

    var ext = matches[1].toLowerCase(),
        types = TYPES[ext],
        data;

    for (var i = 0; i < types.length; i++) {
      data = types[i](content);

      if (data.get()) {
        return {
          data: data,
          path: path,
          shortName: shortName,
          dirty: false
        };
      }
    }

    throw new Error('Unable to determine type of file: ' + shortName);
  }

  function loadAll(files) {
    return files.map(function (file) {
      var path = PATH.resolve(PATH.join(workDir, file));
      var buf = fs.readFileSync(path);
      return load(path, buf);
    });
  }

  function get(files) {
    var loaded = loadAll(files);

    loaded.forEach(function (file) {
      console.error(file.shortName, file.data.get());
    });

    return loaded[0].data.get();
  }

  function put(files, argv) {
    var fromVer = argv.from,
        toVer = argv.to;

    if (!semver.gte(semver.inc(toVer, 'patch'), semver.inc(fromVer, 'patch'))) {
      console.error(
        'Error: target version must be greater than or equal to source version (%s < %s)',
        toVer, fromVer
      );
      process.exit(1);
    }

    var loaded = loadAll(files);

    loaded.forEach(function (file) {
      var fileVer = file.data.get();
      if (!fileVer || !semver.valid(fileVer)) {
        console.error(
          'Error: couldn\'t recognize file "%s" or invalid semver (%s)',
          file.shortName, fileVer
        );
        process.exit(2);
      }
      if (fromVer !== fileVer) {
        console.error(
          'Error: file "%s" (version %s) doesn\'t match "from" version (%s)',
          file.shortName, fileVer, fromVer
        );
        process.exit(3);
      }
    });

    loaded.forEach(function (file) {
      file.data.put(toVer);
      console.error(file.shortName, toVer);
      fs.writeFileSync(file.path, file.data.stringify());
    });

    return toVer;
  }

  return { get: get, put: put };
};
