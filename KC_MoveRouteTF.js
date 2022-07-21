/**
 * MIT License
 * 
 * Copyright (c) 2022 K. Chavez
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
 * @orderBefore KC_Mirrors
 *
 * @plugindesc [v1.0.1]Rotate, translate, and scale characters during move routes.
 *
 * @help 
 * This is a plugin that adds some functions that can be called during move 
 * routes that will rotate, translate, and/or scale the character's sprite 
 * without affecting the 'real' position of the character (i.e. collision and 
 * activation boxes are not affected).
 * 
 * Known Compatibility issues:
 * | Plugin: VisuMZ_1_EventsMoveCore
 *   - Issue 1: Rotations do not work
 *   - Solution 1: Set 'Enable Dash Tilt?' to false in Movement Settings
 * 
 *   - Issue 2: Dash tilt does not rotate around the correct point
 *              and I do not plan on using the rotation functionality of this 
 *              plugin
 *   - Solution 2: Set 'Enable Rotations' to false in this plugin
 * 
 * Plugin Parameters:
 * Disable these as needed if compatibility issues arise with other plugins to 
 * maybe
 * 
 * | Enable Rotations
 *   - Enabling this allows the plugin to update the character sprite's 
 *     rotation.
 * 
 * | Enable Translations
 *   - Enabling this allows the plugin to update the character sprite's
 *     translation.
 * 
 * | Enable Rescale
 *   - Enabling this allows the plugin to update the character sprite's 
 *     scale.
 * 
 * Plugin Commands:
 * | None
 * 
 * Plugin Script Calls:
 * Each of these calls should be in your set move route commands and prefixed
 * with 'this.'. So, to have the character rotate 90 degrees clockwise, you 
 * would write 'this.rotate(90)'.
 * 
 * Every parameter in these script calls is OPTIONAL. So, if they are not 
 * filled in, then this plugin will use default values in their place. 
 * These defaults will be denoted by ' = [value]' following the parameter name.
 * 
 * General Function Calls:
 * | resetTransforms(duration = 1, wait = false)
 *   - Returns the rotation of the character to 0, the translation of the 
 *     character to 0 on both axes, and the scale of the character to 1 on both
 *     axes.
 * 
 * Rotation Function Calls:
 * | rotation()
 *   - Returns the current rotation value of this character
 * | rotate(angle = 0, duration = 1, wait = false)
 *   - Adds angle to the current rotation and has the character reach current
 *     rotation + angle in duration frames.
 * | rotateTo(angle = 0, duration = 1, wait = false)
 *   - Rotates the character from the current angle to the one specified in the
 *     function call over duration frames.
 * 
 * Translation Function Calls:
 * | translationX()
 *   - Returns the current x translation
 * | translateX(x = 0, duration = 1, wait = false)
 *   - Move the sprite x pixels horizontally from its current position over
 *     duration frames
 * | translateXTo(x = 0, duration = 1, wait = false)
 *   - Move the sprite from its current x position to the target x specified in
 *     the function call over duration frames relative to the character's 
 *     origin
 * | translationY()
 *   - Returns the current y translation
 * | translateY(y = 0, duration = 1, wait = false)
 *   - Move the sprite y pixels vertically from its current position over
 *     duration frames
 * | translateYTo(y = 0, duration = 1, wait = false)
 *   - Move the sprite from its current y position to the target y specified in
 *     the function call over duration frames relative to the character's 
 *     origin
 * | translate(x = 0, y = x, duration = 1, wait = false)
 *   - Move the sprite x pixels horizontally and y pixels vertically from its 
 *     current position over duration frames
 * | translateTo(x = 0, y = x, duration = 1, wait = false)
 *   - Move the sprite from its current y position to the target x specified in
 *     the function call over duration frames relative to the character's
 *     origin
 * 
 * Scaling Function Calls:
 * | scaleX()
 *   - returns the current x scale of the character
 * | rescaleX(scale = 0, duration = 1, wait = false)
 *   - Thange x scale to current x scale + scale argument over duration frames
 * | rescaleXTo(scale = 0, duration = 1, wait = false)
 *   - Change the current x scale to the target scale over duration frames
 * | scaleY()
 *   - returns the current y scale of the character
 * | rescaleY(scale = 0, duration = 1, wait = false)
 *   - Thange y scale to current y scale + scale argument over duration frames
 * | rescaleYTo(scale = 0, duration = 1, wait = false)
 *   - Change the current y scale to the target scale over duration frames
 * | rescale(x = 0, y = x, duration = 1, wait = false)
 *   - Adds x to the horizontal scale and y to the vertical scale over
 *     duration frames
 * | rescaleTo(x = 0, y = x, duration = 1, wait = false)
 *   - Change the x scale to x and the y scale to y over duration frames
 * 
 * @param enableRot
 * @text Enable Rotations
 * @desc Enable the rotation functionality of this plugin.
 * @type boolean
 * @default true
 * 
 * @param enableTrans
 * @text Enable Translations
 * @desc Enable the translation functionality of this plugin.
 * @type boolean
 * @default true
 * 
 * @param enableScale
 * @text Enable Rescales
 * @desc Enable the rescale functionality of this plugin.
 * @type boolean
 * @default true
 *                                                              
 */

var KCDev = KCDev || {};

KCDev.MoveRouteTF = {};

(($) => {

    const pluginName = document.currentScript.src.split("/").pop().replace(/\.js$/, "");
    $.parameters = PluginManager.parameters(pluginName);
    $.parameters.enableRot = $.parameters.enableRot === 'true';
    $.parameters.enableTrans = $.parameters.enableTrans === 'true';
    $.parameters.enableScale = $.parameters.enableScale === 'true';

    $.Sprite_Character_updateOther = Sprite_Character.prototype.updateOther;
    Sprite_Character.prototype.updateOther = function () {
        $.Sprite_Character_updateOther.apply(this, arguments);
        const char = this._character;
        const p = $.parameters;
        if (p.enableScale) {
            this.scale.set(char.scaleX(), char.scaleY());
        }
        if (p.enableRot) {
            this.rotation = char.rotation() * Math.PI / 180;
            this.pivot.y = -this.patternHeight() / 2;
            this.y += this.pivot.y * this.scale.y;
        }
        if (p.enableTrans) {
            this.x += char.translationX();
            this.y += char.translationY();
        }
    };

    $.Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
    Game_CharacterBase.prototype.initMembers = function () {
        $.Game_CharacterBase_initMembers.apply(this, arguments);
        this._moveRouteTransforms = {
            scaleX: { start: 1, current: 1, target: 1, duration: 1, time: 0 },
            scaleY: { start: 1, current: 1, target: 1, duration: 1, time: 0 },
            transX: { start: 0, current: 0, target: 0, duration: 1, time: 0 },
            transY: { start: 0, current: 0, target: 0, duration: 1, time: 0 },
            rotation: { start: 0, current: 0, target: 0, duration: 1, time: 0 }
        };
    };

    $.easeFunc = function (transform) {
        return transform.start + (transform.target - transform.start) * (transform.time / transform.duration);
    }

    function needsUpdate(moveInfo) {
        return moveInfo.time < moveInfo.duration;
    }

    function updateTransformEx(...transforms) {
        transforms.forEach(tf => {
            if (needsUpdate(tf)) {
                tf.time++;
                tf.current = $.easeFunc(tf);
            }
        });
    }

    $.Game_CharacterBase_update = Game_CharacterBase.prototype.update;
    Game_CharacterBase.prototype.update = function () {
        $.Game_CharacterBase_update.apply(this, arguments);
        const em = this._moveRouteTransforms;
        updateTransformEx(em.rotation, em.transX, em.transY, em.scaleX, em.scaleY);
    };

    /**
     * Updates an extendedMove property to start an object's transformation
     * @param {number} transform extendedMove object
     * @param {number} start starting value
     * @param {number} target target value to reach from start
     * @param {number} duration how many frames it should take to reach target from start
     */
    function setTarget(transform, start, target, duration) {
        transform.target = target;
        transform.duration = duration;
        transform.start = start;
        transform.time = 0;
    }

    /**
     * Returns current scale along x axis
     * @returns {number}
     */
    Game_CharacterBase.prototype.scaleX = function () {
        return this._moveRouteTransforms.scaleX.current;
    };

    /**
     * Returns current scale along y axis
     * @returns {number}
     */
    Game_CharacterBase.prototype.scaleY = function () {
        return this._moveRouteTransforms.scaleY.current;
    };

    /**
     * Returns current x offset from character's 'real' position
     * @returns {number}
     */
    Game_CharacterBase.prototype.translationX = function () {
        return this._moveRouteTransforms.transX.current;
    };

    /**
     * Returns current y offset from character's 'real' position
     * @returns {number}
     */
    Game_CharacterBase.prototype.translationY = function () {
        return this._moveRouteTransforms.transY.current;
    };


    /**
     * Returns current rotation angle in degrees
     * @returns {number}
     */
    Game_CharacterBase.prototype.rotation = function () {
        return this._moveRouteTransforms.rotation.current;
    };

    /**
     * Rescale on x axis from current x scale to x + an offset
     * @param {number} scale Amount to offset the current scale by.
     * @param {number} duration How many frames it should take to reach target scale
     * @param {boolean} wait Wait for this operation to complete before moving to next command?
     */
    Game_CharacterBase.prototype.rescaleX = function (scale = 0, duration = 1, wait = false) {
        this.rescaleXTo(this.scaleX() + scale, duration, wait);
    }

    /**
     * Rescale on x axis from current x scale to a target x scale
     * @param {number} scale Target scale to finish at
     * @param {number} duration How many frames it should take to reach target scale
     * @param {boolean} wait Wait for this operation to complete before moving to next command?
     */
    Game_CharacterBase.prototype.rescaleXTo = function (scale = 1, duration = 1, wait = false) {
        setTarget.call(this, this._moveRouteTransforms.scaleX, this.scaleX(), scale, duration);
        if (wait) {
            this._waitCount = duration;
        }
    };

    /**
     * Rescale on y axis from current y scale to y + an offset
     * @param {number} scale Amount to offset the current scale by.
     * @param {number} duration How many frames it should take to reach target scale
     * @param {boolean} wait Wait for this operation to complete before moving to next command?
     */
    Game_CharacterBase.prototype.rescaleY = function (scale = 0, duration = 1, wait = false) {
        this.rescaleYTo(this.scaleY() + scale, duration, wait);
    };

    /**
     * Rescale on y axis from current y scale to a target y scale
     * @param {number} scale Target scale to finish at
     * @param {number} duration How many frames it should take to reach target scale
     * @param {boolean} wait Wait for this operation to complete before moving to next command?
     */
    Game_CharacterBase.prototype.rescaleYTo = function (scale = 1, duration = 1, wait = false) {
        setTarget.call(this, this._moveRouteTransforms.scaleY, this.scaleY(), scale, duration);
        if (wait) {
            this._waitCount = duration;
        }
    };

    /**
     * Add a value to x and y scales
     * @param {number} x Target x scale
     * @param {number} y target y scale
     * @param {number} duration How many frames it should take to reach these targets
     * @param {boolean} wait Wait for this operation to complete before moving to next command?
     */
     Game_CharacterBase.prototype.rescale = function (x = 0, y = x, duration = 1, wait = false) {
        this.rescaleX(x, duration);
        this.rescaleY(y, duration);
        if (wait) {
            this._waitCount = duration;
        }
    };

    /**
     * Rescale on x and y axes to a target scale
     * @param {number} x Target x scale
     * @param {number} y target y scale
     * @param {number} duration How many frames it should take to reach these targets
     * @param {boolean} wait Wait for this operation to complete before moving to next command?
     */
    Game_CharacterBase.prototype.rescaleTo = function (x = 1, y = x, duration = 1, wait = false) {
        this.rescaleXTo(x, duration);
        this.rescaleYTo(y, duration);
        if (wait) {
            this._waitCount = duration;
        }
    };

    /**
     * Rotate from the character's current angle to a target angle
     * @param {number} angle Target angle to rotate to in degrees
     * @param {number} duration How many frames the rotation lasts
     * @param {boolean} wait Wait for this operation to complete before moving to next command?
     */
    Game_CharacterBase.prototype.rotateTo = function (angle = 0, duration = 1, wait = false) {
        setTarget.call(this, this._moveRouteTransforms.rotation, this.rotation(), angle, duration);
        if (wait) {
            this._waitCount = duration;
        }
    };

    /**
     * Offset the current rotation by the specified angle
     * @param {number} angle Target angle to offset current rotation in degrees
     * @param {number} duration How many frames the rotation lasts
     * @param {boolean} wait Wait for this operation to complete before moving to next command?
     */
    Game_CharacterBase.prototype.rotate = function (angle = 0, duration = 1, wait = false) {
        this.rotateTo(this.rotation() + angle, duration, wait);
    };

    /**
     * Translate x pixels away from the current y translation
     * @param {number} x Number of pixels in the x direction to translate by
     * @param {number} duration How long it should take for the character to move x pixels
     * @param {boolean} wait Wait for this operation to complete before moving to next command?
     */
     Game_CharacterBase.prototype.translateX = function (x = 0, duration = 1, wait = false) {
        this.translateXTo(this.translationX() + x, duration, wait);
    };

    /**
     * Translate from current x offset to a target value relative to character's 'main' collision
     * @param {number} x Number of pixels in the x direction to translate by
     * @param {number} duration How long it should take for the character to move x pixels
     * @param {boolean} wait Wait for this operation to complete before moving to next command?
     */
    Game_CharacterBase.prototype.translateXTo = function (x = 0, duration = 1, wait = false) {
        setTarget.call(this, this._moveRouteTransforms.transX, this.translationX(), x, duration);
        if (wait) {
            this._waitCount = duration;
        }
    };

    /**
     * Translate y pixels away from the current y translation
     * @param {number} y Number of pixels in the y direction to translate by
     * @param {number} duration How long it should take for the character to move y pixels
     * @param {boolean} wait Wait for this operation to complete before moving to next command?
     */
     Game_CharacterBase.prototype.translateY = function (y = 0, duration = 1, wait = false) {
        this.translateYTo(this.translationY() + y, duration, wait);
    };

    /**
     * Translate from current y offset to a target value relative to character's 'main' collision
     * @param {number} y Number of pixels in the y direction to translate by
     * @param {number} duration How long it should take for the character to move x pixels
     * @param {boolean} wait Wait for this operation to complete before moving to next command?
     */
    Game_CharacterBase.prototype.translateYTo = function (y = 0, duration = 1, wait = false) {
        setTarget.call(this, this._moveRouteTransforms.transY, this.translationY(), y, duration);
        if (wait) {
            this._waitCount = duration;
        }
    };

    /**
     * A combined call for translateX and translateY
     * @param {number} x x offset from current translation
     * @param {number} y y offset from current translation
     * @param {number} duration How many frames this should last
     * @param {boolean} wait Wait for this operation to complete before moving to the next command?
     */

    Game_CharacterBase.prototype.translate = function (x = 0, y = x, duration = 1, wait = false) {
        this.translateX(x, duration);
        this.translateY(y, duration);
        if (wait) {
            this._waitCount = duration;
        }
    };

    /**
     * A combined call for translateXTo and translateYTo
     * @param {number} x Target x translation
     * @param {number} y Target y translation
     * @param {number} duration How many frames this should last
     * @param {boolean} wait Wait for this operation to complete before moving to the next command?
     */
    Game_CharacterBase.prototype.translateTo = function (x = 0, y = x, duration = 1, wait = false) {
        this.translateXTo(x, duration, wait);
        this.translateYTo(y, duration, wait);
        if (wait) {
            this._waitCount = duration;
        }
    };

    /**
     * Reset all transform values to defaults
     * @param {number} duration Number of frames that it takes to reset
     * @param {boolean} wait Wait for this operation to complete before moving to next command?
     */
    Game_CharacterBase.prototype.resetTransforms = function (duration = 1, wait = false) {
        this.rotateTo(0, duration);
        this.translateXTo(0, duration);
        this.translateYTo(0, duration);
        this.rescaleTo(1, 1, duration);
        if (wait) {
            this._waitCount = duration;
        }
    }

})(KCDev.MoveRouteTF);
