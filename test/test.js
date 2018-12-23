const { expect } = require('chai');
const fs = require('fs');
const { analyze, draw } = require('../asimov');

const shogun = fs.readFileSync('the_shogun.txt', 'utf8');
const targetKeys = [
  'text',
  'wordCount',
  'uniqueWords',
  'sentenceCount',
  'avgWordLen',
  'avgSentLen',
  'avgSyllables',
  'readability',
  'time',
  'grammar',
  'spelling'
];

describe('#analyze()', () => {
  it('should fail when called with any argument but a string', () => {
    expect(() => analyze(4)).to.throw(TypeError, 'Text is not a string.');
    expect(() => analyze(-456.61)).to.throw(TypeError, 'Text is not a string.');
    expect(() => analyze(false)).to.throw(TypeError, 'Text is not a string.');
    expect(() => analyze([])).to.throw(TypeError, 'Text is not a string.');
    expect(() => analyze({})).to.throw(TypeError, 'Text is not a string.');
  });

  it('should fail when called without an argument', () => {
    expect(analyze).to.throw(Error, 'No text provided.');
  });

  it('should return object when called with a string', () => {
    expect(analyze(shogun)).to.be.a('object');
    expect(analyze(shogun)).to.have.all.keys(targetKeys);
    expect(analyze('This is a sentence')).to.be.a('object');
    expect(analyze('This is a sentence')).to.have.all.keys(targetKeys);
  });
});

describe('#draw()', () => {});
