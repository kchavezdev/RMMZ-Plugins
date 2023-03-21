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
 * @orderafter PluginCommonBase
 *
 * @plugindesc [v1.0] Small event self switch helper.
 *
 * @help
 * KC_SelfSwitchUtil.js
 * 
 * Changelog:
 *   v1.0.0 - 2023/03/20
 *     - Initial release
 * 
 * Place this plugin under PluginCommonBase to get access to the following
 * text codes as arguments to the plugin command(s):
 * |  \v[n] is converted to the value of the nth variable.
 * |  \s[n] is converted to the value (true, false) of the nth switch.
 * |  \ss[n] is converted to the value (true, false) of the nth self switch.
 * 
 * To use these codes, use the 'text' tab when changing the value of an
 * argument.
 * 
 * @command setSelfSwitch
 * @text Set Self Switch
 * @desc Set the state of any event's self switch.
 * 
 * @arg value
 * @text New Value
 * @desc The value to set this self switch to.
 * @type boolean
 * @default true
 * 
 * @arg selfSwitchId
 * @text Self Switch ID
 * @type select
 * @option A
 * @option B
 * @option C
 * @option D
 * @default A
 * 
 * @arg eventId
 * @text Event ID
 * @desc The ID of the event to set the self switch of. Set to 0 to target the current event.
 * @type number
 * @default 0
 * 
 * @arg mapId
 * @text Map ID
 * @desc The map ID the target event is on. Set to 0 to target the current map.
 * @type number
 * @default 0
 * 
*/

var KCDev = KCDev || {};

KCDev.SelfSwitchUtil = {
    /**
     * @param {boolean} value 
     * @param {string} switchId 
     * @param {number} eventId 
     * @param {number | undefined} mapId 
     */
    setSelfSwitch(value, switchId, eventId, mapId) {
        if (['A', 'B', 'C', 'D'].includes(switchId) && eventId > 0) {
            $gameSelfSwitches.setValue([mapId || $gameMap.mapId(), eventId, switchId], value);
        }
    }
}

/**
 * @typedef {Object} KCDev.SelfSwitchUtil.PluginCommandArgs.setSelfSwitch
 * @property {boolean} value
 * @property {number} selfSwitchId
 * @property {number} eventId
 * @property {number} mapId
 */

if (window.PluginManagerEx) {
    PluginManagerEx.registerCommand(document.currentScript, 'setSelfSwitch', 
    /**@param {KCDev.SelfSwitchUtil.PluginCommandArgs.setSelfSwitch} args */ function (args) {
        KCDev.SelfSwitchUtil.setSelfSwitch(args.value, args.selfSwitchId, args.eventId || this.eventId(), args.mapId);
    });
}
else {
    PluginManager.registerCommand(document.currentScript.src.split("/").pop().replace(/\.js$/, ""), 'setSelfSwitch', 
    /**@param {KCDev.SelfSwitchUtil.PluginCommandArgs.setSelfSwitch} args */ function (args) {
        args.value = args.value === 'true';
        args.eventId = Number(args.eventId);
        args.mapId = Number(args.mapId);
        KCDev.SelfSwitchUtil.setSelfSwitch(args.value, args.selfSwitchId, args.eventId || this.eventId(), args.mapId);
    });
}


