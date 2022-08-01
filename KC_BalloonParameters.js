/*!

MIT License

Copyright (c) 2022 K. Chavez <kchavez.dev@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

/*:
 * @target MZ
 * 
 * @author K. Chavez 
 * @url https://github.com/kchavezdev/RMMZ-Plugins
 * @target MZ
 * @base PluginCommonBase
 * @orderafter PluginCommonBase
 * 
 * @plugindesc [v1.0]Edit various balloon parameters.
 * 
 * @help
 * 
 * This is a simple plugin that allows the developer to edit various traits
 * of the built-in balloons of RPG Maker MZ.
 * 
 * If you want to have a balloon file with balloons at a resolution other than
 * 48 * 48, then keep a placeholder file in the system folder with the name
 * "Balloon" where each Balloon is 48 * 48, and set a new balloon file with
 * the appropriate width and height in the plugin parameters.
 *
 * @param width
 * @text Balloon Width
 * @type number
 * @desc Enter the width in pixels of your balloons.
 * @default 48
 * 
 * @param height
 * @text Balloon Height
 * @type number
 * @desc Enter the height in pixels of your balloons.
 * @default 48
 *
 * @param filename
 * @text Balloon File
 * @type file
 * @desc This should be the actual file name of your new balloons in the System folder.
 * @dir img/system/
 * @default Balloon
 * 
 * @param scaleX
 * @text Balloon X Scale
 * @type number
 * @decimals 2
 * @desc Enter the X scale factor of your balloons.
 * @default 1
 * 
 * @param scaleY
 * @text Balloon Y Scale
 * @type number
 * @decimals 2
 * @desc Enter the Y scale factor of your balloons.
 * @default 1
 * 
 */

var KCDev = KCDev || {};
KCDev.BalloonParameters = {};

(($) => {
    'use strict';

    const script = document.currentScript;
    const parameters = PluginManagerEx.createParameter(script);

    // temporarily change balloon params
    $.setParams = function (filename = "Balloon", width = 48, height = 48, scaleX = 1, scaleY = 1) {
        $.filename = filename;
        $.width = width;
        $.height = height;
        $.scaleX = scaleX;
        $.scaleY = scaleY;
        ImageManager.loadSystem(filename);
    };

    $.defaults = [
        parameters.filename,
        parameters.width,
        parameters.height,
        parameters.scaleX,
        parameters.scaleY
    ];

    $.setParams(...$.defaults);

    // set defaults on new game
    $.DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function () {
        $.DataManager_createGameObjects.apply(this, arguments);
        $.setParams(...$.defaults);
    };

    Sprite_Balloon.prototype.loadBitmap = function () {
        this.bitmap = ImageManager.loadSystem($.filename);
        this.setFrame(0, 0, 0, 0);
    };

    Sprite_Balloon.prototype.updateFrame = function () {
        const w = $.width;
        const h = $.height;
        const sx = this.frameIndex() * w;
        const sy = (this._balloonId - 1) * h;
        this.setFrame(sx, sy, w, h);
    };

    const _setup = Sprite_Balloon.prototype.setup;
    Sprite_Balloon.prototype.setup = function () {
        _setup.apply(this, arguments);
        this.scale.x = $.scaleX;
        this.scale.y = $.scaleY;
    };

})(KCDev.BalloonParameters);
