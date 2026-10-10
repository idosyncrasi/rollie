const { rollie, rl } = require('./roll');
const { rolliecustom, rlc } = require('./rollcustom');
const help = require('./help');
const { rolliestats, rolliemodifier } = require('./stats');

module.exports = [rollie, rl, rolliecustom, rlc, rolliestats, rolliemodifier, help];
