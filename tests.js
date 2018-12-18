const fs = require('fs');
const asimov = require('./asimov.js');

async function tests() {
  const shogun = await fs.readFileSync('the_shogun.txt', 'utf8');
  const blackExp = await fs.readFileSync('the_black_experience.txt', 'utf8');

  // TODO: Write discrete tests so each failure doesn't bork the others.
  // asimov.analyze(1);
  // asimov.analyze(false);
  asimov.analyze(shogun);
  asimov.analyze(blackExp);
  asimov.analyze('Look at me. I have a lot of things to do. Adorable.');
  asimov.analyze('Abort! This is not the best approach');
  asimov.analyze('The is the the.');
  asimov.analyze('So the cat was stolen.');
  asimov.analyze('A Sooop. I like it it.');
  asimov.analyze('And I said to myself, this is the the age of Aquarius.');
}

tests();
