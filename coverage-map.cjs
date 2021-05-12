const regexJoined = /^build\/test\/(.*)\.d\/.*\.(?:ts|js)/u;
const regexFile = /^build\/test\/(.*)\.(?:ts|js)/u;
module.exports = (testFile) => testFile.replace(regexJoined, 'build/$1.js').replace(regexFile, 'build/$1.js');
