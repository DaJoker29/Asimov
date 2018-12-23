#!/usr/bin/env node
const fs = require('fs');
const natural = require('natural');
const syllable = require('syllable');
const { ease } = require('readability-meter');
const readingTime = require('reading-time');
const writeGood = require('write-good');
const Spell = require('spelling');
const dictionary = require('spelling/dictionaries/en_US');
const ui = require('cliui')();
const moment = require('moment');

const wordCounter = new natural.WordTokenizer();
const sentenceCounter = new natural.SentenceTokenizer();
const dict = new Spell(dictionary);

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

  // Map unique words
  const uniqueWords = [...new Set(wordTokens.map(e => e.toLowerCase()))];

  return {
    text,
    wordCount,
    uniqueWords,
    sentenceCount,
    avgWordLen: charCount / wordTokens.length,
    avgSentLen: wordCount / sentenceCount,
    avgSyllables: syllableCount / wordCount,
    readability: ease(text),
    time: readingTime(text),
    grammar: writeGood(text),
    spelling: uniqueWords.map(a => dict.lookup(a))
  };
}

function drawCLI(obj) {
  // Handle errors
  if (typeof obj === 'string') {
    throw new TypeError(`Invalid object.`);
  }

  ui.div({ text: obj.text, border: true, padding: [0, 5, 1, 5] });

  ui.div({
    text:
      `Word Count: \t\t\t ${obj.wordCount}\n` +
      `Unique Words: \t\t ${obj.uniqueWords.length}\n` +
      `Sentence Count: \t\t ${obj.sentenceCount}\n` +
      `Avg. Word Length: \t\t ${obj.avgWordLen.toFixed(2)} chars\n` +
      `Avg, Sentence Length: \t ${obj.avgSentLen.toFixed(2)} words \n` +
      `Avg. Syllables (per word): \t ${obj.avgSyllables.toFixed(2)} \n` +
      `Readability: \t\t\t ${obj.readability.score.toFixed(2)} ${
        obj.readability.notes ? `- ${obj.readability.notes}` : ''
      }\n` +
      `Estimated Reading Time: \t ${moment.duration(obj.time.time).humanize()}`,
    padding: [0, 0, 0, 10]
  });

  if (obj.grammar.length) {
    ui.div({
      text: 'Grammar'.toUpperCase(),
      padding: [1, 0, 0, 10]
    });

    ui.div({
      text: obj.grammar.reduce(
        (a, b) =>
          a.concat(`Index ${b.index}`.padEnd(25, ' '), `\t=> \t${b.reason}\n`),
        ''
      ),
      padding: [0, 0, 0, 15]
    });
  }

  const misspelled = obj.spelling.filter(x => !x.found);

  if (misspelled.length) {
    ui.div({
      text: 'Spelling'.toUpperCase(),
      padding: [1, 0, 0, 10]
    });

    ui.div({
      text: misspelled.reduce(
        (a, b) =>
          a.concat(
            `${b.word.toUpperCase()}, Index ${obj.text.search(
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

module.exports.analyze = processText;
module.exports.draw = drawCLI;
