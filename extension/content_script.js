// content_script.js - Runs on Verdict.run website
// Bridges communication between the website and the extension

(function () {
    'use strict';

    console.log('🧩 Verdict Helper content script loaded');

    // Inject a marker so the website knows the extension is installed
    const marker = document.createElement('div');
    marker.id = 'icpchue-extension-installed';
    marker.style.display = 'none';
    marker.dataset.version = '1.0.0';
    document.documentElement.appendChild(marker);

    // Listen for messages from the website
    window.addEventListener('message', async (event) => {
        // Security: only accept messages from the same window
        if (event.source !== window) return;

        const { type, payload } = event.data;
        if (!type) return;

        // Handle different message types
        switch (type) {
            case 'ICPCHUE_PING':
                // Website is checking if extension is installed
                window.postMessage({
                    type: 'ICPCHUE_PONG',
                    version: '1.0.0'
                }, '*');
                break;

            case 'ICPCHUE_CHECK_LOGIN':
                // Check Codeforces login status
                try {
                    const response = await chrome.runtime.sendMessage({
                        action: 'checkLoginStatus'
                    });
                    window.postMessage({
                        type: 'ICPCHUE_LOGIN_STATUS',
                        ...response
                    }, '*');
                } catch (error) {
                    window.postMessage({
                        type: 'ICPCHUE_LOGIN_STATUS',
                        loggedIn: false,
                        error: error.message
                    }, '*');
                }
                break;

            case 'ICPCHUE_SUBMIT':
                // Submit code to Codeforces
                console.log('📤 Received submission request:', JSON.stringify(payload, null, 2));

                try {
                    const response = await chrome.runtime.sendMessage({
                        action: 'submitToCF',
                        data: payload
                    });

                    window.postMessage({
                        type: 'ICPCHUE_SUBMISSION_RESULT',
                        ...response
                    }, '*');
                } catch (error) {
                    window.postMessage({
                        type: 'ICPCHUE_SUBMISSION_RESULT',
                        success: false,
                        error: error.message
                    }, '*');
                }
                break;

            case 'ICPCHUE_CHECK_SUBMISSION':
                // Check submission status
                try {
                    const response = await chrome.runtime.sendMessage({
                        action: 'checkSubmissionStatus',
                        data: payload
                    });

                    window.postMessage({
                        type: 'ICPCHUE_SUBMISSION_STATUS_RESULT',
                        ...response
                    }, '*');
                } catch (error) {
                    window.postMessage({
                        type: 'ICPCHUE_SUBMISSION_STATUS_RESULT',
                        success: false,
                        error: error.message
                    }, '*');
                }
                break;

            default:
                // Ignore unknown message types
                break;
        }
    });

    // Dispatch a custom event to notify the page that extension is ready
    window.dispatchEvent(new CustomEvent('icpchue-extension-ready', {
        detail: { version: '1.0.0' }
    }));

})();
