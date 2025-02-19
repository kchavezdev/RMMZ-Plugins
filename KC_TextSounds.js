/**
 * MIT License
 * 
 * Copyright (c) 2022-2025 K. Chavez <kchavez.dev@gmail.com>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*:
 * @author K. Chavez 
 * @url https://github.com/kchavezdev/RMMZ-Plugins
 * @target MZ MV
 *
 * @plugindesc [v1.1.1]Play text sound effects based on face graphic.
 *
 * @help
 * KC_TextSounds.js
 * 
 * This plugin plays SEs as text is displayed in message boxes.
 * 
 * Known Compatibility Issues:
 *   - Message Log VisuStella MZ
 *     + Issue:
 *         | KC_TextSounds text code parameters remain in the message log
 *     + Known Fixes:
 *         | None
 * 
 * 
 * 
 * -----------------------------Plugin Parameters------------------------------
 * 
 * The most basic structure of this plugin is an object that holds the SE's 
 * name, volume, minimum pitch, maximum pitch, pan, and frequency. Name,
 * volume, pan, and pitch hold the same meaning as they do when you use the
 * 'Play SE' command.
 * 
 * The pitch is split into max and min to allow for some random variation when
 * the sound is played; the plugin will choose a random pitch between the max
 * and min to play; if you want the same pitch to play each time, just set max 
 * and min equal to each other. 
 * 
 * The frequency just refers to how many letters are awaited between each play 
 * of the SE. A frequency of one plays every letter; a frequency of two plays
 * every other letter; a frequency of three plays every third letter. And so
 * on as the frequency increases.
 * 
 * In general, this plugin associates text sounds with faces. However, if
 * there is no face, the SE defined in the General Sound parameter is used
 * instead. If you would not like an SE to play in this case, then leave the
 * parameter blank or with no sound name defined.
 * 
 * The next parameter is the Preset Sound Effects. This allows you to associate
 * SEs with a certain name that can be easily re-used across many faces. For
 * example, this could be used to give men and women distinct pitch differences
 * without needing to separately define SEs for every single face file.
 * 
 * The last parameter, 'Face Config,' does the actual association of sounds
 * to faces. Within, selecting a face name should be fairly self-explanatory.
 * Indexes tell the plugin which particular indexes to apply the sound to in
 * this file; to apply the text sound to all of the faces in the file, leave 
 * it blank. This allows different sounds to be associated within the same face
 * file; this is useful if your face file comes with many characters, such as
 * those in the RTP.
 * 
 * The next things to worry in a face config about are mutually exclusive; if
 * a preset is used, then the next parameter is ignored; otherwise, a text
 * sound is built using the previously mentioned parameters (name, pitch, etc.)
 * 
 * ---------------------------------Text Codes---------------------------------
 * 
 * This plugin also allows text codes to be used in message boxes to change
 * aspects of each text sound temporarily and on the fly. Say your character is
 * speaking slower and you would like the text sound to play at a more frequent
 * interval, for example, then all you would need to do is use \sef[1] to have
 * a sound play for every non-space character printed. These changes are only
 * for that particular text box, so don't worry about having to reset sound
 * names, volumes, or anything else after using one of these codes!
 * 
 * The full list of usable codes is as follows.
 * 
 * \SEN[x]
 * | Use the SE with the name x for the rest of this text box.
 * 
 * \SEF[x]
 * | Change the frequency of the text sound to x for the rest of the text box.
 * 
 * \SEV[x]
 * | Change the volume of the text sound to x for the rest of the text box.
 * 
 * \SEPA[x]
 * | Change the pan of the text sound to x for the rest of the text box.
 * 
 * \SEPI[x,y]
 * | Change the minimum pitch to x and the maximum pitch to y for the rest of
 *   the text box.
 * 
 * \SEPIMIN[x]
 * | Change the min pitch of the text sound to x for the rest of the text box.
 * 
 * \SEPIMAX[x]
 * | Change the max pitch of the text sound to x for the rest of the text box.
 * 
 * \SEPRE[x]
 * | Load the parameters of the preset with the name x for the rest of the
 *   text box.
 * 
 * \SEPLAY[x]
 * | Play the se defined in the preset name x. Leave x blank to play the
 *   currently loaded text SE. Keep the brackets, however.
 *
 * @param generalSound
 * @text General Sound
 * @desc This sound plays when no face is displayed.
 * @type struct<TextSound>
 * 
 * @param presetSounds
 * @text Preset Sound Effects
 * @desc Presets that you can easily call and use
 * @type struct<PresetSound>[]
 * @default []
 * 
 * @param faceSetup
 * @text Face Config
 * @desc Set up face-based text blips.
 * @type struct<FaceSound>[]
 * @default []
 * 
 * @param disableSwitchId
 * @text Disable Text Sound Switch
 * @desc When this game switch is ON, all text sounds are disabled. This feature is optional.
 * @type switch
 * @default 0
 * 
 * @param useOldFreqBehavior
 * @text Don't Play on 1st Letter
 * @desc Enabling this will use the pre-v1.1.0 behavior where the text SE would not play on the first character.
 * @type boolean
 * @default false
 * 
 */
/*~struct~PresetSound:
 * 
 * @param name
 * @text Preset Name
 * @desc The name of the preset.
 * @type string
 * 
 * @param textSound
 * @text Text SE
 * @desc The parameters of the sound that will be played.
 * @type struct<TextSound>
 */
/*~struct~FaceSound:
 * 
 * @param face
 * @text Face Name
 * @desc Name of the face this sound is associated with.
 * @type file
 * @dir img/faces/
 * 
 * @param indexes
 * @text Indexes
 * @desc Which face indexes should this sound apply to? Leave blank to apply to all.
 * @type text[]
 * @default []
 * 
 * @param preset
 * @text Preset Name
 * @desc Use one of the presets you configured by putting its name here.
 * 
 * @param textSound
 * @text Sound Info
 * @desc The sound that will be played. This parameter is ignored if a preset is used.
 * @type struct<TextSound>
 *
 */
/*~struct~TextSound:
 *
 * @param se
 * @text Sound Name
 * @desc Name of the sound to play when this face appears.
 * @type file
 * @dir audio/se/
 * 
 * @param volume
 * @text Volume
 * @desc The volume at which to play this SE.
 * @type number
 * @min 0
 * @max 100
 * @default 90
 * 
 * @param minPitch
 * @text Minimum Pitch
 * @desc The lowest pitch this sound will randomly play at.
 * @type number
 * @min 50
 * @max 150
 * @default 100
 * 
 * @param maxPitch
 * @text Maximum Pitch
 * @desc The highest pitch this sound will randomly play at.
 * @type number
 * @min 50
 * @max 150
 * @default 100
 * 
 * @param pan
 * @text Pan
 * @desc The pan that will be applied to this sound.
 * @type number
 * @max 100
 * @min -100
 * @default 0
 * 
 * @param frequency
 * @text Frequency
 * @desc Sound will be played every time this many letters are printed.
 * @type number
 * @default 0
 * @min 0
 * 
 */

var KCDev = KCDev || {};

KCDev.TextSounds = {};

KCDev.TextSounds.Text_Sound = class Text_Sound {

    constructor(name = '', volume = 90, maxPitch = 100, minPitch = 100, pan = 0, frequency = 0) {
        // declare private variables here and note types via jsdoc
        /**@private @type {string} */ this._seName;
        /**@private @type {number} */ this._volume;
        /**@private @type {number} */ this._maxPitch;
        /**@private @type {number} */ this._minPitch;
        /**@private @type {number} */ this._pan;
        /**@private @type {number} */ this._freq;

        // handle setting values here to allow proper clamping for numbers
        this.name = name;
        this.volume = volume;
        this.maxPitch = maxPitch;
        this.minPitch = minPitch;
        this.pan = pan;
        this.frequency = frequency;
    }

    get name() {
        return this._seName;
    }

    set name(name) {
        this._seName = name;
    }

    get volume() {
        return this._volume;
    }

    set volume(volume) {
        this._volume = volume.clamp(0, 100);
    }

    get maxPitch() {
        return this._maxPitch;
    }

    set maxPitch(pitch) {
        this._maxPitch = pitch.clamp(50, 150);
    }

    get minPitch() {
        return this._minPitch;
    }

    set minPitch(pitch) {
        this._minPitch = pitch.clamp(50, 150);
    }

    get pan() {
        return this._pan;
    }

    set pan(pan) {
        this._pan = pan.clamp(-100, 100);
    }

    get frequency() {
        return this._freq;
    }

    set frequency(frequency) {
        this._freq = frequency.clamp(0, Infinity);
    }

    get pitch() {
        return Math.floor(Math.random() * (this.maxPitch - this.minPitch) + this.minPitch);
    }

    clone() {
        return new Text_Sound(this.name, this.volume, this.maxPitch, this.minPitch, this.pan, this.frequency);
    }

};

/**
 * @typedef {Object} KCDev.TextSounds.Text_Sound_Param
 * @property {string} se
 * @property {number} volume
 * @property {number} maxPitch
 * @property {number} minPitch
 * @property {number} pan
 * @property {number} frequency
 */

/**
 * @param {KCDev.TextSounds.Text_Sound_Param} param 
 */
KCDev.TextSounds.convertTextSoundParam = function (param) {
    return new KCDev.TextSounds.Text_Sound(param.se, parseInt(param.volume), parseInt(param.maxPitch), parseInt(param.minPitch), parseInt(param.pan), parseInt(param.frequency));
};

/**
 * @param {string} faceName Name of the face file
 * @param {number[]} indexes Index this sound should be associated with
 * @param {KCDev.TextSounds.Text_Sound} textSe Actual sound effect info
 */
KCDev.TextSounds.addConfig = function (faceName, textSe, ...indexes) {
    const m = KCDev.TextSounds.faceMap;
    if (!m.has(faceName))
        m.set(faceName, new Map());
    const entry = m.get(faceName);
    indexes.forEach(index => entry.set(index, textSe));
};

/**
 * @param {string} faceName 
 * @param {KCDev.TextSounds.Text_Sound} textSe 
 * @param {Bitmap} bitmap 
 */
KCDev.TextSounds.addConfigToEveryIndex = function (faceName, textSe, bitmap) {
    const h = Math.floor(bitmap.height / ImageManager.faceHeight);
    const w = Math.floor(bitmap.width / ImageManager.faceWidth);
    const total = h * w;
    const indexes = [];
    for (let i = 0; i < total; i++) {
        indexes.push(i);
    }
    KCDev.TextSounds.addConfig(faceName, textSe, ...indexes);
};

KCDev.TextSounds.disableSwitchId = 0;
/**@type {Map<string, Map<number, KCDev.TextSounds.Text_Sound>>} */ KCDev.TextSounds.faceMap = new Map();
/**@type {Map<string, KCDev.TextSounds.Text_Sound>} */ KCDev.TextSounds.presets = new Map();
KCDev.TextSounds.generalSound = new KCDev.TextSounds.Text_Sound();

KCDev.TextSounds.useNewFreqBehavior = true;

/** @type {any[]} */
KCDev.TextSounds.faceConfigs;

KCDev.TextSounds.parseNoError = function (jsonStr) {
    try {
        return JSON.parse(jsonStr);
    } catch (error) {
        return undefined;
    }
};

// handle plugin parameters
(() => {

    const script = document.currentScript.src.split("/").pop().replace(/\.js$/, "");

    const presets = KCDev.TextSounds.presets;

    const parameters = PluginManager.parameters(script);

    KCDev.TextSounds.disableSwitchId = parseInt(parameters.disableSwitchId) || 0;

    const convertTextSoundParam = KCDev.TextSounds.convertTextSoundParam;

    const parseNoError = KCDev.TextSounds.parseNoError;

    KCDev.TextSounds.generalSound = convertTextSoundParam(parseNoError(parameters.generalSound));

    parseNoError(parameters.presetSounds).forEach(preset => {
        preset = parseNoError(preset);
        presets.set(preset.name, convertTextSoundParam(parseNoError(preset.textSound)));
    });

    // handle face specific configs
    KCDev.TextSounds.faceConfigs = parseNoError(parameters.faceSetup) || [];

    KCDev.TextSounds.useNewFreqBehavior = parameters.useOldFreqBehavior !== 'true';
})();

KCDev.TextSounds.addConfigs = function () {
    const presets = KCDev.TextSounds.presets;

    const parseNoError = KCDev.TextSounds.parseNoError;

    const addConfig = KCDev.TextSounds.addConfig;

    const addConfigToEveryIndex = KCDev.TextSounds.addConfigToEveryIndex;

    const /**@type {[]} */ faceConfigs = KCDev.TextSounds.faceConfigs;

    for (const configParam of faceConfigs) {
        const config = parseNoError(configParam);
        const /**@type {string} */ face = config.face;
        const indexesParam = parseNoError(config.indexes);
        const /**@type {number[]} */ indexes = Array.isArray(indexesParam) ? indexesParam : [];
        let /**@type {KCDev.TextSounds.Text_Sound_Param} */ soundInfo;
        try {
            soundInfo = parseNoError(config.textSound);
        } catch (error) {

        }
        const preset = presets.get(config.preset);
        const textSound = preset || convertTextSoundParam(soundInfo);
        if (indexes.length < 1) {
            ImageManager.loadFace(face).addLoadListener(bitmap => {
                addConfigToEveryIndex(face, textSound, bitmap);
            });
        }
        else {
            // add as load listener to ensure that preset is loaded first
            ImageManager.loadFace(face).addLoadListener(() => addConfig(face, textSound, ...indexes.map(value => parseInt(value))));
        }
    }
};

KCDev.TextSounds.Scene_Boot_onDatabaseLoaded = Scene_Boot.prototype.onDatabaseLoaded;
Scene_Boot.prototype.onDatabaseLoaded = function () {
    KCDev.TextSounds.Scene_Boot_onDatabaseLoaded.apply(this, arguments);
    KCDev.TextSounds.addConfigs();
};

KCDev.TextSounds.Game_Message_initialize = Game_Message.prototype.initialize;
Game_Message.prototype.initialize = function () {
    KCDev.TextSounds.Game_Message_initialize.apply(this, arguments);
    this._textSe = new KCDev.TextSounds.Text_Sound();
    this.resetTextSeCounter();
};

KCDev.TextSounds.Game_Message_clear = Game_Message.prototype.clear;
Game_Message.prototype.clear = function () {
    KCDev.TextSounds.Game_Message_clear.apply(this, arguments);
    this._textSe = new KCDev.TextSounds.Text_Sound();
};

Game_Message.prototype.textSe = function () {
    return this._textSe;
};

Game_Message.prototype.resetTextSeCounter = function () {
    this._textSeCounter = 0;
};

Game_Message.prototype.textSeCounter = function () {
    return this._textSeCounter;
};

Game_Message.prototype.incrementTextSeCounter = function () {
    this._textSeCounter++;
};

KCDev.TextSounds.getMessageSe = function (faceName, faceIndex) {
    const indexes = KCDev.TextSounds.faceMap.get(faceName);
    const sound = (indexes && indexes.get(faceIndex)) || KCDev.TextSounds.generalSound;
    return sound.clone(); // we clone the sound info in case text code overrides are used
};

KCDev.TextSounds.useMessageSe = function () {
    return !(KCDev.TextSounds.disableSwitchId > 0 && $gameSwitches.value(KCDev.TextSounds.disableSwitchId));
};

Game_Message.prototype.setupTextSe = function () {
    this._textSe = (KCDev.TextSounds.useMessageSe()) ? KCDev.TextSounds.getMessageSe(this.faceName(), this.faceIndex()) : new KCDev.TextSounds.Text_Sound();
    if (KCDev.TextSounds.useNewFreqBehavior) this._textSeCounter = this.textSe().frequency;
};

KCDev.TextSounds.Game_Message_setFaceImage = Game_Message.prototype.setFaceImage;
Game_Message.prototype.setFaceImage = function (faceName, faceIndex) {
    KCDev.TextSounds.Game_Message_setFaceImage.apply(this, arguments);
    this.setupTextSe();
};

Window_Message.prototype.processCharacterSe = function (textState) {
    const /**@type {string} */ c = textState.text[textState.index];
    if (c.charCodeAt(0) >= 0x20) {
        $gameMessage.incrementTextSeCounter();
        if (c.match(/\S/g)) {
            const /**@type {KCDev.TextSounds.Text_Sound} */ se = $gameMessage.textSe();
            if ($gameMessage.textSeCounter() >= se.frequency) {
                if (se.frequency > 0) AudioManager.playSe(se);
                $gameMessage.resetTextSeCounter();
            }
        }
    }
};

KCDev.TextSounds.Window_Message_processCharacter = Window_Message.prototype.processCharacter;
Window_Message.prototype.processCharacter = function (textState) {
    this.processCharacterSe(textState);
    KCDev.TextSounds.Window_Message_processCharacter.apply(this, arguments);
};

KCDev.TextSounds.obtainEscapeParamString = function (textState) {
    const regExp = /^\[.*?\]/;
    const arr = regExp.exec(textState.text.slice(textState.index));
    if (arr) {
        textState.index += arr[0].length;
        return arr[0].slice(1, arr[0].length - 1);
    } else {
        return "";
    }
};

KCDev.TextSounds.Window_Message_processEscapeCharacter = Window_Message.prototype.processEscapeCharacter;
Window_Message.prototype.processEscapeCharacter = function (code, textState) {
    KCDev.TextSounds.Window_Message_processEscapeCharacter.apply(this, arguments);
    switch (code) {
        case "SEN":
            $gameMessage.textSe().name = KCDev.TextSounds.obtainEscapeParamString(textState);
            break;

        case "SEF":
            const /**@type {KCDev.TextSounds.Text_Sound} */ sef = $gameMessage.textSe();
            sef.frequency = this.obtainEscapeParam(textState);
            if (KCDev.TextSounds.useNewFreqBehavior) $gameMessage._textSeCounter = sef.frequency;
            break;
            
        case "SEPA":
            $gameMessage.textSe().pan = parseInt(KCDev.TextSounds.obtainEscapeParamString(textState));
            break;

        case "SEV":
            $gameMessage.textSe().volume = this.obtainEscapeParam(textState);
            break;

        case "SEPIMAX":
            $gameMessage.textSe().maxPitch = this.obtainEscapeParam(textState);
            break;

        case "SEPIMIN":
            $gameMessage.textSe().minPitch = this.obtainEscapeParam(textState);
            break;

        case "SEPI":
            const pitchParams = KCDev.TextSounds.obtainEscapeParamString(textState).split(',');
            const min = parseInt(pitchParams[0]);
            const max = parseInt(pitchParams[1]);
            $gameMessage.textSe().minPitch = min;
            $gameMessage.textSe().maxPitch = max;
            break;

        case "SEPRE":
            const preset = KCDev.TextSounds.presets.get(KCDev.TextSounds.obtainEscapeParamString(textState));
            if (preset) {
                $gameMessage._textSe = preset.clone();
            }
            break;

        case "SEPLAY":
            AudioManager.playSe(KCDev.TextSounds.presets.get(KCDev.TextSounds.obtainEscapeParamString(textState)) || $gameMessage.textSe())
            $gameMessage.resetTextSeCounter();
            break;
            
        default:
            break;
    }
};
