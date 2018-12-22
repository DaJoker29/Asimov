const fs = require('fs');
const { analyze, draw } = require('./asimov.js');

async function tests() {
  const shogun = await fs.readFileSync('the_shogun.txt', 'utf8');
  const blackExp = await fs.readFileSync('the_black_experience.txt', 'utf8');

  // TODO: Write discrete tests so each failure doesn't bork the others.
  draw(analyze(1));
  draw(analyze(false));
  draw(analyze(shogun));
  draw(analyze(blackExp));
  draw(analyze('Look at me. I have a lot of things to do. Adorable.'));
  draw(analyze('Abort! This is not the best approach'));
  draw(analyze('The is the the.'));
  draw(analyze('So the cat was stolen.'));
  draw(analyze('A Sooop. I like it it.'));
  draw(analyze('And I said to myself, this is the the age of Aquarius.'));
}

tests();
