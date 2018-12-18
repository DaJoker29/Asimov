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
  if (typeof text !== 'string') {
    return `Error: ${text} is not a string`;
  }

  const wordTokens = wordCounter.tokenize(text);
  const wordCount = wordTokens.length;
  const sentenceTokens = sentenceCounter.tokenize(text);
  const sentenceCount = sentenceTokens.length;
  const avgWordLen =
    wordTokens.reduce((a, b) => a + b.length, 0) / wordTokens.length;
  const avgSentLen =
    sentenceTokens.reduce((a, b) => a + wordCounter.tokenize(b).length, 0) /
    sentenceTokens.length;
  const syllableCount = wordTokens.reduce((a, b) => a + syllable(b), 0);
  const readability = ease.ease(text);
  const time = readingTime(text);
  const suggestions = writeGood(text);
  const spelling = [...new Set(wordTokens.map(e => e.toLowerCase()))].reduce(
    (a, b) => a.concat([dict.lookup(b)]),
    []
  );

  const obj = {
    text,
    wordCount,
    sentenceCount,
    avgWordLen,
    avgSentLen,
    syllableCount,
    readability,
    time,
    suggestions,
    spelling
  };

  return obj;
}

function drawCLI(obj) {
  // Handle errors
  if (typeof obj === 'string') {
    return console.log(obj);
  }
  const {
    text,
    wordCount,
    sentenceCount,
    avgWordLen,
    avgSentLen,
    readability,
    time,
    suggestions,
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
      `Sentence Count: \t\t ${sentenceCount}\n` +
      `Average Word Length: \t\t ${avgWordLen.toFixed(2)} chars\n` +
      `Average Sentence Length: \t ${avgSentLen.toFixed(2)} words \n` +
      `Readability: \t\t\t ${
        'notes' in readability
          ? readability.notes
          : readability.score > 100
          ? 'Super easy'
          : 'N/A'
      }\n` +
      `Estimated Reading Time: \t ${moment.duration(time.time).humanize()}`,
    padding: [0, 0, 0, 10]
  });

  if (suggestions.length) {
    ui.div({
      text: 'Grammar'.toUpperCase(),
      padding: [1, 0, 0, 10]
    });

    ui.div({
      text: suggestions.reduce(
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

async function tests() {
  const shogun = await fs.readFileSync('the_shogun.txt', 'utf8');
  const blackExp = await fs.readFileSync('the_black_experience.txt', 'utf8');

  drawCLI(processText(1));
  drawCLI(processText(false));
  drawCLI(processText(shogun));
  drawCLI(processText(blackExp));
  drawCLI(processText('Look at me. I have a lot of things to do. Adorable.'));
  drawCLI(processText('Abort! This is not the best approach'));
  drawCLI(processText('The is the the.'));
  drawCLI(processText('So the cat was stolen.'));
  drawCLI(processText('A Sooop. I like it it.'));
  drawCLI(
    processText('And I said to myself, this is the the age of Aquarius.')
  );
}

tests();
