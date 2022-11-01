/**
 * @name BetterProfile
 * @version 1.0.5
 * @description Allows you to have animated avatar. Other people with this plugin can see it too.
 * @author Fate
 * @website https://github.com/FateNotAvailable/BetterDiscordPlugins/tree/main/BetterProfile
 * @source https://raw.githubusercontent.com/FateNotAvailable/BetterDiscordPlugins/main/BetterProfile/BetterProfile.plugin.js
 */

let config = {
    name: "BetterProfile",
    version: "1.0.5",
    description: "Allows you to have animated avatar. Other people with this plugin can see it too.",
    author: "Fate",
    website: "https://github.com/FateNotAvailable/BetterDiscordPlugins/tree/main/BetterProfile",
    source: "https://raw.githubusercontent.com/FateNotAvailable/BetterDiscordPlugins/main/BetterProfile/BetterProfile.plugin.js"
}

const api = "https://DB.parrotdevelopers.repl.co";
const proxy = "https://corsproxy.io/?";
let avatarDB = "";

let up = true;

// Default settings
let mySettings = {
    avatarURL: "",
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
        BdApi.saveData(config.name, "settings", mySettings);
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
    BdApi.injectCSS(config.name, `
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
    `);
}

const GETurlbuilder = (type, id) => {
    let url = `${api}/get.php?id=${id}&key=${type}&version=${config.version}`;
    if (!mySettings.cache) return `${url}&lastmod=${Date.now()}`
    return url
}

const replaceAllAvatars = () => {
    if (!avatarDB && !mySettings.avatarURL) return
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
        if (id == localUID && mySettings.avatarURL) {
            if (mySettings.cache) img.src = `${proxy}${urlencode(mySettings.avatarURL)}`;
            else img.src = `${proxy}${urlencode(mySettings.avatarURL)}&lastmod=${Date.now()}`;
            continue
        }

        // If server is down we dont need to replace image cuz local user's one was already replaced above
        if (!up) continue

        // Check DB
        if (!avatarDB.includes(id)) continue

        // Set IMG
        img.src = GETurlbuilder("avatar", id);
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
        if (id == localUID && mySettings.avatarURL) {
            if (mySettings.cache) userAvatar.style.backgroundImage = `url(${proxy}${urlencode(mySettings.avatarURL)})`;
            else userAvatar.style.backgroundImage = `url(${proxy}${urlencode(mySettings.avatarURL)}&lastmod=${Date.now()})`;
            continue
        }
        
        // If server is down we dont need to replace image cuz local user's one was already replaced above
        if (!up) continue

        // Check DB
        if (!avatarDB.includes(id)) continue
        
        // Set IMG
        userAvatar.style.backgroundImage = `url(${GETurlbuilder("avatar", id)})`;
    }
}

const updateItem = (type, id, url, tkn) => {
    const encoded = btoa(url);

    require("request").get(`${api}/set.php?id=${id}&token=${tkn}&key=${type}&value=base64:${encoded}&version=${config.version}`, (e, r, b) => {
        if (type == "avatar") replaceAllAvatars();
    });
}

const updateAvatarfromSettings = () => {
    updateItem(
        "avatar",
        getUID(),
        mySettings.avatarURL,
        "none" // Fuck verification.
    )
}

const downloadDB = () => {
    console.log("Updating Database");
    require("request").get(`${api}/getByKey.php?key=avatar&version=${config.version}`, (e, r, b) => {
        avatarDB = b;
        BdApi.saveData(config.name, "avatarDB", b);
        up = true;
    });
}

module.exports = class BetterProfile {
    constructor(meta) {
        this.meta = meta;
        this.avatarListener = function (e) {
            replaceAllAvatars();
        };
    }

    start() {
        Object.assign(mySettings, BdApi.loadData(config.name, "settings"));
        avatarDB = BdApi.loadData(config.name, "avatarDB");
        if (!avatarDB) avatarDB = "";

        downloadDB();
        updateAvatarfromSettings();
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
            buildSetting("Avatar: ", "avatarURL", "text", mySettings.avatarURL, updateAvatarfromSettings),
            buildSetting("Cache: ", "cache", "checkbox", mySettings.cache, replaceAllAvatars),
        ]

        options.forEach((item, index) => {
            mySettingsPanel.append(item)
        })
        return mySettingsPanel;
    }
    
}

