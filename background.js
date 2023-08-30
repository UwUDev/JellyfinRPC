var extensionId = "agnaejlkbiiggajjmnpmeheigkflbnoo"; //Chrome
if (typeof browser !== 'undefined' && typeof chrome !== "undefined") {
    extensionId = "{57081fef-67b4-482f-bcb0-69296e63ec4f}"; //Firefox
}

let watching = false;
let watchingData = {}


chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
    if (request.action === "presence") {
        console.log('Presence requested', request);
        sendResponse(getPresence(watchingData["title"], watchingData["paused"]));
    }
    return true;
});

// Register Presence
chrome.runtime.sendMessage(extensionId, {mode: 'passive'}, function (response) {
    console.log('Presence registred', response)
});

function getPresence() {
    console.log(watching ? 'Watching' : 'Idle')
    if (!watching) {
        return {
            clientId: '1146413774245462037',
            presence: {
                //state: new Date().toLocaleString(),
                instance: true,
                largeImageKey: 'jellyfin',
                state: "Idle",
            }
        };
    }
    let presence = {
        clientId: '1146413774245462037',
        presence: {
            //state: new Date().toLocaleString(),
            instance: true,
            largeImageKey: watchingData["thumb"],
            details: watchingData["seasonName"] !== undefined ? watchingData["seasonName"] : watchingData["type"],
            state: watchingData["title"],
            smallImageKey: watchingData["paused"] ? 'pause' : 'play',
        }
    };

    if (watchingData["serieName"] !== undefined) {
        presence.presence.state = watchingData["serieName"] + " - " + watchingData["title"];
    }

    return presence;
}


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "jellyPresence") {
        watching = request.watching;
        watchingData = request.watchingData;
    }
    return true;
});
