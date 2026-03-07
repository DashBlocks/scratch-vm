const uid = require('./uid');

const generateQuadUid = () => uid() + uid() + uid() + uid();

const none = "'none'";
const featurePolicy = {
    'accelerometer': none,
    'ambient-light-sensor': none,
    'battery': none,
    'camera': none,
    'display-capture': none,
    'document-domain': none,
    'encrypted-media': none,
    'fullscreen': none,
    'geolocation': none,
    'gyroscope': none,
    'magnetometer': none,
    'microphone': none,
    'midi': none,
    'payment': none,
    'picture-in-picture': none,
    'publickey-credentials-get': none,
    'speaker-selection': none,
    'usb': none,
    'vibrate': none,
    'vr': none,
    'screen-wake-lock': none,
    'web-share': none,
    'interest-cohort': none
};

const generateAllow = () => Object.entries(featurePolicy)
    .map(([name, permission]) => `${name} ${permission}`)
    .join('; ');

const createFrame = () => {
    const element = document.createElement("iframe");
    const frameId = generateQuadUid(); // This is how we differentiate iframe messages from other messages
    element.dataset.id = frameId;
    element.style.display = "none";
    element.setAttribute('aria-hidden', 'true');
    element.sandbox = 'allow-scripts allow-modals';
    element.allow = generateAllow();
    document.body.append(element);
    return element;
};

const origin = window.origin;

/**
 * Handles messages from event
 * @param {MessageEvent} event The message event to handle
 * @param {HTMLIFrameElement} iframe The iframe who produced the event
 * @param {Function} removeHandler The handle to remove
 * @returns {Promise<object>} The data provided by the message
 */
const messageHandler = (event, iframe, removeHandler) => new Promise(resolve => {
    if (!event.data.payload) return;
    if (event.data.payload.id !== iframe.dataset.id) return;
    const data = event.data.payload;

    window.removeEventListener('message', removeHandler);
    try {
        const url = iframe.src;
        URL.revokeObjectURL(url);
    } catch {
        console.warn('Failed to revoke url of iframe sandboxed eval');
    }
    iframe.remove();

    resolve(data);
});

/**
 * Generates a string that can be placed into the iframe src
 * @param {string} code The code to execute
 * @returns {string} The code that can be placed into the eval in the iframe src
 */
const prepareCodeForEval = (code) => {
    const escaped = JSON.stringify(code);
    // When the html encounters a closing script tag, it'll end the script
    // so just put a backslash before it and it should be fine
    const scriptEscaped = escaped.replaceAll('<\/script>', '<\\/script>');
    return scriptEscaped;
}

/**
 * Generates source of iframe
 * @param {string} code - The code to execute
 * @param {object} frame - The iframe to generate source in
 * @returns 
 */
const generateEvaluateSrc = (code, frame) => {
    const runnerCode = `
    (async () => {
        let result = null;
        let success = true;
        try {
            // Techincally eval can also postMessage
            // and also modify success & result probably
            // but there's no real reason to prevent it
            // nor does the user have any reason to do it
            result = await eval(${prepareCodeForEval(code)});
        } catch (err) {
            success = false;
            result = err;
        }

        const parent = window.parent;
        const origin = '*';

        try {
            parent.postMessage({
                payload: {
                    success: success,
                    value: result,
                    id: ${JSON.stringify(frame.dataset.id)}
                },
            }, origin);
        } catch (topLevelError) {
            // Couldn't clone likely
            try {
                parent.postMessage({
                    payload: {
                        success: success,
                        value: JSON.stringify(result),
                        id: ${JSON.stringify(frame.dataset.id)}
                    },
                }, origin);
            } catch (err) {
                // Can't stringify, so error it
                parent.postMessage({
                    payload: {
                        success: false,
                        value: [String(topLevelError), String(err)].join("; "),
                        id: ${JSON.stringify(frame.dataset.id)}
                    },
                }, origin);
            }
        }
    })();`;

    const html = [
        '<!DOCTYPE html>',
        '<html lang="en-US">',
        '<head>',
        '<title>Sandboxed JS code iframe</title>',
        '</head>',
        '<body>',
        '<h1>Loading</h1>',
        '<script>',
        runnerCode,
        '</script>',
        '</body>',
        '</html>'
    ].join("\n");

    const blob = new Blob([html], { type: 'text/html;charset=UTF-8' });
    const url = URL.createObjectURL(blob);

    return url;
};

class SandboxRunner {
    static execute(code) {
        return new Promise(resolve => {
            const frame = createFrame();
            /**
             * Handles messages from a specific event
             * @param {MessageEvent} e Event to handle messages from
             */
            const trueHandler = e => {
                messageHandler(e, frame, trueHandler).then(payload => {
                    resolve({
                        success: payload.success,
                        value: payload.value
                    });
                });
            };
            window.addEventListener('message', trueHandler);
            frame.src = generateEvaluateSrc(code, frame);
        });
    }
}

module.exports = SandboxRunner;