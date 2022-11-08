/**
    * @name BetterProfile
    * @version 2.0.0
    * @description Allows you to customize your profile more. Others with this plugin can see your profile too.
    * @author Fate
    * @website https://github.com/FateNotAvailable/BetterDiscordPlugins/tree/main/BetterProfile
    * @source https://raw.githubusercontent.com/FateNotAvailable/BetterDiscordPlugins/main/BetterProfile/BetterProfile.plugin.js
    * @updateUrl https://raw.githubusercontent.com/FateNotAvailable/BetterDiscordPlugins/main/BetterProfile/BetterProfile.plugin.js
*/
const config = {
    name: "BetterProfile",
    version: "2.0.0",
    description: "Allows you to customize your profile more. Others with this plugin can see your profile too.",
    author: "Fate",
    website: "https://github.com/FateNotAvailable/BetterDiscordPlugins/tree/main/BetterProfile",
    source: "https://raw.githubusercontent.com/FateNotAvailable/BetterDiscordPlugins/main/BetterProfile/BetterProfile.plugin.js",
    updateUrl: "https://raw.githubusercontent.com/FateNotAvailable/BetterDiscordPlugins/main/BetterProfile/BetterProfile.plugin.js",
    api: "https://DB.parrotdevelopers.repl.co",
    proxy: "https://corsproxy.io/?"
};

const DB = () => {
    const db = BdApi.loadData(config.name, "DB");
    if (!db) return {}
    return db
};
const updateDB = () => {
    require("request").get(`${config.api}/db.php?version=${config.version}`, (e, r, b) => {
        BdApi.saveData(config.name, "DB", JSON.parse(b));
    });
};
const updateItem = (type, id, url, tkn) => {
    const encoded = btoa(url);
    require("request").get(`${config.api}/set.php?id=${id}&token=${tkn}&key=${type}&value=base64:${encoded}&version=${config.version}`, (e, r, b) => {
        updateDB();
    });
};

const urlencode = (str) => {
    return encodeURIComponent(str);
};
const getToken = () => {
    return (
        webpackChunkdiscord_app.push(
            [
                [''],
                {},
                e => {
                    m=[];
                    for(let c in e.c)
                        m.push(e.c[c]);
                }
            ]
        ),
        m
    ).find(
        m => m?.exports?.default?.getToken !== void 0
    ).exports.default.getToken()
};
const getUID = () => {
    return atob(getToken().split(".")[0]);
};

const addCustomCSS = () => {
    BdApi.injectCSS(config.name, `
    :root {
        --animatedPFP---profile-gradient-primary-color-size: 2px;
    }

    .animatePFP-settings-label {
        color: white;
        font-weight: 600;
    }

    .animatePFP-settings-input-text {
        background-color: #36393f;
        --profile-gradient-primary-color: 3px solid #202225;
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



    @keyframes rainbow_animation {
        0%,100% {
            background-position: 0 0;
        }
    
        50% {
            background-position: 100% 0;
        }
    }

    `);
};

const replaceAllAvatars = (mySettings) => {
    const db = DB();
    if (!db) return
    let imgs = document.getElementsByTagName("img");
    const localUID = getUID();
    let userAvatars = [
        ...document.querySelectorAll("*[class*='userAvatar-']"),
        ...document.querySelectorAll("*[class*='imageUploaderInner-']"),
    ];
    for (let i = 0; i < imgs.length; i++) {
        let img = imgs[i];
        if (!img.src.includes("/avatars/")) continue
        const id = img.src.split("/avatars/")[1].split("/")[0];
        img.dataset.original = img.src;
        img.dataset.uid = id;
        if (id == localUID && mySettings.avatar != "") {
            img.src = `${config.proxy}${urlencode(mySettings.avatar)}`;
            continue
        }
        if (db.hasOwnProperty(id) && db[id].hasOwnProperty("avatar") && db[id]["avatar"] != "") {
            img.src = config.proxy + urlencode(db[id]['avatar']);
        }
    }
    for (let i = 0; i < userAvatars.length; i++) {
        let userAvatar = userAvatars[i];
        if (!userAvatar.style.backgroundImage.includes("/avatars/")) continue
        const id = userAvatar.style.backgroundImage.split("/avatars/")[1].split("/")[0];
        userAvatar.dataset.original = userAvatar.style.backgroundImage;
        userAvatar.dataset.uid = id;
        if (id == localUID && mySettings.avatar != "") {
            userAvatar.style.backgroundImage = `url(${config.proxy}${urlencode(mySettings.avatar)})`;
            continue
        }
        if (db.hasOwnProperty(id) && db[id].hasOwnProperty("avatar")&& db[id]["avatar"] != "") {
            userAvatar.style.backgroundImage = `url(${config.proxy}${db[id]['avatar']})`;
            userAvatar.style.backgroundImage = `url(${config.proxy}${urlencode(db[id]['avatar'])})`;
        }
    }
};

const replaceAllBanners = (mySettings) => {
    const db = DB();
    if (!db) return
    const localUID = getUID();
    let popouts = [
        ...document.querySelectorAll("*[class*='userPopoutInner-']"),
        ...document.querySelectorAll("*[class*='menu-']"),
    ];
    for (let i = 0; i < popouts.length; i++) {
        let popout = popouts[i];
        const avatar = popout.querySelectorAll("*[class*='avatar-']")[0];
        let banner = popout.querySelectorAll("*[class*='banner-']");
        if (banner.length == 0) continue
        banner = banner[0];
        let id = "";
        if (avatar.src.includes("get.php?id=")) id = avatar.src.split("get.php?id=")[1];
        else if (avatar.src.includes("/avatars/")) id = avatar.src.split("/avatars/")[1].split("/")[0];
        else if (avatar.dataset.original.includes("/avatars/")) id = avatar.dataset.original.split("/avatars/")[1].split("/")[0];
        else id = localUID;
        let avatarWrapperNormal = popout.querySelectorAll("*[class*='avatarWrapperNormal-']")[0];
        if (id == localUID && mySettings.banner || db.hasOwnProperty(id) && db[id].hasOwnProperty("banner")) {
            if (avatarWrapperNormal.style.top != "76px") {
                avatarWrapperNormal.style.setProperty('top', '76px', 'important');
            }
        }
        if (banner.tagName.toLowerCase() == "img") continue
        let img = document.createElement("img");
        img.className = banner.className;
        img.style.height = "120px";
        img.dataset.uid = id;
        if (id == localUID && mySettings.banner != "") {
           img.src = config.proxy+urlencode(mySettings.banner);
        }
        else if (db.hasOwnProperty(id) && db[id].hasOwnProperty("banner") && db[id]["avatar"] != "") {
            img.src = config.proxy + urlencode(db[id]['banner']);
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
};

const replaceAllThemes = (mySettings) => {
    const db = DB();
    if (!db) return
    const localUID = getUID();
    let popouts = [
        ...document.querySelectorAll("*[class*='userPopoutOuter-']"),
    ];
    for (let i = 0; i < popouts.length; i++) {
        let popout = popouts[i];
        const avatar = popout.querySelectorAll("*[class*='avatar-']")[0];
        let id = "";
        if (avatar.src.includes("get.php?id=")) id = avatar.src.split("get.php?id=")[1];
        else if (avatar.src.includes("/avatars/")) id = avatar.src.split("/avatars/")[1].split("/")[0];
        else if (avatar.dataset.original.includes("/avatars/")) id = avatar.dataset.original.split("/avatars/")[1].split("/")[0];
        else id = localUID;
        if (id == localUID && mySettings.themePrimary != "") {
            popout.style.setProperty("--profile-gradient-primary-color", mySettings.themePrimary);
        }
        else if (db.hasOwnProperty(id) && db[id].hasOwnProperty("themePrimary") && db[id]["themePrimary"] != "") {
            popout.style.setProperty("--profile-gradient-primary-color", db[id]["themePrimary"]);
        }
        if (id == localUID && mySettings.themeSecondary != "") {
            popout.style.setProperty("--profile-gradient-secondary-color", mySettings.themeSecondary);
        }
        else if (db.hasOwnProperty(id) && db[id].hasOwnProperty("themeSecondary") && db[id]["themeSecondary"] != "") {
            popout.style.setProperty("--profile-gradient-secondary-color", db[id]["themeSecondary"]);
        }
        if (id == localUID && mySettings.themeBGC != "") {
            popout.style.setProperty("--profile-body-background-color", mySettings.themeBGC);
        }
        else if (db.hasOwnProperty(id) && db[id].hasOwnProperty("themeBGC") && db[id]["themeBGC"] != "") {
            popout.style.setProperty("--profile-body-background-color", db[id]["themeBGC"]);
        }
        if (id == localUID && mySettings.themeOC != "") {
            popout.style.setProperty("--profile-gradient-overlay-color", mySettings.themeOC);
        }
        else if (db.hasOwnProperty(id) && db[id].hasOwnProperty("themeOC") && db[id]["themeOC"] != "") {
            popout.style.setProperty("--profile-gradient-overlay-color", db[id]["themeOC"]);
        }
    }
};

let mySettings = {
    avatar: "",
    banner: "",
    themePrimary: "",
    themeSecondary: "",
    themeBGC: "",
    themeOC: ""
};
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
const updateAvatarfromSettings = () => {
    updateItem(
        "avatar",
        getUID(),
        mySettings.avatar,
        "none"
    );
    replaceAllAvatars(mySettings);
};
const updateBannerfromSettings = () => {
    updateItem(
        "banner",
        getUID(),
        mySettings.banner,
        "none"
    );
    replaceAllBanners(mySettings);
};
const updateThemefromSettings = () => {
    updateItem(
        "themePrimary",
        getUID(),
        mySettings.themePrimary,
        "none"
    );
    updateItem(
        "themeSecondary",
        getUID(),
        mySettings.themeSecondary,
        "none"
    );
    updateItem(
        "themeBGC",
        getUID(),
        mySettings.themeBGC,
        "none"
    );
    updateItem(
        "themeOC",
        getUID(),
        mySettings.themeOC,
        "none"
    );
    replaceAllThemes(mySettings);
};
module.exports = class BetterProfile {
    constructor(meta) {
        Object.assign(mySettings, BdApi.loadData(config.name, "settings"));
        this.meta = meta;
        this.mainListener = function (e) {
            replaceAllAvatars(mySettings);
            replaceAllBanners(mySettings);
            replaceAllThemes(mySettings);
        };
    }
    start() {
        Object.assign(mySettings, BdApi.loadData(config.name, "settings"));
        updateDB();
        updateAvatarfromSettings();
        updateBannerfromSettings();
        updateThemefromSettings();
        addCustomCSS();
        window.addEventListener("DOMNodeInserted", this.mainListener);
        this.mainInterval = setInterval(function() {
            updateAvatarfromSettings();
            updateBannerfromSettings();
            updateThemefromSettings();
            updateDB();
        }, 1* 60 * 1000);
    }
    stop() {
        window.removeEventListener("DOMNodeInserted", this.mainListener);
        clearInterval(this.mainInterval);
    }
    getSettingsPanel() {
        const mySettingsPanel = document.createElement("div");
        mySettingsPanel.id = "animatepfp-settings";
        const options = [
            buildSetting("Avatar: ", "avatar", "text", mySettings.avatar, updateAvatarfromSettings),
            buildSetting("Banner: ", "banner", "text", mySettings.banner, updateBannerfromSettings),
            buildSetting("T-Primary: ", "themePrimary", "text", mySettings.themePrimary, updateThemefromSettings),
            buildSetting("T-Secondary: ", "themeSecondary", "text", mySettings.themeSecondary, updateThemefromSettings),
            buildSetting("T-BG Color: ", "themeBGC", "text", mySettings.themeBGC, updateThemefromSettings),
            buildSetting("T-O Color: ", "themeOC", "text", mySettings.themeOC, updateThemefromSettings),
        ];
        options.forEach((item, index) => {
            mySettingsPanel.append(item);
        });
        return mySettingsPanel;
    }
};
