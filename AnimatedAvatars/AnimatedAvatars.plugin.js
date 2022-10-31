/**
 * @name AnimatedAvatars
 * @version 1.0.0
 * @description Do you want animated avatar but you dont want to buy intro? If yea, I got you covered, with this plugin you can replace avatar with gif or anything, and other people with this plugin can see it.
 * @author Fate#5785
 */


const api = "https://PFPDB.parrotdevelopers.repl.co";

var db =  "";

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
        BdApi.saveData("AnimatedPFP", "settings", mySettings);
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

const addCustomCSS = () => {
    BdApi.injectCSS("AnimatedPFP", `
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
    if (!db) return
    let imgs = document.getElementsByTagName("img");

    // All places that use background-image: url();
    let userAvatars = [
        //...document.getElementsByClassName("userAvatar-3Hwf1F"),
        //...document.getElementsByClassName("imageUploaderInner-IIRaFr")
        ...document.querySelectorAll("*[class*='userAvatar-']"),
        ...document.querySelectorAll("*[class*='imageUploaderInner-']")
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
        atob(getToken().split(".")[0]), // Fun fact, if you split token by ".", first part is base64 encoded user ID
        mySettings.pfpurl,
        "none" // Fuck verification.
    )
}

const downloadDB = () => {
    console.log("Updating Database");
    require("request").get(`${api}/db.php`, (e, r, b) => {
        db = b
    });
}

module.exports = class AnimatedPFP {
    constructor(meta) {
        Object.assign(mySettings, BdApi.loadData("AnimatedPFP", "settings"));
        downloadDB();
        updatePFPfromSettings();
        addCustomCSS();

        // DOMNodeInserted is deprecated but it still works on discord
        window.addEventListener("DOMNodeInserted", (event) => { 
            replaceAllAvatars();
            //replaceUsernameColors(); // Still working on this
        });

        setInterval(function() {
            downloadDB();
        }, 1* 60 * 1000); // 1 minute
    }

    // Not required for this project
    start() {} // it was simpler to put shit into constructor
    stop() {}
    
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

