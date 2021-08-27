const regex = /^build\/test\/(?<dir>(?:[^/]+(?<!\.d)\/)*)(?:(?<dpath>[^/]+?)\.d.*|(?<fpath>[^/]+)\.js)$/u;
module.exports = (testFile) => testFile.replace(regex, 'build/$<dir>$<dpath>$<fpath>.js');
