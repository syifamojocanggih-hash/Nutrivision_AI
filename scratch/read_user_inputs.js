const fs = require('fs');
const readline = require('readline');
const path = 'C:/Users/ASUS/.gemini/antigravity-ide/brain/6a6e3088-d6d6-444a-a546-831cba3b82e3/.system_generated/logs/transcript.jsonl';

const rl = readline.createInterface({
  input: fs.createReadStream(path)
});

rl.on('line', (line) => {
  if (line.includes('"type":"USER_INPUT"')) {
    const obj = JSON.parse(line);
    console.log('--- USER_INPUT (step ' + obj.step_index + ') ---');
    console.log(obj.content);
  }
});
