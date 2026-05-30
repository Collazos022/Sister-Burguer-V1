const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

appjs = appjs.replace(/fetch\(APP_URL,/g, 'fetch(API_URL,');
appjs = appjs.replace(/loadDashboardData\(\);/g, 'fetchData();');

fs.writeFileSync('app.js', appjs);
console.log("Fixed typos in btn-submit-expenses");
