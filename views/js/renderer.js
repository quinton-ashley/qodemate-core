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

	const template = [
		{
			label: 'File',
			submenu: [{
				label: 'Open',
				click() {
					let proj = dialog.showOpenDialog({
						properties: ['openFile', 'openDirectory']
					});
					ent.open(proj);
				}
			}]
		}, {
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
			label: 'Qodemate',
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

		// Window menu
		template[4].submenu = [
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

	function next() {
		let slide = ent.nextSlide();
		if (slide != 'same') {
			$('#presentation').empty();
			$('#presentation').prepend(md.render(slide));
		}
		ent.next();
	}

	$('#close').click(ent.close);
	$('#next').click(next);
	$('#play').click(ent.play);
	$('#reset').click(ent.reset);

};
