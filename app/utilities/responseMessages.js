const HELP = '1. Check available locations\n`/agentlocations`\n\n2. Book a place\n `/agentbook 2030/01/30 Gotham`' +
  ' → to book a random place\n`/agentbook today Gotham 111` → to book a specific place\n\n3. Check your bookings:\n' +
  '`/agentmy`\n\n 4. Unbook if not needed:\n`/agentunbook tomorrow Gotham`';

const FAILURE = `${'Sorry, I didn’t quite get that :disappointed: I’m easily confused. Perhaps if you put the ' +
  'words in a different order? :brain:\n\nHow to use this bot in examples:\n'}${HELP}`;

module.exports = {
  HELP,
  FAILURE
};
