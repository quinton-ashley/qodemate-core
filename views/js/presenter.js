module.exports = function(args, opt) {
  const {
    app
  } = require('electron').remote;
  const bot = require('./bot.js');
  const delay = function(delay) {
    return new Promise(function(fulfill) {
      setTimeout(fulfill, delay)
    });
  }
  const fs = require('fs-extra');
  const ignore = require('ignore');
  const klawSync = require('klaw-sync');
  const ncp = require('copy-paste');
  const open = require('opn');
  const path = require('path');
  const {
    promisify
  } = require('util');
  const copy = promisify(ncp.copy);

  const __homeDir = require('os').homedir();
  const __parentDir = path.dirname(process.mainModule.filename);
  const __usrDir = __homeDir + '/Documents/Qodemate';
  const err = console.error;
  const log = console.log;

  let check = false;
  let setIdx = -1; // the set index
  let seq = []; // the sequence array stores step parts in the order they occur in the file(s)
  let set = []; // the set array stores step parts in sorted order, maintaing sequence order of step parts of the same number
  let slides = []; // the slides array stores the markdown text associated with each step to be displayed as a slide if the user includes a slides.md file
  let qode = [];
  let lesson = [];
  let steps = [];
  let setIdxs = [];
  let slideItr = -1;
  let stepItr = 0;
  let exclude = [];
  let env, files, ig, usrDir, usrFiles, topFiles;

  this.open = (project) => {
    if (!project) {
      return;
    }
    log(project);
    files = [];
    usrFiles = [];
    if (fs.lstatSync(project[0]).isDirectory()) {
      // implement custom file search from .qodeignore project file
      ig = ignore().add(['test0.js']);
      try {
        //				const filterFn = item => ig.ignores(item);
        files = klawSync(project[0]);
        for (let i = 0; i < files.length; i++) {
          files[i] = files[i].path;
        }
        files = ig.filter(files);
      } catch (er) {
        err(er);
      }
      log(files);

      usrDir = __usrDir + '/' + path.parse(project[0]).name;
      log(usrDir);
      fs.copySync(project[0], usrDir);
      open(usrDir, {
        app: 'brackets'
      });
    }
    // single file open
    //		else {
    //			files = project;
    //			let pDir = path.dirname(project[0]);
    //			usrDir = __usrDir + pDir.slice(pDir.lastIndexOf('/'), -1);
    //			fs.copySync(pDir, usrDir);
    //			open(usrDir, {
    //				app: 'brackets'
    //			});
    //		}

    let foundLesson = 0;

    for (let i = 0; i < files.length; i++) {
      let lines, match, mod, prevMatch, tag, tags, text, primarySeqIdx, regex, splitStr;
      let file = files[i];
      let data = fs.readFileSync(file, 'utf8');
      let loop = true;
      // parse files of different languages
      // splitStr is the comment syntax for that language
      file = path.parse(file);
      switch (file.ext) {
        case '.css':
          splitStr = '/*';
          regex = /\n^.*\/\*\d[^\n]*/gm;
        case '.md':
        case '.markdown':
        case '.c':
        case '.js':
        case '.java':
        case '.h':
        case '.m':
          splitStr = '//';
          regex = /\n^.*\/\/\d[^\n]*/gm;
      }
      let tagRegex = /([^ \w][^\);]+[\);]|[a-zA-Z][^ a-zA-Z]*|[\d\.]+)/g;
      for (let j = -1; loop; j++, primarySeqIdx = j) {
        if (((match = regex.exec(data)) == null)) {
          match = {
            index: data.length - 1
          };
          loop = false;
        }
        if (prevMatch != null) {
          // the text of this step goes from the start of prevMatch to the start of match
          // if loop is false (this is the end of the file) add another line
          text = data.slice(prevMatch.index, match.index) + ((loop) ? '' : '\n');
          // if no new line char/char seqence is found then line length is 1
          lines = (text.match(/\r\n|\r|\n/g) || [1]).length;
          // the first line of the step, split and pop after the splitStr
          // to get the tags, then get the individual tags with tagRegex
          tags = prevMatch[0].split(splitStr).pop().match(tagRegex);
          // there are three types of tag: step number, editor, and option
          // cur will change if more than one step number tag is found
          let cur;
          for (let k = 0; k < tags.length; k++) {
            tag = tags[k];
            if (/[^ \w][^\);]+[\);]/.test(tag)) {
              // test for editor tags
              cur.lines = 0;
              cur.text = tag;
            } else if (/[a-zA-Z][^ a-zA-Z]*/.test(tag)) {
              // test for any option tag
              cur.opt[tag[0]] = tag.slice(1);
            } else if (/[\d\.]+/.test(tag)) {
              // the first tag will always be the step number tag, so cur will
              // be assigned to the object created below this if statement
              // if another step number tag is found then the current step is
              // complete and is pushed to the arrays seq and set
              // the seqIdx, j, is increased and the old cur is replaced by the
              // object created after the if statement
              if (k > 0) {
                cur.seqIdx = j++;
                seq.push(cur);
                set.push(cur);
              }
              // file: index of the file
              // lines: the number of lines the step has or the number of lines to remove
              // num: the step number tag string must be converted to a js Number
              // opt: assigned an empty object if k is 0, else assigned the delete option
              //   with step num primarySeqIdx, the seqIdx of the first step
              // seqIdx: j, the seqence index of the step part in the file
              // setIdx: set index is the index of the step part in an ordered list of all
              //   step parts.  -1 is a placeholder, a proper value is assigned after the set
              //   array is sorted.
              // text: the text of the step part. 'd' for delete, was/is useful for debugging
              //   purposes if the program were to try to print a delete step part somehow.
              cur = {
                lines: ((k == 0) ? lines : -lines),
                num: Number(tag).toFixed(2),
                opt: ((k == 0) ? {} : {
                  d: primarySeqIdx
                }),
                seqIdx: j,
                setIdx: -1,
                text: ((k == 0) ? text : 'd')
              };
              if ((file.ext != '.md') && (!(cur.num in steps))) {
                steps[cur.num] = i - foundLesson;
              }
            }
          }
          seq.push(cur);
          set.push(cur);
          prevMatch = match;
        } else {
          prevMatch = match;
        }
      }
      if (set) {
        if (file.base != 'lesson.md') {
          usrFiles.push(usrDir + '/' + path.relative(project[0], files[i]));
          fs.outputFile(usrFiles[i - foundLesson], '');
          setIdxs.push(-1);
        }
        // sort from least to greatest step number
        set.sort((a, b) => {
          if (a.num < b.num) return -1;
          if (a.num > b.num) return 1;
          return a.seqIdx - b.seqIdx;
        });
        // setIdx is assigned it's proper value after the sort
        for (let q = 0; q < set.length; q++) {
          set[q].setIdx = q;
        }
        log(set);
        if (file.ext != '.md') {
          qode.push({
            seq: seq,
            set: set
          });
        } else {
          for (q = 0; q < set.length; q++) {
            lesson.push({
              num: set [q].num,
              text: set [q].text
            });
          }
          foundLesson = 1;
        }
        seq = [];
        set = [];
      }
    }

    steps = Object.entries(steps);
    steps.sort(function(a, b) {
      return Number(a[0]) - Number(b[0]);
    });
    log('step numbers');
    log(steps);

    bot.focusOnApp();
  }

  function countLines(cur, init, dest) {
    let result = 0;
    for (let i = init; i < dest; i++) {
      if (seq[i].setIdx < cur.setIdx) {
        result += seq[i].lines;
      }
    }
    return result;
  }

  async function moveToDest(past, cur) {
    // finds the shortest distance in lines that bot needs to
    // traverse to reach the destination
    let from = {
      start: -1,
      past: -1,
      end: -1
    };
    from.start = countLines(cur, 0, cur.seqIdx);
    if (past.seqIdx < cur.seqIdx) {
      // count down
      from.past = countLines(cur, past.seqIdx + 1, cur.seqIdx);
    } else {
      // count up
      from.past = countLines(cur, cur.seqIdx + 1, past.seqIdx + 1);
    }
    from.end = countLines(cur, cur.seqIdx, seq.length);
    log(from);

    // moves the cursor to the destination
    if (from.end < from.start && from.end < from.past) {
      bot.moveToEnd();
      bot.move(from.end, 'up');
    } else if (from.past < from.start) {
      bot.move(from.past, ((past.seqIdx < cur.seqIdx) ? 'down' : 'up'));
    } else {
      bot.moveToStart();
      bot.move(from.start, 'down');
    }
    bot.moveToEOL();
  }

  async function performPart() {
    if (setIdx + 1 >= set.length) {
      log('ERROR: ' + (setIdx + 1) + ' is outside the bounds of set ' + set.length);
      log(set);
      check = false;
      return false;
    }
    let cur, past;
    cur = set[setIdx + 1];
    if (setIdx >= 0) {
      past = set[setIdx];
    } else {
      past = set[setIdx + 1];
    }

    if (check && (cur.num != past.num)) {
      check = false;
      return false;
    }
    check = true;
    if (cur.num >= 1) {
      moveToDest(past, cur);
    }
    log(cur);
    setIdx++;
    if (cur.lines >= 0) {
      let textToPaste;
      if (cur.lines == 0) {
        bot.deleteLines(seq[cur.opt.d].lines);
        let firstChar = cur.text[0];
        let lastChar = cur.text[cur.text.length - 1];
        let regexReplace = `${firstChar}[^${lastChar}]*${lastChar}`;
        regexReplace = new RegExp(regexReplace);
        textToPaste = seq[cur.opt.d].text;
        textToPaste = textToPaste.replace(regexReplace, cur.text);
      } else {
        textToPaste = cur.text;
      }
      await copy(textToPaste);
      bot.paste();
      return true;
    } else {
      bot.deleteLines(-cur.lines);
      return true;
    }
  }

  async function perform() {
    let fIdx = steps[stepItr][1];
    bot.focusOnFile(usrFiles[fIdx]);
    seq = qode[fIdx].seq;
    set = qode[fIdx].set;
    setIdx = setIdxs[fIdx];
    await delay(500);
    while (await performPart()) {
      await delay(50);
    }
    setIdxs[fIdx] = setIdx;
    stepItr++;
    bot.focusOnApp();
  }

  this.next = () => {
    log('next');
    if (stepItr < steps.length) {
      perform();
    } else {
      log('done!');
    }
  }

  this.nextSlide = () => {
    log('next slide');
    if (!usrFiles) {
      return '# no file or folder selected!';
    }
    if (slideItr + 1 < lesson.length &&
      lesson[slideItr + 1].num == steps[stepItr][0]) {
      slideItr++;
      return lesson[slideItr].text;
    }
    return 'same';
  }

  this.play = () => {
    this.next();
  }

  this.reset = () => {
    log('reset');
    for (let i = 0; i < setIdxs.length; i++) {
      setIdxs[i] = -1;
    }
    return 0;
  }

  this.close = () => {
    app.quit();
  }
}