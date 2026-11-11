
"use strict";

const toggle = document.getElementById("enabledToggle");

const statusText = document.getElementById("statusText");
const statusDescription = document.getElementById("statusDescription");
const statusDot = document.getElementById("statusDot");

const errorMessage = document.getElementById("errorMessage");

const aboutButton = document.getElementById("aboutButton");
const aboutContent = document.getElementById("aboutContent");

let currentEnabled = true;
let saving = false;

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
}

function clearError() {
    errorMessage.textContent = "";
    errorMessage.hidden = true;
}

function updateInterface(enabled) {
    currentEnabled = enabled;
    toggle.checked = enabled;

    statusText.textContent = enabled
        ? "Background Playback Enabled"
        : "Background Playback Disabled";

    statusDescription.textContent = enabled
        ? "Your Reels can continue playing in the background."
        : "Instagram will use its normal playback behaviour.";

    statusDot.classList.toggle("active", enabled);
    statusDot.classList.toggle("inactive", !enabled);
}

async function initialize() {
    toggle.disabled = true;
    clearError();

    try {
        const settings = await browser.storage.local.get({
            enabled: true
        });

        if (typeof settings.enabled !== "boolean") {
            throw new Error("Invalid playback preference.");
        }

        updateInterface(settings.enabled);

    } catch (error) {
        console.error("[ReelFlow] Settings initialization failed:", error);

        statusText.textContent = "Settings unavailable";
        statusDescription.textContent = "Unable to load preferences.";

        showError(
            "ReelFlow couldn't load your settings. Try reloading the extension."
        );

    } finally {
        toggle.disabled = false;
    }
}

toggle.addEventListener("change", async () => {
    if (saving) return;

    saving = true;
    toggle.disabled = true;

    const requestedValue = toggle.checked;
    const previousValue = currentEnabled;

    clearError();

    try {
        await browser.storage.local.set({
            enabled: requestedValue
        });

        updateInterface(requestedValue);

        console.log(
            "[ReelFlow] Preference updated:",
            requestedValue
        );

    } catch (error) {
        console.error("[ReelFlow] Could not save preference:", error);

        updateInterface(previousValue);

        showError(
            "Your setting couldn't be saved. Please try again."
        );

    } finally {
        saving = false;
        toggle.disabled = false;
    }
});

// Keep the popup synchronized with storage changes.
browser.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes.enabled) return;

    if (typeof changes.enabled.newValue === "boolean") {
        updateInterface(changes.enabled.newValue);
        clearError();
    }
});

// Expand or collapse About.
aboutButton.addEventListener("click", () => {
    const isExpanded =
        aboutButton.getAttribute("aria-expanded") === "true";

    aboutButton.setAttribute(
        "aria-expanded",
        String(!isExpanded)
    );

    aboutContent.hidden = isExpanded;
});

initialize();
