module.exports = function () {
	let argv;
	try {
		argv = require('minimist')(process.argv.slice(2));
	} catch (err) {}
	require('./server.js')(((argv) ? argv._ : null), argv);
};
