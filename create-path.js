const path = require('path');

module.exports = (dir, folder) => path.resolve( __dirname + `/${folder}` + `/${dir}.ejs` );