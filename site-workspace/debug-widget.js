const { JSDOM } = require('jsdom');
const fetch = require('node-fetch');

async function testWidget() {
    console.log('Testing podcast widget...');
    
    try {
        // Fetch the test HTML
        const response = await fetch('http://localhost:8080/widgets/podcast-feed/test-v1.6.html');
        const html = await response.text();
        
        // Create DOM
        const dom = new JSDOM(html, {
            url: 'http://localhost:8080/widgets/podcast-feed/',
            runScripts: "dangerously",
            resources: "usable"
        });
        
        const { window } = dom;
        global.window = window;
        global.document = window.document;
        global.fetch = fetch;
        
        console.log('DOM created, waiting for widget to load...');
        
        // Wait a bit for the widget to initialize
        setTimeout(() => {
            const loadTimeElement = window.document.getElementById('loadTime');
            const episodeCountElement = window.document.getElementById('episodeCount');
            
            console.log('Load time element:', loadTimeElement ? loadTimeElement.textContent : 'NOT FOUND');
            console.log('Episode count element:', episodeCountElement ? episodeCountElement.textContent : 'NOT FOUND');
            
            // Check for any JavaScript errors
            console.log('Console errors:', window.console._errors || 'None captured');
        }, 3000);
        
    } catch (error) {
        console.error('Error testing widget:', error);
    }
}

testWidget();