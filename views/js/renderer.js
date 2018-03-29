module.exports = function () {
	const fs = require('fs-extra'); // open source library adds functionality to standard node.js fs
	const md = require('markdown-it')();
	const path = require('path');
	const $ = require('jquery');

	window.$ = window.jQuery = $;
	window.Tether = require('tether');
	window.Bootstrap = require('bootstrap');

	const __homeDir = require('os').homedir();
	const __parentDir = path.join(__homeDir + '/Documents/apps/qodemate/views');
	//	const __parentDir = path.dirname(process.mainModule.filename);

	let Presenter = require('./presenter.js');
	let ent = new Presenter([path.join(__dirname + '/../../dev/jsTestFolder')]);

	//		let mark = __parentDir + '/../usr/test0.md';
	//		let file = fs.readFile(mark, 'utf8', (err, data) => {
	//			if (err) {
	//				log(err);
	//			}
	//			res.render('index', {
	//				title: 'Hey',
	//				md: md.render(data.toString())
	//			});
	//		});
	//	});
	//		});

	$('#close').click(ent.close);
	$('#next').click(ent.next);
	$('#play').click(ent.play);
	$('#reset').click(ent.reset);

};
