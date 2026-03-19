const fs = require('fs');
const path = require('path');

function log(tag, msg) {
    const timestamp = new Date().toISOString();

    const logLine = `[${timestamp}] ${msg}\n`;

    const filePath = path.join(__dirname, `../data/${tag}.log`);

    fs.appendFileSync(filePath, logLine, 'utf8');
}

module.exports = {
    log
};