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
 *
 * @plugindesc [v2.0]Combine graphics to create layered bitmaps.
 *
 * @help
 * KC_CompositeBitmaps.js
 * 
 * Changelog:
 *   v1.0.0 - 2022/08/08
 *     - Initial release
 * 
 *   v1.1.0 - 2022/08/13
 *     - Added ability to clear layers with a new add layer parameter
 *     - Fixed picture Composite Bitmap plugin parameters
 *     - Updated help section to explain that game variables are supported
 * 
 *   v2.0.0 - TBA (WIP)
 *     - Complete plugin rewrite
 * 
 * @param presetComposites
 * @text Preset Composites
 * @desc These composites are constructed at the start of a new game.
 * @type struct<CompositeBitmap>[]
 * 
 * @param consts
 * @text Constants
 * @desc These expressions can be referred to in parameters using \const[x] where x is the constant's name.
 * @type struct<constant>[]
 * @default ["Face Example Constants","----------------------------------------------------","{\"varId\":\"face_width\",\"varVal\":\"ImageManager.faceWidth\",\"comment\":\"The value is parsed using eval, so we call\\nImageManager.faceWidth to have this constant be more\\ngeneral (i.e. it will update if this value is changed)\"}","{\"varId\":\"face_height\",\"varVal\":\"ImageManager.faceHeight\",\"comment\":\"The value is parsed using eval, so we call\\nImageManager.faceHeight to have this constant be more\\ngeneral (i.e. it will update if this value is changed)\"}","{\"varId\":\"faceset_width\",\"varVal\":\"\\\\const[face_width] * 4\",\"comment\":\"A face set always has 4 rows, so just multiplying the face\\nwidth value by 4 should give this constant the right value\"}","{\"varId\":\"faceset_height\",\"varVal\":\"\\\\const[face_height] * 2\",\"comment\":\"RTP face sets have 2 rows by default, so we use a 2 here.\\nTechnically, this is arbitrary, but for this example's\\nsake, I am sticking to RTP standards.\"}","----------------------------------------------------","Character Example Constants","----------------------------------------------------","{\"varId\":\"char_width\",\"varVal\":\"48\",\"comment\":\"Each frame of an RTP character sprite is 48 pixels wide\"}","{\"varId\":\"char_height\",\"varVal\":\"48\",\"comment\":\"Each frame of an RTP character is 48 pixels tals\"}","{\"varId\":\"charset_width\",\"varVal\":\"\\\\const[char_width] * 12\",\"comment\":\"Each RTP character set contains 4 characters per row.\\nEach character has 3 walking frames.\\n3 frames * 4 characters = 12 character sprites per row.\"}","{\"varId\":\"charset_height\",\"varVal\":\"\\\\const[char_height] * 8\",\"comment\":\"Each RTP character set contains 2 characters per column.\\nEach character has 4 diretions.\\n4 directions * 2 characters = 12 character sprites per column\"}"]
 *
 * @command addComposite
 * @text Create Composite
 * @desc Set up a new composite bitmap.
 * 
 * @arg compositeBmp
 * @text Composite Bitmap
 * @type struct<CompositeBitmap>
 * 
 * @command addComposites
 * @text Create Multiple Composites
 * @desc Set up many composite bitmaps in a single, convenient plugin command!
 * 
 * @arg compositeBmps
 * @text Composite Bitmaps
 * @type struct<CompositeBitmap>[]
 * 
 * @command editComposite
 * 
*/

/*~struct~constant:
 * @param varId
 * @text Name
 * @desc The name of this constant. It can include any characters except '[' and ']'.
 * @type text
 * 
 * @param varVal
 * @text Value
 * @desc The value this constant takes on.
 * @type multiline_string
 * 
 * @param comment
 * @text Comment
 * @desc A comment on the purpose of this constant. This is never used and is entirely optional.
 * @type multiline_string
 */

/*~struct~Layer:
 * @param sourceFile
 * @text Source Image
 * @type file
 * @dir img/
 * @desc Enter the path to the file you want this layer to be copied from. Paths leading to composite files work too.
 * 
 * @param compositeMode
 * @text Compositing Mode
 * @desc Set the Canvas2D compositing mode. The default is source-over.
 * @type combo
 * @option source-over
 * @option source-in
 * @option source-out
 * @option source-atop
 * @option destination-over
 * @option destination-in
 * @option destination-out
 * @option destination-atop
 * @option lighter
 * @option copy
 * @option xor
 * @option multiply
 * @option screen
 * @option overlay
 * @option darken
 * @option lighten
 * @option color-dodge
 * @option color-burn
 * @option hard-light
 * @option soft-light
 * @option difference
 * @option exclusion
 * @option hue
 * @option saturation
 * @option color
 * @option luminosity
 * @default source-over
 * 
 * @param layerWidth
 * @text Width
 * @desc Width of this layer. AUTO will make this the width of the source image.
 * @type combo
 * @option AUTO
 * @default AUTO
 * 
 * @param layerHeight
 * @text Height
 * @desc Height of this layer. AUTO will make this the height of the source image.
 * @type combo
 * @option AUTO
 * @default AUTO
 * 
 * @param srcTile
 * @text Tiled
 * @desc Enabling this will tile the layer over the entire composite image.
 * @type boolean
 * @default false
 * 
 * @param src
 * @text Source
 * 
 * @param sx
 * @text x
 * @parent src
 * @desc The image from the source file will be copied starting at this horizontal coordinate.
 * @default 0
 * 
 * @param sy
 * @text y
 * @parent src
 * @desc The image from the source file will be copied starting at this vertical coordinate.
 * @default 0
 * 
 * @param useSrcGrid
 * @text Use Grid
 * @parent src
 * @desc If enabled, this will cut out a piece of the source image before applying any other operations.
 * @type boolean
 * @default false
 * 
 * @param srcGridOpts
 * @text Grid Options
 * @parent useSrcGrid
 * @desc The options of the grid.
 * @type struct<LayerGridProperties>
 * 
 * @param dst
 * @text Destination
 * 
 * @param dx
 * @text x
 * @parent dst
 * @desc The layer will be drawn starting at this x coordinate on the composite.
 * @default 0
 * 
 * @param dy
 * @text y
 * @parent dst
 * @desc The layer will be drawn starting at this y coordinate on the composite.
 * @default 0
 * 
 * @param useDstGrid
 * @text Use Grid
 * @parent dst
 * @desc If enabled, this will cut out a piece of the destination image before applying any other operations.
 * @type boolean
 * @default false
 * 
 * @param dstGridOpts
 * @text Grid Options
 * @parent useDstGrid
 * @desc The options of the grid.
 * @type struct<LayerGridProperties>
 * 
 * @param layerTf
 * @text Advanced Transforms
 * @desc Optional additional transformations that can be applied to this layer.
 * @type struct<AdvancedLayerTransforms>
 * 
 */

/*~struct~AdvancedLayerTransforms:
 * @param angle
 * @text Angle
 * @desc Rotate the layer by this angle in degrees.
 * @default 0
 * 
 * @param transX
 * @text Translation x
 * @desc Translate the layer this many units horizontally.
 * @default 0
 * 
 * @param transY
 * @text Translation y
 * @desc Translate the layer this many units vertically.
 * @default 0
 * 
 * @param scaleX
 * @text Scale x
 * @desc Scale the layer by this amount horizontally.
 * @default 1.00
 * 
 * @param scaleY
 * @text Scale y
 * @desc Scale the layer by this amount vertically.
 * @default 1.00
 * 
 * @param orderOfTransforms
 * @text Transformation Order
 * @desc Order in which the transformations are applied to this layer.
 * @type select
 * @option Rotate -> Translate -> Scale
 * @value RTS
 * @option Rotate -> Scale -> Translate
 * @value RST
 * @option Translate -> Rotate -> Scale
 * @value TRS
 * @option Translate -> Scale -> Rotate
 * @value TSR
 * @option Scale -> Rotate -> Translate
 * @value SRT
 * @option Scale -> Translate -> Rotate
 * @value STR
 * @default RTS
 */

/*~struct~LayerGridProperties:
 * @param cols
 * @text Columns
 * @desc Enter the number of columns the image has.
 * @type combo
 * @option auto_face
 * @option auto_character
 * @option auto_frame_width
 * @default 1
 * 
 * @param frameWidth
 * @text Frame Width
 * @parent cols
 * @desc Auto calculate the number of columns based on a frame width.
 * @type number
 * @default 1
 * @min 1
 * 
 * @param rows
 * @text Rows
 * @desc Enter the number of rows the image has.
 * @type combo
 * @option auto_face
 * @option auto_character
 * @option auto_frame_height
 * @default 1
 * 
 * @param frameHeight
 * @text Frame Height
 * @parent rows
 * @desc Auto calculate the number of columns based on a frame height.
 * @type number
 * @default 1
 * @min 1
 * 
 * @param index
 * @text Index
 * @desc The index of the target grid entry.
 * @type number
 * @default 0
 * 
 */

/*~struct~CompositeBitmap:
 * @param url
 * @text Bitmap Path
 * @desc This is the path to the composite. When this image is loaded, the composite shows up.
 * @type file
 * @dir img/
 * 
 * @param width
 * @text Width
 * @desc The width in pixels of this composite bitmap.
 * @type text
 * 
 * @param height
 * @text Height
 * @desc The height in pixels of this composite bitmap.
 * @type text
 * 
 * @param layers
 * @text Layers
 * @desc These layers make up the composite bitmap.
 * @type struct<Layer>[]
 */

// general namespace for my plugins
var KCDev = KCDev || {};

// this plugin's namespace
KCDev.CompositeBitmaps = {};

KCDev.CompositeBitmaps.currentVersion = "2.0";

/**
 * @typedef {Object} KCDev.CompositeBitmaps.PluginStructs.AdvancedLayerTransforms
 * @property {number} angle
 * @property {number} transX
 * @property {number} transY
 * @property {number} scaleX
 * @property {number} scaleY
 * @property {string} orderOfTransforms
 */

/**
 * @typedef {Object} KCDev.CompositeBitmaps.PluginStructs.LayerGridProperties
 * @property {number} cols Number of columns the grid has
 * @property {number} rows Number of rows the grid has
 * @property {number} frameWidth Width of an individual frame in the grid
 * @property {number} frameHeight Height of an individual frame in the grid
 * @property {number} index Targetted index of the grid. Index 0 is the grid entry at the top left.
 */

/**
 * @typedef {Object} KCDev.CompositeBitmaps.PluginStructs.Layer
 * @property {string} sourceFile
 * @property {string} compositeMode
 * @property {number} layerWidth
 * @property {number} layerHeight
 * @property {number} sx
 * @property {number} sy
 * @property {boolean} useSrcGrid
 * @property {KCDev.CompositeBitmaps.PluginStructs.LayerGridProperties} srcGridOpts
 * @property {number} dx
 * @property {number} dy
 * @property {boolean} useDstGrid
 * @property {KCDev.CompositeBitmaps.PluginStructs.LayerGridProperties} dstGridOpts
 * @property {KCDev.CompositeBitmaps.PluginStructs.AdvancedLayerTransforms} layerTf
 */

/**
 * @typedef {Object} KCDev.CompositeBitmaps.PluginStructs.CompositeBitmap
 * @property {string} url
 * @property {number} width
 * @property {number} height
 * @property {KCDev.CompositeBitmaps.PluginStructs.Layer[]} layers
 */

/**
 * @typedef {Object} KCDev.CompositeBitmaps.Layer_Info
 * @property {string} source
 * @property {string} sourceFolder
 * @property {number} sourceIndex
 * @property {number} sourceRowNum
 * @property {number} sourceColNum
 * @property {number} destinationIndex
 * @property {number[]} globalShift
 * @property {number[][]} frameShifts
 * @property {number} frameHeight
 * @property {number} frameWidth
 * @property {KCDev.CompositeBitmaps.PluginStructs.AdvancedLayerTransforms} layerTf
 */

/**
 * 
 * @param {Bitmap} source 
 * @param {number} sx 
 * @param {number} sy 
 * @param {number} sw 
 * @param {number} sh 
 * @param {Bitmap} destination 
 * @param {number} dx 
 * @param {number} dy 
 * @param {number} dw 
 * @param {number} dh
 * @param {string} compOp
 */
KCDev.CompositeBitmaps.bltExtended = function(source, sx, sy, sw, sh, destination, dx, dy, dw, dh, compOp = 'source-over') {
    dw = dw || sw;
    dh = dh || sh;
    try {
        const image = source._canvas || source._image;
        const oldOp = destination.context.globalCompositeOperation;
        destination.context.globalCompositeOperation = compOp;
        destination.context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
        destination._baseTexture.update();
        destination.context.globalCompositeOperation = oldOp;
    } catch (e) {
        //
    }
};

/**
 * Cuts out a piece of a bitmap with rows and columns and returns the resulting bitmap.
 * @param {Bitmap} bitmap 
 * @param {number} index Order goes from left to right top to bottom
 * @param {number} totalColumns 
 * @param {number} totalRows 
 */
KCDev.CompositeBitmaps.extractFromBitmapIndex = function (bitmap, index, totalColumns, totalRows) {
    const width = Math.floor(bitmap.width / totalColumns);
    const height = Math.floor(bitmap.height / totalRows);
    const bmp = new Bitmap(width, height);
    const sx = Math.floor(index % totalColumns) * width;
    const sy = Math.floor(index / totalColumns) * height;
    bmp.blt(bitmap, sx, sy, width, height, 0, 0);
    return bmp;
};

/**
 * Modifies the destination bitmap and returns a reference to this modified bitmap
 * @param {Bitmap} source Source bitmap
 * @param {Bitmap} destination Bitmap to be modified
 * @param {number} destinationIndex 
 * @param {number} destinationCols 
 * @param {number} destinationRows
 * @param {boolean} clearOld
 * @param {string} compOp 
 */
KCDev.CompositeBitmaps.drawBitmapGridEntry = function (source, destination, destinationIndex, destinationCols, destinationRows, clearOld = false, compOp) {
    const width = Math.floor(destination.width / destinationCols);
    const height = Math.floor(destination.height / destinationRows);
    const dx = Math.floor(destinationIndex % destinationCols) * width;
    const dy = Math.floor(destinationIndex / destinationCols) * height;
    if (clearOld) {
        destination.clearRect(dx, dy, width, height);
    }
    
    this.bltExtended(source, 0, 0, source.width, source.height, destination, dx, dy, width, height, compOp);
    return destination;
};

/**
 * Returns a new bitmap with its contents offset by x pixels horizontally and y pixels vertically.
 * @param {Bitmap} bitmap 
 * @param {number} x Horizontal offset
 * @param {number} y Vertical offset
 */
KCDev.CompositeBitmaps.getShiftedBitmap = function (bitmap, x, y) {
    const width = bitmap.width;
    const height = bitmap.height;
    const finalBitmap = new Bitmap(width, height);
    // if the image is shifted more than the dimensions, the bitmap will be blank so don't bother copying.
    if (Math.abs(x) < bitmap.width && Math.abs(y) < bitmap.height) {
        finalBitmap.blt(bitmap, -x, -y, width, height, 0, 0);
    }
    return finalBitmap;
};

/**
 * Takes an offset mapping and reverses it
 * @param {number[][]} offsets 
 * @returns {number[][]}
 */
KCDev.CompositeBitmaps.flipOffsets = function (offsets) {
    return offsets.map(pair => {
        return pair.map(offset => {
            return offset * -1;
        })
    });
}

KCDev.CompositeBitmaps.MZF_TO_MZM_OFFSETS = [
    [0, 0], [0, 0], [0, 0], [0, 0], [1, 0], [1, 0], [3, -2], [3, -2], [3, -2],
    [1, 0], [1, 0], [1, 0], [0, 0], [1, 0], [1, 0], [0, 0], [0, 0], [0, 0],
    [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [-1, -2], [-1, -2], [-1, -2],
    [-1, 0], [-1, 0], [-1, 0], [-1, 0], [0, 0], [0, 0], [-1, -2], [-1, -2], [-1, -2],
    [2, 1], [2, 1], [2, 1], [-1, 0], [1, 0], [1, 0], [-1, -2], [-1, -2], [-1, -2],
    [0, 1], [0, 1], [0, 1], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]
];

KCDev.CompositeBitmaps.MZM_TO_MZF_OFFSETS = KCDev.CompositeBitmaps.flipOffsets(KCDev.CompositeBitmaps.MZF_TO_MZM_OFFSETS);

/**
 * @typedef {Object} KCDev.CompositeBitmaps.Composite_Bitmap.OptionalInfo
 * @property {string} proxyUrl
 * @property {number} rows
 * @property {number} columns
 * @property {number} width
 * @property {number} height
 */

// parent composite class that is the base for all composite bitmaps
KCDev.CompositeBitmaps.Composite_Bitmap = class Composite_Bitmap extends Bitmap {

    /**
     * 
     * @param {KCDev.CompositeBitmaps.Layer_Info[]} layerInfos 
     * @param {KCDev.CompositeBitmaps.Composite_Bitmap.OptionalInfo} opts
     */
    constructor(layerInfos, opts = {}) {
        super();
        this._loadingState = 'loading';
        /**@type {KCDev.CompositeBitmaps.Layer_Info[]} */ this._layerInfos = layerInfos;
        /**@type {KCDev.CompositeBitmaps.Composite_Bitmap.OptionalInfo} */ this._optionalParams = opts;
        this.refreshComposite();
    }

    refreshComposite() {
        this._destroyCanvas();

        this._loadingState = 'loading'

        const opts = this._optionalParams;

        /**@type {Map<KCDev.CompositeBitmaps.Layer_Info, Bitmap>} */ this._infoBitmaps = new Map();

        this._numRows = opts.rows || 1;
        this._numCols = opts.columns || 1;
        this._numToLoad = layerInfos.length;
        if (opts.width || !opts.height) {
            this._needsResolutionChange = true;
        }

        if (opts.proxyUrl && opts.proxyUrl !== '') {
            this._numToLoad++;
            this._proxyBitmap = ImageManager.loadBitmapFromUrl(opts.proxyUrl);
            this._proxyBitmap.addLoadListener(() => {
                this._loadCallback();
            });
        }

        this._layerInfos.forEach(info => {
            ImageManager.loadBitmap(info.sourceFolder, info.source).addLoadListener(bmp => {
                info.numCols = Math.floor(bmp.width / info.frameWidth);
                info.numRows = Math.floor(bmp.height / info.frameHeight);
                this._infoBitmaps.set(info, bmp);
                this._loadCallback();
            });
        });
    }

    _loadCallback() {
        this._numToLoad--;

        if (this._numToLoad <= 0) {
            this._onLoad();
        }
    }

    _onLoad() {
        if (this._needsResolutionChange) {
            if (this._proxyBitmap) {
                this.height = this._proxyBitmap.height;
                this.width = this._proxyBitmap.width;
            }
            else {
                const bottom = this._infoBitmaps.get(this._layerInfos[0]) || new Bitmap();
                this.height = bottom.height;
                this.width = bottom.width;
            }
        }

        this._layerInfos.forEach(layerInfo => {
            this.handleLayerInfo(layerInfo);
        });

        delete this._infoBitmaps; // don't need this anymore

        this._loadingState = 'loaded';
    }

    /**
     * 
     * @param {KCDev.CompositeBitmaps.Layer_Info} info 
     */
    handleLayerInfo(info) {
        let bitmap = this._infoBitmaps.get(info);
        if ((info.sourceColNum > 1 || info.sourceRowNum > 1) && info.sourceIndex >= 0) {
            bitmap = KCDev.CompositeBitmaps.extractFromBitmapIndex(bitmap, info.sourceIndex, info.sourceColNum, info.sourceRowNum);
        }
        if (info.globalShift && (info.globalShift[0] || info.globalShift[1])) {
            const x = info.globalShift[0];
            const y = info.globalShift[1];
            bitmap = KCDev.CompositeBitmaps.getShiftedBitmap(bitmap, x, y);
        }
        if (info.frameShifts) {
            const columns = info.numCols;
            const rows = info.numRows;
            const shiftedBmp = new Bitmap(bitmap.width, bitmap.height);
            shiftedBmp.blt(bitmap, 0, 0, bitmap.width, bitmap.height, 0, 0); // make a copy to avoid affecting a cached bitmap
            const loopLim = Math.min(info.frameShifts.length, columns * rows);
            for (let i = 0; i < loopLim; i++) {
                const pair = info.frameShifts[i];
                const x = pair[0];
                const y = pair[1];
                const extractedFrame = KCDev.CompositeBitmaps.extractFromBitmapIndex(bitmap, i, columns, rows);
                const shiftedFrame = KCDev.CompositeBitmaps.getShiftedBitmap(extractedFrame, x, y);
                KCDev.CompositeBitmaps.drawBitmapGridEntry(shiftedFrame, shiftedBmp, i, columns, rows, true);
            }
            bitmap = shiftedBmp;
        }
        const tf = info.layerTf;
        if (tf) {
            const order = tf.orderOfTransforms.toUpperCase();

            for (let i = 0; i < order.length; i++) {
                switch (order[i]) {
                    case 'R':
                        bitmap.context.rotate(tf.angle);
                        break;

                    case 'T':
                        bitmap.context.translate(tf.transX, tf.transY);
                        break;

                    case 'F':
                        bitmap.context.scale(tf.scaleX, tf.scaleY);
                        break;
                
                    default:
                        //
                        break;
                }
            }
        }
        KCDev.CompositeBitmaps.drawBitmapGridEntry(bitmap, this, info.destinationIndex, this._numCols, this._numRows, false);
    }

    /**
     * 
     * @param {KCDev.CompositeBitmaps.Layer_Info} layerInfo 
     */
    addLayer(layerInfo) {
        if (!this.isReady()) {
            this._layerInfos.push(layerInfo);
            this._numToLoad++;
        }
        else {
            this.handleLayerInfo(layerInfo);
        }
    }

    /**
     * 
     * @param {KCDev.CompositeBitmaps.Layer_Info[]} layerInfos 
     */
    replaceLayerInfos(layerInfos) {
        this._layerInfos = layerInfos;
    }

    /**
     * 
     * @param {KCDev.CompositeBitmaps.Composite_Bitmap.OptionalInfo} opts
     */
    replaceOptionalParams(opts = {}) {
        this._optionalParams = opts;
    }
};

/**
 * @typedef {Object} KCDev.CompositeBitmaps.Composite_Entry
 * @property {KCDev.CompositeBitmaps.Layer_Info[]} layerInfos
 * @property {KCDev.CompositeBitmaps.Composite_Bitmap | null} bitmap
 * @property {KCDev.CompositeBitmaps.Composite_Bitmap.OptionalInfo} opts
 */

KCDev.CompositeBitmaps.Composite_Manager = class Composite_Manager {
    constructor() {
        this.init();
    }

    init() {
        /**@type {Map<string,KCDev.CompositeBitmaps.Composite_Entry>} */ this._entries = new Map();

        // tracks all bitmaps the key appears as part of (useful for compositions of composite bitmaps)
        /**@type {Map<string,Set<string>>} */ this._dependencies = new Map();

    }

    /**
     * 
     * Returns the composite bitmap with the same url if it exists; otherwise, returns undefined
     * @param {string} url 
     */
    getComposite(url) {
        const entry = this._entries.get(url);
        if (entry) {
            if (!entry.bitmap) {
                entry.bitmap = new KCDev.CompositeBitmaps.Composite_Bitmap(entry.layerInfos, entry.opts);
            }
            return entry.bitmap;
        }
        return undefined;
    }

    /**
     * 
     * @param {string} url 
     * @param {KCDev.CompositeBitmaps.Layer_Info[]} layerInfos 
     * @param {KCDev.CompositeBitmaps.Composite_Bitmap.OptionalInfo} opts 
     */
    addComposite(url, layerInfos, opts) {
        layerInfos.forEach(info => {
            let parent = this._dependencies.get(info.source);
            if (!parent) {
                parent = new Set();
                this._dependencies.set(parent);
            }
            parent.add(url);
        });
        this._entries.set(url, { layerInfos: layerInfos, opts: opts, bitmap: null });
        this.rebuildDependencies(url);
    }

    /**
     * 
     * @param {string} url 
     */
    removeComposite(url) {
        const entry = this._entries.get(url);
        if (entry) {
            entry.layerInfos.forEach(info => {
                this.removeDependency(info.source, url);
            });
            this._entries.delete(url);
            this.rebuildDependencies(url);
        }
    }

    /**
     * 
     * @param {string} url 
     */
    updateCachedEntry(url) {
        const entry = this._entries.get(url);
        if (entry && entry.bitmap) {
            entry.bitmap.replaceLayerInfos(entry.layerInfos);
            entry.bitmap.replaceOptionalParams(entry.opts);
            entry.bitmap.refreshComposite();
            this.rebuildDependencies(url);
        }
    }

    /**
     * 
     * @param {string} url 
     * @param {KCDev.CompositeBitmaps.Composite_Bitmap.OptionalInfo}
     */
    updateCompositeOptions(url, newOpts) {
        const entry = this._dependencies.get(url);
        if (entry) {
            entry.opts = newOpts;
            this.updateCachedEntry(url);
        }
    }

    /**
     * 
     * @param {string} url 
     * @param {KCDev.CompositeBitmaps.Layer_Info} layerInfo 
     */
    pushLayerInfo(url, layerInfo) {
        this.spliceLayerInfo(url, -1, 0, layerInfo);
    }

    /**
     * 
     * @param {string} url 
     * @param {number} index 
     * @param {KCDev.CompositeBitmaps.Layer_Info} layerInfo 
     */
    replaceLayerInfo(url, index, layerInfo) {
        this.spliceLayerInfo(url, index, 1, layerInfo);
    }

    /**
     * 
     * @param {string} url 
     */
    popLayerInfo(url) {
        return this.removeLayerInfo(url, -1);
    }

    /**
     * 
     * @param {string} url
     * @param {number} index 
     */
    removeLayerInfo(url, index) {
        return this.spliceLayerInfo(url, index, 1)[0];
    }

    /**
     * Performs a splice on an entry's layerInfo array updates any dependent entries
     * @param {string} url
     * @param {number} index
     * @param {number} deleteCount
     * @param {KCDev.CompositeBitmaps.Layer_Info[]} layerInfos 
     */
    spliceLayerInfo(url, index, deleteCount, ...layerInfos) {
        const entry = this._entries.get(url);

        if (entry) {
            const origIndex = index;
            if (index < 0) {
                index += entry.layerInfos.length;
            }
            if (index >= 0 && index < entry.layerInfos.length) {
                const removed = entry.layerInfos.splice(index, deleteCount, ...layerInfos);
                removed.filter(info => !entry.layerInfos.find(info.source)).forEach(entirelyRemoved => {
                    this.removeDependency(entirelyRemoved.source, url);
                });
                this.updateCachedEntry(url);

                return removed;
            }
            else {
                console.error('KCDev.CompositeBitmaps.Composite_Manager.spliceLayerInfo: Index ' + origIndex + ' is not in range of layerInfos array for composite bitmap ' + url);
            }
        }
        else {
            console.error('KCDev.CompositeBitmaps.Composite_Manager.spliceLayerInfo: Composite Bitmap with url ' + url + ' does not exist');
        }
    }

    /**
     * 
     * @param {string} parentUrl 
     * @param {string} childUrl 
     */
    addDependency(parentUrl, childUrl) {
        let parent = this._dependencies.get(parentUrl);
        if (!parent) {
            parent = new Set();
            this._dependencies.set(parent);
        }
        parent.add(childUrl);
    }

    /**
     * 
     * @param {string} parentUrl 
     * @param {string} childUrl 
     */
    removeDependency(parentUrl, childUrl) {
        const parent = this._dependencies.get(parentUrl);
        if (parent) {
            return parent.delete(childUrl);
        }
        return false;
    }

    /**
     * Updates the bitmap of each dependency
     * @param {string} url 
     */
    rebuildDependencies(url) {

        /**
         * Needs to be recursive to ensure dependencies of dependencies are updated
         * @param {string} url 
         * @param {Set<string>} visited 
         */
        function rebuildRecursively(url, visited = new Set()) {

            if (visited.has(url)) {
                return;
            }

            visited.add(url);

            /**@type {Set<string> | undefined} */ const dependencies = this._dependencies.get(url);

            if (dependencies) {
                for (const dependency of dependencies) {
                    /**@type {KCDev.CompositeBitmaps.Composite_Entry | undefined} */ const entry = this._entries.get(dependency);
                    if (entry) {
                        this.updateCachedEntry(dependency);
                        rebuildRecursively(dependency);
                    }
                }
            }
        }

        rebuildRecursively(url);
    }

};

KCDev.CompositeBitmaps.manager = new KCDev.CompositeBitmaps.Composite_Manager();

/*
// start new game
KCDev.CompositeBitmaps.DataManager_createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function () {
    KCDev.CompositeBitmaps.DataManager_createGameObjects.apply(this, arguments);
    KCDev.CompositeBitmaps.manager.clear();
};

// save game
KCDev.CompositeBitmaps.DataManager_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function () {
    const contents = KCDev.CompositeBitmaps.DataManager_makeSaveContents.apply(this, arguments);
    contents.KCDev = contents.KCDev || {};
    const pluginObj = contents.KCDev.CompositeBitmaps = {};
    pluginObj.version = KCDev.CompositeBitmaps.currentVersion;
    pluginObj.data = KCDev.CompositeBitmaps.manager.makeSaveContents();
    return contents;
}

// load game
KCDev.CompositeBitmaps.DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function (contents) {
    KCDev.CompositeBitmaps.DataManager_extractSaveContents.apply(this, arguments);
    KCDev.CompositeBitmaps.manager.clear();
    const pluginObj = contents.KCDev?.CompositeBitmaps;
    if (pluginObj) {
        if (!pluginObj.version) {
            // handle version < 1.2 plugin saved data
        }
        else {
            KCDev.CompositeBitmaps.manager.applySaveContents(contents.data);
        }
    }
}
*/

KCDev.CompositeBitmaps.ImageManager_loadBitmapFromUrl = ImageManager.loadBitmapFromUrl;
ImageManager.loadBitmapFromUrl = function (url) {
    return KCDev.CompositeBitmaps.manager.getComposite(url) || KCDev.CompositeBitmaps.ImageManager_loadBitmapFromUrl.apply(this, arguments);
};

/**
 * Returns a buffer of data that represents the bitmap as a png.
 * @param {Bitmap} bitmap The bitmap that will be converted to a png
 * @returns {Buffer}
 */
KCDev.CompositeBitmaps.bitmapToPng = function (bitmap) {

    let data = bitmap._canvas.toDataURL('image/png');
    data = data.replace(/^.*,/, '');

    const png = Buffer.from(data, 'base64');

    return png;
};


/*
// if i forget to remove this in the full release please slap me
ImageManager.loadFace('Actor1').addLoadListener(bitmap => {

    const fs = require('fs');

    ImageManager.loadFace('Actor2').addLoadListener(bitmap2 => {
        const bmp = new Bitmap(bitmap2.width, bitmap2.height);
        bmp.blt(bitmap2, 0, 0, bmp.width, bmp.height, 0, 0);
        fs.writeFileSync('./test_extract_plus_overwrite.png', KCDev.CompositeBitmaps.bitmapToPng(
            KCDev.CompositeBitmaps.drawBitmapGridEntry(KCDev.CompositeBitmaps.extractFromBitmapIndex(bitmap, 4, 4, 2),
                bmp, 1, 4, 2, true)
            ));
    });

});
*/

KCDev.CompositeBitmaps.UserVariables = {};

/**
 * 
 * @param {string} str
 * @param {string} startToken This indicates the start of the 
 * @param {string} endToken This token should NOT appear in the argument string at any point. Can be escaped with a backslash
 * @param {(input: string) => string} replacementGetter
 * @param {boolean} caseSensitive
 * @param {number} maxReplacements It is possible to infinitely loop with certain transformer functions if the string substituted in has a start token, so we place a hard upper limit
 */
KCDev.CompositeBitmaps.easyWordReplace = function (str = '', startToken = '', endToken = '', replacementGetter, caseSensitive = false, maxReplacements = 1024) {

    // minor safety check
    if (str === '' || startToken === '' || endToken === '' || !replacementGetter) {
        return str;
    }

    const rgxFlags = caseSensitive ? 'g' : 'gi';
    const startReg = new RegExp(startToken, rgxFlags);
    const endReg = new RegExp(endToken, rgxFlags);
    let replaced = 0;

    let final = str;

    for (let i = final.search(startReg); i >= 0; i = final.search(startReg)) {
        if (replaced > maxReplacements) {
            throw new Error('KCDev.CompositeBitmaps.easyWordReplace: Maximum number of replacements reached (' + maxReplacements + ')');
        }

        const start = i + startToken.length + 1;
        let end = final.search(endReg);

        // handle escaped end token
        while (end > 0 && final[end - 1] === '\\') {
            const tempStart = end + endToken.length + 1;
            const newEnd = tempStart < final.length ? final.substring(tempStart).search(endReg) : -1;
            end = newEnd >= 0 ? tempStart + newEnd : -1;
        }

        if (end < 0) {
            throw new Error('KCDev.CompositeBitmaps.easyWordReplace: No closing token \'' + endToken + '\'')
        }

        const replaceArg = final.substring(start, end);

        const replacement = replacementGetter(replaceArg);

        // first arg is a substring to allow start and end tokens to be case-insensitive
        final = final.replace(final.substring(i, end + endToken.length), replacement);

        replaced++;
    }

    return final;
};

/**
 * Replaces any \v[x] control codes with the value in that variable.
 * @param {string} str 
 */
KCDev.CompositeBitmaps.replaceControlCodes = function (str) {
    return this.easyWordReplace(str, '\\v[', ']', $gameVariables.value);
};

/**
 * 
 * @param {string} param 
 */
KCDev.CompositeBitmaps.parseParameter = function (param) {
    
    const final = this.easyWordReplace(this.replaceControlCodes(param), '\\const[', ']', (input) => { return KCDev.CompositeBitmaps.UserVariables[input] || '' });

    try {
        // try to eval this first
        return (new Function("use strict; return (" + final + ")"))();
    }
    catch (error) {
        // if the eval fails, assume it was a string
        return final;
    }
};

KCDev.CompositeBitmaps.parseAllParameters = function (obj) {
    for (const propName of Object.getOwnPropertyNames(obj)) {
        const prop = obj[propName];
        if (typeof prop === 'string') {
            try {
                // need to do this in case parameter is actually an object with params of its own
                obj[propName] = this.parseAllParameters(JsonEx.parse(prop));
            } catch (error) {
                obj[propName] = this.parseParameter(prop);
            }
        }
    }
    return obj;
};

// handle plugin parameters
(() => {

    const script = document.currentScript.src.split("/").pop().replace(/\.js$/, "");

    const parameters = PluginManager.parameters(script);

    const $ = KCDev.CompositeBitmaps;

    function parseNoError(str) {
        try {
            return JsonEx.parse(str);
        } catch (error) {
            return undefined;
        }
    }

    const consts = parseNoError(parameters.consts);

    if (Array.isArray(consts)) {
        consts.forEach((constant, i) => {
            const parsed = parseNoError(constant);
            if (parsed && parsed.varId) {
                if (parsed.varId.indexOf(']') < 0 && parsed.varId.indexOf('[') < 0) {
                    $.UserVariables[parsed.varId] = parsed.varVal;
                }
                else {
                    console.error('Invalid characters in constant with name ' + parsed.varId);
                }
            }
        });
    }
})();
