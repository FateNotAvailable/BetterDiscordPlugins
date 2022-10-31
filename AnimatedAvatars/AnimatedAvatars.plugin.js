/**
 * @name AnimatedAvatars
 * @version 1.0.2
 * @description Do you want animated avatar but you dont want to buy intro? If yea, I got you covered, with this plugin you can replace avatar with gif or anything, and other people with this plugin can see it.
 * @author Fate#5785
 * @website https://github.com/FateNotAvailable/BetterDiscordPlugins/blob/main/AnimatedAvatars/AnimatedAvatars.plugin.js
 * @source https://raw.githubusercontent.com/FateNotAvailable/BetterDiscordPlugins/main/AnimatedAvatars/AnimatedAvatars.plugin.js
 */


const api = "https://PFPDB.parrotdevelopers.repl.co";
const proxy = "https://corsproxy.io/?";
let db =  "";
let up = true;

// Default settings
let mySettings = {
    pfpurl: "",
    cache:false,
};

// Credits: https://docs.betterdiscord.app/plugins/basics/settings#settings-menu
function buildSetting(text, key, type, value, callback = () => {}) {
    const setting = Object.assign(document.createElement("div"), {className: "setting"});
    const label = Object.assign(document.createElement("span"), {textContent: text, className: "animatePFP-settings-label"});
    const input = Object.assign(document.createElement("input"), {type: type, name: key, value: value});

    if (type == "checkbox" && value) input.checked = true;
    input.addEventListener("change", () => {
        const newValue = type == "checkbox" ? input.checked : input.value;
        mySettings[key] = newValue;
        BdApi.saveData("AnimatedAvatars", "settings", mySettings);
        callback(newValue);
    });

    if (type == "text") {
        input.className = "animatePFP-settings-input-text";
    } else {
        input.className = "animatePFP-settings-input-checkbox";
    }

    setting.append(label, input);
    return setting;
}

// Credits: https://www.w3docs.com/snippets/javascript/how-to-encode-javascript-url.html
const urlencode = (str) => {
    return encodeURIComponent(str);
}

// Credits: https://stackoverflow.com/questions/67348339/any-way-to-get-my-discord-token-from-browser-dev-console
const getToken = () => {
    return (
        webpackChunkdiscord_app.push(
            [
                [''],
                {},
                e => {
                    m=[];
                    for(let c in e.c)
                        m.push(e.c[c])
                }
            ]
        ),
        m
    ).find(
        m => m?.exports?.default?.getToken !== void 0
    ).exports.default.getToken()
}

const getUID = () => {
    return atob(getToken().split(".")[0]); // Fun fact, if you split token by ".", first part is base64 encoded user ID
}

const addCustomCSS = () => {
    BdApi.injectCSS("AnimatedAvatars", `
    .animatePFP-settings-label {
        color: white;
        font-weight: 600;
    }

    .animatePFP-settings-input-text {
        background-color: #36393f;
        border: 3px solid #202225;
        width: 70%;
        margin-left: 8%;
        color: white;
        text-align: center;
        font-weight: 600;
        font-size: .95em;
    }

    .animatePFP-settings-input-checkbox {
        margin-left: 6%;
    }

    .animatePFP-animated-text {
        animation: colorRotate 6s linear 0s infinite;
    }

    @keyframes colorRotate {
        from {
          color: #6666ff;
        }
        10% {
          color: #0099ff;
        }
        50% {
          color: #00ff00;
        }
        75% {
          color: #ff3399;
        }
        100% {
          color: #6666ff;
        }
    }
    `);
}

/*
const replaceUsernameColors = () => {
    let usernames = [
        ...document.querySelectorAll("*[class*='username-']"),
        ...document.querySelectorAll("*[class*='nickname-']"),
        ...document.querySelectorAll("*[class*='title-']"),
        //...document.getElementsByClassName("title-338goq"),
    ];

    for (let i = 0; i < usernames.length; i++) {
        let username = usernames[i];
        username.className = "animatePFP-animated-text";
    }
*/

const replaceAllAvatars = () => {
    if (!db && !mySettings.pfpurl) return
    let imgs = document.getElementsByTagName("img");
    const localUID = getUID();

    // All places that use background-image: url();
    let userAvatars = [
        //...document.getElementsByClassName("userAvatar-3Hwf1F"),
        //...document.getElementsByClassName("imageUploaderInner-IIRaFr")
        ...document.querySelectorAll("*[class*='userAvatar-']"),
        ...document.querySelectorAll("*[class*='imageUploaderInner-']"),
    ];

    // Replace avatars
    for (let i = 0; i < imgs.length; i++) {
        let img = imgs[i];
                
        //  Check if image is avatar
        if (!img.src.includes("/avatars/")) continue
        
        // check if img was already replaced
        if (img.src.includes("get.php?id=")) continue

        // Get user id from avatar
        const id = img.src.split("/avatars/")[1].split("/")[0];

        // Add original to datase
        img.dataset.original = img.src;

        // Add onerror event listeners so if url is broken, u will see normal discord one
        img.addEventListener('error', function(e) {
            e.path[0].src = e.path[0].dataset.original;
            up = false;
        }.bind(this), false);

        // If id is local user and user has set avatar url, use link directly from settings
        if (id == localUID && mySettings.pfpurl) {
            if (mySettings.cache) img.src = `${proxy}${urlencode(mySettings.pfpurl)}`;
            else img.src = `${proxy}${urlencode(mySettings.pfpurl)}&lastmod=${Date.now()}`;
            continue
        }

        // If server is down we dont need to replace image cuz local user's one was already replaced above
        if (!up) continue

        // Check DB
        if (!db.includes(id)) continue

        // Set IMG
        if (mySettings.cache) img.src = `${api}/get.php?id=${id}`;
        else img.src = `${api}/get.php?id=${id}&lastmod=${Date.now()}`;
    }

    // Replace avatars in voice chat
    for (let i = 0; i < userAvatars.length; i++) {
        let userAvatar = userAvatars[i];
        
        //  Check if image is avatar
        if (!userAvatar.style.backgroundImage.includes("/avatars/")) continue
        
        // check if img was already replaced
        if (userAvatar.style.backgroundImage.includes("get.php?id=")) continue
        
        // Get user id from avatar
        const id = userAvatar.style.backgroundImage.split("/avatars/")[1].split("/")[0];

        // Add original to datase
        userAvatar.dataset.original = userAvatar.style.backgroundImage;

        // Add onerror event listeners so if url is broken, u will see normal discord one
        userAvatar.addEventListener('error', function(e) {
            e.path[0].style.backgroundImage = e.path[0].dataset.original;
            up = false;
        }.bind(this), false);

        // If id is local user and user has set avatar url, use link directly from settings
        if (id == localUID && mySettings.pfpurl) {
            if (mySettings.cache) userAvatar.style.backgroundImage = `url(${proxy}${urlencode(mySettings.pfpurl)})`;
            else userAvatar.style.backgroundImage = `url(${proxy}${urlencode(mySettings.pfpurl)}&lastmod=${Date.now()})`;
            continue
        }
        
        // If server is down we dont need to replace image cuz local user's one was already replaced above
        if (!up) continue

        // Check DB
        if (!db.includes(id)) continue
        
        // Set IMG
        if (mySettings.cache) userAvatar.style.backgroundImage = `url(${api}/get.php?id=${id})`;
        else userAvatar.style.backgroundImage = `url(${api}/get.php?id=${id}&lastmod=${Date.now()})`;
    }
}

const updatePFP = (id, url, tkn) => {
    const encoded = btoa(url);

    require("request").get(`${api}/set.php?id=${id}&token=${tkn}&url=${encoded}`, (e, r, b) => {
        replaceAllAvatars();
    });
}

const updatePFPfromSettings = () => {
    updatePFP(
        getUID(),
        mySettings.pfpurl,
        "none" // Fuck verification.
    )
}

const downloadDB = () => {
    console.log("Updating Database");
    require("request").get(`${api}/db.php`, (e, r, b) => {
        db = b;
        BdApi.saveData("AnimatedAvatars", "DB", b);
        up = true;
    });
}

module.exports = class AnimatedAvatars {
    constructor(meta) {
        this.meta = meta;
        this.avatarListener = function (e) {
            replaceAllAvatars();
        };
    }

    start() {
        Object.assign(mySettings, BdApi.loadData("AnimatedAvatars", "settings"));
        db = BdApi.loadData("AnimatedAvatars", "DB");
        if (!db) db = "";

        downloadDB();
        updatePFPfromSettings();
        addCustomCSS();

        // DOMNodeInserted is deprecated but it still works on discord
        window.addEventListener("DOMNodeInserted", this.avatarListener);

        this.downloadDBInterval = setInterval(function() {
            downloadDB();
        }, 1* 60 * 1000); // 1 minute
    }


    stop() {
        window.removeEventListener("DOMNodeInserted", this.avatarListener);
        clearInterval(this.downloadDBInterval);
    }
    
    // Credits: https://docs.betterdiscord.app/plugins/basics/settings#settings-menu
    getSettingsPanel() {
        const mySettingsPanel = document.createElement("div");
        mySettingsPanel.id = "animatepfp-settings";

        const options = [
            buildSetting("URL: ", "pfpurl", "text", mySettings.pfpurl, updatePFPfromSettings),
            buildSetting("Cache: ", "cache", "checkbox", mySettings.cache, replaceAllAvatars),
        ]

        options.forEach((item, index) => {
            mySettingsPanel.append(item)
        })
        return mySettingsPanel;
    }
    
}

