const Bot = function () {
	const os = require('os');
	const osType = os.type();
	const linux = (osType == 'Linux');
	const mac = (osType == 'Darwin');
	const win = (osType == 'Windows_NT');
	const robot = require('robotjs');
	//	robot.setKeyboardDelay(10);

	const log = console.log;

	let loc = {
		app: {
			x: 600,
			y: 600
		},
		file: [{
			x: 1150,
			y: 20
			}]
	};

	this.ensureKeysNotPressed = (cb) => {
		//		while (robot.Keyboard.getState(robot.KeySpace)) {}
		cb();
	}

	this.focusOnApp = function () {
		if (mac) {
			robot.keyTap('tab', 'command');
			robot.keyToggle('command', 'up');
		} else {
			// might be able to use alt+tab on windows
			robot.moveMouse(loc.app.x, loc.app.y);
			robot.mouseClick();
		}
	}

	this.focusOnFile = function (fidx) {
		if (mac) {
			robot.keyTap('tab', 'command');
			robot.keyToggle('command', 'up');
		} else {
			robot.moveMouse(loc.file[fidx].x, loc.file[fidx].y);
			robot.mouseClick();
		}
	}

	this.clear = function () {
		log('clear file contents');
		robot.keyTap('a', 'command');
		robot.keyTap('backspace');
	}

	this.moveToStart = () => {
		log('moved to Start');
		robot.keyTap('up', 'command');
	}

	this.moveToEnd = () => {
		log('moved to End');
		robot.keyTap('down', 'command');
	}

	this.moveToBOL = () => {
		log('moved to BOL');
		robot.keyTap('left', 'command');
	}

	this.moveToEOL = () => {
		log('moved to EOL');
		robot.keyTap('right', 'command');
	}

	this.move = (lines, direction, mod) => {
		log('moved ' + lines + ' ' + direction);
		for (var i = 0; i < lines; i++) {
			if (mod) {
				robot.keyTap(direction, mod);
			} else {
				robot.keyTap(direction);
			}
		}
	}

	this.deleteLines = (lines) => {
		this.move(1, 'down');
		this.moveToBOL();
		this.move(lines, 'up', 'shift');
		robot.keyTap('backspace');
		robot.keyTap('up');
		log('deleted');
	}

	this.paste = () => {
		robot.keyTap('v', 'command');
	};
}

module.exports = new Bot();

//const Bot = function () {
//	const os = require('os');
//	const robot = require('robotjs');
//	const {
//		promisify
//	} = require('bluebird');
//	const keyTap = promisify(robot.keyTap, {
//		context: robot,
//		multiArgs: true
//	});
//	const keyToggle = promisify(robot.keyToggle, {
//		context: robot,
//		multiArgs: true
//	});
//	const mouseClick = promisify(robot.mouseClick, {
//		context: robot,
//		multiArgs: true
//	});
//	const moveMouse = promisify(robot.moveMouse, {
//		context: robot,
//		multiArgs: true
//	});
//
//	const log = console.log;
//
//	const osType = os.type();
//	const linux = (osType == 'Linux');
//	const mac = (osType == 'Darwin');
//	const win = (osType == 'Windows_NT');
//
//	let loc = {
//		app: {
//			x: 600,
//			y: 600
//		},
//		file: [{
//			x: 1150,
//			y: 120
//			}]
//	};
//
//	//	function ensureKeysNotPressed(cb) {
//	//		//		while (await Keyboard.getState(await KeySpace)) {}
//	//		cb();
//	//	}
//
//	this.focusOnApp = async function () {
//		if (mac) {
//			await keyTap('tab', 'command');
//			await keyToggle('command', 'up');
//		} else {
//			// might be able to use alt+tab on windows
//			await moveMouse(loc.app.x, loc.app.y);
//			await mouseClick();
//		}
//	}
//
//	this.focusOnFile = async function (fidx) {
//		if (mac) {
//			await keyTap('tab', 'command');
//			await keyToggle('command', 'up');
//		} else {
//			await moveMouse(loc.file[fidx].x, loc.file[fidx].y);
//			await mouseClick();
//		}
//	}
//
//	this.clear = async function () {
//		log('clear file contents');
//		await keyTap('a', 'command');
//		await keyTap('backspace');
//	}
//
//	this.moveToStart = async function () {
//		log('moved to Start');
//		await keyTap('up', 'command');
//	}
//
//	this.moveToEnd = async function () {
//		log('moved to End');
//		await keyTap('down', 'command');
//	}
//
//	this.moveToBOL = async function () {
//		log('moved to BOL');
//		await keyTap('left', 'command');
//	}
//
//	this.moveToEOL = async function () {
//		log('moved to EOL');
//		await keyTap('right', 'command');
//	}
//
//	this.move = async function (lines, direction, mod) {
//		log('moved ' + lines + ' ' + direction);
//		for (let i = 0; i < lines; i++) {
//			if (mod) {
//				await keyTap(direction, mod);
//			} else {
//				await keyTap(direction);
//			}
//		}
//	}
//
//	this.deleteLines = async function (lines) {
//		await this.move(1, 'down');
//		await this.moveToBOL();
//		await this.move(lines, 'up', 'shift');
//		await keyTap('backspace');
//		await keyTap('left');
//		log('deleted');
//	}
//
//	this.paste = async function () {
//		await keyTap('v', 'command');
//	}
//}
//
//module.exports = new Bot();
