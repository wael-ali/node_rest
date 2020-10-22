const path = require('path');
const fs = require('fs');

const clearImage = filePath => {
    const projRoot =  path.dirname(require.main.filename || process.mainModule.filename);
    filePath = path.join(projRoot, filePath);
    fs.unlink(filePath, err => console.log(err));
};

exports.clearImage = clearImage;