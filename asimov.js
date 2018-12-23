#!/usr/bin/env node
const fs = require('fs');
const natural = require('natural');
const syllable = require('syllable');
const ease = require('readability-meter');
const readingTime = require('reading-time');
const writeGood = require('write-good');
const Spell = require('spelling');
const dictionary = require('spelling/dictionaries/en_US');
const ui = require('cliui')();
const moment = require('moment');

const wordCounter = new natural.WordTokenizer();
const sentenceCounter = new natural.SentenceTokenizer();
const dict = new Spell(dictionary);

function processText(text) {
  if (typeof text === 'undefined') {
    throw new Error('No text provided.');
  }

  if (typeof text !== 'string') {
    throw new TypeError('Text is not a string.');
  }

  // Generate tokens
  const wordTokens = wordCounter.tokenize(text);
  const sentenceTokens = sentenceCounter.tokenize(text);

  // Calculate counts
  const wordCount = wordTokens.length;
  const charCount = wordTokens.reduce((a, b) => a + b.length, 0);
  const sentenceCount = sentenceTokens.length;
  const syllableCount = wordTokens.reduce((a, b) => a + syllable(b), 0);

  const avgWordLen = charCount / wordTokens.length;
  const avgSentLen = wordCount / sentenceCount;
  const avgSyllables = syllableCount / wordCount;

  const readability = ease.ease(text);
  const time = readingTime(text);

  const grammar = writeGood(text);

  const uniqueWords = [...new Set(wordTokens.map(e => e.toLowerCase()))];
  const spelling = uniqueWords.map(a => dict.lookup(a));

  // Output results
  return {
    text,
    wordCount,
    uniqueWords,
    sentenceCount,
    avgWordLen,
    avgSentLen,
    avgSyllables,
    readability,
    time,
    grammar,
    spelling
  };
}

function drawCLI(obj) {
  // Handle errors
  if (typeof obj === 'string') {
    throw Error(`${obj} is not a string`);
  }

  const {
    text,
    wordCount,
    uniqueWords,
    sentenceCount,
    avgWordLen,
    avgSentLen,
    avgSyllables,
    readability,
    time,
    grammar,
    spelling
  } = obj;

  ui.div({
    text,
    border: true,
    padding: [0, 5, 1, 5]
  });

  ui.div({
    text:
      `Word Count: \t\t\t ${wordCount}\n` +
      `Unique Words: \t\t ${uniqueWords.length}\n` +
      `Sentence Count: \t\t ${sentenceCount}\n` +
      `Avg. Word Length: \t\t ${avgWordLen.toFixed(2)} chars\n` +
      `Avg, Sentence Length: \t ${avgSentLen.toFixed(2)} words \n` +
      `Avg. Syllables (per word): \t ${avgSyllables.toFixed(2)} \n` +
      `Readability: \t\t\t ${readability.score.toFixed(2)} ${
        readability.notes ? `- ${readability.notes}` : ''
      }\n` +
      `Estimated Reading Time: \t ${moment.duration(time.time).humanize()}`,
    padding: [0, 0, 0, 10]
  });

  if (grammar.length) {
    ui.div({
      text: 'Grammar'.toUpperCase(),
      padding: [1, 0, 0, 10]
    });

    ui.div({
      text: grammar.reduce(
        (a, b) =>
          a.concat(`Index ${b.index}`.padEnd(25, ' '), `\t=> \t${b.reason}\n`),
        ''
      ),
      padding: [0, 0, 0, 15]
    });
  }

  const misspelled = spelling.filter(x => !x.found);

  if (misspelled.length) {
    ui.div({
      text: 'Spelling'.toUpperCase(),
      padding: [1, 0, 0, 10]
    });

    ui.div({
      text: misspelled.reduce(
        (a, b) =>
          a.concat(
            `${b.word.toUpperCase()}, Index ${text.search(
              new RegExp(b.word, 'i')
            )}`.padEnd(25, ' '),
            `\t=> \t${b.suggestions
              .slice(0, 3)
              .map(z => z.word)
              .join(', ')}\n`
          ),
        ''
      ),
      padding: [0, 0, 0, 15]
    });
  }

  // Print UI
  console.log(ui.toString());
  ui.resetOutput();
}

// function analyze(text) {
//    processText(text);
//   return
//   // if run as a script, draw to CLI.
//   // if imported by another module and run, return object
//   // unless specifically asked to draw to CLI
// }

module.exports.analyze = processText;
module.exports.draw = drawCLI;

// Respond to incorrect format
if (!module.parent && process.argv.length <= 2) {
  console.log(`Usage: ${__filename} FILE`);
  process.exit(-1);
}

// Check if filename is passed and analyze
const filename = process.argv[2];

if (!module.parent && filename && typeof filename === 'string') {
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) throw err;
    console.log(`Analyzing file: ${filename}`);
    try {
      drawCLI(processText(data));
    } catch (e) {
      console.log(`Error: ${e}`);
    }
  });
}
