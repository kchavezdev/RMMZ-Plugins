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
 * @target MZ
 * @base PluginCommonBase
 *
 * @plugindesc [v0.1]Allow certain events to be skipped.
 *
 * @help
 * KC_SkipEvent.js
 * 
 * ----------------------------------------------------------------------------
 * 
 * Changelog:
 *     v1.0.0 - TBA
 *       - Initial release
 * 
 * ----------------------------------------------------------------------------
 * 
 * This plugin allows the developer to set up skippable events. This is done by
 * interrupting an event while it is running and skipping to a label defined in
 * the plugin command that sets up the skip's properties. Optionally, the
 * screen can be faded out right before the skip begins and, also optionally,
 * faded back in when the skip ends. Additionally, this plugin can place a skip
 * button that when clicked or touched will skip the scene.
 * 
 * This plugin does NOT automatically run through the skipped commands since
 * certain commands, particularly move routes, can get quite complex when
 * trying to account for all cases. As a result, this plugin is NOT simply plug
 * 'n play; it is on the developer to correctly set up switches, variables, 
 * event positions, etc. after a skip. This plugin does provide some tools to
 * aid in this process, however.
 * 
 * This plugin is NOT compatible with parallel process events.
 * 
 * ----------------------------------------------------------------------------
 * 
 * Plugin Parameters:
 *   | Default Skip Settings
 *     - These are the default parameters for each skip and will be used if
 *       said parameters are not manually overriden in the plugin command.
 *     * Activation Button
 *       : This is the button that is will be held to initiate a skip. The
 *         names are based on the internal button MZ uses in its static input
 *         class. To see what these internal names map to by default on
 *         keyboard and gamepad, you can reference the strings in the
 *         Input.keyMapper and Input.gamepadMapper objects, respectively,
 *         in rmmz_core.js.
 *           ; For compatibility, default strings defined by KC_SkipEvent only
 *             reference strings that are used on both keyboard and gamepad,
 *             but any string defined in keyMapper and/or gamepadMapper should
 *             work.
 *       * Frame Count
 *         : This is the number of frames that must pass before the event is
 *           skipped. For reference, 60 frames is equivalent to 1 second.
 *       * Auto Fade Out
 *         : Enabling this will cause the screen to fade to black before the
 *           skip starts. This is an option to let the developer move events,
 *           the player, etc. around after a skip.
 *       * Auto Fade In
 *         : Enabling this will fade the screen back in after the skip is over
 *           without the developer needing to explicitly call the Fadein Screen
 *           comand in the editor.
 *       * Common Event Inherit
 *         : Enabling this will allow the skip's parameters to be passed into
 *           any common events called while this skip is active. This feature
 *           is experimental, so use at your own risk.
 * 
 *   | Use Skip Touch UI Button
 *     - Enabling this displays a button that can be touched/clicked in the
 *       touch UI button area. Alternatively, this button can be set to only
 *       display if the touch UI is enabled in the settings. This button has
 *       to be held down for the same amount of time as the keyboard or
 *       gamepad button to skip a cutscene.
 *     - To use this button, a graphic in the system folder must be selected.
 *       The top half of the graphic will be used if the button is not
 *       pressed, and the bottom graphic will be used while the button is held
 *       down.
 *     - Regardless of what this option is, the skip button will also only be
 *       displayed if the currently-execuiting event is able to be skipped.
 *     - This button is displayed on the same line as other touch UI buttons
 *       by default.
 *     
 *   | Use Skip Progress Bar
 *     - Enabling this will cause the game to display a progress bar and some
 *       text to show the player how much longer the skip button has to be
 *       pressed to initiate a cutscene skip. The position and colors of this
 *       visual indicator are left for the developer to customize as they see
 *       fit.
 * 
 * ----------------------------------------------------------------------------
 * 
 * Plugin Commands:
 *   | Enable Event Skip
 *     - This command is the one that allows the event to be skipped. To set
 *       up a skip, a label name must be provided. If the label does not
 *       exist, the skip setup process will be aborted, and an error will be
 *       printed in the developer console.
 *     - If no overrides are set, the parameters in the plugin commands will
 *       be used. Otherwise, each parameter can be overriden and will be
 *       active for this skip only. Any skips set up after this one will NOT
 *       inherit these overrides.
 *     
 *   | Disable Event Skip
 *     - This command disables skipping the current event. Does nothing if
 *       the current event does not have a skip currently set up.
 * 
 *   | Force Event Skip
 *     - This command forces the currently setup skip to occur. Nothing
 *       happens in-game if the current event was not skippable.
 * 
 *   | Restore Parent Skip
 *     - This can be used inside of a common event if Disable Event Skip was
 *       used inside of it to restore the ability of the common event to end
 *       early and return to the parent event's commands. This only works if
 *       the calling event had the Common Event Inherit parameter enabled.
 * 
 *   | Reset Event
 *     - This command re-initializes a map event in a process similar to how
 *       the event would be loaded if the map was entered. So, the position,
 *       graphics, move route, etc. of the event's current page will be
 *       restored. This command does NOT affect the event's self-switches.
 *     - Setting the Event ID parameter of this command to 0 targets the
 *       event using this command.
 * 
 *   | Set Camera Coordinates
 *     - This command directly sets the scroll position of the camera,
 *       centered on the tile at x and y. This can be used to quickly
 *       set the camera's position if the end of the event expects it to be
 *       in a certain spot on the map. This command cannot cause the camera
 *       to move beyond the map's boundaries, so if the coordinate would
 *       cause the camera to display beyond the edges of the map, the camera
 *       position will be clamped, similar to how the camera behaves when
 *       the player is close to the map border.
 * 
 *   | Reset Map Camera
 *     - This is basically a wrapper for 'Set Camera Coordinates' that
 *       sets x and y to the player's x and y coordinates, respectfully.
 * 
 * ----------------------------------------------------------------------------
 * 
 * Script Calls:
 *   - Any script calls prefixed with 'this' work in parts of the event
 *     editor that accept script calls, like the script command and in
 *     the conditional branch command. The big exception to this is in
 *     move route commands. So, do NOT use any commands prefixed with
 *     'this' inside of the script of a move route.
 * 
 *   | this.wasEventSkipped()
 *     - Returns true if the most recently set up skip for this event was
 *       activated. This can be called in any place in the event editor
 *       that accepts scripts (e.g. conditional branches, game variables,
 *       etc.) with the exception that this call is NOT supported inside
 *       of move routes.
 * 
 *   | this.setupSkip(label: string, fadeIn?: boolean, fadeOut?: boolean,
 *                    button?: string, allowInherit: boolean)
 *     * label: Name of the label that will be jumped to if the player
 *              activates this event skip.
 *     * fadeIn: Plugin parameter fade in override. Optional.
 *     * fadeOut: Plugin parameter fade out override. Optional.
 *     * button: Plugin parameter button override. Optional.
 *     * allowInherit: Plugin parameter Common Event Inherit override.
 *                     Optional.
 *     - Sets up a skip. Any arguments left undefined will use the ones
 *       set in the 'Default Skip Setting' plugin parameter.
 * 
 *   | this.disableSkip()
 *     - Disables the currently available skip if it exists. Does nothing
 *       otherwise.
 * 
 *   | this.restoreSkipParentParams()
 *     - Does the same thing as the 'Restore Parent Skip' plugin command.
 * 
 *   | KCDev.SkipEvent.reinitEvent(eventId: number)
 *     * eventId: ID number of the target event
 *     - Reinitializes the map event with ID eventId.
 * 
 *   | KCDev.SkipEvent.setMapScrollPos(x: number, y: number)
 *     * x: x coordinate of the tile
 *     * y: y coordinate of the tile
 *     - Centers the display on the map tile with the coordinates x and y.
 * 
 *   | KCDev.SkipEvent.resetMapScroll()
 *     - Centers the display on the player.
 * 
 * @param defaults
 * @text Default Skip Settings
 * @desc Default parameters set when skipping event.
 * @type struct<SkipSettings>
 * @default {"skipButton":"pagedown","frameCount":"60","fadeOut":"true","fadeIn":"false","commonEventInherit":"false"}
 * 
 * @param useSkipButton
 * @text Use Skip Touch UI Button
 * @desc Adds a "Skip Event" button that can be touched to activate a skip if the touch UI is enabled.
 * @type select
 * @option Always Use Button
 * @value always
 * @option Never Use Button
 * @value never
 * @option Follow Touch UI Setting
 * @value systemSetting
 * @default systemSetting
 * 
 * @param skipButtonImg
 * @parent useSkipButton
 * @text Skip Button Image
 * @desc The image of the skip button.
 * @type file
 * @dir img/system
 * @default
 * 
 * @param skipButtonSide
 * @parent useSkipButton
 * @text Skip Button Position
 * @desc Choose which side of the screen the skip button is aligned to.
 * @type select
 * @option Left
 * @value L
 * @option Right
 * @value R
 * @default R
 * 
 * @param skipButtonX
 * @parent useSkipButton
 * @text Skip Button x Offset
 * @desc x offset of the skip button. 
 * @type number
 * @max 99999
 * @min -99999
 * @default 0
 * 
 * @param skipButtonY
 * @parent useSkipButton
 * @text Skip Button y Offset
 * @desc y offset of the skip button. 
 * @type number
 * @max 99999
 * @min -99999
 * @default 0
 * 
 * @param progressBarEnabled
 * @text Use Skip Progress Bar
 * @desc Fill a guage as the player holds down the skip button.
 * @type boolean
 * @on Enabled
 * @off Disabled
 * @default true
 * 
 * @param progressBarPosition
 * @parent progressBarEnabled
 * @text Position
 * @desc Location of the progress bar on the screen.
 * @type select
 * @option Top left of screen
 * @value top_left
 * @option Top right of screen 
 * @value top_right
 * @option Bottom left of screen
 * @value bottom_left
 * @option Bottom right of screen
 * @value bottom_right
 * @option Middle of screen
 * @value middle
 * @default top_left
 * 
 * @param progressBarXOff
 * @parent progressBarPosition
 * @text x Offset
 * @desc x offset of the progress bar from the position.
 * @default 0
 * 
 * @param progressBarYOff
 * @parent progressBarPosition
 * @text y Offset
 * @desc y offset of the progress bar from the position.
 * @default 0
 * 
 * @param progressBarLabelColor
 * @parent progressBarLabel
 * @text Text Color
 * @desc The color of the text. The color indexes are based on system/Window.png.
 * @type color
 * @default 0
 * 
 * @param progressBarWidth
 * @parent progressBarEnabled
 * @text Width
 * @desc Width of the progress bar.
 * @default 192
 * 
 * @param progressBarHeight
 * @parent progressBarEnabled
 * @text Height
 * @desc Height of the progress bar.
 * @default 32
 * 
 * @param progressBarCol1
 * @parent progressBarEnabled
 * @text Color 1
 * @type color
 * @desc Leftmost color of the progress bar gradient. The color indexes are based on system/Window.png.
 * @default 20
 * 
 * @param progressBarCol2
 * @parent progressBarEnabled
 * @text Color 2
 * @type color
 * @desc Rightmost color of the progress bar gradient. The color indexes are based on system/Window.png.
 * @default 21
 * 
 * @param progressBarLabel
 * @parent progressBarEnabled
 * @text Text
 * @desc The text displayed on top of the progress bar
 * @default Skipping...
 * 
 * @param progressBarLabelWidth
 * @parent progressBarLabel
 * @text Text Max Width
 * @desc The maximum width of the progress bar's text. Leave at 0 to have it automatically set based on the bar width.
 * @default 0
 * 
 * @param progressBarLabelHeight
 * @parent progressBarLabel
 * @text Text Max Height
 * @desc The maximum height of the progress bar's text. Leaving at 0 will cause a default value to be used.
 * @default 0
 * 
 * @param progressBarLabelFontSize
 * @parent progressBarLabel
 * @text Text Font Size
 * @desc The font size of the text. Leaving at 0 will use the default font size set in the editor.
 * @default 0
 * 
 * @command setupSkipParams
 * @text Enable Event Skip
 * @desc Setup the parameters for the event skip.
 * 
 * @arg label
 * @text Label Name
 * @desc This is the name of the label that will be jumped to after a skip. Text codes supported (e.g. \v[1])
 * @type text
 * 
 * @arg overrides
 * @text Overrides
 * @desc Overrides for the plugin parameters.
 * @type struct<SkipOverrides>
 * 
 * @command disableSkip
 * @text Disable Event Skip
 * @desc Disable skipping for the current event.
 * 
 * @command forceSkip
 * @text Force Event Skip
 * @desc Force an event skip.
 * 
 * @command restoreParentParams
 * @text Restore Parent Skip
 * @desc Restores the skip parameters of the parent event. Basically only used if you call a Common Event from an event.
 * 
 * @command reloadEvent
 * @text Reset Event
 * @desc Utility command that resets an event to its 'default' state, as if the map were reloaded. Does not affect self-switches.
 * 
 * @arg eventId
 * @text Event ID
 * @desc ID of the event to reload. 0 is the current event.
 * @type number
 * @min 0
 * @default 0
 * 
 * @command setMapCoordinate
 * @text Set Camera Coordinates
 * @desc Directly set the tile that the camera is centered on.
 * 
 * @arg x
 * @desc The x coordinate to center the camera on.
 * 
 * @arg y
 * @desc The y coordinate to center the camera on.
 * 
 * @command resetMapScroll
 * @text Reset Map Camera
 * @desc Centers the camera on the player.
 * 
 */
/*~struct~SkipSettings:
 * @param skipButton
 * @text Activation Button
 * @desc This button begins the countdown to skip the event.
 * @type combo
 * @option pageup
 * @option pagedown
 * @option shift
 * @option escape
 * @default pagedown
 * 
 * @param frameCount
 * @text Frame Count
 * @desc How many frames the activation button has to be held before a skip occurs.
 * @type number
 * @default 180
 * @min 1
 * 
 * @param fadeOut
 * @text Auto Fade Out
 * @desc If enabled, the screen will automatically fade out after a skip is activated.
 * @type boolean
 * @default true
 * 
 * @param fadeIn
 * @text Auto Fade In
 * @desc If enabled, the screen will automatically fade back in when a fade is complete.
 * @type boolean
 * @default false
 * 
 * @param commonEventInherit
 * @text Common Event Inherit
 * @desc (EXPERIMENTAL) Allows Common Events to be ended early if the calling event's skip settings are met.
 * @type boolean
 * @default true
 * 
 */
/*~struct~SkipOverrides:
 * @param fadeOut
 * @text Auto Fade Out
 * @desc If enabled, the screen will automatically fade out after a skip is activated.
 * @type select
 * @option Use Plugin Parameter
 * @value pluginParam
 * @option Do fade out
 * @value true
 * @option Don't fade out
 * @value false
 * @default pluginParam
 * 
 * @param fadeIn
 * @text Auto Fade In
 * @desc If enabled, the screen will automatically fade back in after a skip is complete.
 * @type select
 * @option Use Plugin Parameter
 * @value pluginParam
 * @option Do fade in
 * @value true
 * @option Don't fade in
 * @value false
 * @default pluginParam
 * 
 * @param frameCount
 * @text Frame Count
 * @desc Frame count override.
 * @type combo
 * @option pluginParam
 * @default pluginParam
 * 
 * @param skipButton
 * @text Skip Button
 * @desc Skip button override. pluginParam uses the button in the plugin parameters.
 * @type combo
 * @option pluginParam
 * @option pageup
 * @option pagedown
 * @option shift
 * @option escape
 * @default pluginParam
 * 
 * @param commonEventInherit
 * @text Common Event Inherit
 * @desc (EXPERIMENTAL) Allows Common Events to be ended early if the calling event's skip settings are met.
 * @type select
 * @option Use Plugin Parameter
 * @value pluginParam
 * @option Allow
 * @value true
 * @option Disallow
 * @value false
 * @default pluginParam
 */

var KCDev = KCDev || {};

KCDev.SkipEvent = {};

KCDev.SkipEvent.button = {};
KCDev.SkipEvent.button.enabled = false;
KCDev.SkipEvent.button.imgName = 'ButtonSet';
KCDev.SkipEvent.button.offsets = {};
KCDev.SkipEvent.button.offsets.x = 0;
KCDev.SkipEvent.button.offsets.y = 0;
KCDev.SkipEvent.button.visible = false;
KCDev.SkipEvent.button.alignedLeft = false;
KCDev.SkipEvent.defaults = {};
KCDev.SkipEvent.defaults.commonEventInherit = false;
KCDev.SkipEvent.defaults.frameCount = 1;
KCDev.SkipEvent.defaults.button = '';
KCDev.SkipEvent.defaults.fadeOut = false;
KCDev.SkipEvent.defaults.fadeIn = false;
KCDev.SkipEvent.globalWaitCounter = 0;
KCDev.SkipEvent.skipGauge = {};
KCDev.SkipEvent.skipGauge.color1 = 0;
KCDev.SkipEvent.skipGauge.color2 = 0;
KCDev.SkipEvent.skipGauge.enabled = false;
KCDev.SkipEvent.skipGauge.offsets = { x: 0, y: 0 };
KCDev.SkipEvent.skipGauge.anchor = '';
KCDev.SkipEvent.skipGauge.width = 0;
KCDev.SkipEvent.skipGauge.height = 0;
KCDev.SkipEvent.skipGauge.label = {
    text: '',
    width: 0,
    height: 0,
    fontSize: 0,
    color: 0
};

// handle params and plugin command
(() => {
    const script = document.currentScript;

    const params = PluginManagerEx.createParameter(script);

    //console.debug(params);

    const $ = KCDev.SkipEvent;
    const paramDefaults = params.defaults || {
        skipButton: '',
        frameCount: 180,
        commonEventInherit: false,
        fadeOut: false,
        fadeIn: false
    };

    if (params.defaults === '') {
        console.error('KC_SkipEvent: No default parameters found! Loading default values...');
    }

    $.defaults.button = paramDefaults.skipButton;
    $.defaults.frameCount = parseInt(paramDefaults.frameCount) || 180;
    $.defaults.commonEventInherit = paramDefaults.commonEventInherit;
    $.defaults.fadeOut = paramDefaults.fadeOut;
    $.defaults.fadeIn = paramDefaults.fadeIn;
    if (params.useSkipButton === 'systemSetting') {
        Object.defineProperty($.button, 'enabled', {
            get() {
                return ConfigManager.touchUI;
            }
        });
    }
    else {
        $.button.enabled = params.useSkipButton === 'always';
    }

    $.button.imgName = params.skipButtonImg;
    $.button.offsets.x = parseInt(params.skipButtonX) || 0;
    $.button.offsets.y = parseInt(params.skipButtonY) || 0;
    $.button.alignedLeft = params.skipButtonSide === 'L';

    const bar = $.skipGauge;
    bar.color1 = parseInt(params.progressBarCol1) || ColorManager.normalColor();
    bar.color2 = parseInt(params.progressBarCol2) || ColorManager.normalColor();
    bar.anchor = params.progressBarPosition;
    bar.enabled = params.progressBarEnabled;
    bar.height = parseInt(params.progressBarHeight) || 0;
    bar.width = parseInt(params.progressBarWidth) || 0;
    bar.offsets.x = parseInt(params.progressBarXOff) || 0;
    bar.offsets.y = parseInt(params.progressBarYOff) || 0;
    bar.label.text = params.progressBarLabel;
    bar.label.width = parseInt(params.progressBarLabelWidth) || 0;
    bar.label.height = parseInt(params.progressBarLabelHeight) || 0;
    bar.label.fontSize = parseInt(params.progressBarLabelFontSize) || 0;
    bar.label.color = parseInt(params.progressBarLabelColor) || 0;

    PluginManagerEx.registerCommand(script, 'setupSkipParams', function (args) {
        const label = (args.label || '') + ''; // must be string
        const overrides = args.overrides || {}; // just in case undefined or null is passed in as an argument for some unholy reason
        this.setupSkip(label, overrides.fadeOut, overrides.fadeIn, overrides.frameCount, overrides.skipButton, overrides.commonEventInherit);
    });

    PluginManagerEx.registerCommand(script, 'disableSkip', function (args) {
        this.disableSkip();
    });

    PluginManagerEx.registerCommand(script, 'restoreParentParams', function (args) {
        this.restoreSkipParentParams();
    });

    PluginManagerEx.registerCommand(script, 'reloadEvent', function (args) {
        this.reloadMapEvent(args.eventId);
    });

    PluginManagerEx.registerCommand(script, 'setMapCoordinate', function (args) {
        const x = args.x === '' ? undefined : args.x;
        const y = args.y === '' ? undefined : args.y;
        KCDev.SkipEvent.setMapScrollPos(x, y);
    });

    PluginManagerEx.registerCommand(script, 'resetMapScroll', function (args) {
        KCDev.SkipEvent.resetMapScroll();
    });

    PluginManagerEx.registerCommand(script, 'forceSkip', function (args) {
        if (this.isEventSkippable()) {
            KCDev.SkipEvent.requestSkip();
            this.wait(1); // break out of the event update loop
        }
        else {
            console.error('KC_SkipEvent: Tried to force event skip with plugin command, but no skip was set up!');
        }
    });
})();

KCDev.SkipEvent._skipRequested = false;

KCDev.SkipEvent.skipRequested = function () {
    return this._skipRequested;
};

KCDev.SkipEvent.clearSkipRequest = function () {
    this._skipRequested = false;
};

KCDev.SkipEvent.requestSkip = function () {
    // console.debug("SKIP REQUESTED");
    this._skipRequested = true;
};

KCDev.SkipEvent._forceCloseMessage = false;

KCDev.SkipEvent.messageCloseRequested = function () {
    return this._forceCloseMessage;
};

KCDev.SkipEvent.clearMessageCloseRequest = function () {
    this._forceCloseMessage = false;
};

KCDev.SkipEvent.requestMessageClose = function () {
    // console.debug("MESSAGE CLOSE REQUESTED");
    this._forceCloseMessage = true;
};

KCDev.SkipEvent.reinitEvent = function (eventId) {
    const event = $gameMap.event(eventId);
    if (event) {
        event.initMembers();
        event.initialize($gameMap.mapId(), eventId);
    }
};

/**
 * @param {Game_Interpreter} interpreter 
 * @param {Sprite_Button} button 
 */
KCDev.SkipEvent.updateGlobalCounter = function (interpreter, button) {
    interpreter = KCDev.SkipEvent.getYoungestInterpreter(interpreter);

    if ((Input.isPressed(interpreter._skipButton) || button?.isPressed()) && interpreter.isEventSkippable()) {
        KCDev.SkipEvent.globalWaitCounter++;
    }
    else {
        KCDev.SkipEvent.globalWaitCounter = 0;
    }

    if (KCDev.SkipEvent.globalWaitCounter >= interpreter._skipFrameCount) {
        KCDev.SkipEvent.requestSkip();
    }
};

/**
 * @param {Game_Interpreter} interpreter 
 */
KCDev.SkipEvent.getYoungestInterpreter = function (interpreter) {
    return interpreter._childInterpreter || interpreter;
};

Game_Interpreter.prototype.reloadMapEvent = function (eventId = 0) {
    const argId = parseInt(eventId);
    if (isNaN(argId) || argId < 0) {
        console.error('KC_SkipEvent: Invalid argument passed to Game_Interpreter.prototype.reloadMapEvent: ' + eventId);
    }
    else {
        const id = argId || this.eventId();
        KCDev.SkipEvent.reinitEvent(id);
    }
};

Game_Interpreter.prototype.setupSkip = function (labelName = '', fadeOut = 'pluginParam', fadeIn = 'pluginParam', frameCount = 'pluginParam', button = 'pluginParam', allowInherit = 'pluginParam') {
    if (KCDev.SkipEvent.labelExists(this, labelName) || this._skipParentEnabled) {
        const param = 'pluginParam';
        const defaults = KCDev.SkipEvent.defaults;

        this._skipLabel = labelName;
        this._skipFadeOut = fadeOut === param ? defaults.fadeOut : fadeOut;
        this._skipFadeIn = fadeIn === param ? defaults.fadeIn : fadeIn;
        this._skipFrameCount = frameCount === param || isNaN(frameCount) || frameCount < 1 ? defaults.frameCount : frameCount;
        this._skipButton = button === param ? defaults.button : button;
        this._skipInheritEnabled = allowInherit === param ? defaults.commonEventInherit : allowInherit;

        this._skipParentEnabled = false;
    }
    else {
        console.error('KC_SkipEvent: setupSkip: Label does not exist: ' + labelName);
    }
};

Game_Interpreter.prototype.disableSkip = function () {
    this._skipLabel = '';
    this._skipParentEnabled = false;
};

/**
 * Returns true if a label exists in an interpreter's command list, false otherwise
 * @param {Game_Interpreter} interpreter 
 * @param {string} label 
 * @returns {boolean}
 */
KCDev.SkipEvent.labelExists = function (interpreter, label) {
    for (let i = 0; i < interpreter._list.length; i++) {
        const command = interpreter._list[i];
        if (command.code === 118 && command.parameters[0] === label) {
            return true;
        }
    }
    return false;
};

KCDev.SkipEvent.Game_Interpreter_setup = Game_Interpreter.prototype.setup;
Game_Interpreter.prototype.setup = function () {
    KCDev.SkipEvent.Game_Interpreter_setup.apply(this, arguments);
    this._skipInheritEnabled = false;
    this._wasSkipped = false;
    this._skipParentParams = null;
    this._isSkipping = false;
    this._skipLabel = '';
    this._skipFadeIn = false;
    this._skipFadeOut = true;
    this._skipParentEnabled = false;
};

Game_Interpreter.prototype.startEventSkip = function () {
    this._waitCount = 0;
    if (this._waitMode === 'route') {
        this.character(this._characterId).processRouteEnd();
    }
    this.setWaitMode('');

    if (this._skipParentEnabled) {
        this.command115(); // exit event processing
        KCDev.SkipEvent.requestSkip();
    }
    else {
        this._isSkipping = true;

        // we need to wait to ensure certain commands aren't skipped
        this.wait(1);
        
        if (this._skipFadeOut) {
            const fs = this.fadeSpeed();
            $gameScreen.startFadeOut(fs);
            this.wait(fs);
        }

        KCDev.SkipEvent.requestMessageClose();
    }
};

Game_Interpreter.prototype.isEventSkippable = function () {
    return !$gameMessage.isChoice() && !$gameMessage.isNumberInput() && !$gameMessage.isItemChoice() && (this._skipParentEnabled || (this._skipLabel !== '' && this.isRunning() && !this.isBeingSkipped() && ($gameScreen._fadeInDuration + $gameScreen._fadeOutDuration < 1) && !this._childInterpreter));
};

Game_Interpreter.prototype.endSkip = function () {
    if (this._skipFadeIn) {
        this.command222();
    }

    this._wasSkipped = true;
    this._isSkipping = false;
    this._skipLabel = '';

};

KCDev.SkipEvent.Game_Interpreter_update = Game_Interpreter.prototype.update;
Game_Interpreter.prototype.update = function () {

    KCDev.SkipEvent.Game_Interpreter_update.apply(this, arguments);

    // we do this last in case child interpreter requested a skip
    if (KCDev.SkipEvent.skipRequested() && this.isRunning()) {
        KCDev.SkipEvent.clearSkipRequest();
        this.startEventSkip();
    }
};

KCDev.SkipEvent.Game_Interpreter_setupChild = Game_Interpreter.prototype.setupChild;
Game_Interpreter.prototype.setupChild = function () {
    const skippable = this.isEventSkippable();
    KCDev.SkipEvent.Game_Interpreter_setupChild.apply(this, arguments);
    if (skippable && this._skipInheritEnabled) {
        this._childInterpreter._skipParentParams = ['', this._skipFadeOut, this._skipFadeIn, this._skipFrameCount, this._skipButton, this._skipInheritEnabled];
        this._childInterpreter.restoreSkipParentParams();
    }
};

Game_Interpreter.prototype.restoreSkipParentParams = function () {
    if (Array.isArray(this._skipParentParams)) {
        const c = this;
        const p = this._skipParentParams;
        c._skipFadeOut = p[1];
        c._skipFadeIn = p[2];
        c._skipFrameCount = p[3];
        c._skipButton = p[4];
        c._skipInheritEnabled = p[5];
        c._skipParentEnabled = true;
    }
};

KCDev.SkipEvent.Game_Interpreter_executeCommand = Game_Interpreter.prototype.executeCommand;
Game_Interpreter.prototype.executeCommand = function () {
    if (this.isBeingSkipped()) {
        this.command119([this._skipLabel]);
        this.endSkip();
    }
    return KCDev.SkipEvent.Game_Interpreter_executeCommand.apply(this, arguments);
}

Game_Interpreter.prototype.isBeingSkipped = function () {
    return this._isSkipping;
}

Game_Interpreter.prototype.wasEventSkipped = function () {
    return this._wasSkipped;
}

// allow event skip to force close message box
KCDev.SkipEvent.Window_Message_update = Window_Message.prototype.update;
Window_Message.prototype.update = function () {
    KCDev.SkipEvent.Window_Message_update.apply(this, arguments);

    if ($gameMessage.isBusy() && KCDev.SkipEvent.messageCloseRequested()) {
        this._showFast = true;
        this._lineShowFast = true;
        this._waitCount = 0;
        this.pause = false;
        this._pauseSkip = true;
        this.terminateMessage();
        this._textState = null;
    }

    KCDev.SkipEvent.clearMessageCloseRequest();
};

// don't progress message box while trying to skip event.
KCDev.SkipEvent.Window_Message_isTriggered = Window_Message.prototype.isTriggered;
Window_Message.prototype.isTriggered = function () {
    return KCDev.SkipEvent.globalWaitCounter < 1 && KCDev.SkipEvent.Window_Message_isTriggered.apply(this, arguments);
};

KCDev.SkipEvent.Sprite_SkipButton = class Sprite_SkipButton extends Sprite_Button {

    buttonData() {
        return { x: 0, w: 1 };
    }

    checkBitmap() { }

    loadButtonImage() {
        this.bitmap = KCDev.SkipEvent.button.imgName !== '' ?
            ImageManager.loadSystem(KCDev.SkipEvent.button.imgName) :
            new Bitmap(1, 1);
    }

    onClick() { }

    updateFrame() {
        const frame = this.isPressed() || KCDev.SkipEvent.globalWaitCounter ? this._hotFrame : this._coldFrame;
        if (frame) {
            this.setFrame(frame.x, frame.y, frame.width, frame.height);
        }
    }

    setupFrames() {
        this.loadButtonImage();
        this.bitmap.addLoadListener(() => {
            const data = this.buttonData();
            const x = data.x * this.blockWidth();
            const width = data.w * this.blockWidth();
            const height = this.blockHeight();
            this.setColdFrame(x, 0, width, height);
            this.setHotFrame(x, height, width, height);
            this.updateFrame();
            this.updateOpacity();
        });
    }

    blockWidth() {
        return this.bitmap.width;
    }

    blockHeight() {
        return Math.floor(this.bitmap.height / 2);
    }

};

KCDev.SkipEvent.Scene_Map_createButtons = Scene_Map.prototype.createButtons;
Scene_Map.prototype.createButtons = function () {
    KCDev.SkipEvent.Scene_Map_createButtons.apply(this, arguments);
    KCDev.SkipEvent.createSkipSprites(this);
};

KCDev.SkipEvent.Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function () {
    KCDev.SkipEvent.Scene_Map_update.apply(this, arguments);
    KCDev.SkipEvent.updateSkipSprites(this);
    KCDev.SkipEvent.updateGlobalCounter($gameMap._interpreter, this._skipEventButton);
};

KCDev.SkipEvent.Scene_Battle_createButtons = Scene_Battle.prototype.createButtons;
Scene_Battle.prototype.createButtons = function () {
    KCDev.SkipEvent.Scene_Battle_createButtons.apply(this, arguments);
    KCDev.SkipEvent.createSkipSprites(this);
};

KCDev.SkipEvent.Scene_Battle_update = Scene_Battle.prototype.update;
Scene_Battle.prototype.update = function () {
    KCDev.SkipEvent.Scene_Battle_update.apply(this, arguments);
    KCDev.SkipEvent.updateSkipSprites(this);
    KCDev.SkipEvent.updateGlobalCounter($gameTroop._interpreter, this._skipEventButton);
};

KCDev.SkipEvent.createSkipSprites = function (scene) {
    if (KCDev.SkipEvent.button.enabled) {
        KCDev.SkipEvent.createSkipButton(scene);
    }
    if (KCDev.SkipEvent.skipGauge.enabled) {
        KCDev.SkipEvent.createSkipBar(scene);
    }
};

KCDev.SkipEvent.updateSkipSprites = function (scene) {
    if (scene._skipEventButton) {
        const interpreter = $gameParty.inBattle() ? $gameTroop._interpreter : $gameMap._interpreter;
        scene._skipEventButton.visible = KCDev.SkipEvent.getYoungestInterpreter(interpreter).isEventSkippable();
    }
    if (scene._skipEventProgressGauge) {
        scene._skipEventProgressGauge.visible = scene._skipEventProgressGauge.isValid();
        if (scene._skipEventGaugeLabel) {
            scene._skipEventGaugeLabel.visible = scene._skipEventProgressGauge.visible;
        }
    }
}

/**
 * @param {Scene_Map | Scene_Battle} scene 
 */
KCDev.SkipEvent.createSkipButton = function (scene) {
    scene._skipEventButton = new KCDev.SkipEvent.Sprite_SkipButton();
    scene._skipEventButton.bitmap.addLoadListener(() => {
        scene._skipEventButton.x = (KCDev.SkipEvent.button.alignedLeft) ? 0 : Graphics.boxWidth - scene._skipEventButton.width - 4;
        scene._skipEventButton.x += KCDev.SkipEvent.button.offsets.x;
        scene._skipEventButton.y = scene.buttonY();
        scene._skipEventButton.y += KCDev.SkipEvent.button.offsets.y;
        scene._skipEventButton.visible = false;
        scene.addWindow(scene._skipEventButton);
    });
};

/**
 * @param {Scene_Map | Scene_Battle} scene 
 */
KCDev.SkipEvent.createSkipBar = function (scene) {
    const g = new KCDev.SkipEvent.Sprite_SkipGauge();
    scene._skipEventProgressGauge = g;
    const anchor = KCDev.SkipEvent.skipGauge.anchor;
    const anchorSplit = anchor.split('_');

    // position skip bar in a corner
    if (anchorSplit.length === 2) {
        g.x = anchorSplit[1] === 'right' ? Graphics.boxWidth - g.bitmapWidth() : 0;
        g.y = anchorSplit[0] === 'bottom' ? Graphics.boxHeight - g.bitmapHeight() : 0;
    }
    else { // must be middle
        g.x = Math.floor((Graphics.boxWidth - g.bitmapWidth()) / 2);
        g.y = Math.floor((Graphics.boxHeight - g.bitmapHeight()) / 2);
    }

    g.x += KCDev.SkipEvent.skipGauge.offsets.x;
    g.y += KCDev.SkipEvent.skipGauge.offsets.y;

    if (KCDev.SkipEvent.skipGauge.label !== '') {
        const l = new KCDev.SkipEvent.Sprite_SkipBarLabel();

        if (g.y === Graphics.boxHeight - g.bitmapHeight()) {
            g.y -= l.bitmapHeight();
        }
        if (g.x === Graphics.boxWidth - g.bitmapWidth()) {
            g.x = Graphics.boxWidth - Math.max(g.bitmapWidth(), l.bitmapWidth());
        }

        l.visible = false;
        scene._skipEventGaugeLabel = l;
        l.x = g.x;
        l.y = g.y;
        g.y += l.bitmapHeight();

        scene.addWindow(l);
    }

    g.visible = false;
    scene.addWindow(g);
};

KCDev.SkipEvent.BattleManager_update = BattleManager.update;
BattleManager.update = function () {
    if ($gameTroop._interpreter.isRunning() && KCDev.SkipEvent.skipRequested()) {
        $gameTroop.updateInterpreter();
    }
    KCDev.SkipEvent.BattleManager_update.apply(this, arguments);
};

KCDev.SkipEvent.Sprite_SkipGauge = class Sprite_SkipGauge extends Sprite_Gauge {

    static get properties() {
        return KCDev.SkipEvent.skipGauge;
    }

    initialize() {
        super.initialize();
    }

    isValid() {
        return KCDev.SkipEvent.globalWaitCounter > 0;
    }

    currentMaxValue() {
        const interpreter = $gameParty.inBattle() ? $gameTroop._interpreter : $gameMap._interpreter;
        return interpreter._skipFrameCount;
    }

    currentValue() {
        return KCDev.SkipEvent.globalWaitCounter;
    }

    update() {
        Sprite.prototype.update.call(this);
        this._value = this.currentValue();
        this._maxValue = this.currentMaxValue();
        this.redraw();
    }

    updateFlashing() {
        //
    }

    smoothness() {
        return 1;
    }

    bitmapWidth() {
        return Sprite_SkipGauge.properties.width;
    }

    bitmapHeight() {
        return Sprite_SkipGauge.properties.height;
    }

    gaugeHeight() {
        return Math.floor(this.bitmapHeight() * 0.375)
    }

    gaugeX() {
        return 0;
    }

    gaugeColor1() {
        return ColorManager.textColor(Sprite_SkipGauge.properties.color1);
    }

    gaugeColor2() {
        return ColorManager.textColor(Sprite_SkipGauge.properties.color2);
    }

    drawValue() {
        //
    }

};

KCDev.SkipEvent.Sprite_SkipBarLabel = class Sprite_SkipBarLabel extends Sprite_Name {
    name() {
        return KCDev.SkipEvent.skipGauge.label.text;
    }

    bitmapWidth() {
        return KCDev.SkipEvent.skipGauge.label.width || KCDev.SkipEvent.skipGauge.width;
    }

    bitmapHeight() {
        return KCDev.SkipEvent.skipGauge.label.height || super.bitmapHeight();
    }

    fontSize() {
        return KCDev.SkipEvent.skipGauge.label.fontSize || $gameSystem.mainFontSize();
    }

    textColor() {
        return ColorManager.textColor(KCDev.SkipEvent.skipGauge.label.color);
    }

};

// directly sets the map camera position to be centered on coordinates x and y
KCDev.SkipEvent.setMapScrollPos = function (x = $gameMap._displayX, y = $gameMap._displayY) {

    const parsedX = parseFloat(x);
    const parsedY = parseFloat(y);

    let success = true;

    function errCheck(num) {
        if (isNaN(num)) {
            console.error('KCDev.SkipEvent.setMapScrollPos: Invalid argument with value of ' + num + ' passed in.');
            success = false;
        }
    }

    errCheck(parsedX);
    errCheck(parsedY);

    if (success) {
        $gameMap.startScroll(2, 0, 1); // override the current map scroll
        const camX = Math.max(0, parsedX - Math.floor(Graphics.width / $gameMap.tileWidth() / 2));
        const camY = Math.max(0, parsedY - Math.floor(Graphics.height / $gameMap.tileHeight() / 2));
        $gameMap.setDisplayPos(camX, camY);
    }
};

KCDev.SkipEvent.resetMapScroll = function () {
    // need to use real x and y values to account for pixel movement plugins
    KCDev.SkipEvent.setMapScrollPos($gamePlayer._realX, $gamePlayer._realY);
};
