/**
 * MIT License
 * 
 * Copyright (c) 2023 K. Chavez <kchavez.dev@gmail.com>
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
 * @target MZ
 *
 * @plugindesc [v1.0] Adds a toggle fullscreen option to the options menu.
 * 
 * @param applyOnBoot
 * @text Apply On Boot
 * @desc Enable this if you want the saved full screen configuration to be applied when the game is booted up.
 * @type boolean
 * @default true
 * 
 * @param addOptionToMenu
 * @text Add To Options
 * @desc This controls whether this plugin will attempt to add an option to the vanilla options menu.
 * @type bool
 * @default true
 * 
 * @param optionsMenuText
 * @parent addOptionToMenu
 * @text Option Name
 * @desc Enter the name that will appear in the options menu.
 * @type text
 * @default FullScreen
 * 
 * @param defaultSetting
 * @text Default Setting
 * @desc This will set the initial fullscreen value (i.e. the player hasn't changed any options yet).
 * @type boolean
 * @default false
 *
 * @help
 * KC_SimpleFullScreen.js
 * 
 * Changelog:
 *   v1.0.0 - 2023.04.28
 *     - Initial release
 * 
 * This plugin aims to simplify the process of adding a "full screen" option
 * to your game by saving when the window is full screened (or not) and
 * applying that saved value on game boot up.
 * 
 * Because all players might not know about the Full Screen hotkey (F4), this
 * plugin can also integrate itself with the built in options menu. If you
 * are using a custom menu, 'isFullScreenEnabled' is the option's key.
 * 
 * This plugin will automatically disable itself if the game is being played
 * on a mobile device or via browser. 
 *   
*/

'use strict';

// only enable this plugin if NW.js player is being used (i.e. no browser or mobile)
if (Utils.isNwjs()) {
    var KCDev = KCDev || {};
    KCDev.SimpleFullScreen = {};

    {
        /**@type {{applyOnBoot?: string, addOptionToMenu?: string, optionsMenuText?: string, defaultSetting: string}} */
        const pluginParams = PluginManager.parameters(document.currentScript.src.split("/").pop().replace(/\.js$/, ""));

        KCDev.SimpleFullScreen.isAppliedOnBoot = pluginParams.applyOnBoot === 'true';
        KCDev.SimpleFullScreen.isAddedToOpts = pluginParams.addOptionToMenu === 'true';
        KCDev.SimpleFullScreen.optName = pluginParams.optionsMenuText || 'FullScreen';


        ConfigManager._isFullScreenEnabled = pluginParams.defaultSetting === 'true' && KCDev.SimpleFullScreen.isAppliedOnBoot;
    }

    Object.defineProperty(ConfigManager, 'isFullScreenEnabled', {
        get() {
            return this._isFullScreenEnabled;
        },
        set(bool) {
            if (bool) {
                if (!Graphics._isFullScreen()) {
                    Graphics._requestFullScreen();
                }
            }
            else {
                if (Graphics._isFullScreen()) {
                    Graphics._cancelFullScreen()
                }
            }
        }
    });

    // handle setting option to ON or OFF if a full screen change is triggered in the options menu (e.g. by pushing F4)
    KCDev.SimpleFullScreen.handleFullScreenChange = function () {
        if (!(SceneManager._scene instanceof Scene_Options)) {
            if (KCDev.SimpleFullScreen.isAppliedOnBoot) {
                ConfigManager.save();
            }
        }
        else if (KCDev.SimpleFullScreen.optionsWindowReference) {
            const index = KCDev.SimpleFullScreen.optionsWindowReference.findSymbol('isFullScreenEnabled');
            if (index >= 0) {
                KCDev.SimpleFullScreen.optionsWindowReference._list[index].enabled = ConfigManager.isFullScreenEnabled;
                KCDev.SimpleFullScreen.optionsWindowReference.refresh();
            }
        }
    };

    KCDev.SimpleFullScreen.Graphics__requestFullScreen = Graphics._requestFullScreen;
    Graphics._requestFullScreen = function () {
        KCDev.SimpleFullScreen.Graphics__requestFullScreen.apply(this, arguments);
        ConfigManager._isFullScreenEnabled = true;
        KCDev.SimpleFullScreen.handleFullScreenChange()
    };

    KCDev.SimpleFullScreen.Graphics__cancelFullScreen = Graphics._cancelFullScreen;
    Graphics._cancelFullScreen = function () {
        KCDev.SimpleFullScreen.Graphics__cancelFullScreen.apply(this, arguments);
        ConfigManager._isFullScreenEnabled = false;
        KCDev.SimpleFullScreen.handleFullScreenChange()
    };

    // no need to bother saving settings if they're not gonna be applied on boot
    if (KCDev.SimpleFullScreen.isAppliedOnBoot) {
        KCDev.SimpleFullScreen.Scene_Boot_start = Scene_Boot.prototype.start;
        Scene_Boot.prototype.start = function () {
            KCDev.SimpleFullScreen.Scene_Boot_start.apply(this, arguments);
            // this triggers the full screen 
            ConfigManager.isFullScreenEnabled = ConfigManager.isFullScreenEnabled;
        };

        KCDev.SimpleFullScreen.ConfigManager_makeData = ConfigManager.makeData;
        ConfigManager.makeData = function () {
            const config = KCDev.SimpleFullScreen.ConfigManager_makeData.apply(this, arguments);
            config.isFullScreenEnabled = this._isFullScreenEnabled;
            return config;
        };

        KCDev.SimpleFullScreen.ConfigManager_applyData = ConfigManager.applyData;
        ConfigManager.applyData = function (config) {
            KCDev.SimpleFullScreen.ConfigManager_applyData.apply(this, arguments);
            this._isFullScreenEnabled = this.readFlag(config, 'isFullScreenEnabled', Graphics._isFullScreen());
        };
    }

    if (KCDev.SimpleFullScreen.isAddedToOpts) {
        /**@type {undefined | Window_Options} */ KCDev.SimpleFullScreen.optionsWindowReference = undefined;

        KCDev.SimpleFullScreen.Scene_Options_maxCommands = Scene_Options.prototype.maxCommands;
        Scene_Options.prototype.maxCommands = function () {
            return KCDev.SimpleFullScreen.Scene_Options_maxCommands.apply(this, arguments) + 1;
        };

        KCDev.SimpleFullScreen.Window_Options_addGeneralOptions = Window_Options.prototype.addGeneralOptions;
        Window_Options.prototype.addGeneralOptions = function () {
            KCDev.SimpleFullScreen.Window_Options_addGeneralOptions.apply(this, arguments);
            this.addCommand(KCDev.SimpleFullScreen.optName, 'isFullScreenEnabled');
        };

        KCDev.SimpleFullScreen.Window_Options_initialize = Window_Options.prototype.initialize;
        Window_Options.prototype.initialize = function () {
            KCDev.SimpleFullScreen.Window_Options_initialize.apply(this, arguments);
            KCDev.SimpleFullScreen.optionsWindowReference = this;
        };

        KCDev.SimpleFullScreen.Window_Options_destroy = Window_Options.prototype.destroy;
        Window_Options.prototype.destroy = function () {
            KCDev.SimpleFullScreen.Window_Options_destroy.apply(this, arguments);
            KCDev.SimpleFullScreen.optionsWindowReference = undefined;
        };
    }
}
else {
    console.log('KC_SimpleFullScreen: Game is not being played on NW.js platform! Disabling all plugin functionality...');
}
