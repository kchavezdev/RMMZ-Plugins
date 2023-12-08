/*!

MIT License

Copyright (c) 2023 K. Chavez <kchavez.dev@gmail.com>

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
 * @author K. Chavez 
 * @url https://github.com/kchavezdev/RMMZ-Plugins
 * @target MZ
 *
 * @plugindesc [v1.0]Change whether the map shadow draws on top of or below characters.
 *
 * @help
 * KC_SetMapShadowLayer.js
 * 
 * A simple plugin that lets the developer set the map shadows (the ones drawn
 * by the shadow pencil) to draw on top of the player, followers, and any event
 * with its priority set to 'Same as characters' or 'Below characters'.
 * 
 * To set the shadow layer on a per-map basis, you can use the note tag
 * '<SHADOW_LAYER: [UPPER/LOWER]>' in the map notes.
 * 
 * Example usage:
 * <SHADOW_LAYER:UPPER> // shadows now draw on top of characters
 * 
 * <SHADOW_LAYER:LOWER> // shadows now draw below characters
 * 
 * Changelog:
 *     v1.0.0 - 2023/12/08
 *         - Initial release
 * 
 * @param defaultDrawingLayer
 * @text Default Layer
 * @desc Sets the shadow layer of maps without a note tag.
 * The default engine behavior is 'lower'.
 * @default lower
 * @type select
 * @option Upper
 * @value upper
 * @option Lower
 * @value lower
 */

'use strict';

// a general namespace for all of my plugins
var KCDev = KCDev || {};

KCDev.SetMapShadowLayer = {
    useDefaultEngineBehavior: false,
    drawOnUpperLayerForCurrentMap: false,
};

{
    const scriptName = document.currentScript.src.split("/").pop().replace(/\.js$/, '');
    KCDev.SetMapShadowLayer.useDefaultEngineBehavior = PluginManager.parameters(scriptName).defaultDrawingLayer !== 'upper';
}

KCDev.SetMapShadowLayer.Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function (mapId) {
    KCDev.SetMapShadowLayer.Game_Map_setup.apply(this, arguments);

    let shouldDrawOnUpperLayer = !KCDev.SetMapShadowLayer.useDefaultEngineBehavior;
    let /**@type {string?} */ notetag = $dataMap.meta.SHADOW_LAYER;
    if (notetag) {
        notetag = notetag.trim().toUpperCase();
        if (notetag === 'UPPER') {
            shouldDrawOnUpperLayer = true;
        }
        else if (notetag === 'LOWER') {
            shouldDrawOnUpperLayer = false;
        }
    }

    KCDev.SetMapShadowLayer.drawOnUpperLayerForCurrentMap = shouldDrawOnUpperLayer;
};

KCDev.SetMapShadowLayer.Tilemap_addShadow = Tilemap.prototype._addShadow;
Tilemap.prototype._addShadow = function(layer, shadowBits, dx, dy) {
    if (KCDev.SetMapShadowLayer.drawOnUpperLayerForCurrentMap) {
        arguments[0] = this._upperLayer;
    }
    KCDev.SetMapShadowLayer.Tilemap_addShadow.apply(this, arguments);
};

