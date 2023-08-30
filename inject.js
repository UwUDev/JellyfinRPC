var localSessCreds = localStorage.getItem("jellyfin_credentials");

if (localSessCreds === undefined) {
    console.log("Not a jellyfin server")
} else {

    var localSessCredsJson = JSON.parse(localSessCreds);

    if (localSessCredsJson["Servers"][0]["AccessToken"] === undefined) {
        console.log("Not authed")
    } else {
        console.log("Authed !")
        const aToken = localSessCredsJson["Servers"][0]["AccessToken"]
        const userId = localSessCredsJson["Servers"][0]["UserId"]
        setInterval (() => {
            console.log(aToken)

            const data = null;

            const xhr = new XMLHttpRequest();
            xhr.withCredentials = true;

            xhr.addEventListener("readystatechange", function () {
                if (this.readyState === this.DONE) {
                    const jsonResp = JSON.parse(this.responseText);
                    let watching = false;
                    let watchingData = {}
                    for (var i = 0; i < jsonResp.length; i++) {
                        session = jsonResp[i];
                        if (session["PlayState"]["PositionTicks"] === undefined) {
                            continue;
                        }

                        console.log(session["UserId"] + " " + userId)
                        if (session["UserId"] !== userId) {
                            continue;
                        }

                        watching = true
                        watchingData = {
                            "position": Math.floor(session["PlayState"]["PositionTicks"] / 10000),
                            "paused": session["PlayState"]["IsPaused"],
                            "type": session["NowPlayingItem"]["Type"],
                            "title": session["NowPlayingItem"]["Name"],
                            "duration": Math.floor(session["NowPlayingItem"]["RunTimeTicks"] / 10000),
                            "serieName": session["NowPlayingItem"]["SeriesName"],
                            "seasonName": session["NowPlayingItem"]["SeasonName"],
                            "thumb": document.location.origin + "/Items/" + session["NowPlayingItem"]["Id"] + "/Images/Primary"
                        }
                        console.log("Found watching session: " + session["Id"]);
                        console.log(document.location.origin + "/Items/" + session["NowPlayingItem"]["Id"] + "/Images/Primary")
                        break;
                    }

                    chrome.runtime.sendMessage({
                        action: "jellyPresence",
                        watching: watching,
                        watchingData: watchingData
                    }, function (response) {
                        console.log('Presence registred', response)
                    });
                }
            });

            xhr.open("GET", "/Sessions?ActiveWithinSeconds=5");
            xhr.setRequestHeader("X-Mediabrowser-Token", aToken);

            xhr.send(data);

            //await new Promise(r => setTimeout(r, 5000));
        }, 5000);
    }
}
