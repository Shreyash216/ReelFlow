
(() => {
    "use strict";

    if (window.__reelFlowInitialized) return;
    window.__reelFlowInitialized = true;

    const SOURCE = "reelflow-page";
    const TARGET = "reelflow-extension";

    let enabled = false;
    let listenerAttached = false;

    const originalVisibility = Object.getOwnPropertyDescriptor(
        Document.prototype,
        "visibilityState"
    );

    const originalHidden = Object.getOwnPropertyDescriptor(
        Document.prototype,
        "hidden"
    );

    if (!originalVisibility?.get || !originalHidden?.get) {
        console.warn("[ReelFlow] Visibility API unavailable.");
        return;
    }

    function handleVisibilityChange(event) {
        if (!enabled) return;

        if (originalVisibility.get.call(document) === "hidden") {
            event.stopImmediatePropagation();
        }
    }

    function enableProtection() {
        if (enabled) return;

        enabled = true;

        window.addEventListener(
            "visibilitychange",
            handleVisibilityChange,
            true
        );

        try {
            Object.defineProperty(document, "visibilityState", {
                configurable: true,
                get: () => "visible"
            });

            Object.defineProperty(document, "hidden", {
                configurable: true,
                get: () => false
            });

            console.log("[ReelFlow] Background playback enabled.");
        } catch (error) {
            enabled = false;

            window.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
                true
            );

            console.error("[ReelFlow] Enable failed:", error);
        }
    }

    function disableProtection() {
        if (!enabled) return;

        enabled = false;

        window.removeEventListener(
            "visibilitychange",
            handleVisibilityChange,
            true
        );

        // Restore the original document behaviour.
        delete document.visibilityState;
        delete document.hidden;

        console.log("[ReelFlow] Background playback disabled.");
    }

    window.addEventListener("message", (event) => {
        if (event.source !== window) return;

        const data = event.data;

        if (!data || data.source !== TARGET) return;

        if (data.type === "SETTINGS") {
            if (data.enabled === true) {
                enableProtection();
            } else if (data.enabled === false) {
                disableProtection();
            }
        }
    });

    // Respond to the isolated extension script.
    window.addEventListener("message", (event) => {
        if (event.source !== window) return;

        if (
            event.data?.source === SOURCE &&
            event.data?.type === "HELLO"
        ) {
            window.postMessage({
                source: SOURCE,
                type: "READY"
            }, location.origin);
        }
    });

    window.postMessage({
        source: SOURCE,
        type: "READY"
    }, location.origin);

})();
