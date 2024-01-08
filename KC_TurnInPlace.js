/**
 * MIT License
 * 
 * Copyright (c) 2024 K. Chavez <kchavez.dev@gmail.com>
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
 * @plugindesc [v1.1]Adds a configurable delay to walking after turning for the player.
 * 
 * @param delay
 * @text Delay Frames
 * @desc The player will wait this many frames to walk after changing the direction of the character.
 * @type number
 * @default 6
 * @min 0
 * 
 * @param cooldown
 * @text Movement Cooldown Frames
 * @desc Delay will only occur if the player stands still for this many frames.
 * @type number
 * @default 6
 * @min 0
 * 
 * @param delayDash
 * @text Delay On Dash
 * @desc Let player turn in place when dashing.
 * @type boolean
 * @default false
 * 
 * @help
 * KC_TurnInPlace.js
 * 
 * This is a simple plugin that allows the player character to be turned in
 * place when a directional button is pressed. This is an attempt to emulate
 * behavior seen in certain RPGs that use tile-based movement systems.
 * 
 * There are three configurable parameters.
 * 
 * | Delay Frames
 *   + This is the amount of frames the player will wait before the character
 *     starts moving. If the player lifts their finger from the movement key
 *     before this many frames have passed, the controllable character will
 *     only face the direction the player inputted without stepping forward.
 *   - Default: 6
 * 
 * | Movement Cooldown Frames
 *   + The player character must not move for this many frames before the delay
 *     is applied. This should be at least 2 if you want changing directions
 *     while walking to remain seamless.
 *   - Default: 6
 * 
 * | Delay On Dash
 *   + If this is true, then the player will only turn in place while not
 *     dashing.
 *   - Default: False
 * 
 * Changelog:
 *   v1.1.0 - 2024.01.07
 *     - Added delay on dash parameter
 *   v1.0.0 - 2024.01.06
 *     - Initial release
 * 
*/

'use strict';

// a general namespace for my plugins
var KCDev = KCDev || {};

KCDev.TurnInPlace = {};

KCDev.TurnInPlace.delay = 0;

KCDev.TurnInPlace.timeUntilMove = 0;

KCDev.TurnInPlace.stoppingCooldownTimer = 0;

KCDev.TurnInPlace.stoppingCooldownAmount = 3;

KCDev.TurnInPlace.isAppliedWhenDashing = false;

KCDev.TurnInPlace.decrementTimers = function () {
    if (KCDev.TurnInPlace.timeUntilMove > 0) {
        KCDev.TurnInPlace.timeUntilMove--;
    }

    if (KCDev.TurnInPlace.stoppingCooldownTimer > 0) {
        KCDev.TurnInPlace.stoppingCooldownTimer--;
    }
};

/**
 * 
 * @param {Game_Player} p 
 */
KCDev.TurnInPlace.shouldMoveImmediately = function(p) {
    return (!KCDev.TurnInPlace.isAppliedWhenDashing && p.isDashing()) ||$gameTemp.isDestinationValid() || KCDev.TurnInPlace.stoppingCooldownTimer > 0
};

/**
 * 
 * @param {Game_Player} p 
 * @returns 
 */
KCDev.TurnInPlace.shouldAddDelay = function(p) {
    return p.getInputDirection() !== p.direction();
};

/**
 * @param {Game_Player} p 
 */
KCDev.TurnInPlace.handleTimeUntilMoveSetup = function(p) {
    if (KCDev.TurnInPlace.shouldMoveImmediately(p)) {
        KCDev.TurnInPlace.timeUntilMove = 0;
    }
    else if (KCDev.TurnInPlace.shouldAddDelay(p)) {
        KCDev.TurnInPlace.timeUntilMove = KCDev.TurnInPlace.delay;
    }
};

/**
 * 
 * @param {Game_Player} p 
 */
KCDev.TurnInPlace.handleMovementCooldown = function (p) {
    if (p.isMoving()) {
        KCDev.TurnInPlace.stoppingCooldownTimer = KCDev.TurnInPlace.stoppingCooldownAmount;
    }
};

KCDev.TurnInPlace.Game_Player_executeMove = Game_Player.prototype.executeMove;
/**
 * @param {number} direction 
 */
Game_Player.prototype.executeMove = function (direction) {
    KCDev.TurnInPlace.handleTimeUntilMoveSetup(this);

    if (KCDev.TurnInPlace.timeUntilMove <= 0) {
        // @ts-ignore
        KCDev.TurnInPlace.Game_Player_executeMove.apply(this, arguments);
    }
    else {
        this.setDirection(direction);
    }

};

KCDev.TurnInPlace.Game_Player_update = Game_Player.prototype.update;
Game_Player.prototype.update = function () {
    
    KCDev.TurnInPlace.decrementTimers();
    KCDev.TurnInPlace.handleMovementCooldown(this);

    // @ts-ignore
    KCDev.TurnInPlace.Game_Player_update.apply(this, arguments);
}

{
    // @ts-ignore
    /**@type {string} */ const script = document.currentScript.src.split("/").pop().replace(/\.js$/, "");

    /**@type {{delay: string, cooldown: string, delaySameDir: string, delayDash: string}} */
    const params = PluginManager.parameters(script);

    KCDev.TurnInPlace.delay = Number(params.delay) || 0;
    KCDev.TurnInPlace.stoppingCooldownAmount = Number(params.cooldown) || 0;
    KCDev.TurnInPlace.isAppliedWhenDashing = params.delayDash === 'true';
}
