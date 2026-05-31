const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

appjs = appjs.replace(/const modal = document\.getElementById\('entry-modal'\);[\r\n]*/, "");
appjs = appjs.replace(/const btnOpen = document\.getElementById\('btn-open-form'\);[\r\n]*/, "");
appjs = appjs.replace(/const btnClose = document\.getElementById\('btn-close-modal'\);[\r\n]*/, "");
appjs = appjs.replace(/const btnCancel = document\.getElementById\('btn-cancel'\);[\r\n]*/, "");

appjs = appjs.replace(/const toggleModal = \(\) => modal\.classList\.toggle\('active'\);[\r\n]*/, "");
appjs = appjs.replace(/btnOpen\.addEventListener\('click', toggleModal\);[\r\n]*/, "");
appjs = appjs.replace(/btnClose\.addEventListener\('click', toggleModal\);[\r\n]*/, "");
appjs = appjs.replace(/btnCancel\.addEventListener\('click', toggleModal\);[\r\n]*/, "");

fs.writeFileSync('app.js', appjs);
console.log("Removed modal listeners properly.");
