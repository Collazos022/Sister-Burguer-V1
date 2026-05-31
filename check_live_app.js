const fetch = require('node-fetch');

(async () => {
    try {
        const res = await fetch('https://collazos022.github.io/Sister-Burguer-V1/app.js?t=' + Date.now());
        const text = await res.text();
        
        if (text.includes("entryForm.addEventListener('submit', (e) => {")) {
            console.log("Submit listener present!");
        }
        
        // Check for the syntax error (missing bracket at the end)
        // If it ends with updateDashboard() call or something properly formatted.
        const last100 = text.slice(-100);
        console.log("Last 100 chars of live app.js:\\n", last100);
        
        // Evaluate if it compiles
        try {
            const vm = require('vm');
            new vm.Script(text);
            console.log("Live app.js parsed successfully! No syntax errors.");
        } catch (e) {
            console.log("Live app.js SYNTAX ERROR:", e.message);
        }
    } catch(e) {
        console.log("Fetch error:", e.message);
    }
})();
