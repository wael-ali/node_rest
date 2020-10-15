const fs = require('fs');
const path = require('path');

setEnv = () => {
    const localEnv = path.join(path.dirname(require.main.filename), '.env.local');
    if (!process.env.NODE_ENV){
        process.env.NODE_ENV = fs.existsSync(localEnv) ? 'local' : true;
    }
}

module.exports = setEnv;