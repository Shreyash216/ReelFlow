
const toggle = document.getElementById("enabledToggle");
const statusText = document.getElementById("statusText");
const statusDescription = document.getElementById("statusDescription");
const statusDot = document.getElementById("statusDot");

function updateInterface(enabled) {
    toggle.checked = enabled;

    statusText.textContent = enabled
        ? "Background Playback Active"
        : "Background Playback Disabled";

    statusDescription.textContent = enabled
        ? "Your Reels can play in the background."
        : "Instagram will use its normal playback behaviour.";

    statusDot.classList.toggle("active", enabled);
}

async function initialize() {
    try {
        const settings = await browser.storage.local.get({
            enabled: true
        });

        updateInterface(settings.enabled);
    } catch (error) {
        console.error("[ReelFlow] Settings error:", error);
        statusText.textContent = "Unable to load settings";
    }
}

toggle.addEventListener("change", async () => {
    toggle.disabled = true;

    try {
        await browser.storage.local.set({
            enabled: toggle.checked
        });

        updateInterface(toggle.checked);
    } catch (error) {
        console.error("[ReelFlow] Could not save settings:", error);
        await initialize();
    } finally {
        toggle.disabled = false;
    }
});

initialize();
