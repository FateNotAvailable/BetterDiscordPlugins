/**
    * @name BetterProfile
    * @version 2.6.0
    * @description Allows you to customize your profile more. Others with this plugin can see your profile too.
    * @author Fate
    * @website https://github.com/FateNotAvailable/BetterDiscordPlugins/tree/main/BetterProfile
    * @source https://raw.githubusercontent.com/FateNotAvailable/BetterDiscordPlugins/main/BetterProfile/BetterProfile.plugin.js
    * @updateUrl https://raw.githubusercontent.com/FateNotAvailable/BetterDiscordPlugins/main/BetterProfile/BetterProfile.plugin.js
*/
const config = {
    name: "BetterProfile",
    version: "2.6.0",
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
const grabUID = () => {
    let userAvatar = document.querySelectorAll("*[class*='avatar-']")[0];
    let img = userAvatar.getElementsByTagName("img")[0];
    if (img.dataset.original) return img.dataset.original.split("/avatars/")[1].split("/")[0];
    if (img.src.includes("/avatars/")) return img.src.original.split("/avatars/")[1].split("/")[0];
    return ""
};
const getUID = () => {
    let id = BdApi.loadData(config.name, "uid");
    if (!id) {
        id = grabUID();
        BdApi.saveData(config.name, "uid", id);
    }
    return id
};

const addCustomCSS = () => {
    BdApi.injectCSS(config.name, `
    .BetterProfile-label {
        color: white;
        font-weight: 600;
    }

    .BetterProfile-input {
        padding: 5px;
        border-radius: 2px;
        border: 0px;
        background-color: #202225;
        width: 200%;
        margin-left: 8%;
        color: white;
        text-align: center;
        font-weight: 600;
        font-size: .95em;
    }

    .BetterProfile-switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 30px;
    }
      
    .BetterProfile-switch input { 
        opacity: 0;
        width: 0;
        height: 0;
    }
      
    .BetterProfile-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        -webkit-transition: .4s;
        transition: .4s;
    }
      
    .BetterProfile-slider:before {
        position: absolute;
        content: "";
        height: 23px;
        width: 23px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        -webkit-transition: .4s;
        transition: .4s;
    }

    .BetterProfile-checkbox:checked {
        padding: 5px;
    }

    .BetterProfile-checkbox:checked + .BetterProfile-slider {
        background-color: rgb(67, 181, 129);
    }
      
    .BetterProfile-checkbox:focus + .BetterProfile-slider {
        box-shadow: 0 0 1px rgb(67, 181, 129);
    }
      
    .BetterProfile-checkbox:checked + .BetterProfile-slider:before {
        -webkit-transform: translateX(26px);
        -ms-transform: translateX(26px);
        transform: translateX(26px);
    }
      

    .BetterProfile-slider.BetterProfile-round {
        border-radius: 34px;
    }
      
    .BetterProfile-slider.BetterProfile-round:before {
        border-radius: 50%;
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

const parseBadges = (data) => {
    return JSON.parse(data);
};
const createBadge = (name, img, imgClass) => {
    let div = document.createElement("div");
    div.setAttribute("aria-label", name);
    div.setAttribute("role", 'button');
    div.setAttribute("tabindex", "0");
    div.innerHTML = `<img alt=" " aria-hidden="true" src="${config.proxy}${urlencode(img)}" class="${imgClass}">`;
    return div
};
const replaceAllBadges = (mySettings) => {
    const db = DB();
    if (!db) return
    const localUID = getUID();
    let popouts = [
        ...document.querySelectorAll("*[class*='userPopoutInner-']"),
    ];
    for (let i = 0; i < popouts.length; i++) {
        let popout = popouts[i];
        const avatar = popout.querySelectorAll("*[class*='avatar-']")[0];
        let id = "";
        if (avatar.src.includes("get.php?id=")) id = avatar.src.split("get.php?id=")[1];
        else if (avatar.src.includes("/avatars/")) id = avatar.src.split("/avatars/")[1].split("/")[0];
        else if (avatar.dataset.original.includes("/avatars/")) id = avatar.dataset.original.split("/avatars/")[1].split("/")[0];
        else id = localUID;
        if (db.hasOwnProperty(id) && db[id].hasOwnProperty("avatar")&& db[id]["badges"] != "") {
            let badgesList = document.querySelectorAll("*[class*='profileBadges-']")[0];
            if (badgesList.dataset.BPpatched == "true") continue
            badgesList.dataset.BPpatched = "true";
            if (db.hasOwnProperty(id) && db[id].hasOwnProperty("hideOriginalBadges")&& db[id]["hideOriginalBadges"] == "true") {
                badgesList.innerHTML = "";
            } else if (mySettings.hideOriginalBadges.toString() == "true") {
                badgesList.innerHTML = "";
            }
            let parsed;
            if (id == localUID) parsed = parseBadges(mySettings.badges);
            else parsed = parseBadges(db[id]["badges"]);
            parsed.forEach(item => {
                badgesList.appendChild(createBadge(
                    item.name,
                    item.img,
                    "profileBadge22-3OAigE profileBadge-2YySEb desaturate-_Twf3u"
                ));
            });
        }
    }
};

let mySettings = {
    avatar: "",
    banner: "",
    badges: "",
    hideOriginalBadges: false,
    themePrimary: "",
    themeSecondary: "",
    themeBGC: "",
    themeOC: ""
};
function buildSetting(text, key, type, value, callback = () => {}) {
    const label = Object.assign(document.createElement("span"), {textContent: text, className: "BetterProfile-label"});
    let input = Object.assign(document.createElement("input"), {type: type, name: key, value: value});
    if (type == "checkbox" && value) input.checked = true;
    input.addEventListener("change", () => {
        const newValue = type == "checkbox" ? input.checked : input.value;
        mySettings[key] = newValue;
        BdApi.saveData(config.name, "settings", mySettings);
        callback(newValue);
    });
    if (type == "text") {
        input.className = "BetterProfile-input";
    } else {
        input.className = "BetterProfile-checkbox";
        const lb = document.createElement("label");
        lb.className = "BetterProfile-switch";
        const span = document.createElement("span");
        span.className = "BetterProfile-slider BetterProfile-round";
        lb.append(input);
        lb.append(span);
        input = lb;
    }
    const tr = document.createElement("tr");
    const th1 = document.createElement("th");
    const th2 = document.createElement("th");
    th1.append(label);
    th2.append(input);
    tr.append(th1);
    tr.append(th2);
    return tr;
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
const updateBadgesfromSettings = () => {
    updateItem(
        "badges",
        getUID(),
        mySettings.badges,
        "none"
    );
    updateItem(
        "hideOriginalBadges",
        getUID(),
        mySettings.hideOriginalBadges,
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
            replaceAllBadges(mySettings);
        };
    }
    start() {
        getUID();
        Object.assign(mySettings, BdApi.loadData(config.name, "settings"));
        updateDB();
        updateAvatarfromSettings();
        updateBannerfromSettings();
        updateThemefromSettings();
        updateBadgesfromSettings();
        addCustomCSS();
        window.addEventListener("DOMNodeInserted", this.mainListener);
        this.mainInterval = setInterval(function() {
            updateAvatarfromSettings();
            updateBannerfromSettings();
            updateThemefromSettings();
            updateBadgesfromSettings();
            updateDB();
        }, 1* 60 * 1000);
        this.UIDInterval = setInterval(function() {
            getUID();
        }, 500);
    }
    stop() {
        window.removeEventListener("DOMNodeInserted", this.mainListener);
        clearInterval(this.mainInterval);
        clearInterval(this.UIDInterval);
    }
    getSettingsPanel() {
        const mySettingsPanel = document.createElement("table");
        const options = [
            buildSetting("Avatar: ", "avatar", "text", mySettings.avatar, updateAvatarfromSettings),
            buildSetting("Banner: ", "banner", "text", mySettings.banner, updateBannerfromSettings),
            buildSetting("Badges: ", "badges", "text", mySettings.badges, updateBadgesfromSettings),
            buildSetting("T-Primary: ", "themePrimary", "text", mySettings.themePrimary, updateThemefromSettings),
            buildSetting("T-Secondary: ", "themeSecondary", "text", mySettings.themeSecondary, updateThemefromSettings),
            buildSetting("T-BG Color: ", "themeBGC", "text", mySettings.themeBGC, updateThemefromSettings),
            buildSetting("T-O Color: ", "themeOC", "text", mySettings.themeOC, updateThemefromSettings),
            buildSetting("Hide Original Badges: ", "hideOriginalBadges", "checkbox", mySettings.hideOriginalBadges, updateBadgesfromSettings),
        ];
        options.forEach((item, index) => {
            mySettingsPanel.append(item);
        });
        const div = document.createElement("div");
        div.id = "animatepfp-settings";
        div.appendChild(mySettingsPanel);
        return div;
    }
};
