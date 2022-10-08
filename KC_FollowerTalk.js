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
 * @plugindesc [v1.0]Call a common event when you talk to your followers.
 *
 * @help
 * KC_FollowerTalk.js
 * 
 * Changelog:
 *   v1.0.0 - 2022/10/08
 *     - Initial release
 * 
 * This is a plugin that lets the player trigger a common event upon
 * interacting with their followers. The use that I developed this
 * plugin for in particular is to initiate "conversations" with the
 * party through this common event.
 * 
 * Script Calls:
 * KCDev.FollowerTalk.recentActorId()
 * | Returns the result of the most recent check. Useful for script calls in
 *   cases where you do not want to use a Game Variable for this plugin.
 * 
 * @param commonId
 * @text Common Event ID
 * @desc The common event that will be called when the player talks to a follower.
 * @type common_event
 * @default 0
 * 
 * @param actorIdVar
 * @text Variable ID
 * @desc The actor ID of the follower being talked to will be stored here.
 * @type variable
 * @default 0
 * 
 * @param disableSwitch
 * @text Disable Talk Switch
 * @desc Follower talk is disabled when this switch is ON.
 * @type switch
 * @default 0
 * 
 * @param triggerButton
 * @text Activation Button
 * @desc This button triggers the follower talk check.
 * @type combo
 * @option ok
 * @option pageup
 * @option pagedown
 * @option shift
 * @option control
 * @option escape
 * @default ok
 * 
 * @param maxDistance
 * @text Maximum Talk Distance
 * @desc The player can talk to their follower from at most this many tiles away.
 * @type number
 * @decimals 2
 * @default 1.0
 * 
 * @param minDistance
 * @text Minimum Talk Distance
 * @desc The player must be at least this many tiles away from a follower to initiate a talk.
 * @type number
 * @decimals 2
 * @default 1.0
 * 
 */

var KCDev = KCDev || {};

KCDev.FollowerTalk = {};

(($) => {
    'use strict';

    const script = document.currentScript.src.split("/").pop().replace(/\.js$/, "");

    const params = PluginManager.parameters(script);

    $.commonEventId = parseInt(params.commonId) || 0;
    $.variableId = parseInt(params.actorIdVar) || 0;
    $.disableSwitchId = parseInt(params.disableSwitch) || 0;
    $.button = params.triggerButton;
    $.maxDist = parseFloat(params.maxDistance) || 0;
    $.minDist = parseFloat(params.minDist) || 0;
    $.followCheckResult = 0;

    $.Game_Player_update = Game_Player.prototype.update;
    Game_Player.prototype.update = function (sceneActive) {
        $.Game_Player_update.apply(this, arguments);
        $.checkFollowSpeak();
    };

    /**
     * Get the real distance squared betwen two characters
     * @param {Game_Character} a 
     * @param {Game_Character} b 
     * @returns {number}
     */
    $.quickDist2 = function (a, b) {
        const dx = a._realX - b._realX;
        const dy = a._realY - b._realY;
        return dx * dx + dy * dy;
    }

    /**
     * Get the real distance betwen two characters
     * @param {Game_Character} a 
     * @param {Game_Character} b 
     * @returns {number}
     */
    $.charDistance = function (a, b) {
        return Math.sqrt($.quickDist2(a, b));
    }

    $.recentActorId = function() {
        return this.followCheckResult;
    }

    $.checkFollowSpeak = function () {
        const p = $gamePlayer;
        if (Input.isTriggered($.button) && !$gameSwitches.value($.disableSwitchId) && p.canMove()) {
            $.followCheckResult = 0;

            const /**@type {Game_Follower[]} */ validFollowers = [];
            const /**@type {Map<Game_Follower, number>} */ distances = new Map();

            const f = p.followers();
            f.visibleFollowers().filter(follower => follower.actor()).forEach(follower => {
                const d = $.charDistance($gamePlayer, follower);
                if (d >= $.minDist && d <= $.maxDist) {
                    distances.set(follower, d);
                    validFollowers.push(follower);
                }
            });

            validFollowers.sort((a, b) => {
                return distances.get(a) - distances.get(b);
            });

            for (let i = 0; i < validFollowers.length; i++) {
                const f = validFollowers[i];
                let playerIsFacing = false;
                switch ($gamePlayer.direction()) {
                    // UP
                    case 8:
                        playerIsFacing = $gamePlayer._realY > f._realY;
                        break;
                    // RIGHT
                    case 6:
                        playerIsFacing = $gamePlayer._realX < f._realX;
                        break;
                    // LEFT
                    case 4:
                        playerIsFacing = $gamePlayer._realX > f._realX;

                        break;
                    // DOWN
                    case 2:
                        playerIsFacing = $gamePlayer._realY < f._realY;
                        break;

                    default:
                        break;
                }
                
                if (playerIsFacing) {
                    f.setDirection(f.reverseDir(p.direction()))
                    $.followCheckResult = f.actor().actorId();
                    // player is looking at this follower so don't check rest
                    break;
                }
            }

            if ($.recentActorId()) {
                $gameTemp.reserveCommonEvent($.commonEventId);
            }

            $gameVariables.setValue($.variableId, $.recentActorId());
        }
    }

})(KCDev.FollowerTalk);

