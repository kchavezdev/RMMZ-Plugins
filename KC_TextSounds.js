/**
 * MIT License
 * 
 * Copyright (c) 2022 K. Chavez <kchavez.dev@gmail.com>
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
 * @plugindesc [v1.0]Play text sound effects based on face graphic.
 *
 * @help
 * KC_TextSounds.js
 * 
 * This plugin plays SEs as text is displayed in message boxes.
 * 
 * -----------------------------Plugin Parameters-----------------------------
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
 * | the text box.
 * 
 * \SEPIMIN[x]
 * | Change the min pitch of the text sound to x for the rest of the text box.
 * 
 * \SEPIMAX[x]
 * | Change the max pitch of the text sound to x for the rest of the text box.
 * 
 * \SEPRE[x]
 * | Load the parameters of the preset with the name x for the rest of the
 * | text box.
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

(($) => {

    class Text_Sound {
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

    $.Text_Sound = Text_Sound;

    // do basic setup when game launches
    (() => {

        const script = document.currentScript.src.split("/").pop().replace(/\.js$/, "");

        $.faceMap = new Map();
        $.presets = new Map();
        const /**@type {Map<string,Map<number,Text_Sound>} */ m = $.faceMap;
        const /**@type {Map<String,Text_Sound} */ presets = $.presets;

        const parameters = PluginManager.parameters(script);

        $.disableSwitchId = parseInt(parameters.disableSwitchId) || 0;

        /**
         * @typedef {Object} Text_Sound_Param
         * @property {string} se
         * @property {number} volume
         * @property {number} maxPitch
         * @property {number} minPitch
         * @property {number} pan
         * @property {number} frequency
         */

        /**
         * @param {Text_Sound_Param} param 
         * @returns {Text_Sound}
         */
        function convertTextSoundParam(param) {
            return new $.Text_Sound(param.se, parseInt(param.volume), parseInt(param.maxPitch), parseInt(param.minPitch), parseInt(param.pan), parseInt(param.frequency));
        }
        $.convertTextSoundParam = convertTextSoundParam;

        function parseNoError(jsonStr) {
            try {
                return JSON.parse(jsonStr);
            } catch (error) {
                return undefined;
            }
        }

        $.generalSound = convertTextSoundParam(parseNoError(parameters.generalSound));
        parseNoError(parameters.presetSounds).forEach(preset => {
            preset = parseNoError(preset);
            presets.set(preset.name, convertTextSoundParam(parseNoError(preset.textSound)));
        });

        // handle face specific configs
        const /**@type {[]} */ faceConfigs = parseNoError(parameters.faceSetup);

        /**
         * @param {string} faceName Name of the face file
         * @param {number[]} indexes Index this sound should be associated with
         * @param {Text_Sound} textSe Actual sound effect info
         */
        function addConfig(faceName, textSe, ...indexes) {
            if (!m.has(faceName))
                m.set(faceName, new Map());
            const entry = m.get(faceName);
            indexes.forEach(index => entry.set(index, textSe));
        }
        $.addConfig = addConfig;

        /**
         * @param {string} faceName 
         * @param {Text_Sound} textSe 
         * @param {Bitmap} bitmap 
         */
        function addConfigToEveryIndex(faceName, textSe, bitmap) {
            const h = Math.floor(bitmap.height / ImageManager.faceHeight);
            const w = Math.floor(bitmap.width / ImageManager.faceWidth);
            const total = h * w;
            const indexes = [];
            for (let i = 0; i < total; i++) {
                indexes.push(i);
            }
            addConfig(faceName, textSe, ...indexes);
        }
        $.addConfigToEveryIndex = addConfigToEveryIndex;

        faceConfigs.forEach(configParam => {
            const config = parseNoError(configParam);
            const /**@type {string} */ face = config.face;
            const indexesParam = parseNoError(config.indexes);
            const /**@type {number[]} */ indexes = Array.isArray(indexesParam) ? indexesParam : [];
            let /**@type {Text_Sound_Param} */ soundInfo;
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
        });
    })();

    $.Game_Message_initialize = Game_Message.prototype.initialize;
    Game_Message.prototype.initialize = function () {
        $.Game_Message_initialize.apply(this, arguments);
        this._textSe = new $.Text_Sound();
        this._textSeCounter = 0;
    };

    $.Game_Message_clear = Game_Message.prototype.clear;
    Game_Message.prototype.clear = function () {
        $.Game_Message_clear.apply(this, arguments);
        this._textSe = new $.Text_Sound();
    }

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

    $.getMessageSe = function (faceName, faceIndex) {
        const /**@type {Map<string,Map<number,Text_Sound>} */ m = $.faceMap;
        const indexes = m.get(faceName);
        const sound = (indexes && indexes.get(faceIndex)) || $.generalSound;
        return sound.clone(); // we clone the sound info in case text code overrides are used
    };

    $.useMessageSe = function() {
        return !($.disableSwitchId > 0 && $gameSwitches.value($.disableSwitchId));
    }

    Game_Message.prototype.setupTextSe = function () {
        this._textSe = ($.useMessageSe()) ? $.getMessageSe(this.faceName(), this.faceIndex()) : new $.Text_Sound();
        this.resetTextSeCounter();
    }

    $.Game_Message_setFaceImage = Game_Message.prototype.setFaceImage;
    Game_Message.prototype.setFaceImage = function (faceName, faceIndex) {
        $.Game_Message_setFaceImage.apply(this, arguments);
        this.setupTextSe();
    };

    $.Window_Message_processCharacter = Window_Message.prototype.processCharacter;
    Window_Message.prototype.processCharacter = function (textState) {
        const c = textState.text[textState.index];
        if (c.charCodeAt(0) >= 0x20) {
            if (c.match(/\S/g)) {
                const /**@type {Text_Sound} */ se = $gameMessage.textSe();
                if ($gameMessage.textSeCounter() >= se.frequency) {
                    if (se.frequency > 0) AudioManager.playSe(se);
                    $gameMessage.resetTextSeCounter();
                }
            }
            $gameMessage.incrementTextSeCounter();
        }
        $.Window_Message_processCharacter.apply(this, arguments);
    };

    $.obtainEscapeParamString = function(textState) {
        const regExp = /^\[.*?\]/;
        const arr = regExp.exec(textState.text.slice(textState.index));
        if (arr) {
            textState.index += arr[0].length;
            return arr[0].slice(1, arr[0].length - 1);
        } else {
            return "";
        }
    };

    $.Window_Message_processEscapeCharacter = Window_Message.prototype.processEscapeCharacter;
    Window_Message.prototype.processEscapeCharacter = function (code, textState) {
        $.Window_Message_processEscapeCharacter.apply(this, arguments);
        switch (code) {
            case "SEN":
                $gameMessage.textSe().name = $.obtainEscapeParamString(textState);
                break;
            case "SEF":
                $gameMessage.textSe().frequency = this.obtainEscapeParam(textState);
                break;
            case "SEPA":
                $gameMessage.textSe().pan = parseInt($.obtainEscapeParamString(textState));
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
                const pitchParams = $.obtainEscapeParamString(textState).split(',');
                const min = parseInt(pitchParams[0]);
                const max = parseInt(pitchParams[1]);
                $gameMessage.textSe().minPitch = min;
                $gameMessage.textSe().maxPitch = max;
                break;
            case "SEPRE":
                const /**@type {Text_Sound} */ preset = $.presets.get($.obtainEscapeParamString(textState));
                if (preset) {
                    $gameMessage._textSe = preset.clone();
                }
                break;
        }
    };

})(KCDev.TextSounds);
