
(() => {
    "use strict";

    if (window.__reelFlowControlInitialized) return;
    window.__reelFlowControlInitialized = true;

    const SOURCE = "reelflow-extension";
    const TARGET = "reelflow-page";

    const MAX_RETRIES = 10;
    const RETRY_DELAY = 500;

    let mainReady = false;
    let settingsLoaded = false;
    let pendingEnabled = true;
    let storageRevision = 0;
    let retryCount = 0;
    let retryTimer = null;
    let settingsRequestId = 0;

    function sendMessage(type, extra = {}) {
        window.postMessage({
            source: SOURCE,
            type,
            ...extra
        }, location.origin);
    }

    function stopRetrying() {
        if (retryTimer !== null) {
            clearTimeout(retryTimer);
            retryTimer = null;
        }
    }

   async function reportError(message) {
    console.error(`[ReelFlow] ${message}`);

    try {
        await browser.storage.local.set({
            lastError: {
                message,
                timestamp: Date.now()
            }
        });
    } catch (error) {
        console.error(
            "[ReelFlow] Could not save diagnostic:",
            error
        );
    }
}

    function startHandshake() {
        if (mainReady || retryTimer !== null) return;

        if (retryCount >= MAX_RETRIES) {
            reportError("Could not establish communication with the playback engine.");
            return;
        }

        retryCount++;

        sendMessage("HELLO");

        retryTimer = setTimeout(() => {
            retryTimer = null;
            startHandshake();
        }, RETRY_DELAY);
    }

    function sendSettings() {
        if (!mainReady || !settingsLoaded) return;

        settingsRequestId++;

        sendMessage("SETTINGS", {
            enabled: pendingEnabled,
            requestId: settingsRequestId
        });
    }

    async function loadSettings() {
        const revisionAtStart = storageRevision;

        try {
            const settings = await browser.storage.local.get({
                enabled: true
            });

            if (revisionAtStart !== storageRevision) return;

            if (typeof settings.enabled !== "boolean") {
                throw new Error("Invalid stored playback preference.");
            }

            pendingEnabled = settings.enabled;
            settingsLoaded = true;

            sendSettings();

        } catch (error) {
            reportError(`Settings could not be loaded: ${error.message}`);
        }
    }

    window.addEventListener("message", (event) => {
        if (event.source !== window) return;

        const data = event.data;

        if (!data || data.source !== TARGET) return;

        if (data.type === "READY") {
            stopRetrying();

            mainReady = true;
            retryCount = 0;

            console.log("[ReelFlow] Playback engine connected.");

            if (settingsLoaded) {
                sendSettings();
            }

            return;
        }

        if (data.type === "ACK") {
            if (data.requestId !== settingsRequestId) return;

            if (data.enabled !== pendingEnabled) {
                reportError("Playback engine acknowledged an unexpected setting.");
                return;
            }

            console.log(
                "[ReelFlow] Settings applied:",
                data.enabled
            );

            return;
        }

        if (data.type === "STATUS") {
            console.log("[ReelFlow] Engine status:", data.status);
            return;
        }

        if (data.type === "ERROR") {
            reportError(data.message || "Playback engine reported an error.");
        }
    });

    browser.storage.onChanged.addListener((changes, area) => {
        if (area !== "local" || !changes.enabled) return;

        storageRevision++;

        const newValue = changes.enabled.newValue;

        if (typeof newValue !== "boolean") {
            reportError("Received an invalid playback preference.");
            return;
        }

        pendingEnabled = newValue;
        settingsLoaded = true;

        sendSettings();
    });

    // Start the communication handshake.
    startHandshake();

    // Load the saved preference.
    loadSettings();

})();
