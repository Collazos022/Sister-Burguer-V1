const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const targetStr = "estado: p.Estado || 'pendiente',";
const replaceStr = "estado: (p.Estado || 'pendiente').toString().trim().toLowerCase(),";

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replaceStr);
    fs.writeFileSync('app.js', code);
    console.log("Fixed estado mapping!");
} else {
    console.error("target string not found!");
}
