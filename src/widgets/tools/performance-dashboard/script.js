/* global window, document, axe */

// Performance Dashboard Widget Script

document.addEventListener('DOMContentLoaded', () => {
    console.log('Performance Dashboard Loaded - script.js:6');

    // Simulate fetching Core Web Vitals metrics
    setTimeout(() => {
        document.getElementById('fcp').textContent = '1.2s';
        document.getElementById('lcp').textContent = '2.5s';
        document.getElementById('cls').textContent = '0.03';
        document.getElementById('tbt').textContent = '150ms';
    }, 1000);

    // Function to simulate advanced metrics calculation
    function calculateAdvancedMetrics() {
        // Simulate network requests count
        const networkRequests = Math.floor(Math.random() * 100) + 1;
        document.getElementById('network-requests').textContent = `${networkRequests} requests`;

        // Simulate JavaScript execution time
        const jsExecutionTime = (Math.random() * 500 + 100).toFixed(2);
        document.getElementById('js-execution').textContent = `${jsExecutionTime} ms`;

        // Simulate memory usage
        const memoryUsage = (Math.random() * 200 + 50).toFixed(2);
        document.getElementById('memory-usage').textContent = `${memoryUsage} MB`;
    }

    // Function to run real accessibility checks using axe-core
    function runRealAccessibilityCheck() {
        const resultsContainer = document.getElementById('accessibility-results');
        if (!resultsContainer) {
            console.error('Results container not found - script.js:35');
            return;
        }

        resultsContainer.innerHTML = '<p>Running real accessibility check...</p>';

        if (typeof axe === 'undefined') {
            console.error('axecore library not loaded - script.js:42');
            resultsContainer.innerHTML = '<p>Error: axe-core library not loaded. Please check the script inclusion.</p>';
            return;
        }

        axe.run(document, {}, (err, results) => {
            if (err) {
                console.error('Accessibility check failed: - script.js:49', err);
                resultsContainer.innerHTML = '<p>Error running accessibility check. See console for details.</p>';
                return;
            }

            if (results.violations.length === 0) {
                resultsContainer.innerHTML = '<p>No accessibility issues found. Great job!</p>';
            } else {
                const issueDetails = results.violations.map((violation, index) => {
                    return `<li>Issue ${index + 1}: ${violation.description} (Impact: ${violation.impact})</li>`;
                });
                resultsContainer.innerHTML = `
                    <p>Found ${results.violations.length} accessibility issues. Please review:</p>
                    <ul>
                        ${issueDetails.join('')}
                    </ul>
                `;
            }
        });
    }

    // Function to copy log content to clipboard
    function copyLogContent() {
        const logTextarea = document.getElementById('log-details');
        logTextarea.select();
        document.execCommand('copy');
        console.log('Log content copied to clipboard! - script.js:75');
    }

    // Trigger advanced metrics calculation periodically
    setInterval(calculateAdvancedMetrics, 2000); // Update every 2 seconds

    // Attach event listener to the accessibility check button
    const checkButton = document.getElementById('run-accessibility-check');
    if (checkButton) {
        checkButton.addEventListener('click', runRealAccessibilityCheck);
    } else {
        console.error('Run Check button not found - script.js:86');
    }

    // Attach event listener to the copy log button
    const copyLogButton = document.getElementById('copy-log');
    if (copyLogButton) {
        copyLogButton.addEventListener('click', copyLogContent);
    }

    // Add functionality to toggle between light and dark modes
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const body = document.body;
            if (body.classList.contains('light-mode')) {
                body.classList.remove('light-mode');
                body.classList.add('dark-mode');
            } else {
                body.classList.remove('dark-mode');
                body.classList.add('light-mode');
            }
        });
    }
});

// Use CommonJS require instead of ES6 import
const axe = require('axe-core');

// Function to run accessibility checks
async function runAccessibilityChecks() {
  try {
    const results = await axe.run();
    console.log('Accessibility Violations:', results.violations);
    // Display violations in the UI or log them for debugging
  } catch (error) {
    console.error('Error running accessibility checks:', error);
  }
}

// Ensure the script runs in the browser environment
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    runAccessibilityChecks();
  });
}