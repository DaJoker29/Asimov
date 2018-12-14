const fs = require('fs');
const natural = require('natural');
const syllable = require('syllable');
const ease = require('readability-meter');
const readingTime = require('reading-time');
const writeGood = require('write-good');

const wordCounter = new natural.WordTokenizer();
const sentenceCounter = new natural.SentenceTokenizer();

function processText(text) {
  if ('string' !== typeof text) {
    return `Error: ${text} is not a string`;
  }

  const wordTokens = wordCounter.tokenize(text);
  const wordCount = wordTokens.length;
  const sentenceTokens = sentenceCounter.tokenize(text);
  const sentenceCount = sentenceTokens.length;
  const avgWordLen = wordTokens.reduce((a, b) => a + b.length, 0) / wordTokens.length;
  const avgSentLen = sentenceTokens.reduce((a, b) => a + wordCounter.tokenize(b).length, 0) / sentenceTokens.length;
  const syllableCount = wordTokens.reduce((a, b) => a + syllable(b), 0);
  const readability = ease.ease(text);
  const time = readingTime(text);
  const suggestions = writeGood(text);

  const obj = {
    wordCount,
    sentenceCount,
    avgWordLen,
    avgSentLen,
    syllableCount,
    readability,
    time,
    suggestions,
  };

  return obj;
}

async function tests() {
  console.log(processText('Look at me. I have a lot of things to do. Adorable.'));
  console.log(processText('Abort! This is not the best approach'));
  console.log(processText('So the cat was stolen.'));
  console.log(processText(1));
  console.log(processText(false));
  const shogun = await fs.readFileSync('the_shogun.txt', 'utf8');
  console.log(processText(shogun));
}


tests();
