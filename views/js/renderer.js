module.exports = function () {
	const {
		app,
		dialog,
		Menu
	} = require('electron').remote;
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
	const log = console.log;

	const Presenter = require('./presenter.js');
	let ent = new Presenter();

	//		const template = [{
	//			label: 'File',
	//			submenu: [{
	//				label: 'Open',
	//				click() {
	//					dialog.showOpenDialog({
	//						properties: ['openFile', 'openDirectory', 'multiSelections']
	//					});
	//				}
	//			}]
	//		}];

	const template = [
		{
			label: 'File',
			submenu: [{
				label: 'Open',
				click() {
					//					ent.open([path.join(__dirname + '/../../dev/jsTestFolder')]);
					ent.open(dialog.showOpenDialog({
						properties: ['openFile', 'openDirectory']
					}));
				}
			}]
		},
		{
			label: 'Edit',
			submenu: [
				{
					role: 'undo'
				},
				{
					role: 'redo'
				},
				{
					type: 'separator'
				},
				{
					role: 'cut'
				},
				{
					role: 'copy'
				},
				{
					role: 'paste'
				},
				{
					role: 'pasteandmatchstyle'
				},
				{
					role: 'delete'
				},
				{
					role: 'selectall'
				}
    ]
  },
		{
			label: 'View',
			submenu: [
				{
					role: 'reload'
				},
				{
					role: 'forcereload'
				},
				{
					role: 'toggledevtools'
				},
				{
					type: 'separator'
				},
				{
					role: 'resetzoom'
				},
				{
					role: 'zoomin'
				},
				{
					role: 'zoomout'
				},
				{
					type: 'separator'
				},
				{
					role: 'togglefullscreen'
				}
    ]
  },
		{
			role: 'window',
			submenu: [
				{
					role: 'minimize'
				},
				{
					role: 'close'
				}
    ]
  },
		{
			role: 'help',
			submenu: [
				{
					label: 'Learn More',
					click() {
						require('electron').shell.openExternal('https://electronjs.org')
					}
      }
    ]
  }
]

	if (process.platform === 'darwin') {
		template.unshift({
			label: app.getName(),
			submenu: [
				{
					role: 'about'
				},
				{
					type: 'separator'
				},
				{
					role: 'services',
					submenu: []
				},
				{
					type: 'separator'
				},
				{
					role: 'hide'
				},
				{
					role: 'hideothers'
				},
				{
					role: 'unhide'
				},
				{
					type: 'separator'
				},
				{
					role: 'quit'
				}
    ]
		})

		// Edit menu
		template[1].submenu.push({
			type: 'separator'
		}, {
			label: 'Speech',
			submenu: [
				{
					role: 'startspeaking'
				},
				{
					role: 'stopspeaking'
				}
      ]
		})

		// Window menu
		template[3].submenu = [
			{
				role: 'close'
			},
			{
				role: 'minimize'
			},
			{
				role: 'zoom'
			},
			{
				type: 'separator'
			},
			{
				role: 'front'
			}
  ]
	}

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);

	//		let mark = __parentDir + '/../usr/test0.md';
	//		let file = fs.readFile(mark, 'utf8', (err, data) => {
	//		if (err) {
	//		log(err);
	//		}
	//		res.render('index', {
	//		title: 'Hey',
	//		md: md.render(data.toString())
	//		});
	//		});
	//		});
	//		});

	$('#close').click(ent.close);
	$('#next').click(ent.next);
	$('#play').click(ent.play);
	$('#reset').click(ent.reset);

};
