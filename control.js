
(() => {
    "use strict";

    const SOURCE = "reelflow-extension";
    const TARGET = "reelflow-page";

    let mainReady = false;
    let pendingEnabled = true;

    function sendSettings(enabled) {
        pendingEnabled = enabled;

        if (!mainReady) return;

        window.postMessage({
            source: SOURCE,
            type: "SETTINGS",
            enabled
        }, location.origin);
    }

    // Wait until the MAIN-world engine is ready.
    window.addEventListener("message", async (event) => {
        if (event.source !== window) return;

        const data = event.data;

        if (
            !data ||
            data.source !== TARGET ||
            data.type !== "READY"
        ) return;

        mainReady = true;

        const settings = await browser.storage.local.get({
            enabled: true
        });

        sendSettings(settings.enabled);
    });

    // Synchronize changes made through the popup.
    browser.storage.onChanged.addListener((changes, area) => {
        if (area !== "local" || !changes.enabled) return;

        sendSettings(changes.enabled.newValue);
    });

    // Ask the MAIN-world script to initialize.
    window.postMessage({
        source: SOURCE,
        type: "HELLO"
    }, location.origin);

})();
