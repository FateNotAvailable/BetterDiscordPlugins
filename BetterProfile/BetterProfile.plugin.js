/**
 * @name BetterProfile
 * @version 1.1.0
 * @description Allows you to customize your profile more. Others with this plugin can see your profile too.
 * @author Fate
 * @website https://github.com/FateNotAvailable/BetterDiscordPlugins/tree/main/BetterProfile
 * @source https://raw.githubusercontent.com/FateNotAvailable/BetterDiscordPlugins/main/BetterProfile/BetterProfile.plugin.js
 * @updateUrl https://raw.githubusercontent.com/FateNotAvailable/BetterDiscordPlugins/main/BetterProfile/BetterProfile.plugin.js
 */


const config = {
    name: "BetterProfile",
    version: "1.1.0",
    description: "Allows you to customize your profile more. Others with this plugin can see your profile too.",
    author: "Fate",
    website: "https://github.com/FateNotAvailable/BetterDiscordPlugins/tree/main/BetterProfile",
    source: "https://raw.githubusercontent.com/FateNotAvailable/BetterDiscordPlugins/main/BetterProfile/BetterProfile.plugin.js",
    updateUrl: this.source
}

const api = "https://DB.parrotdevelopers.repl.co";
const proxy = "https://corsproxy.io/?";
var db = "";
let up = true;

// Default settings
let mySettings = {
    avatar: "",
    banner: "",
    border: false,
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
    :root {
        --animatedPFP-border-size: 2px;
    }

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

    @keyframes RGB {
        from {
          border: var(--animatedPFP-border-size) solid #6666ff;
        }
        10% {
            border: var(--animatedPFP-border-size) solid #0099ff;
        }
        50% {
            border: var(--animatedPFP-border-size) solid #00ff00;
        }
        75% {
            border: var(--animatedPFP-border-size) solid #ff3399;
        }
        100% {
            border: var(--animatedPFP-border-size) solid #6666ff;
        }
    }
    `);
}

const replaceAllAvatars = () => {
    if (!db) return // TODO: Add checker if specific key exists
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
        if (id == localUID && mySettings.avatar) {
            if (mySettings.cache) img.src = `${proxy}${urlencode(mySettings.avatar)}`;
            else img.src = `${proxy}${urlencode(mySettings.avatar)}&lastmod=${Date.now()}`;
            continue
        }

        // If server is down we dont need to replace image cuz local user's one was already replaced above
        if (!up) continue

        if (db.hasOwnProperty(id) && db[id].hasOwnProperty("avatar")) {
            if (mySettings.cache) img.src = proxy + urlencode(db[id]['avatar']);
            else img.src = `${proxy}${urlencode(db[id]['avatar'])}&lastmod=${Date.now()}`;
        }
        
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
        if (id == localUID && mySettings.avatar) {
            if (mySettings.cache) userAvatar.style.backgroundImage = `url(${proxy}${urlencode(mySettings.avatar)})`;
            else userAvatar.style.backgroundImage = `url(${proxy}${urlencode(mySettings.avatar)}&lastmod=${Date.now()})`;
            continue
        }
        
        // If server is down we dont need to replace image cuz local user's one was already replaced above
        if (!up) continue

        if (db.hasOwnProperty(id) && db[id].hasOwnProperty("avatar")) {
            userAvatar.style.backgroundImage = `url(${proxy}${db[id]['avatar']})`;

            if (mySettings.cache) userAvatar.style.backgroundImage = `url(${proxy}${urlencode(db[id]['avatar'])})`;
            else userAvatar.style.backgroundImage = `url(${proxy}${urlencode(db[id]['avatar'])}&lastmod=${Date.now()})`;
        }
    }
}

const replaceAllBorders = () => {
    if (!db) return // TODO: Add checker if specific key exists
    const localUID = getUID();

    let popouts = [
        ...document.querySelectorAll("*[class*='userPopout-']"),
        ...document.querySelectorAll("*[class*='menu-']"),
    ];

    for (let i = 0; i < popouts.length; i++) {
        let popout = popouts[i];
        
        const avatar = popout.getElementsByTagName("img")[0];

        // Get user id from avatar
        let id = "";
        if (avatar.src.includes("get.php?id=")) id = avatar.src.split("get.php?id=")[1]
        else if (avatar.src.includes("/avatars/")) id = avatar.src.split("/avatars/")[1].split("/")[0]
        else id = localUID

        if (!db.hasOwnProperty(id) || !db[id].hasOwnProperty("border") || !db[id]["border"]) continue
        console.log(db[id]["border"]);
        // Check DB
        if (db[id]["border"] == "RGB") {
            popout.style.animation = "RGB 6s linear 0s infinite";
            popout.style.border = "";
            continue;
        }

        popout.style.border = `2px solid ${db[id]["border"]}`;
        popout.style.animation = "";
    }

}

const replaceAllBanners = () => {
    if (!db) return // TODO: Add checker if specific key exists
    const localUID = getUID();

    let popouts = [
        ...document.querySelectorAll("*[class*='userPopout-']"),
        ...document.querySelectorAll("*[class*='menu-']"),
    ];

    for (let i = 0; i < popouts.length; i++) {
        let popout = popouts[i];
        
        const avatar = popout.querySelectorAll("*[class*='avatar-']")[0];
        let banner = popout.querySelectorAll("*[class*='banner-']");
        
        if (banner.length == 0) continue
        banner = banner[0];

        
        // Get user id from avatar
        let id = "";
        if (avatar.src.includes("get.php?id=")) id = avatar.src.split("get.php?id=")[1]
        else if (avatar.src.includes("/avatars/")) id = avatar.src.split("/avatars/")[1].split("/")[0]
        else id = localUID
        
        // Discord autoreplaces this with original, so made this to fuck the discord's one
        let avatarWrapperNormal = popout.querySelectorAll("*[class*='avatarWrapperNormal-']")[0];
        if (id == localUID && mySettings.banner || up && db.hasOwnProperty(id) && db[id].hasOwnProperty("banner")) {
            if (avatarWrapperNormal.style.top != "76px") {
                avatarWrapperNormal.style.setProperty('top', '76px', 'important');
            }
        }
        
        if (banner.tagName.toLowerCase() == "img") continue

        // Replace the div with an image
        let img = document.createElement("img");
        img.className = banner.className;
        img.style.height = "120px";
        
        if (id == localUID && mySettings.banner) {
           if (mySettings.cache) img.src = proxy+urlencode(mySettings.banner);
           else img.src = `${proxy}${urlencode(mySettings.banner)}&lastmod=${Date.now()}`;
        }
        else if (up && db.hasOwnProperty(id) && db[id].hasOwnProperty("banner")) {
            if (mySettings.cache) img.src = proxy + urlencode(db[id]['banner']);
            else img.src = `${proxy}${urlencode(db[id]['banner'])}&lastmod=${Date.now()}`;
        }
        else {
            continue
        }

        let bannerSVGWrapper = popout.querySelectorAll("*[class*='bannerSVGWrapper-']")[0];
        bannerSVGWrapper.getElementsByTagName("foreignObject")[0].removeAttribute("mask");
        bannerSVGWrapper.setAttribute("viewBox", "0 0 300 120");
        bannerSVGWrapper.style.minHeight = "120px";

        

        banner.parentNode.replaceChild(img, banner);
    }

}

const updateItem = (type, id, url, tkn) => {
    const encoded = btoa(url);

    require("request").get(`${api}/set.php?id=${id}&token=${tkn}&key=${type}&value=base64:${encoded}&version=${config.version}`, (e, r, b) => {
        downloadDB();
        if (type == "avatar") replaceAllAvatars();
        if (type == "banner") replaceAllBanners();
    });
}

const updateAvatarfromSettings = () => {
    updateItem(
        "avatar",
        getUID(),
        mySettings.avatar,
        "none" // Fuck verification.
    )
}

const updateBorderfromSettings = () => {
    updateItem(
        "border",
        getUID(),
        mySettings.border,
        "none" // Fuck verification.
    )
}

const updateBannerfromSettings = () => {
    updateItem(
        "banner",
        getUID(),
        mySettings.banner,
        "none" // Fuck verification.
    )
}

const downloadDB = () => {
    console.log("Updating Database");
    require("request").get(`${api}/db.php?version=${config.version}`, (e, r, b) => {
        db = JSON.parse(b);
        BdApi.saveData(config.name, "DB", db);
        up = true;
    });
}

module.exports = class BetterProfile {
    constructor(meta) {
        this.meta = meta;
        this.mainListener = function (e) {
            replaceAllAvatars();
            replaceAllBorders();
            replaceAllBanners();
        };
    }

    start() {
        Object.assign(mySettings, BdApi.loadData(config.name, "settings"));
        db = BdApi.loadData(config.name, "DB");
        if (!db) db = "";

        downloadDB();
        updateAvatarfromSettings();
        updateBannerfromSettings();
        updateBorderfromSettings();
        addCustomCSS();

        // DOMNodeInserted is deprecated but it still works on discord
        window.addEventListener("DOMNodeInserted", this.mainListener);

        this.downloadDBInterval = setInterval(function() {
            updateAvatarfromSettings();
            updateBannerfromSettings();
            updateBorderfromSettings();
            downloadDB();
        }, 1* 60 * 1000); // 1 minute
    }


    stop() {
        window.removeEventListener("DOMNodeInserted", this.mainListener);
        clearInterval(this.downloadDBInterval);
    }
    
    // Credits: https://docs.betterdiscord.app/plugins/basics/settings#settings-menu
    getSettingsPanel() {
        const mySettingsPanel = document.createElement("div");
        mySettingsPanel.id = "animatepfp-settings";

        const options = [
            buildSetting("Avatar: ", "avatar", "text", mySettings.avatar, updateAvatarfromSettings),
            buildSetting("Banner: ", "banner", "text", mySettings.banner, updateBannerfromSettings),
            buildSetting("Border: ", "border", "text", mySettings.border, updateBorderfromSettings),
            buildSetting("Cache: ", "cache", "checkbox", mySettings.cache, replaceAllAvatars),
        ]

        options.forEach((item, index) => {
            mySettingsPanel.append(item)
        })
        return mySettingsPanel;
    }
}

