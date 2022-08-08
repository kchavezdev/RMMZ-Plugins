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

/**
 * Installation instructions:
 * 1. Copy PluginCommonBase and PluginBaseFunction into your project's \js\plugins folder
 *      a. If you're using the Steam version of MZ, you can find these plugins in
 *         \steamapps\common\RPG Maker MZ\dlc\BasicResources\plugins\official
 * 2. Place this plugin into your project's \js\plugins folder
 * 3. Open the Plugin Manager and add and enable PluginCommonBase and PluginBaseFunction
 * 4. Add this plugin BELOW PluginCommonBase and enable it
 */

/*:
 * @author K. Chavez 
 * @url https://github.com/kchavezdev/RMMZ-Plugins
 * @target MZ
 * @base PluginBaseFunction
 * @orderafter PluginBaseFunction
 *
 * @plugindesc [v1.0]Combine graphics to create layered bitmaps.
 *
 * @help
 * KC_CompositeBitmaps.js
 * 
 * This plugin allows the developer to dynamically generate new character
 * graphics on the fly by layering other pre-existing graphics. A character
 * graphic that is made up of other graphics in this way is called a
 * composite bitmap for the purposes of this plugin.
 *
 * Due to the way RPG Maker MZ loads images for the file select and how I wrote
 * this plugin, party members who use composite bitmaps will have strange
 * behavior on the file save and load screen, so one of the parameters of this
 * plugin relates to whether to try and mitigate these oddities. Enabling this
 * parameter works out of the box with the vanilla save screen, but any custom
 * save screens will likely need patches to properly display this plugin.
 * 
 * The other parameters of this plugin allow the developer to set up composite
 * bitmaps that are created upon a new game save file being launched. This is
 * used in the demo to set up the main character's sprites.
 *
 * Composite bitmaps are constructed via the plugin commands and are saved with
 * each game file. Since the only things saved are lists of file names, the
 * overall save file size increase should be minor.
 *
 * Layers are drawn from the bottom (last entry) in the array to the topmost
 * (first) layer.
 * 
 * For Faces and Side view actors, the proxy image is discarded in its
 * entirety, and you cannot use the proxy as a layer.
 * 
 * For character proxies, each character set is not replaced until it has at
 * least one layer. So, for example, if you have a sheet with characters in
 * indexes 1 and 2 and use the "Add Character Layers" for index 1 of that
 * image, then the character at index 1 will have their image replaced and the
 * character at index 2 will be unaffected until layers are put at that index.
 * 
 * The plugin commands are as follows:
 *
 * Commands:
 *  Add Face Layers
 *      | Replaces a face file with a composite bitmap or adds new
 *      | layers onto an existing composite bitmap
 * Remove all Face Layers
 *      | Restore original face file
 * Add Top View Character Layers
 *      | Replaces the character at a particular index in a TV character
 *      | file with a character built on a composite bitmap or adds onto
 *      | an existing composite bitmap
 * Remove All TV Character Layers
 *      | Restore top view character at an index to default appearance
 * Add SV Character Layers
 *      | Replace a side view actor image with a composite bitmap or add
 *      | onto an existing composite bitmap
 * Remove all SV Layers
 *      | Restore original side view actor image
 * Add Picture Layers
 *      | Replace a picture with a composite bitmap or add onto an
 *      | existing composite bitmap
 * Remove all Picture Layers
 *      | Restore original picture image
 * Save Graphic
 *      | Dump images (face/character/actor battler) to local computer storage
 *      | Also dumps current composite bitmap if proxy filename is used
 * 
 * @param fixSaveScreen
 * @text Modify Save Screen
 * @desc Aliases and overwrites some functions to make composite bitmaps appear when saving and loading.
 * @type boolean
 * @default false
 * 
 * @param presetCompositesParent
 * @text New Game Presets
 * 
 * @param presetCompFaces
 * @text Preset Face Composites
 * @desc These composite faces are set up when a new game is started.
 * @parent presetCompositesParent
 * @type struct<CompositeFaceStruct>[]
 * @default []
 * 
 * @param presetCompTv
 * @text Preset TV Composites
 * @desc These composite top view characters are set up when a new game is started.
 * @parent presetCompositesParent
 * @type struct<CompositeTvStruct>[]
 * @default []
 * 
 * @param presetCompSv
 * @text Preset SV Composites
 * @desc These composite side view characters are set up when a new game is started.
 * @parent presetCompositesParent
 * @type struct<CompositeSvStruct>[]
 * @default []
 * 
 * @param presetCompPics
 * @text Preset Picture Composites
 * @desc These composite pictures are set up when a new game is started.
 * @parent presetCompositesParent
 * @type struct<CompositePictureStruct>[]
 * @default []
 * 
 * @command addFaceLayers
 * @text Add Face Layers
 * @desc Add face layers.
 * 
 * @arg destination
 * @text Proxy File
 * @type file
 * @desc Specify the placeholder file name. Any time this face is drawn, the layers will be drawn instead.
 * @dir img/faces/
 * 
 * @arg layerInfos
 * @text Layer Images
 * @type struct<FaceLayerInfo>[]
 * @desc Specify the face file these new layers will draw from.
 * @default []
 * 
 * @command removeFaceLayers
 * @text Remove All Face Layers
 * @desc Remove every layer associated with this face and allow the face to be drawn normally.
 * 
 * @arg destination
 * @text Proxy File
 * @type file
 * @desc The placeholder face name we will remove all layers from.
 * @dir img/faces/
 * 
 * @command addTvLayers
 * @text Add TV Character Layers
 * @desc Add a new top view character image on top of the current one.
 * 
 * @arg destination
 * @text Proxy File
 * @type file
 * @desc Specify the placeholder file name. Any time this character is drawn, the layers will be drawn instead.
 * @dir img/characters/
 * 
 * @arg destinationIndex
 * @text Proxy Index
 * @type number
 * @desc Specify index of the character sprites we will replace with layers. Ignored for big characters.
 * @default 0
 * @min -1
 * 
 * @arg layerInfos
 * @text Layer Images
 * @desc Combine these character graphics. First image is the top layer.
 * @type struct<CharLayerInfo>[]
 * @default []
 * 
 * @command removeTvLayers
 * @text Remove All TV Character Layers
 * @desc Remove every layer associated with this top view character and allow the character to be drawn normally.
 * 
 * @arg destination
 * @text Proxy File
 * @type file
 * @desc The placeholder character file name we will remove all layers from.
 * @dir img/characters/
 * 
 * @arg destinationIndex
 * @text Proxy Index
 * @type number
 * @desc Specify the index of the character sprites we will clear layers from.
 * @min -1
 * @default 0
 * 
 * @command addSvLayers
 * @text Add SV Character Layers
 * @desc Add new SV images on top of the selected one.
 * 
 * @arg destination
 * @text Proxy File
 * @type file
 * @desc Specify the placeholder file name. Any time this SV character is drawn, the layers will be drawn instead.
 * @dir img/sv_actors/
 * 
 * @arg layers
 * @text Layer Images
 * @type file[]
 * @desc The SV actor images that will be combined. First element is the top layer.
 * @dir img/sv_actors/
 * @default []
 * 
 * @command removeSvLayers
 * @text Remove All SV Layers
 * @desc Remove every layer associated with this battler and allow the character to be drawn normally.
 * 
 * @arg destination
 * @text Proxy File
 * @type file
 * @desc The placeholder battler file name we will remove all layers from.
 * @dir img/sv_actors/
 * 
 * @command addPictureLayers
 * @text Add Picture Layers
 * @desc Add new picture layers on top of the selected one.
 * 
 * @arg destination
 * @text Proxy File
 * @type file
 * @desc Specify the placeholder file name. Any time this picture is drawn, the layers will be drawn instead.
 * @dir img/pictures/
 * 
 * @arg layers
 * @text Layer Images
 * @type file[]
 * @desc The pictures that will be combined. First element is the top layer.
 * @dir img/pictures/
 * @default []
 * 
 * @command removePictureLayers
 * @text Remove All Picture Layers
 * @desc Remove every layer associated with this picture and allow the picture to be drawn normally.
 * 
 * @arg destination
 * @text Proxy File
 * @type file
 * @desc The placeholder picture name we will remove all layers from.
 * @dir img/pictures/
 * 
 * @command dumpGraphic
 * @text Save Graphic (PC/DEBUG)
 * @desc Save a graphic to disk as a png.
 * Useful for seeing composite bitmaps in full.
 * 
 * @arg path
 * @text Folder Path
 * @desc This folder is where the graphics will be saved.
 * @type string
 * @default ./dumped_graphics/
 * 
 * @arg faces
 * @text Face Bitmaps
 * @desc List of face files to dump.
 * @type file[]
 * @dir img/faces/
 * 
 * @arg chars
 * @text Character Bitmaps
 * @desc List of character files to dump.
 * @type file[]
 * @dir img/characters/
 * 
 * @arg svActors
 * @text SV Actor Bitmaps
 * @desc List of side view actor files to dump.
 * @type file[]
 * @dir img/sv_actors/
 * 
 * @arg pictures
 * @text Picture Bitmaps
 * @desc List of picture files to dump.
 * @type file[]
 * @dir img/pictures/
 * 
 */
/*~struct~CharLayerInfo:
 *
 * @param source
 * @text Source Image
 * @desc Choose the image you want to add as a new layer.
 * @type file
 * @dir img/characters/
 * 
 * @param sourceIndex
 * @text Index
 * @desc Choose which index will be used as the layer.
 * This parameter is ignored for big characters.
 * @type number
 * @min 0
 * @default 0
 * 
 */
/*~struct~FaceLayerInfo:
 *
 * @param source
 * @text Source Image
 * @desc Choose the image you want to add as a new layer.
 * @type file
 * @dir img/faces/
 * 
 * @param sourceIndex
 * @text Index
 * @desc If an index > -1 is specified, the face image at that index will be copied to every slot in the composite image.
 * @type number
 * @min -1
 * @default -1
 */
/*~struct~CompositeFaceStruct:
 * @param destination
 * @text Proxy File
 * @type file
 * @desc Specify the placeholder file name. Any time this face is drawn, the layers will be drawn instead.
 * @dir img/faces/
 * 
 * @param layerInfos
 * @text Layer Images
 * @type struct<FaceLayerInfo>[]
 * @desc Specify the face file these new layers will draw from.
 * @default []
 */
/*~struct~CompositeTvStruct:
 * @param destination
 * @text Proxy File
 * @type file
 * @desc Specify the placeholder file name. Any time this character is drawn, the layers will be drawn instead.
 * @dir img/characters/
 * 
 * @param destinationIndex
 * @text Proxy Index
 * @type number
 * @desc Specify index of the character sprites we will replace with layers. Ignored for big characters.
 * @default 0
 * @min -1
 * 
 * @param layerInfos
 * @text Layer Images
 * @desc Combine these character graphics. First image is the top layer.
 * @type struct<CharLayerInfo>[]
 * @default []
 */
/*~struct~CompositeSvStruct:
 * @param destination
 * @text Proxy File
 * @type file
 * @desc Specify the placeholder file name. Any time this SV character is drawn, the layers will be drawn instead.
 * @dir img/sv_actors/
 * 
 * @param layers
 * @text Layer Images
 * @type file[]
 * @desc The SV actor images that will be combined. First element is the top layer.
 * @dir img/sv_actors/
 * @default []
 */
/*~struct~CompositePictureStruct:
 * @arg destination
 * @text Proxy File
 * @type file
 * @desc Specify the placeholder file name. Any time this picture is drawn, the layers will be drawn instead.
 * @dir img/pictures/
 * 
 * @arg layers
 * @text Layer Images
 * @type file[]
 * @desc The pictures that will be combined. First element is the top layer.
 * @dir img/pictures/
 * @default []
 */

// general namespace for my plugins
var KCDev = KCDev || {};

// this plugin's namespace
KCDev.CompositeBitmaps = {};

(($) => {
    'use strict';

    $.faceLayers = {};
    $.tvCharLayers = {};
    $.svCharLayers = {};
    $.picLayers = {};

    $.cache = new Map();

    const script = document.currentScript;

    $.fixLoadScreen = PluginManagerEx.createParameter(script).fixSaveScreen;

    $.FACE_PREFIX = 'fc';
    $.TOP_VIEW_PREFIX = 'tv';
    $.SIDE_VIEW_PREFIX = 'sv';
    $.PICTURE_PREFIX = 'pc';

    // parent composite class that is the base for all composite bitmaps
    class Composite_Bitmap extends Bitmap {
        constructor(layerInfos, ImgManagerLoader = Bitmap.load) {

            super();

            this._images = [];
            layerInfos.forEach(info => {
                this._images.push(info.filename);
            });
            this._ImgManagerLoader = ImgManagerLoader;
            this._bitmaps = [];
        }

        _loadCallback() {
            this._numToLoad--;

            if (this._numToLoad <= 0) {
                this._onLoad();

            }
        }

        // this function is called after all images are done loading
        // override me!
        _processLoadedImages() { return true; }

        _onLoad() {

            if (this._images.length > 0) {

                this._bitmaps = [];

                this._images.forEach(img => {
                    this._bitmaps.push(this._ImgManagerLoader.call(ImageManager, img))
                });
                this._loadingState = this._processLoadedImages() ? "loaded" : "loading";
                if (this.isReady()) {
                    // don't need bitmaps anymore so get rid of them
                    delete this._bitmaps;
                }
            }
            else {
                this._loadingState = "none";
            }
            if (this.isReady()) {
                this._callLoadListeners();
            };
        }

        _startLoading() {
            this._numToLoad = this._images.length;

            this._loadingState = "loading";

            this._images.forEach(img => {
                const bmp = this._ImgManagerLoader.call(ImageManager, img);
                bmp.addLoadListener(this._loadCallback.bind(this));
            });
        }

        // override me too!
        static load() {
            return new Bitmap();
        }
    }

    class Composite_Face_Bitmap extends Composite_Bitmap {
        constructor(layerInfos) {

            super(layerInfos, ImageManager.loadFace);

            this._layerInfos = layerInfos;

            this._startLoading();
        }

        _processLoadedImages() {
            const fw = ImageManager.faceWidth;
            const fh = ImageManager.faceHeight;

            // default face image dimensions
            let width = fw * 4;
            let height = fh * 2;

            /* When layering face images, there are two "modes", and the one used is determined
             * by whether the index argument passed in to the plugin command is a valid index.
             * 
             * A valid index is defined as an index greater than or equal to 0.
             * An invalid index is defined as an index less than 0.
             * 
             * The first of the two modes is known as "dynamic" and is used when the index is
             * invalid. This is the simpler of the two modes. In this mode, the entire face
             * image defined in the layer information is copied over the Composite Face Image.
             * 
             * One of the more notable use cases for dynamic mode is for face sets that represent
             * an emote set. One could place all of the facial expressions on a dynamic layer and
             * build the other layers with the static mode, which will be defined next.
             * 
             * The second mode is known as "static" and is useful for parts you will want to use
             * on all slots in the face set. Static mode is used in cases where the index is valid.
             * This mode takes the face at the index in the face image defined in the layer info
             * and copies it over to all slots in the final face image.
             * 
             * To build on the emote face set example earlier, this can be used for layers containing
             * solely parts that do not change from face to face, like hair or clothes.
             */
            this._layerInfos.filter(info => info.index < 0).forEach(info => {
                const bmp = ImageManager.loadFace(info.filename);
                if (width < bmp.width) width = bmp.width;
                if (height < bmp.height) height = bmp.height;
            });

            this.resize(width, height);

            this._layerInfos.forEach(info => {

                const bmp = this._ImgManagerLoader.call(ImageManager, info.filename);
                const index = info.index;

                if (index < 0) {
                    // dynamic mode
                    this.blt(bmp, 0, 0, bmp.width, bmp.height, 0, 0);
                }
                else {
                    // static mode
                    const numCols = Math.floor(this.width / fw);
                    const numRows = Math.floor(this.height / fh);
                    const sw = fw;
                    const sh = fh;
                    const sx = Math.floor((index % 4) * fw + (fw - sw) / 2);
                    const sy = Math.floor(Math.floor(index / 4) * fh + (fh - sh) / 2);

                    if (sx > bmp.width || sy > bmp.height) {
                        console.error("COMPOSITE BITMAP FACE ERROR:\nIndex " + index +
                            " WAS OUT OF RANGE FOR FACE IMAGE " + info.filename +
                            "!\nSkipping this layer..."
                        )
                        return;
                    }

                    for (let i = 0; i < numCols; i++) {
                        for (let j = 0; j < numRows; j++) {
                            const dx = i * fw;
                            const dy = j * fh;

                            this.blt(bmp, sx, sy, sw, sh, dx, dy);
                        }
                    }
                }
            });

            return true;
        }

        static load(layerInfos) {
            return new Composite_Face_Bitmap(layerInfos);
        }
    };

    class Composite_Character_Bitmap extends Composite_Bitmap {

        constructor(layerInfos, origName) {

            super(layerInfos, ImageManager.loadCharacter);

            this._orig = origName;

            this._isBig = ImageManager.isBigCharacter(origName);

            this._layerInfos = layerInfos;

            this._startLoading();
        }

        _processLoadedImages() {

            const /**@type {Bitmap} */ origBmp = $.ImageManager_loadCharacter.call(ImageManager, this._orig);

            // original bitmap isn't ready for some reason?
            // go load it and come back...
            if (!origBmp.isReady()) {
                this._numToLoad++;
                origBmp.addLoadListener(this._onLoad.bind(this));
                return false;
            }

            this._smooth = origBmp._smooth;
            this._updateScaleMode();

            this.resize(origBmp.width, origBmp.height);

            this.blt(origBmp, 0, 0, origBmp.width, origBmp.height, 0, 0);

            const dw = (this._isBig) ? this.width : Math.floor(this.width / 4);
            const dh = (this._isBig) ? this.height : Math.floor(this.height / 2);

            const firstLayerSet = Array(8);
            firstLayerSet.fill(false);

            this._layerInfos.forEach(info => {

                const src = this._ImgManagerLoader.call(ImageManager, info.filename);

                const si = info.sIndex;
                const di = info.dIndex;

                const sw = (info._isBig) ? src.width : Math.floor(src.width / 4);
                const sh = (info._isBig) ? src.height : Math.floor(src.height / 2);

                if (sw > dw || sh > dh) {
                    console.error("Source bitmap " + info.filename + " was too large to be copied to destination bitmap!\nSkipping...");
                    return;
                }

                const sx = Math.floor((si % 4) * sw);
                const sy = Math.floor(si / 4) * sh;
                const dx = Math.floor((di % 4) * dw);
                const dy = Math.floor(di / 4) * dh;

                // clears the area if this is the first layer
                if (!firstLayerSet[di]) {
                    this.clearRect(dx, dy, dw, dh);
                    firstLayerSet[di] = true;
                }

                this.blt(src, sx, sy, sw, sh, dx, dy, dw, dh);

            });

            return true;
        }

        static load(layerInfos, origName) {
            return new Composite_Character_Bitmap(layerInfos, origName);
        }
    };

    class Composite_SV_Bitmap extends Composite_Bitmap {
        constructor(layerInfos) {
            super(layerInfos, ImageManager.loadSvActor);
            this._startLoading();
        }

        _processLoadedImages() {
            const /**@type {Bitmap[]} */ bitmaps = this._bitmaps;

            this.resize(bitmaps[0].width, bitmaps[0].height);

            bitmaps.forEach(bmp => {
                this.blt(bmp, 0, 0, bmp.width, bmp.height, 0, 0);
            });

            return true;
        }

        static load(images) {
            return new Composite_SV_Bitmap(images);
        }
    };

    class Composite_Picture_Bitmap extends Composite_Bitmap {
        constructor(layerInfos) {
            super(layerInfos, ImageManager.loadPicture);
            this._startLoading();
        }

        _processLoadedImages() {
            /**
             * @type {Bitmap[]}
             */
            const bitmaps = this._bitmaps;

            this.resize(bitmaps[0].width, bitmaps[0].height);

            bitmaps.forEach(bmp => {
                this.blt(bmp, 0, 0, bmp.width, bmp.height, 0, 0);
            });

            return true;
        }

        static load(images) {
            return new Composite_Picture_Bitmap(images);
        }
    };

    /**
     * 
     * @param {string} filename 
     * @param {Object} layerInfos 
     * @param {string} prefix 
     * @param {() => void} compositeLoadFunc 
     * @returns {Bitmap}
     */
    $.setupComposite = function (filename, layerInfos, prefix, compositeLoadFunc) {
        const config = JsonEx.stringify(layerInfos);

        filename = prefix + filename;

        const /**@type {Map<string, string>} */ cache = $.cache;

        if (cache.has(filename)) {
            const cached = cache.get(filename);

            // check if the config has changed since last check
            if (cached.config === config) {
                return cached.bitmap;
            }
            else {
                // layers have changed
                // so remove this entry from the cache and continue
                cache.delete(filename);
            }
        }

        const compBmp = compositeLoadFunc(layerInfos);

        cache.set(filename, { bitmap: compBmp, config: config });

        return compBmp;
    }
    function setupComposite() { return $.setupComposite.apply(this, arguments); }

    $.Composite_Bitmap = Composite_Bitmap;
    $.Composite_Character_Bitmap = Composite_Character_Bitmap;
    $.Composite_Face_Bitmap = Composite_Face_Bitmap;
    $.Composite_SV_Bitmap = Composite_SV_Bitmap;
    $.Composite_Picture_Bitmap = Composite_Picture_Bitmap;

    /**
     * Removes composite bitmaps from the cache if one of their layers is the composite bitmap with the name layerName
     * @param { string } layerName The name of the layer that will be invalidated.
     * @param { string } prefix The prefix of this layer type in the cache.
     * @returns { void }
     */
    $.invalidateCachedComposites = function (layerName, prefix) {

        const /**@type {Map<any,string>} */ cache = $.cache;

        for (const pair of cache.entries()) {
            if (pair[0].startsWith(prefix)) {
                const cached = pair[1];

                if (cached.bitmap._images.includes(layerName)) {
                    cached.bitmap.destroy();
                    cache.delete(pair[0]);
                }
            }
        }
    }
    function invalidateCachedComposites() { $.invalidateCachedComposites.apply(this, arguments); }

    /**
     * Returns true if adding the layer filename does not exist in layerInfos.
     * @param { string } filename Name of the graphic that we are checking for circular references of
     * @param { { filename: string, ... }[] } layerInfos Object that contains layerInfos objects that might contain circular refs.
     * @param { {}[] } layerInfosDict This is the object that associates filenames to layerInfos arrays.
     * @returns { boolean }
     */
    function isNotCircularRef(filename, layerInfos, layerInfosDict) {

        if (!layerInfos) return true;

        let result = true;

        for (let i = 0; i < layerInfos.length && result; i++) {
            const layerFile = layerInfos[i].filename;

            result = result &&
                filename !== layerFile &&
                isNotCircularRef(filename, layerInfosDict[layerFile], layerInfosDict);
        }

        return result;
    }

    /**
     * A simple logging function called when the developer creates a circular reference.
     * @param { string } source Image that we were trying to add as a new layer.
     * @param { string } destination Name of the composite bitmap we tried to add source to.
     * @returns { void }
     */
    function logCircularRef(source, destination) {
        console.error("Detected circular reference when trying to add " + source + " to " + destination + "!\nIgnoring layer...");
    }

    /**
     * Adds a face layer source to a destination composite bitmap.
     * @param {string} source Image we are trying to add as a new layer.
     * @param {string} destination File name of the composite bitmap.
     * @param {number} sourceIndex Index of the face file in the source bitmap we want to copy to the destination bitmap. 
     */
    $.addFaceLayer = function (source, destination, sourceIndex) {
        $.faceLayers[destination] = $.faceLayers[destination] || [];

        if (isNotCircularRef(destination, $.faceLayers[destination], $.faceLayers)) {
            $.faceLayers[destination].push({ filename: source, index: sourceIndex });

            invalidateCachedComposites(destination, $.FACE_PREFIX);

            if ($gameParty.inBattle()) {
                $gameTemp.requestBattleRefresh();
            }
        }
        else {
            logCircularRef(source, destination);
        }
    };

    function addFaceLayers(args) {
        const layerInfos = args.layerInfos;

        if (Array.isArray(layerInfos)) {
            while (layerInfos.length > 0) {
                const info = layerInfos.pop();
                $.addFaceLayer(info.source, args.destination, info.sourceIndex);
            }
        }
    }

    PluginManagerEx.registerCommand(script, "addFaceLayers", addFaceLayers);

    /**
     * @param {string} faceName Face file name to be removed
     */
    $.removeFaceLayers = function (faceName) {
        delete $.faceLayers[faceName];
        invalidateCachedComposites(faceName, $.FACE_PREFIX);
        if ($gameParty.inBattle()) {
            $gameTemp.requestBattleRefresh();
        }
    }

    function removeFaceLayers (args) {
        $.removeFaceLayers(args.destination);
    }

    PluginManagerEx.registerCommand(script, "removeFaceLayers", removeFaceLayers);

    /**
     * Refreshes the sprites of all characters using composite bitmaps on the map.
     */
    $.refreshMapCompositeChars = function () {
        if (SceneManager.isCurrentScene(Scene_Map)) {
            const /**@type {Sprite_Character[]} */ mapSprites = SceneManager._scene._spriteset._characterSprites;
            mapSprites.filter(sprite => $.tvCharLayers[sprite._characterName]).forEach(
                sprite => { sprite._characterName = ""; sprite.updateBitmap(); }
            );
        }
    };

    /**
     * Draws character sprites from a source bitmap to the top of a destination bitmap.
     * @param {string} source File the character graphics will be copied from
     * @param {string} destination Composite bitmap the source will be copied over
     * @param {number} sourceIndex Index of the graphics that will be copied form source. Ignored if source is a big character.
     * @param {number} destinationIndex Index that the source graphics will by copied onto in the destination. Ignored if destination is a big character.
     */
    $.addTvLayer = function (source, destination, sourceIndex, destinationIndex) {
        $.tvCharLayers[destination] = $.tvCharLayers[destination] || [];

        if (isNotCircularRef(destination, $.tvCharLayers[destination], $.tvCharLayers)) {

            $.tvCharLayers[destination].push({
                filename: source,
                sIndex: sourceIndex,
                dIndex: destinationIndex,
                _isBig: ImageManager.isBigCharacter(source)
            });

            invalidateCachedComposites(destination, $.TOP_VIEW_PREFIX);
        }
        else {
            logCircularRef(source, destination);
        }
    };

    function addTvLayers(args) {
        const layerInfos = args.layerInfos;
        const dest = args.destination;
        const destination_index = (ImageManager.isBigCharacter(dest)) ? 0 : args.destinationIndex;

        if (Array.isArray(layerInfos)) {
            while (layerInfos.length > 0) {
                const layerInfo = layerInfos.pop();
                const source_index = (ImageManager.isBigCharacter(layerInfo.source)) ? 0 : layerInfo.sourceIndex;
                $.addTvLayer(layerInfo.source, dest, source_index, destination_index);
            }
            $.refreshMapCompositeChars();
        }
    }

    PluginManagerEx.registerCommand(script, "addTvLayers", addTvLayers);

    function removeTvLayers(args) {
        const key = args.destination;

        const chArr = $.tvCharLayers[key];

        if (Array.isArray(chArr)) {
            const index = args.destinationIndex;
            if (index >= 0) {
                $.tvCharLayers[key] = chArr.filter(info => info.dIndex !== index);

                if ($.tvCharLayers[key].length < 1) {
                    delete $.tvCharLayers[key];
                }

            }
            else {
                delete $.tvCharLayers[key];
            }

            invalidateCachedComposites(key, $.TOP_VIEW_PREFIX);
            $.refreshMapCompositeChars();
        }
    }

    PluginManagerEx.registerCommand(script, "removeTvLayers", removeTvLayers);

    /**
     * Refresh all side view battlers using composite bitmaps.
     */
    $.refreshSVBattlers = function () {
        if ($gameParty.inBattle()) {
            BattleManager._spriteset.battlerSprites().forEach(sprite => {
                // only actor SV sprites should have a setupWeaponAnimation function
                if (sprite.setupWeaponAnimation && $.svCharLayers[sprite._battlerName]) {
                    sprite._battlerName = "";
                    sprite.updateBitmap();
                }
            });
        }
    };

    /**
     * Adds a new side view layer to the composite bitmap destination
     * @param {string} source This graphic will be copied on top of the destination bitmap.
     * @param {string} destination This is the bitmap the source will be copies to.
     */
    $.addSvLayer = function (source, destination) {
        $.svCharLayers[destination] = $.svCharLayers[destination] || [];

        if (isNotCircularRef(destination, $.svCharLayers[destination], $.svCharLayers)) {
            $.svCharLayers[destination].push({ filename: source });

            invalidateCachedComposites(destination, $.SIDE_VIEW_PREFIX);

            $.refreshSVBattlers();
        }
        else {
            logCircularRef(source, destination);
        }
    };

    function addSvLayers(args) {
        const layers = args.layers;
        if (Array.isArray(layers)) {
            while (layers.length > 0) {
                $.addSvLayer(layers.pop(), args.destination)
            }
        }
    }

    PluginManagerEx.registerCommand(script, "addSvLayers", addSvLayers);

    function removeSvLayers(args) {
        delete $.svCharLayers[args.destination];

        invalidateCachedComposites(args.destination, $.SIDE_VIEW_PREFIX);

        $.refreshSVBattlers();
    }

    PluginManagerEx.registerCommand(script, "removeSvLayers", removeSvLayers);

    $.addPictureLayer = function (source, destination) {
        $.picLayers[destination] = $.picLayers[destination] || [];

        if (isNotCircularRef(destination, $.picLayers[destination], $.picLayers)) {
            $.picLayers[destination].push({ filename: source });

            invalidateCachedComposites(destination, $.PICTURE_PREFIX);

        }
        else {
            logCircularRef(source, destination);
        }
    };

    function addPictureLayers(args) {
        const layers = args.layers;
        if (Array.isArray(layers)) {
            while (layers.length > 0) {
                $.addPictureLayer(layers.pop(), args.destination)
            }
        }
    }

    PluginManagerEx.registerCommand(script, "addPictureLayers", addPictureLayers);

    function removePictureLayers(args) {
        delete $.picLayers[args.destination];

        invalidateCachedComposites(args.destination, $.PICTURE_PREFIX);
    }

    PluginManagerEx.registerCommand(script, "removePictureLayers", removePictureLayers);

    PluginManagerEx.registerCommand(script, 'dumpGraphic', args => {
        const path = require('path');
        const fs = require('fs');
        const dirPath = path.resolve(args.path);

        fs.access(dirPath, error => {

            function writeImg(error) {
                if (error) {
                    console.error("Could not create directory " + dirPath);
                    return;
                }

                const faces = args.faces;
                const chars = args.chars;
                const svActors = args.svActors;
                const pics = args.pictures;

                function dumpFiles(fileList, prefix, loadFunc) {
                    if (Array.isArray(fileList)) {
                        fileList.forEach(file => {
                            loadFunc.call(ImageManager, file).addLoadListener(bitmap => {
                                const filename = path.resolve(dirPath + '/' + prefix + file + '.png');
                                fs.writeFile(filename, bitmapToPng(bitmap), (e) => {
                                    if (e) {
                                        console.error(e);
                                        console.error("Could not save " + filename);
                                    }
                                    console.log("Successfully saved " + filename);
                                });
                            });
                        });
                    }
                }

                dumpFiles(faces, 'fc_', ImageManager.loadFace);
                dumpFiles(chars, 'tv_', ImageManager.loadCharacter);
                dumpFiles(svActors, 'sv_', ImageManager.loadSvActor);
                dumpFiles(pics, 'pc_', ImageManager.loadPicture);

            }

            if (error) {
                fs.mkdir(dirPath, writeImg);
            } else {
                writeImg();
            }
        })
    });

    $.DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function () {
        $.DataManager_createGameObjects.apply(this, arguments);
        $.faceLayers = {};
        $.tvCharLayers = {};
        $.svCharLayers = {};
        $.picLayers = {};

        function applyNewGameLayers(param, presetProcFn) {
            if (Array.isArray(param)) {
                param.forEach(preset => {
                    presetProcFn(preset);
                })
            }
        }

        const parameters = PluginManagerEx.createParameter(script);

        applyNewGameLayers(parameters.presetCompFaces, addFaceLayers);
        applyNewGameLayers(parameters.presetCompTv, addTvLayers);
        applyNewGameLayers(parameters.presetCompSv, addSvLayers);
        applyNewGameLayers(parameters.presetCompPics, addPictureLayers);
    };

    const _makeSaveContents = $.DataManager_makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function () {
        const contents = _makeSaveContents.apply(this, arguments);
        contents.KCDev = contents.KCDev || {};
        contents.KCDev.CompositeBitmaps = {};
        const saved = contents.KCDev.CompositeBitmaps;
        saved.faceLayers = $.faceLayers;
        saved.tvCharLayers = $.tvCharLayers;
        saved.svCharLayers = $.svCharLayers;
        saved.picLayers = $.picLayers;
        $.cache.clear();
        return contents;
    };

    const _extractSaveContents = $.DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function (contents) {
        _extractSaveContents.apply(this, arguments);
        if (contents.KCDev?.CompositeBitmaps) {
            const saved = contents.KCDev.CompositeBitmaps;
            $.faceLayers = saved.faceLayers || {};
            $.tvCharLayers = saved.tvCharLayers || {};
            $.svCharLayers = saved.svCharLayers || {};
            $.picLayers = saved.picLayers || {};
        }
        $.cache.clear();
    };

    /**
     * Returns a buffer of data that represents the bitmap as a png.
     * @param {Bitmap} bitmap The bitmap that will be converted to a png
     * @returns {Buffer}
     */
    const bitmapToPng = $.bitmapToPng = function (bitmap) {

        let data = bitmap._canvas.toDataURL('image/png');
        data = data.replace(/^.*,/, '');

        const png = Buffer.from(data, 'base64');

        return png;
    }

    function recursivelyFlatten(layerInfos, compList, parentNames = new Set()) {
        let newInfos = [];
        layerInfos.forEach(layerInfo => {
            const filename = layerInfo.filename;

            // prevent circular references
            if (parentNames.has(filename)) {
                return;
            }

            const listEntry = compList[filename];
            if (listEntry) {
                // we create a copy of the set here because it is fine for an bitmap to appear
                // multiple times as long as it does not contain a ref to itself
                // therefore, we do not want to modify the parent's set
                const newParents = new Set(parentNames);
                newParents.add(filename);
                newInfos = newInfos.concat(recursivelyFlatten(listEntry, compList, newParents));

            }
            else {
                newInfos.push(layerInfo);
            }
        })

        return newInfos;
    }

    /**
     * Handle case where composite bitmaps are referenced within other composite bitmaps. We do this by "flattening" the layerInfos by looking at the images referenced in each layerInfos list and replacing the layer info entry if its name refers to a composite bitmap.
     * @param {string} filename The composite bitmap we will flatten
     * @param {{}[][]} compList The composite bitmap list we will reference.
     * @returns {{}[]}
     */
    const flattenLayerInfos = $.flattenLayerInfos = function (filename, compList) {

        const layerInfos = compList[filename];

        const parents = new Set();
        parents.add(filename);

        return layerInfos ? recursivelyFlatten(layerInfos, compList, parents) : [];
    };

    if ($.fixLoadScreen) {

        /**
         * Draws a face graphic directly from a passed in bitmap
         * @param {Bitmap} faceBitmap Bitmap to be drawn
         * @param {number} faceIndex Index of the face to be drawn
         * @param {number} x x coordinate to be drawn at
         * @param {number} y y coordinate to be drawn at
         * @param {number} width Width given to draw the face
         * @param {number} height Height given to draw the face
         */
        Window_Base.prototype.drawFaceFromBitmap = function (
            faceBitmap, faceIndex, x, y, width, height
        ) {
            width = width || ImageManager.faceWidth;
            height = height || ImageManager.faceHeight;
            const bitmap = faceBitmap;
            const pw = ImageManager.faceWidth;
            const ph = ImageManager.faceHeight;
            const sw = Math.min(width, pw);
            const sh = Math.min(height, ph);
            const dx = Math.floor(x + Math.max(width - pw, 0) / 2);
            const dy = Math.floor(y + Math.max(height - ph, 0) / 2);
            const sx = Math.floor((faceIndex % 4) * pw + (pw - sw) / 2);
            const sy = Math.floor(Math.floor(faceIndex / 4) * ph + (ph - sh) / 2);
            this.contents.blt(bitmap, sx, sy, sw, sh, dx, dy);
        };

        /**
         * Draws a game character graphic directly from an already-loaded bitmap.
         * @param {string} characterName Original file name of the character
         * @param {number} characterIndex Index of the character to be drawn. Ignored for big characters.
         * @param {number} x x coordinate of where the character will be drawn
         * @param {number} y y coordinate of where the character will be drawn
         * @param {Bitmap} characterBitmap The actual bitmap to draw
         */
        Window_Base.prototype.drawCharacterFromBitmap = function (
            characterName, characterIndex, x, y, characterBitmap
        ) {
            const bitmap = characterBitmap;
            const big = ImageManager.isBigCharacter(characterName);
            const pw = bitmap.width / (big ? 3 : 12);
            const ph = bitmap.height / (big ? 4 : 8);
            const n = big ? 0 : characterIndex;
            const sx = ((n % 4) * 3 + 1) * pw;
            const sy = Math.floor(n / 4) * 4 * ph;
            this.contents.blt(bitmap, sx, sy, pw, ph, x - pw / 2, y - ph);
        };

        const _makeSaveFileInfo = $.DataManager_makeSaveFileInfo = DataManager.makeSavefileInfo;
        DataManager.makeSavefileInfo = function () {
            const info = _makeSaveFileInfo.apply(DataManager, arguments);
            info.faceConfigs = {};
            info.faces.filter(face => $.faceLayers[face[0]]).forEach(face => {
                info.faceConfigs[face[0]] = flattenLayerInfos(face[0], $.faceLayers);
            });
            info.charConfigs = {};
            info.characters.filter(char => $.tvCharLayers[char[0]]).forEach(char => {
                info.charConfigs[char[0]] = flattenLayerInfos(char[0], $.tvCharLayers);
            });
            info.svConfigs = {};
            $gameParty.allMembers().filter(actor => $.svCharLayers[actor.battlerName()]).forEach(actor => {
                info.svConfigs[actor.battlerName()] = flattenLayerInfos(actor.battlerName(), $.svCharLayers);
            });
            return info;
        };

        // Get the necessary non-composite bitmaps into RMMZ's cache
        const loadAllConfigImages = function (configs, loadFunc) {
            if (!Array.isArray(configs)) return;

            for (const filename in configs) {
                configs[filename].forEach(layerInfo => {
                    loadFunc.call(ImageManager, layerInfo.filename);
                });
            }
        };

        $.DataManager_loadSavefileImages = DataManager.loadSavefileImages;
        DataManager.loadSavefileImages = function (info) {
            loadAllConfigImages(info.charConfigs, $.ImageManager_loadCharacter);
            loadAllConfigImages(info.faceConfigs, $.ImageManager_loadFace);
            loadAllConfigImages(info.svConfigs, $.ImageManager_loadSvActor);
            $.DataManager_loadSavefileImages.apply(DataManager, arguments);
        };

        // need to use original loadCharacter function for save screen due to flattened bitmaps
        class Composite_Character_Bitmap_Save_Screen extends Composite_Bitmap {
            constructor(layerInfos, origName) {
                super(layerInfos, $.ImageManager_loadCharacter);

                this._orig = origName;
    
                this._isBig = ImageManager.isBigCharacter(origName);
    
                this._layerInfos = layerInfos;
    
                this._startLoading();
            }

            _processLoadedImages = Composite_Character_Bitmap.prototype._processLoadedImages;

            static load(layerInfos, origName) {
                return new Composite_Character_Bitmap_Save_Screen(layerInfos, origName)
            }
        };

        $.Window_SavefileList_drawPartyCharacters = Window_SavefileList.prototype.drawPartyCharacters;
        Window_SavefileList.prototype.drawPartyCharacters = function (info, x, y) {
            if (info.characters) {
                let characterX = x;
                for (const data of info.characters) {
                    const filename = data[0];
                    const index = data[1];
                    const currX = characterX;
                    const layerInfo = info.charConfigs && info.charConfigs[filename];
                    const bitmap = (layerInfo) ?
                        new Composite_Character_Bitmap_Save_Screen(layerInfo, filename) :
                        $.ImageManager_loadCharacter(filename);
                    bitmap.addLoadListener(bitmap => { this.drawCharacterFromBitmap(filename, index, currX, y, bitmap); });
                    characterX += ImageManager.isBigCharacter(filename) ? Math.floor(bitmap.width / 3) : Math.floor(bitmap.width / 12);
                }
            }
        };

        // need to use original loadFace function for save screen due to flattened bitmaps
        class Composite_Face_Bitmap_Save_Screen extends Composite_Bitmap {
            constructor(layerInfos) {

                super(layerInfos, $.ImageManager_loadFace);
    
                this._layerInfos = layerInfos;
    
                this._startLoading();
            }

            _processLoadedImages = Composite_Face_Bitmap.prototype._processLoadedImages;

            static load(layerInfos) {
                return new Composite_Face_Bitmap_Save_Screen(layerInfos);
            }
        };

        Window_SavefileList.prototype.drawPartyfaces = function (info, x, y) {
            if (info.faces) {
                let characterX = x;
                for (const data of info.faces) {
                    const filename = data[0];
                    const index = data[1];
                    const layerInfo = info.faceConfigs && info.faceConfigs[filename];
                    const currX = characterX;
                    const bitmap = (layerInfo) ?
                        new Composite_Face_Bitmap_Save_Screen(layerInfo) :
                        $.ImageManager_loadFace(filename);
                    bitmap.addLoadListener(bitmap => { this.drawFaceFromBitmap(bitmap, index, currX, y); });
                    characterX += ImageManager.faceWidth + 6;
                }
            }
        };
    }

    $.ImageManager_loadFace = ImageManager.loadFace;
    ImageManager.loadFace = function (filename) {
        const layerInfos = $.faceLayers[filename];

        return (layerInfos) ? setupComposite(filename, layerInfos, $.FACE_PREFIX, Composite_Face_Bitmap.load)
            : $.ImageManager_loadFace.apply(this, arguments);
    };

    $.ImageManager_loadCharacter = ImageManager.loadCharacter;
    ImageManager.loadCharacter = function (filename) {
        const layerInfos = $.tvCharLayers[filename];

        return (layerInfos) ? setupComposite(filename, layerInfos, $.TOP_VIEW_PREFIX,
            layers => { return new Composite_Character_Bitmap(layers, filename); })
            : $.ImageManager_loadCharacter.apply(this, arguments);

    }

    $.ImageManager_loadSvActor = ImageManager.loadSvActor;
    ImageManager.loadSvActor = function (filename) {
        const layers = $.svCharLayers[filename];

        return (layers) ? setupComposite(filename, layers, $.SIDE_VIEW_PREFIX, Composite_SV_Bitmap.load)
            : $.ImageManager_loadSvActor.apply(this, arguments);
    };

    $.ImageManager_loadPicture = ImageManager.loadPicture;
    ImageManager.loadPicture = function (filename) {
        const layers = $.picLayers[filename];

        return (layers) ? setupComposite(filename, layers, $.PICTURE_PREFIX, Composite_Picture_Bitmap.load)
            : $.ImageManager_loadPicture.apply(this, arguments);
    };

})(KCDev.CompositeBitmaps);
