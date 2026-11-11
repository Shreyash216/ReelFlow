
(() => {
    "use strict";

    if (window.__reelFlowInitialized) return;
    window.__reelFlowInitialized = true;

    const SOURCE = "reelflow-page";
    const TARGET = "reelflow-extension";

    let enabled = false;
    let initialized = false;

    const originalVisibility = Object.getOwnPropertyDescriptor(
        Document.prototype,
        "visibilityState"
    );

    const originalHidden = Object.getOwnPropertyDescriptor(
        Document.prototype,
        "hidden"
    );

    // Preserve any existing own properties for safe restoration.
    const previousVisibility = Object.getOwnPropertyDescriptor(
        document,
        "visibilityState"
    );

    const previousHidden = Object.getOwnPropertyDescriptor(
        document,
        "hidden"
    );

    function sendMessage(type, extra = {}) {
        window.postMessage({
            source: SOURCE,
            type,
            ...extra
        }, location.origin);
    }

    function reportError(message) {
        console.error(`[ReelFlow] ${message}`);

        sendMessage("ERROR", { message });
    }

    function reportStatus() {
        sendMessage("STATUS", {
            status: enabled ? "enabled" : "disabled",
            initialized
        });
    }

    if (!originalVisibility?.get || !originalHidden?.get) {
        reportError("Visibility API unavailable.");
        return;
    }

    function handleVisibilityChange(event) {
        if (!enabled) return;

        if (originalVisibility.get.call(document) === "hidden") {
            event.stopImmediatePropagation();
        }
    }

    function restoreProperty(property, previousDescriptor) {
        if (previousDescriptor) {
            Object.defineProperty(
                document,
                property,
                previousDescriptor
            );
        } else {
            delete document[property];
        }
    }

    function enableProtection() {
        if (enabled) return true;

        try {
            Object.defineProperty(document, "visibilityState", {
                configurable: true,
                get: () => "visible"
            });

            Object.defineProperty(document, "hidden", {
                configurable: true,
                get: () => false
            });

            window.addEventListener(
                "visibilitychange",
                handleVisibilityChange,
                true
            );

            enabled = true;

            console.log("[ReelFlow] Background playback enabled.");

            return true;

        } catch (error) {
            // Roll back both properties if activation partially fails.
            try {
                restoreProperty(
                    "visibilityState",
                    previousVisibility
                );

                restoreProperty(
                    "hidden",
                    previousHidden
                );
            } catch (restoreError) {
                console.error(
                    "[ReelFlow] Visibility restoration failed:",
                    restoreError
                );
            }

            window.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
                true
            );

            enabled = false;

            reportError(`Could not enable protection: ${error.message}`);

            return false;
        }
    }

    function disableProtection() {
        if (!enabled) return true;

        enabled = false;

        window.removeEventListener(
            "visibilitychange",
            handleVisibilityChange,
            true
        );

        try {
            restoreProperty(
                "visibilityState",
                previousVisibility
            );

            restoreProperty(
                "hidden",
                previousHidden
            );

            console.log("[ReelFlow] Background playback disabled.");

            return true;

        } catch (error) {
            reportError(`Could not restore visibility: ${error.message}`);

            return false;
        }
    }

    function handleSettings(data) {
        if (typeof data.enabled !== "boolean") {
            reportError("Invalid playback setting received.");
            return;
        }

        const success = data.enabled
            ? enableProtection()
            : disableProtection();

        if (!success) return;

        sendMessage("ACK", {
            requestId: data.requestId,
            enabled
        });

        reportStatus();
    }

    window.addEventListener("message", (event) => {
        if (event.source !== window) return;

        const data = event.data;

        if (!data || data.source !== TARGET) return;

        if (data.type === "HELLO") {
            sendMessage("READY");
            return;
        }

        if (data.type === "SETTINGS") {
            handleSettings(data);
        }
    });

    initialized = true;

    console.log("[ReelFlow] Playback engine initialized.");

    // Initial readiness notification.
    sendMessage("READY");

})();
