const maxstacheStream = require("maxstache-stream-variable-injection");
const maxstache = require("maxstache-variable-injection");
const parallel = require("run-parallel");
const eos = require("end-of-stream");
const readdirp = require("readdirp");
const assert = require("assert");
const mkdirp = require("mkdirp");
const noop = require("noop2");
const path = require("path");
const pump = require("pump");
const fs = require("graceful-fs");

module.exports = copyTemplateDir;

const defaultPattern = "{{\\s*([^{}\\s]+)\\s*}}";

// High throughput template dir writes
// (str, str, obj, fn) -> null
function copyTemplateDir(srcDir, outDir, vars, pattern, cb) {
  if (!cb) {
    if (!vars) vars = noop;
    cb = vars;
    vars = {};
  }

  assert.equal(typeof srcDir, "string");
  assert.equal(typeof outDir, "string");
  assert.equal(typeof vars, "object");
  assert.equal(typeof cb, "function");

  // create directory
  mkdirp(outDir, function (err) {
    if (err) return cb(err);

    const rs = readdirp({ root: srcDir });
    const streams = [];
    const createdFiles = [];

    // create a new stream for every file emitted
    rs.on("data", function (file) {
      createdFiles.push(
        path.join(
          outDir,
          maxstache(
            removeUnderscore(file.path),
            vars,
            pattern ?? defaultPattern
          )
        )
      );
      streams.push(writeFile(outDir, vars, file, pattern));
    });

    // delegate errors & close streams
    eos(rs, function (err) {
      if (err) return cb(err);
      parallel(streams, function (err) {
        if (err) return cb(err);
        cb(null, createdFiles);
      });
    });
  });
}

// write a file to a directory
// str -> stream
function writeFile(outDir, vars, file, pattern) {
  return function (done) {
    const fileName = file.path;
    const inFile = file.fullPath;
    const parentDir = file.parentDir;
    const outFile = path.join(
      outDir,
      maxstache(removeUnderscore(fileName), vars, pattern ?? defaultPattern)
    );

    mkdirp(
      path.join(outDir, maxstache(parentDir, vars, pattern ?? defaultPattern)),
      function (err) {
        if (err) return done(err);

        const rs = fs.createReadStream(inFile);
        const ts = maxstacheStream(vars, pattern ?? defaultPattern);
        const ws = fs.createWriteStream(outFile);

        pump(rs, ts, ws, done);
      }
    );
  };
}

// remove a leading underscore
// str -> str
function removeUnderscore(filepath) {
  const parts = filepath.split(path.sep);
  const filename = parts.pop().replace(/^_/, "");
  return parts.concat([filename]).join(path.sep);
}
