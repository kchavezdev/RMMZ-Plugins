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
 * @author K. Chavez 
 * @url https://github.com/kchavezdev/RMMZ-Plugins
 * @target MZ
 * @base PluginCommonBase
 * @orderafter PluginCommonBase
 *
 * @plugindesc [v1.3]Add reflections to events and actors.
 *
 * @help
 * KC_Mirrors.js
 * 
 * Changelog: 
 *     v1.3.0 - 2022/10/26
 *         - Added FilterControllerMZ targets
 *           | CharReflectionsFloor - Applies filter to all floor reflections
 *           | CharReflectionsWall - Applies filter to all wall reflections
 *           | CharReflections - Applies filter to all character reflections
 *         - Added new note tags to actors, characters, and maps:
 *             | <REFLECT_FLOOR_OFFSETS:[x],[y]>
 *             | <REFLECT_WALL_OFFSETS:[x],[y]>
 *         - Added an option to fix Z-fighting under certain conditions on
 *           wall reflections in 'perspective' mode
 *             | You probably don't need this fix unless you're using a pixel
 *               movement plugin
 *         - Fixed a bug in the Change Event Reflect plugin command that
 *           caused the wrong event to be used as reference for unchanged
 *           parameters
 *         - Internal code refactor
 *           | All plugin parameters are exposed on the KCDev.Mirrors object
 *     v1.2.0 - 2022/08/05
 *         - Reflections of each type can now be separately toggled on and off
 *           for the entire map through note tags and a new plugin command
 *             | New command: Override Map Settings
 *             | New map note tag: <REFLECT_TYPE:[ALL/FLOOR/WALL]>
 *         - The reflection mode the map uses can be changed via the map notes
 *           and the aforementioned new command
 *             | New map note tag: <REFLECT_MODE:[PERSPECTIVE/EVENT]>
 *         - The developer can now set the opacity of each reflection type
 *           through the updated plugin command and via new note tags
 *             | New event and actor tags: <REFLECT_FLOOR_OPACITY:[x]>, 
 *                                         <REFLECT_WALL_OPACITY:[x]>
 *         - Characters that are made transparent via move route commands
 *           now also have their reflections disappear if those reflections
 *           are not using custom opacities
 *     v1.1.4 - 2022/07/19
 *         - Adjusted how reflections are handled internally for compatibility
 *           with KC_MoveRouteTF
 *     v1.1.3 - 2022/07/16
 *         - Fixed issue where characters using a sprite from the tileset and
 *           with a priority other than 'Below Characters' would never have
 *           reflections
 *     v1.1.2 - 2022/07/14
 *         - Fixed a typo that caused incorrect behavior when setting event
 *           reflection properties via plugin command and manually selecting
 *           'Unchanged' from the dropdown box
 *     v1.1.1 - 2022/07/14
 *         - Added a few safety checks to avoid a game crash when trying to
 *           access characters that do not exist (e.g. trying to change the
 *           reflection of the third follower when the player has two
 *           followers)
 *     v1.1.0 - 2022/07/12
 *         - Fixed bug where characters standing out of the maximum wall
 *           reflection range would appear on the mirror with incorrect
 *           scaling
 *         - Added the 'event-like' wall reflection mode and renamed the
 *           mode featured in the previous version to 'pseudo-perspective'
 *           mode
 *         - Removed restriction that caused events using tile IDs to not
 *           appear in wall reflections
 *     v1.0.0 - 2022/07/11
 *         - Initial release
 * 
 * This is a plugin that allows the developer to add reflections to actors and 
 * events. This is done by drawing sprites below the map but above the parallax
 * layer. So, to get full usage out of this plugin, you must be using tilesets
 * that show the parallax layer (i.e. tilesets with transparency).
 * 
 * The demo uses a tileset with reduced opacity on the water tiles to achieve
 * the water reflection effect, for example.
 * 
 * There are two types of reflections: Wall and Floor
 * 
 * Floor reflections appear below the character and follow the character as
 * they walk around the map.
 * 
 * Wall reflections appeaer on regions marked with certain IDs and grow and
 * shrink based on how close the character is to the marked tile. Only one
 * wall reflection is visible at a time per character; the one that is
 * visible is placed on the closest tile with a wall reflection that is above
 * the character.
 * 
 * Also note that most arguments can have their values substituted with
 * variables by using \v[x] as an argument where x is a game variable ID.
 * 
 * As of version 1.3.0 of this plugin, FilterControllerMZ is supported. To
 * use filters, place KC_Mirrors UNDER FilterControllerMZ and use either
 * CharReflectionsFloor, CharReflectionsWall, or CharReflections as your
 * filter target. For example, if a given map had the note tags
 * <Filter:REFLECT#1,reflection-w,CharReflectionsFloor> and
 * <SetFilter:REFLECT#1,0,0,5,30,100,1,1>, only the floor reflections would
 * have a "wavy" effect; this would be useful to simulate the appearance of
 * water for example.
 * 
 * Also as of version 1.3.0, reflections can be offset by arbitrary numbers
 * of pixels using the <REFLECT_FLOOR_OFFSETS:[x],[y]> and 
 * <REFLECT_WALL_OFFSETS:[x],[y]>, which can be useful for fine-tuning
 * reflections on a per-map and per-character basis.
 * 
 * -----------------------------Plugin Parameters-----------------------------
 * 
 * Wall Region IDs:
 * An array of regions that wall reflections can be drawn on.
 * 
 * Disable Region IDs:
 * Characters standing on these regions will have wall and floor reflections
 * disabled for as long as they are on top of those regions.
 * 
 * Actor Defaults:
 * Default reflection settings for actors. Can be overriden by note tags.
 * 
 * Event Defaults:
 * Default reflection settings for events. Can be overriden by note tags.
 * 
 * Reflection Z Value:
 * This is the Z value all reflections have. If below 0, reflections are
 * drawn below the main map tiles.
 * 
 * Maximum Wall Distance:
 * This determines the maximum amount of tiles a character can be from a wall
 * before their reflection stops being drawn. This number also determines how
 * quickly a character shrinks as they move away from the wall if the wall
 * reflections are in pseudo-perspective mode.
 * 
 * Wall Reflection Mode:
 * This is the wall reflection mode that is used by default. Currently, there
 * are two modes to choose from:
 *   - Pseudo-perspective Mode:
 *       This is the mode where wall reflections are made to appear as if the
 *       characters are walking "into" the screen as the event or actor moves
 *       further down from the mirror. This is achieved partly through making
 *       the reflection sprite smaller as the character moves further down and
 *       away from the mirror.
 * 
 *   - Event-like Mode:
 *     In this mode, reflections appear more like an event would. So, there is
 *     no sprite scaling as seen in pseudo-perspective mode. Instead, as the
 *     character being reflected moves away from the mirror, their reflection
 *     moves the same amount. So, if the character is 3 tiles south of the
 *     base of the mirror, then their reflection is three tiles north of the
 *     mirror's base.
 * 
 * Reflect Mode Variable:
 * This allows the developer to bind the current reflection mode to a variable
 * rather than use the same mode for the entire game. If there is an invalid
 * reflection mode in this variable, the game falls back to the mode defined in
 * the Wall Reflection Mode parameter. Setting this to 0 causes the defined
 * Wall Reflection Mode to always be used.
 * 
 * ------------------------------Plugin Note Tags------------------------------
 * 
 * This plugin allows the author to control various aspects of it via note tags.
 * All of these note tags are completely OPTIONAL. Default values will be used
 * if they are not present.
 * 
 * Shared Note Tags:
 * 
 * - These note tags are shared by the map, actors, and events
 * 
 *   | <REFLECT_TYPE:[ALL/FLOOR/WALL]>
 *     | Determines which reflections are enabled for this.
 *     | This overrides the defaults in this plugin's parameters.
 *     | ALL enables both wall and floor reflections
 *     | FLOOR enables floor reflections and disables wall reflections
 *     | WALL enables wall reflections and disables floor reflections
 *     |
 *     | For the map, enabling only enables reflections on characters with the
 *     | appropriate settings, and "disable" removes reflections regardless of
 *     | character setup. By default, maps allow reflections to appear.
 * 
 *   | <REFLECT_FLOOR_OFFSETS:[x],[y]>
 *     | Offsets the relevant floor reflections by x pixels horizontally and
 *       y pixels vertically
 *     | Note that the map's offsets and each individual character's offsets
 *       are added to get the final position of the reflection. So, if you
 *       have a character with tag <REFLECT_FLOOR_OFFSETS:-4,6> on a map with
 *       tag <REFLECT_FLOOR_OFFSETS:1,1>, the final offset of that individual
 *       character's reflection will be -3 pixels horizontally and 7 pixels
 *       vertically.
 *   | <REFLECT_WALL_OFFSETS:[x],[y]>
 *     | Offsets the relevant wall reflections by x pixels horizontally and
 *       y pixels vertically. Like the above, the final reflection position
 *       is the sum of the character offsets and the map offsets.
 * 
 * Map Note Tags:
 * 
 *   | <REFLECT_MODE:[PERSPECTIVE/EVENT]>
 *     | This overrides the perspective option in the plugin parameters for this
 *     | map. This is reset upon leaving and re-entering the map.
 * 
 * Shared Character Note Tags:
 * 
 * - These note tags are shared by actors and events
 * 
 *   | <REFLECT_INDEX:[x]>
 *     | x is the index of this character's reflection on the character sheet.
 *     | This parameters has no effect if the character is using a big
 *     | character for their reflection sprite.
 * 
 *   | <REFLECT_FLOOR_OPACITY:[x]>
 *     | x is a number between 0-255, inclusive. This is the "opacity" of the
 *       floor reflection sprite of the character. In other words, this is how
 *       transparent the reflection sprites appear for the character, where 0
 *       is totally transparent and 255 is fully opaque.
 * 
 *   | <REFLECT_WALL_OPACITY:[x]>
 *     | x is a number between 0-255, inclusive. This is the "opacity" of the
 *       wall reflection sprite of the character. In other words, this is how
 *       transparent the reflection sprites appear for the character, where 0
 *       is totally transparent and 255 is fully opaque.
 * 
 * Event Note Tags:
 * 
 *   | <REFLECT_CHAR:[filename]>
 *     | Uses the character sheet with the specified filename for this event's
 *     | reflection. Index can be set seperately with REFLECT_INDEX.
 * 
 * Actor Note Tags:
 *   | <REFLECT_ACTOR:[filename]>
 *     | Uses the character sheet with the specified filename for this actor's
 *     | reflection. Index can be set seperately with REFLECT_INDEX.
 * 
 * ------------------------------Plugin Commands------------------------------
 * 
 * Change Event Reflection
 *   | Change the reflection parameters of a specified event. These changes
 *   | are reset on map reload.
 * 
 * Match Event Reflection
 *   | Sets this event's reflection graphic to their normal top view graphic.
 * 
 * Change Actor Reflection
 *   | Change the reflection parameters of a specified actor. These changes
 *   | are persistent and are included in the save file.
 * 
 * Match Actor Reflection
 *   | Sets this actor's reflection graphic to their normal top view graphic.
 * 
 * Set Wall Reflection Mode
 *   | Sets the wall reflection mode by changing the wall reflection mode variable
 *   | defined in the plugin parameters. Does nothing if that parameter is 0.
 * 
 * Refresh Wall Reflections
 *   | Refreshes the wall reflection positions on the current map. Useful if
 *   | tiles on the current map have their regions updated.
 * 
 * Override Map Settings
 *   | Overrides reflection settings for the current map. This can be used to
 *   | quickly disable all reflections or change the perspective mode temporarily.
 *   | All changes are lost upon leaving and re-entering the map.
 * 
 * ---------------------------Plugin Script Calls---------------------------
 * 
 * The script calls for this plugin are as follows.
 * 
 * Format your script commands as KCDev.Mirrors.<function name>
 * 
 * Example: KCDev.Mirrors.setEventReflect(1, 'Actor1', 0, true, false)
 * 
 * The commands are as follows:
 * 
 * setEventReflect(event_id, reflection_filename, reflection_index, floor_enabled, wall_enabled, floor_opacity, wall_opacity, floor_x_offset, floor_y_offset, wall_x_offset, wall_y_offset)
 *   | Same as Change Event Reflection command
 * 
 * resetEventReflectImage(event_id)
 *   | Same as Match Event Reflection command
 * 
 * setActorReflect(actor_id, reflection_filename, reflection_index, floor_enabled, wall_enabled, floor_opacity, wall_opacity, floor_x_offset, floor_y_offset, wall_x_offset, wall_y_offset)
 *   | Same as Change Actor Reflection command
 * 
 * resetActorReflectImage(actor_id)
 *   | Same as Match Actor Reflection command
 * 
 * setWallReflectMode(mode)
 *   | Same as Set Wall Reflection Mode command
 * 
 * refreshReflectWallCache()
 *   | Same as Refresh Wall Reflections command
 * 
 * overrideMapSettings(floorEnabled, wallEnabled, mode)
 *   | Same as Override Map Settings command
 * 
 * @param regionsParent
 * @text Regions
 * 
 * @param wallRegions
 * @parent regionsParent
 * @text Wall Region IDs
 * @desc A wall reflection sprite will be drawn on tiles with any of these region IDs.
 * @type number[]
 * @default ["1"]
 * 
 * @param noReflectRegions
 * @parent regionsParent
 * @text Disable Reflection IDs
 * @desc Any character standing on a tile with one of these region IDs will have all reflections disabled.
 * @type number[]
 * @default []
 * 
 * @param defaultParent
 * @text Default Settings
 * 
 * @param actorDefault
 * @text Actors
 * @desc Default settings for player and followers.
 * @type struct<defaults>
 * @parent defaultParent
 * @default {"reflectFloor":"true","reflectWall":"true"}
 * 
 * @param eventDefault
 * @text Events
 * @desc Default setting for map events.
 * @type struct<defaults>
 * @parent defaultParent
 * @default{"reflectFloor":"false","reflectWall":"false"}
 * 
 * @param advancedOptsParent
 * @text Other Options
 * 
 * @param zValue
 * @parent advancedOptsParent
 * @text Reflection Z Value
 * @desc The z value of the reflections. Negative values are drawn below the map.
 * @default -1
 * 
 * @param attemptFixZFight
 * @text Use Z Fighting Fixup
 * @parent zValue
 * @desc Certain plugins cause an incorrect ordering of characters in wall 'perspective' mode. Use only if needed.
 * @type boolean
 * @default false
 * 
 * @param maxWallDistance
 * @parent advancedOptsParent
 * @text Maximum Wall Distance
 * @desc Sets maximum distance for wall reflection to appear. Affects how quickly sprite shrinks in pseudo-perspective.
 * @type number
 * @default 20
 * 
 * @param wallReflectType
 * @parent advancedOptsParent
 * @text Wall Reflection Mode
 * @desc Choose the type of wall reflection to use. This is also the fallback if the variable has an invalid value.
 * @type select
 * @option Pseudo-Perspective
 * @value perspective
 * @option Event-Like
 * @value event
 * @default perspective
 * 
 * @param wallReflectVar
 * @parent wallReflectType
 * @text Reflect Mode Variable
 * @desc This variable is checked for a wall reflect type. Set to 0 to disable this.
 * @type variable
 * @default 0
 * 
 * @noteParam REFLECT_CHAR
 * @noteDir img/characters/
 * @noteType file
 * @noteData events
 * 
 * @noteParam REFLECT_ACTOR
 * @noteDir img/characters/
 * @noteType file
 * @noteData actors
 * 
 * @command changeEventReflect
 * @text Change Event Reflection
 * @desc Change the reflection graphic of an event. Changes are reset on map reload. 
 * @arg id
 * @text Event ID
 * @type text
 * @desc Specify the event to change the graphic of. 0 is this event.
 * @default 0
 * 
 * @arg character
 * @text Character File
 * @desc Specify the new character file name. Keep empty to leave this unchanged.
 * @type file
 * @dir img/characters/
 * 
 * @arg index
 * @text Character Index
 * @desc Index to use in the new graphic. Keep empty to leave this unchanged.
 * @type text
 * 
 * @arg reflectFloorOpacity
 * @text Floor Opacity
 * @desc Set the floor reflection's opacity by entering a number 0-255. -1 sets reflection to follow parent character's opacity.
 * @type combo
 * @option unchanged
 * @option -1
 * @default unchanged
 * 
 * @arg reflectWallOpacity
 * @text Wall Opacity
 * @desc Set the wall reflection's opacity by entering a number 0-255. -1 sets reflection to follow parent character's opacity.
 * @type combo
 * @option unchanged
 * @option -1
 * @default unchanged
 * 
 * @arg reflectFloor
 * @text Enable Floor Reflection
 * @type select
 * @option Enable
 * @value true
 * @option Disable
 * @value false
 * @option Unchanged
 * @value unchanged
 * @default unchanged
 * 
 * @arg reflectWall
 * @text Enable Wall Reflection
 * @type select
 * @option Enable
 * @value true
 * @option Disable
 * @value false
 * @option Unchanged
 * @value unchanged
 * @default unchanged
 * 
 * @arg reflectFloorXOffset
 * @parent reflectFloor
 * @text Floor x Offset
 * @desc The x offset of the floor reflection for this character. Leave blank to keep unchanged.
 * @type text
 * 
 * @arg reflectFloorYOffset
 * @parent reflectFloor
 * @text Floor y Offset
 * @desc The y offset of the floor reflection for this character. Leave blank to keep unchanged.
 * @type text
 * 
 * @arg reflectWallXOffset
 * @text Wall x Offset
 * @parent reflectWall
 * @desc The x offset of the wall reflection for this character. Leave blank to keep unchanged.
 * @type text
 * 
 * @arg reflectWallYOffset
 * @text Wall y Offset
 * @parent reflectWall
 * @desc The y offset of the wall reflection for this character. Leave blank to keep unchanged.
 * @type text
 * 
 * @command resetEventReflect
 * @text Match Event Reflection
 * @desc Set the chosen event's graphic to its current top view character graphic and opacity. Changes are reset on map reload.
 * 
 * @arg id
 * @text Event ID
 * @type text
 * @desc Specify the event to remove custom reflection images for. 0 refers to this event.
 * @default 0
 * 
 * @command changeActorReflect
 * @text Change Actor Reflection
 * @desc Change the reflection graphic of an actor.
 * 
 * @arg id
 * @text Actor ID
 * @type actor
 * @desc Specify the actor to change the reflection of. 0 refers to the current party leader and negatives refer to followers.
 * @default 0
 * 
 * @arg character
 * @text Character File
 * @desc Specify the new character file name. Keep empty to leave this unchanged.
 * @type file
 * @dir img/characters/
 * 
 * @arg index
 * @text Character Index
 * @desc Index to use in the new graphic. Keep empty to leave this unchanged.
 * @type text
 * 
 * @arg reflectFloorOpacity
 * @text Floor Opacity
 * @desc Set the floor reflection's opacity by entering a number 0-255. -1 sets reflection to follow parent character's opacity.
 * @type combo
 * @option unchanged
 * @option -1
 * @default unchanged
 * 
 * @arg reflectWallOpacity
 * @text Wall Opacity
 * @desc Set the wall reflection's opacity by entering a number 0-255. -1 sets reflection to follow parent character's opacity.
 * @type combo
 * @option unchanged
 * @option -1
 * @default unchanged
 * 
 * @arg reflectFloor
 * @text Enable Floor Reflection
 * @type select
 * @option Enable
 * @value true
 * @option Disable
 * @value false
 * @option Unchanged
 * @value unchanged
 * @default unchanged
 * 
 * @arg reflectWall
 * @text Enable Wall Reflection
 * @type select
 * @option Enable
 * @value true
 * @option Disable
 * @value false
 * @option Unchanged
 * @value unchanged
 * @default unchanged
 * 
 * @arg reflectFloorXOffset
 * @parent reflectFloor
 * @text Floor x Offset
 * @desc The x offset of the floor reflection for this character. Leave blank to keep unchanged.
 * @type text
 * 
 * @arg reflectFloorYOffset
 * @parent reflectFloor
 * @text Floor y Offset
 * @desc The y offset of the floor reflection for this character. Leave blank to keep unchanged.
 * @type text
 * 
 * @arg reflectWallXOffset
 * @text Wall x Offset
 * @parent reflectWall
 * @desc The x offset of the wall reflection for this character. Leave blank to keep unchanged.
 * @type text
 * 
 * @arg reflectWallYOffset
 * @text Wall y Offset
 * @parent reflectWall
 * @desc The y offset of the wall reflection for this character. Leave blank to keep unchanged.
 * @type text
 * 
 * @command resetActorReflect
 * @text Match Actor Reflection
 * @desc Set the actor's reflection to the same graphic and opacity as their top view character.
 * 
 * @arg id
 * @text Actor ID
 * @type actor
 * @desc Specify the actor to change. 0 refers to the current party leader and negatives refer to followers in order.
 * @default 0
 * 
 * @command setWallReflectMode
 * @text Set Wall Reflection Mode
 * @desc Sets the variable defined in the plugin params to a reflection mode.
 * 
 * @arg mode
 * @text New Mode
 * @type select
 * @option Pseudo-Perspective
 * @value perspective
 * @option Event-Like
 * @value event
 * @default perspective
 * 
 * @command refreshReflectMap
 * @text Refresh Wall Reflections
 * @desc Force refresh wall reflections on current map. Useful if region IDs of tiles are changed during gameplay.
 * 
 * @command overrideMapSettings
 * @text Override Map Settings
 * @desc These overrides will stay in effect until the map is left and re-entered. These overrides take priority over the plugin parameters.
 * 
 * @arg reflectFloor
 * @text Allow Floor Reflections
 * @type select
 * @option Allow
 * @value allow
 * @option Disallow
 * @value disallow
 * @option Reset to Map Notes
 * @value map notes
 * @option Unchanged
 * @value unchanged
 * @default unchanged
 * 
 * @arg reflectWall
 * @text Allow Wall Reflections
 * @type select
 * @option Allow
 * @value allow
 * @option Disallow
 * @value disallow
 * @option Reset to Map Notes
 * @value map notes
 * @option Unchanged
 * @value unchanged
 * @default unchanged
 * 
 * @arg mode
 * @text Reflection Mode
 * @type select
 * @option Pseudo-Perspective
 * @value perspective
 * @option Event-Like
 * @value event
 * @option Match Plugin Params
 * @value plugin params
 * @option Match Map Notes
 * @value map notes
 * @option Unchanged
 * @value unchanged
 * @default unchanged
 * 
 */

/*~struct~defaults:
 * @param reflectFloor
 * @text Floor Reflection
 * @desc Enable floor reflections by default.
 * @type boolean
 * @default false
 * 
 * @param reflectWall
 * @text Wall Reflection
 * @desc Enable wall reflections by default.
 * @type boolean
 * @default false
 * 
 */

// A general namespace for all of my plugins

var KCDev = KCDev || {};

KCDev.Mirrors = {};

KCDev.Mirrors = {};
KCDev.Mirrors.zValue = -1;
KCDev.Mirrors.wallReflectType = 'perspective';
KCDev.Mirrors.wallReflectVar = 0;
KCDev.Mirrors.maxWallDistance = 20;
KCDev.Mirrors.actorDefault = {};
KCDev.Mirrors.actorDefault.reflectFloor = true;
KCDev.Mirrors.actorDefault.reflectWall = true;
KCDev.Mirrors.eventDefault = {};
KCDev.Mirrors.eventDefault.reflectFloor = false;
KCDev.Mirrors.eventDefault.reflectWall = false;
KCDev.Mirrors.useZFightFix = false;
/** @type {Map<number,number[]>} */
KCDev.Mirrors.reflectWallPositions = null;
KCDev.Mirrors.currMapId = -1;
/** @type {Set<number>} */
KCDev.Mirrors.wallRegions = null;
/** @type {Set<number>} */
KCDev.Mirrors.noReflectRegions = null;

(() => {
    const script = document.currentScript;

    /**
     * @typedef KCMirrorParams
     * @property {number} zValue
     * @property {number} maxWallDistance
     * @property {object} actorDefault
     * @property {boolean} actorDefault.reflectFloor
     * @property {boolean} actorDefault.reflectWall
     * @property {object} eventDefault
     * @property {boolean} eventDefault.reflectFloor
     * @property {boolean} eventDefault.reflectWall
     * @property {string} wallReflectType
     * @property {number} wallReflectVar
     */

    const /** @type {KCMirrorParams} */ parameters = PluginManagerEx.createParameter(script);

    if (parameters.zValue !== undefined) {
        KCDev.Mirrors.zValue = parameters.zValue;
    }
    if (parameters.maxWallDistance !== undefined) {
        KCDev.Mirrors.maxWallDistance = parameters.maxWallDistance;
    }
    if (parameters.wallReflectType) {
        KCDev.Mirrors.wallReflectType = parameters.wallReflectType;
    }

    KCDev.Mirrors.useZFightFix = parameters.attemptFixZFight;
    KCDev.Mirrors.actorDefault = parameters.actorDefault;
    KCDev.Mirrors.eventDefault = parameters.eventDefault;
    KCDev.Mirrors.wallRegions = new Set(parameters.wallRegions);
    KCDev.Mirrors.noReflectRegions = new Set(parameters.noReflectRegions);

    // plugin commands
    PluginManagerEx.registerCommand(script, 'changeEventReflect', function (args) {
        KCDev.Mirrors.setEventReflect.apply(this, KCDev.Mirrors.convertChangeReflectArgs($gameMap.event(args.id), args));
    });

    PluginManagerEx.registerCommand(script, 'changeActorReflect', function (args) {
        const actorId = KCDev.Mirrors.getRealActorId(args.id);
        const actor = $gameActors.actor(actorId);
        args.id = actorId;
        KCDev.Mirrors.setActorReflect(...KCDev.Mirrors.convertChangeReflectArgs(actor, args));
    });

    PluginManagerEx.registerCommand(script, 'resetEventReflect', function (args) {
        KCDev.Mirrors.resetEventReflectImage.call(this, args.id);
    });

    PluginManagerEx.registerCommand(script, 'resetActorReflect', function (args) {
        KCDev.Mirrors.resetActorReflectImage.call(this, args.id);
    });

    PluginManagerEx.registerCommand(script, 'refreshReflectMap', function (args) {
        KCDev.Mirrors.refreshReflectWallCache();
    });

    PluginManagerEx.registerCommand(script, 'setWallReflectMode', function (args) {
        KCDev.Mirrors.setWallReflectMode(args.mode);
    });

    PluginManagerEx.registerCommand(script, 'overrideMapSettings', function (args) {
        KCDev.Mirrors.overrideMapSettings(args.reflectFloor, args.reflectWall, args.mode);
    });

})();

KCDev.Mirrors.wallModes = {};
KCDev.Mirrors.wallModes.perspective = 0;
KCDev.Mirrors.wallModes.event = 1;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// START CUSTOM CLASS DEFINITIONS                                                                             //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Our reflection sprites are Sprite_Character objects with empty update functions. We remove the update function
 * to allow the "parent" character sprite to handle the this sprite's position, rotation, etc. We cannot just
 * parent this sprite to the parent, as seen with the bush opacity sprites, because we need to draw this sprite
 * behind the tileset layer.
 * 
 */
KCDev.Mirrors.Sprite_Reflect = class Sprite_Reflect extends Sprite_Character {

    /**
     * 
     * @param {Sprite_Character} parentCharSprite This is the character this sprite represents a reflection of
     * @param  {...any} spriteArgs 
     */
    constructor(parentCharSprite, ...spriteArgs) {
        super(spriteArgs);
        this.anchor.x = 0.5;
        this.anchor.y = 1;
        this.parentSprite = parentCharSprite;
        this.z = 2 * KCDev.Mirrors.zValue;
        this._character = parentCharSprite._character;
    }

    // we're letting the parent graphic handle this
    update() { }

    refreshGraphic() {
        this._characterName = (this._character.reflectName() === '') ? this._character.characterName() : this._character.reflectName();
        this._characterIndex = (this._character.reflectIndex() < 0) ? this._character.characterIndex() : this._character.reflectIndex();
        this.bitmap = ImageManager.loadCharacter(this._characterName);
        this._isBigCharacter = ImageManager.isBigCharacter(this._characterName);
        this._tileId = 0;
    }

    // changing the index used in characterBlockX and characterBlockY to the internally stored index rather than the one in the character
    characterBlockX() {
        if (this._isBigCharacter) {
            return 0;
        } else {
            const index = this._characterIndex;
            return (index % 4) * 3;
        }
    }

    characterBlockY() {
        if (this._isBigCharacter) {
            return 0;
        } else {
            const index = this._characterIndex;
            return Math.floor(index / 4) * 4;
        }
    };

    _refresh() {
        super._refresh();
        const pp = this.parentSprite.pivot;
        this.pivot.set(pp.x, pp.y);
    }
};

KCDev.Mirrors.Sprite_Reflect_Wall = class Sprite_Reflect_Wall extends KCDev.Mirrors.Sprite_Reflect {

    // draw graphic for opposite facing direction
    characterPatternY() {
        return (this._character.reverseDir(this._character.direction()) - 2) / 2;
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// END CUSTOM CLASS DEFINITIONS                                                                               //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// START EVENT COMMAND DEFINITIONS                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Set reflection properties of an event on the map.
 * @param {number} eventId ID of the event to change the reflection properties of.
 * @param {string} reflectChar File name of the new graphic to use as a reflection.
 * @param {number} reflectIndex Index of the character in the file to use as a reflection.
 * @param {boolean} enableFloor If true, enable floor reflections for the target event.
 * @param {boolean} enableWall If true, enable wall reflections for the target event.
 * @param {number | undefined} floorOpacity Opacity of the floor reflection
 * @param {number | undefined} wallOpacity Opacity of the wall reflection
 * @param {number | undefined} floorXOffset x offset of the floor reflection
 * @param {number | undefined} floorYOffset y offset of the floor reflection
 * @param {number | undefined} wallXOffset x offset of the wall reflection
 * @param {number | undefined} wallYOffset y offset of the wall reflection
 */
KCDev.Mirrors.setEventReflect = function (eventId, reflectChar, reflectIndex, enableFloor, enableWall, floorOpacity, wallOpacity, floorXOffset, floorYOffset, wallXOffset, wallYOffset) {
    const event = $gameMap.event(eventId === 0 ? this.eventId() : eventId);
    if (event) {
        event.setReflectImage(reflectChar, reflectIndex);
        event.reflectFloorToggle(enableFloor);
        event.reflectWallToggle(enableWall);
        event.setReflectFloorOpacity(floorOpacity);
        event.setReflectWallOpacity(wallOpacity);
        event.setReflectFloorXOffset(floorXOffset);
        event.setReflectFloorYOffset(floorYOffset);
        event.setReflectWallXOffset(wallXOffset);
        event.setReflectWallYOffset(wallYOffset);
    }
};

/**
 * Makes the event's reflection the same as the event graphic.
 * @param {number} eventId Event to target
 */
KCDev.Mirrors.resetEventReflectImage = function (eventId) {
    const event = $gameMap.event(eventId === 0 ? this.eventId() : eventId);
    if (event) {
        event.setReflectImage();
        event.setReflectFloorOpacity();
        event.setReflectWallOpacity();
    }
};

/**
 * Takes an actor ID and converts 0 to the party leader's actor ID and negative numbers to
 * the follower actors' IDs.
 * @param {number} actorId ID of the actor or party member index
 * @returns {number}
 */
KCDev.Mirrors.getRealActorId = function (actorId) {
    if (actorId < 1) {
        if (actorId === 0) {
            if ($gameParty.size() > 0) {
                return $gameParty.leader().actorId();
            }
            else return -1;
        }
        else {
            const followers = $gamePlayer.followers();
            const follower = followers.follower(Math.abs(actorId) - 1);
            if (follower?.actor()) {
                return follower.actor().actorId();
            }
            else {
                return -1;
            }
        }
    }
    return actorId;
};

/**
 * Set reflection properties of an actor.
 * @param {number} actorId ID the actor to target.
 * @param {string} reflectChar File name of the new graphic to use as a reflection.
 * @param {number} reflectIndex Index of the character in the file to use as a reflection.
 * @param {boolean} enableFloor If true, enable floor reflections for the target actor.
 * @param {boolean} enableWall If true, enable wall reflections for the target actor.
 * @param {number|undefined} floorOpacity Set floor reflection opacity
 * @param {number|undefined} wallOpacity Set wall reflection opacity
 * @param {number | undefined} floorXOffset x offset of the floor reflection
 * @param {number | undefined} floorYOffset y offset of the floor reflection
 * @param {number | undefined} wallXOffset x offset of the wall reflection
 * @param {number | undefined} wallYOffset y offset of the wall reflection
 */
KCDev.Mirrors.setActorReflect = function (actorId, reflectChar, reflectIndex, enableFloor, enableWall, floorOpacity, wallOpacity, floorXOffset, floorYOffset, wallXOffset, wallYOffset) {
    const realId = KCDev.Mirrors.getRealActorId(actorId);
    if (realId < 0) return;
    const actor = $gameActors.actor(realId);
    if (actor) {
        actor.setReflectImage(reflectChar, reflectIndex)
        actor.reflectFloorToggle(enableFloor);
        actor.reflectWallToggle(enableWall);
        actor.setReflectFloorOpacity(floorOpacity);
        actor.setReflectWallOpacity(wallOpacity);
        actor.setReflectFloorXOffset(floorXOffset);
        actor.setReflectFloorYOffset(floorYOffset);
        actor.setReflectWallXOffset(wallXOffset);
        actor.setReflectWallYOffset(wallYOffset);
    }
};

/**
 * Sets the target actor's reflection graphic to be the same as their character graphic.
 * @param {number} actorId Targetted actor's ID
 * @returns {void}
 */
KCDev.Mirrors.resetActorReflectImage = function (actorId) {
    const realId = KCDev.Mirrors.getRealActorId(actorId);
    if (realId < 0) return;
    const actor = $gameActors.actor(realId);
    if (actor) {
        actor.setReflectImage();
        actor.setReflectFloorOpacity();
        actor.setReflectWallOpacity();
    }
};

/**
 * Sets the wall reflection variable type to a new value.
 * @param {string} mode New wall reflection mode.
 */
KCDev.Mirrors.setWallReflectMode = function (mode = KCDev.Mirrors.wallReflectType) {
    if (KCDev.Mirrors.wallReflectVar) {
        $gameVariables.setValue(KCDev.Mirrors.wallReflectVar, mode);
    }
};

/**
 * Get current wall reflection mode in the plugin config
 * This can be overwritten by map settings
 * @returns {number}
 */
KCDev.Mirrors.getWallReflectMode = function () {
    if (KCDev.Mirrors.wallReflectVar) {
        const val = $gameVariables.value(KCDev.Mirrors.wallReflectVar);
        if (KCDev.Mirrors.wallModes[val] !== undefined) {
            return KCDev.Mirrors.wallModes[val];
        }
    }
    return KCDev.Mirrors.wallModes[KCDev.Mirrors.wallReflectType];
};

/**
 * Returns a list of arguments to set the target's reflection properties and substitutes values that are
 * unchanged for the current values.
 * @param {Game_Character} char Character that is being updated
 * @param {Object} args Plugin command arguments
 * @param {number} args.id ID of the target event or actor.
 * @param {string} args.character Character file name to use as the reflection.
 * @param {number | string} args.index Index of the character to use as a reflection. Empty string means do not change.
 * @param {boolean | string} args.reflectFloor Enables or disables the floor reflections of the target.
 * @param {boolean | string} args.reflectWall Enables or disables the wall reflections of the target.
 * @param {number | string} args.reflectFloorOpacity Floor opacity to use for the reflection
 * @param {number | string} args.reflectWallOpacity Wall opacity to use for the reflection
 * @param {number | string} args.reflectFloorXOffset Floor reflection x offset
 * @param {number | string} args.reflectFloorYOffset Floor reflection y offset
 * @param {number | string} args.reflectWallXOffset Wall reflection x offset
 * @param {number | string} args.reflectWallYOffset Wall reflection y offset
 * @returns {Array<any>}
 */
KCDev.Mirrors.convertChangeReflectArgs = function (char, args) {

    if (!char) { // create a fake character with the desired functions if no character is passed in
        char = {
            reflectName() { return '' },
            reflectIndex() { return -1 },
            reflectFloor() { return false; },
            reflectWall() { return false; },
            reflectFloorOpacity() { return undefined; },
            setReflectWallOpacity() { return undefined; },
            reflectFloorXOffset() { return 0; },
            reflectFloorYOffset() { return 0; },
            reflectWallXOffset() { return 0; },
            reflectWallYOffset() { return 0; }
        };
    }

    const id = args.id;
    const character = args.character === '' ? char.reflectName() : args.character;
    const index = args.index === '' ? char.reflectIndex() : args.index;
    const reflectFloor = args.reflectFloor === 'unchanged' ? char.reflectFloor() : args.reflectFloor;
    const reflectWall = args.reflectWall === 'unchanged' ? char.reflectWall() : args.reflectWall;
    const reflectFloorOpacity = typeof (args.reflectFloorOpacity) !== 'number' ? char.reflectFloorOpacity() : (args.reflectFloorOpacity === -1 ? undefined : args.reflectFloorOpacity);
    const reflectWallOpacity = typeof (args.reflectWallOpacity) !== 'number' ? char.reflectWallOpacity() : (args.reflectWallOpacity === -1 ? undefined : args.reflectWallOpacity);
    const reflectFloorXOff = typeof (args.reflectFloorXOffset) !== 'number' ? char.reflectFloorXOffset() : args.reflectFloorXOffset;
    const reflectFloorYOff = typeof (args.reflectFloorYOffset) !== 'number' ? char.reflectFloorYOffset() : args.reflectFloorYOffset;
    const reflectWallXOff = typeof (args.reflectWallXOffset) !== 'number' ? char.reflectFloorXOffset() : args.reflectWallXOffset;
    const reflectWallYOff = typeof (args.reflectWallYOffset) !== 'number' ? char.reflectFloorYOffset() : args.reflectWallYOffset;
    return [id, character.trim(), index, reflectFloor, reflectWall, reflectFloorOpacity, reflectWallOpacity, reflectFloorXOff, reflectFloorYOff, reflectWallXOff, reflectWallYOff];
};

/**
 * Overrides map settings. These params are usually controlled through note tags
 * @param {boolean} floorEnabled If false globally disable floor reflections for current map
 * @param {boolean} wallEnabled If false globally disable wall reflections for current map
 * @param {string} mode Reflection mode
 */
KCDev.Mirrors.overrideMapSettings = function (floorEnabled = 'unchanged', wallEnabled = 'unchanged', mode = 'unchanged') {
    const refType = 'Reflect_Type';
    const reflect = PluginManagerEx.findMetaValue($dataMap, [refType, refType.toLowerCase(), refType.toUpperCase()])?.trim().toUpperCase();
    if (floorEnabled !== 'unchanged') $gameMap.setReflectFloor(floorEnabled === 'map notes' ? reflect === 'FLOOR' || reflect === 'ALL' || reflect === undefined : floorEnabled === 'allow');
    if (wallEnabled !== 'unchanged') $gameMap.setReflectWall(wallEnabled === 'map notes' ? reflect === 'WALL' || reflect === 'ALL' || reflect === undefined : wallEnabled === 'allow');

    if (mode !== 'unchanged') {
        if (mode === 'map notes') {
            const refMode = 'Reflect_Mode';
            mode = PluginManagerEx.findMetaValue($dataMap, [refMode, refMode.toLowerCase(), refMode.toUpperCase()])?.toLowerCase().trim();
        }
        switch (mode) {
            case 'perspective':
                $gameMap.setReflectMode(KCDev.Mirrors.wallModes.perspective)
                break;

            case 'event':
                $gameMap.setReflectMode(KCDev.Mirrors.wallModes.event);
                break;

            default:
                $gameMap.setReflectMode(KCDev.Mirrors.getWallReflectMode());
                break;
        }
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// END EVENT COMMAND DEFINITIONS                                                                              //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// START Game_CharacterBase edits                                                                             //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

KCDev.Mirrors.Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
/**
 * Aliased method: Game_CharacterBase.prototype.initMembers
 * Adds default values for the reflection name and index. These values tell this plugin that
 * the reflection should use the character graphic.
 */
Game_CharacterBase.prototype.initMembers = function () {
    KCDev.Mirrors.Game_CharacterBase_initMembers.apply(this, arguments);
    this._reflectName = '';
    this._reflectIndex = -1;
};

KCDev.Mirrors.Game_CharacterBase_setImage = Game_CharacterBase.prototype.setImage;
/**
 * Aliased method: Game_CharacterBase.prototype.setImage
 * Added a reflection refresh whenever the event's character image changes.
 * @param {string} characterName New character file name
 * @param {number} characterIndex Index of the character to use
 */
Game_CharacterBase.prototype.setImage = function (characterName, characterIndex) {
    KCDev.Mirrors.Game_CharacterBase_setImage.apply(this, arguments);
    this.requestReflectRefresh();
};

/**
 * New method: Game_CharacterBase.prototype.setReflectImage
 * Sets the reflection graphic for a character
 * @param {string} filename New reflection image's file name
 * @param {number} index Index of the character to use in the file name
 */
Game_CharacterBase.prototype.setReflectImage = function (filename = '', index = -1) {
    this._reflectName = filename.trim();
    this._reflectIndex = index;
    this.requestReflectRefresh();
};

/**
 * New method: Game_CharacterBase.prototype.reflectName
 * Returns the reflection graphic's filename.
 * Returns an empty string if the reflection is mapped to the regular character graphic.
 * @returns {string}
 */
Game_CharacterBase.prototype.reflectName = function () {
    return this._reflectName;
};

/**
 * New method: Game_CharacterBase.prototype.reflectIndex
 * Returns the index of the reflection graphic. Returns -1 if the graphic is regular character graphic's index
 * @returns {number}
 */
Game_CharacterBase.prototype.reflectIndex = function () {
    return this._reflectIndex;
};

/**
 * New method: Game_CharacterBase.prototype.reflectWallToggle
 * Enables or disables the wall reflection.
 * @param {boolean} reflect True if wall reflection is on, false otherwise
 */
Game_CharacterBase.prototype.reflectWallToggle = function (reflect = !this.reflectWall()) {
    this._reflectWall = reflect;
};

/**
 * New method: Game_CharacterBase.prototype.reflectWall
 * Returns the current state of the wall reflection, true for enabled and false for disabled.
 * @returns {boolean}
 */
Game_CharacterBase.prototype.reflectWall = function () {
    return this._reflectWall;
};

/**
 * New method: Game_CharacterBase.prototype.reflectFloorToggle
 * Set state of floor reflection
 * @param {boolean} reflect True if floor reflection is on, false otherwise
 */
Game_CharacterBase.prototype.reflectFloorToggle = function (reflect = !this.reflectFloor()) {
    this._reflectFloor = reflect;
};

/**
 * New method: Game_CharacterBase.prototype.reflectFloor
 * Returns true if the floor reflection is on for this character, false otherwise.
 * @returns {boolean}
 */
Game_CharacterBase.prototype.reflectFloor = function () {
    return this._reflectFloor;
};

/**
 * New method: Game_CharacterBase.prototype.reflectDisable
 * Disables wall and floor reflections for this character.
 */
Game_CharacterBase.prototype.reflectDisable = function () {
    this.reflectFloorToggle(false);
    this.reflectWallToggle(false);
};

/**
 * New method: Game_CharacterBase.prototype.reflectEnable
 * Enables wall and floor reflections for this character.
 */
Game_CharacterBase.prototype.reflectEnable = function () {
    this.reflectFloorToggle(true);
    this.reflectWallToggle(true);
};

/**
 * New method: Game_CharacterBase.prototype.reflectRefreshRequested
 * Returns true if a refresh has been requested for the reflection graphic.
 * @returns {boolean}
 */
Game_CharacterBase.prototype.reflectRefreshRequested = function () {
    return this._reflectRefreshRequested;
};

/**
 * New method: Game_CharacterBase.prototype.requestReflectRefresh
 * Requests for the reflection graphic to be updated on the next update
 */
Game_CharacterBase.prototype.requestReflectRefresh = function () {
    this._reflectRefreshRequested = true;
};

/**
 * New method: Game_CharacterBase.prototype.clearReflectRefresh
 * Clears reflection graphic refresh requests.
 */
Game_CharacterBase.prototype.clearReflectRefresh = function () {
    this._reflectRefreshRequested = false;
};

/**
 * New method: Game_CharacterBase.prototype.reflectOpacity
 * Returns floor reflection opacity for this character
 * @returns {number | undefined}
 */
Game_CharacterBase.prototype.reflectFloorOpacity = function () {
    return this._reflectFloorOpacity;
};

/**
 * New method: Game_CharacterBase.prototype.reflectWallOpacity
 * Returns wall reflection opacity for this character
 * @returns {number | undefined}
 */
Game_CharacterBase.prototype.reflectWallOpacity = function () {
    return this._reflectWallOpacity;
};

/**
 * New method: Game_CharacterBase.prototype.setReflectFloorOpacity
 * @param {number | undefined} opacity New opacity
 */
Game_CharacterBase.prototype.setReflectFloorOpacity = function (opacity) {
    this._reflectFloorOpacity = opacity;
};

/**
 * New method: Game_CharacterBase.prototype.setReflectWallOpacity
 * @param {number | undefined} opacity New opacity
 */
Game_CharacterBase.prototype.setReflectWallOpacity = function (opacity) {
    this._reflectWallOpacity = opacity;
};

/**
 * New method: Game_CharacterBase.prototype.reflectFloorXOffset
 */
Game_CharacterBase.prototype.reflectFloorXOffset = function () {
    return this._reflectFloorXOff || 0;
};

/**
 * New method: Game_CharacterBase.prototype.setReflectFloorXOffset
 * @param {number} x New x offset
 */
Game_CharacterBase.prototype.setReflectFloorXOffset = function (x = 0) {
    this._reflectFloorXOff = x;
};

/**
 * New method: Game_CharacterBase.prototype.reflectFloorYOffset
 */
Game_CharacterBase.prototype.reflectFloorYOffset = function () {
    return this._reflectFloorYOff || 0;
};

/**
 * New method: Game_CharacterBase.prototype.setReflectFloorYOffset
 * @param {number} y New y offset
 */
Game_CharacterBase.prototype.setReflectFloorYOffset = function (y = 0) {
    this._reflectFloorYOff = y;
};

/**
 * New method: Game_CharacterBase.prototype.reflectWallXOffset
 */
Game_CharacterBase.prototype.reflectWallXOffset = function () {
    return this._reflectWallXOff || 0;
};

/**
 * New method: Game_CharacterBase.prototype.setReflectFloorXOffset
 * @param {number} x New x offset
 */
Game_CharacterBase.prototype.setReflectWallXOffset = function (x = 0) {
    this._reflectWallXOff = x;
};

/**
 * New method: Game_CharacterBase.prototype.reflectWallYOffset
 */
Game_CharacterBase.prototype.reflectWallYOffset = function () {
    return this._reflectWallYOff || 0;
};

/**
 * New method: Game_CharacterBase.prototype.setReflectWallYOffset
 * @param {number} y New y offset
 */
Game_CharacterBase.prototype.setReflectWallYOffset = function (y = 0) {
    this._reflectWallYOff = y;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// END Game_CharacterBase edits                                                                               //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// START Game_Actor edits                                                                                     //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Updates reflection properties for characters that represent actors.
 * @param {Game_Actor} actor Target actor to update reflection properties for
 * @param {Game_Character} character Current character representing the actor
 * @returns {void}
 */
KCDev.Mirrors.updateActorCharacterReflect = function (actor, character) {
    if (!actor) return;
    let needsUpdate = false;
    let reflectName = character.reflectName();
    let reflectIndex = character.reflectIndex();
    if (reflectName !== actor.reflectName()) {
        reflectName = actor.reflectName();
        needsUpdate = true;
    }
    if (reflectIndex !== actor.reflectIndex()) {
        reflectIndex = actor.reflectIndex();
        needsUpdate = true;
    }
    if (needsUpdate) {
        character.setReflectImage(reflectName, reflectIndex);
    }
    character.reflectFloorToggle(actor.reflectFloor());
    character.reflectWallToggle(actor.reflectWall());
    character.setReflectFloorOpacity(actor.reflectFloorOpacity());
    character.setReflectWallOpacity(actor.reflectWallOpacity());
    character.setReflectFloorXOffset(actor.reflectFloorXOffset());
    character.setReflectFloorYOffset(actor.reflectFloorYOffset());
    character.setReflectWallXOffset(actor.reflectWallXOffset());
    character.setReflectWallYOffset(actor.reflectWallYOffset());
};

KCDev.Mirrors.Game_Actor_setup = Game_Actor.prototype.setup;
/**
 * Aliased Method: Game_Actor.prototype.setup
 * Add note tag parsing to determine reflection visibility and appearance. Also set up default values.
 * @param {number} actorId ID of the actor to set default values for
 */
Game_Actor.prototype.setup = function (actorId) {
    KCDev.Mirrors.Game_Actor_setup.apply(this, arguments);
    const actor = $dataActors[actorId];
    KCDev.Mirrors.parseMetaValues(this, actor, KCDev.Mirrors.actorDefault, true);
};

// Add reflection methods to Game_Actor for convenience
Game_Actor.prototype.reflectEnable = Game_CharacterBase.prototype.reflectEnable;
Game_Actor.prototype.reflectDisable = Game_CharacterBase.prototype.reflectDisable;
Game_Actor.prototype.reflectFloor = Game_CharacterBase.prototype.reflectFloor;
Game_Actor.prototype.reflectFloorToggle = Game_CharacterBase.prototype.reflectFloorToggle;
Game_Actor.prototype.reflectWall = Game_CharacterBase.prototype.reflectWall;
Game_Actor.prototype.reflectWallToggle = Game_CharacterBase.prototype.reflectWallToggle;
Game_Actor.prototype.reflectName = Game_CharacterBase.prototype.reflectName;
Game_Actor.prototype.reflectIndex = Game_CharacterBase.prototype.reflectIndex;
Game_Actor.prototype.setReflectFloorOpacity = Game_CharacterBase.prototype.setReflectFloorOpacity;
Game_Actor.prototype.setReflectWallOpacity = Game_CharacterBase.prototype.setReflectWallOpacity;
Game_Actor.prototype.reflectFloorOpacity = Game_CharacterBase.prototype.reflectFloorOpacity;
Game_Actor.prototype.reflectWallOpacity = Game_CharacterBase.prototype.reflectWallOpacity;
Game_Actor.prototype.reflectFloorXOffset = Game_CharacterBase.prototype.reflectFloorXOffset;
Game_Actor.prototype.setReflectFloorXOffset = Game_CharacterBase.prototype.setReflectFloorXOffset;
Game_Actor.prototype.reflectFloorYOffset = Game_CharacterBase.prototype.reflectFloorYOffset;
Game_Actor.prototype.setReflectFloorYOffset = Game_CharacterBase.prototype.setReflectFloorYOffset;
Game_Actor.prototype.reflectWallXOffset = Game_CharacterBase.prototype.reflectWallXOffset;
Game_Actor.prototype.setReflectWallXOffset = Game_CharacterBase.prototype.setReflectWallXOffset;
Game_Actor.prototype.reflectWallYOffset = Game_CharacterBase.prototype.reflectWallYOffset;
Game_Actor.prototype.setReflectWallYOffset = Game_CharacterBase.prototype.setReflectWallYOffset;
Game_Actor.prototype.setReflectImage = function (filename = '', index = -1) { // same as Game_CharacterBase but without sprite refresh request
    this._reflectName = filename.trim();
    this._reflectIndex = index;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// END Game_Actor edits                                                                                       //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// START Game_Follower edits                                                                                  //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

KCDev.Mirrors.Game_Follower_update = Game_Follower.prototype.update;
/**
 * Aliased method: Game_Follower.prototype.update
 * Adds a check to update the reflection to the update function.
 */
Game_Follower.prototype.update = function () {
    KCDev.Mirrors.Game_Follower_update.apply(this, arguments);
    KCDev.Mirrors.updateActorCharacterReflect(this.actor(), this);
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// END Game_Follower edits                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// START Game_Player edits                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

KCDev.Mirrors.Game_Player_update = Game_Player.prototype.update;
/**
 * Aliased method: Game_Player.prototype.update
 * Adds a check to update the reflection to the update function.
 */
Game_Player.prototype.update = function () {
    KCDev.Mirrors.Game_Player_update.apply(this, arguments);
    if ($gameParty.size() > 0) {
        const actor = $gameParty.leader();
        KCDev.Mirrors.updateActorCharacterReflect(actor, this);
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// END Game_Player edits                                                                                      //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// START Game_Event edits                                                                                     //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

KCDev.Mirrors.Game_Event_setupPage = Game_Event.prototype.setupPage;
/**
 * Aliased method: Game_Event.prototype.setupPage
 * Adds note tag parsing to override default event reflection settings.
 */
Game_Event.prototype.setupPage = function () {
    KCDev.Mirrors.Game_Event_setupPage.apply(this, arguments);
    KCDev.Mirrors.parseMetaValues(this, this.event(), KCDev.Mirrors.eventDefault)
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// END Game_Event edits                                                                                       //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


KCDev.Mirrors.findMetaSimple = function (str, target) {
    return PluginManagerEx.findMetaValue(target, [str, str.toLowerCase(), str.toUpperCase()]);
};

/**
 * Parses note tags for events and actors
 * @param {Game_Event | Game_Actor} reflectableObj Game object with reflection setting and getting methods
 * @param {rm.types.Actor | rm.types.Event} target Database information that will be used to find the note tags
 * @param {{reflectFloor: boolean, reflectWall: boolean}} defaults Default values for floor and wall reflections for the target object
 * @param {boolean} isActor Actors and events use different reflection characters!
 */
KCDev.Mirrors.parseMetaValues = function (reflectableObj, target, defaults, isActor = false) {

    const findMetaSimple = function (str) {
        return KCDev.Mirrors.findMetaSimple(str, target);
    };

    const refChar = isActor ? 'Reflect_Actor' : 'Reflect_Char';
    const refIdx = 'Reflect_Index';
    const refType = 'Reflect_Type';
    const refFloorOpa = 'Reflect_Floor_Opacity';
    const refWallOpa = 'Reflect_Wall_Opacity';
    const refWallOff = 'Reflect_Wall_Offsets';
    const refFloorOff = 'Reflect_Floor_Offsets';
    const metaChar = findMetaSimple(refChar);
    const metaIdx = findMetaSimple(refIdx);
    const metaFloorOpa = findMetaSimple(refFloorOpa);
    const metaWallOpa = findMetaSimple(refWallOpa);
    const metaRefWallOff = findMetaSimple(refWallOff) || '';
    const metaRefFloorOff = findMetaSimple(refFloorOff) || '';
    const wallOffs = metaRefWallOff.split(',').map(num => parseInt(num));
    const floorOffs = metaRefFloorOff.split(',').map(num => parseInt(num));
    const reflectType = findMetaSimple(refType);
    reflectableObj.reflectFloorToggle(defaults.reflectFloor);
    reflectableObj.reflectWallToggle(defaults.reflectWall);
    if (reflectType) {
        switch (reflectType.trim().toUpperCase()) {
            case 'FLOOR':
                reflectableObj.reflectFloorToggle(true);
                reflectableObj.reflectWallToggle(false);
                break;

            case 'WALL':
                reflectableObj.reflectWallToggle(true);
                reflectableObj.reflectFloorToggle(false);
                break;

            case 'ALL':
                reflectableObj.reflectEnable();
                break;

            case 'NONE':
                reflectableObj.reflectDisable();
                break;

            default:
                break;
        }
    }
    reflectableObj.setReflectImage(metaChar ? metaChar.trim() : '', metaIdx);
    reflectableObj.setReflectFloorOpacity(typeof (metaFloorOpa) === 'number' ? metaFloorOpa : undefined);
    reflectableObj.setReflectWallOpacity(typeof (metaWallOpa) === 'number' ? metaWallOpa : undefined);
    reflectableObj.setReflectFloorXOffset(floorOffs[0] || 0);
    reflectableObj.setReflectFloorYOffset(floorOffs[1] || 0);
    reflectableObj.setReflectWallXOffset(wallOffs[0] || 0);
    reflectableObj.setReflectWallYOffset(wallOffs[1] || 0);
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// START Game_Map edits                                                                                       //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

KCDev.Mirrors.setupMapReflectOptions = function () {

    const findMetaSimple = function (str) {
        return KCDev.Mirrors.findMetaSimple(str, $dataMap);
    };

    const refType = 'Reflect_Type';
    const refWallOff = 'Reflect_Wall_Offsets';
    const refFloorOff = 'Reflect_Floor_Offsets';
    const reflect = PluginManagerEx.findMetaValue($dataMap, [refType, refType.toLowerCase(), refType.toUpperCase()])?.trim().toUpperCase();
    $gameMap.setReflectWall(reflect === 'WALL' || reflect === 'ALL' || reflect === undefined);
    $gameMap.setReflectFloor(reflect === 'FLOOR' || reflect === 'ALL' || reflect === undefined);
    const refMode = 'Reflect_Mode';
    const reflectMode = findMetaSimple(refMode)?.toUpperCase().trim();
    const metaRefWallOff = findMetaSimple(refWallOff) || '';
    const metaRefFloorOff = findMetaSimple(refFloorOff) || '';
    const wallOffs = metaRefWallOff.split(',').map(num => parseInt(num));
    const floorOffs = metaRefFloorOff.split(',').map(num => parseInt(num));
    $gameMap.setReflectFloorXOffset(floorOffs[0] || 0);
    $gameMap.setReflectFloorYOffset(floorOffs[1] || 0);
    $gameMap.setReflectWallXOffset(wallOffs[0] || 0);
    $gameMap.setReflectWallYOffset(wallOffs[1] || 0);
    switch (reflectMode) {
        case 'PERSPECTIVE':
            $gameMap.setReflectMode(KCDev.Mirrors.wallModes.perspective)
            break;

        case 'EVENT':
            $gameMap.setReflectMode(KCDev.Mirrors.wallModes.event);
            break;

        default:
            $gameMap.setReflectMode(KCDev.Mirrors.getWallReflectMode());
            break;
    }
};

/**
 * New method: Game_Map.prototype.reflectFloorXOffset
 */
Game_Map.prototype.reflectFloorXOffset = function () {
    return this._reflectFloorXOff || 0;
};

/**
 * New method: Game_Map.prototype.setReflectFloorXOffset
 * @param {number} x New x offset
 */
Game_Map.prototype.setReflectFloorXOffset = function (x = 0) {
    this._reflectFloorXOff = x;
};

/**
 * New method: Game_Map.prototype.reflectFloorYOffset
 */
Game_Map.prototype.reflectFloorYOffset = function () {
    return this._reflectFloorYOff || 0;
};

/**
 * New method: Game_Map.prototype.setReflectFloorYOffset
 * @param {number} y New y offset
 */
Game_Map.prototype.setReflectFloorYOffset = function (y = 0) {
    this._reflectFloorYOff = y;
};

/**
 * New method: Game_Map.prototype.reflectWallXOffset
 */
Game_Map.prototype.reflectWallXOffset = function () {
    return this._reflectWallXOff || 0;
};

/**
 * New method: Game_Map.prototype.setReflectFloorXOffset
 * @param {number} x New x offset
 */
Game_Map.prototype.setReflectWallXOffset = function (x = 0) {
    this._reflectWallXOff = x;
};

/**
 * New method: Game_Map.prototype.reflectWallYOffset
 */
Game_Map.prototype.reflectWallYOffset = function () {
    return this._reflectWallYOff || 0;
};

/**
 * New method: Game_Map.prototype.setReflectWallYOffset
 * @param {number} y New y offset
 */
Game_Map.prototype.setReflectWallYOffset = function (y = 0) {
    this._reflectWallYOff = y;
};

KCDev.Mirrors.Game_Map_refresh = Game_Map.prototype.refresh;
/**
 * Aliased method: Game_Map.prototype.refresh
 * Adds a compatibility fix for save files created with old version of plugin
 * Rebuild the wall reflection cache
 */
Game_Map.prototype.refresh = function () {
    KCDev.Mirrors.Game_Map_refresh.apply(this, arguments);
    if (this._reflectFloor === undefined) {
        KCDev.Mirrors.setupMapReflectOptions();
    }
    KCDev.Mirrors.refreshReflectWallCache();
};

KCDev.Mirrors.Game_Map_setup = Game_Map.prototype.setup;
/**
 * Aliased method: Game_Map.prototype.setup
 * Parse map information from note tags
 * @param {number} mapId 
 */
Game_Map.prototype.setup = function (mapId) {
    KCDev.Mirrors.Game_Map_setup.apply(this, arguments);
    KCDev.Mirrors.setupMapReflectOptions();
};

/**
 * New method: Game_Map.prototype.reflectWall
 * Returns whether wall reflections are enabled for the current map
 * We need to invert this to maintain backwards compatibility with
 * older versions of the plugin
 * @returns {boolean}
 */
Game_Map.prototype.reflectWall = function () {
    return this._reflectWall;
};

/**
 * New method: Game_Map.prototype.reflectFloor
 * Returns whether floor reflections are enabled for the current map
 * We need to invert this to maintain backwards compatibility with
 * older versions of the plugin
 * @returns {boolean}
 */
Game_Map.prototype.reflectFloor = function () {
    return this._reflectFloor;
};

/**
 * New method: Game_Map.prototype.setReflectWall
 * Globally enable or disable wall reflections for the map
 * @param {boolean} reflectWall 
 */
Game_Map.prototype.setReflectWall = function (reflectWall = false) {
    this._reflectWall = reflectWall;
};

/**
 * New method: Game_Map.prototype.setReflectFloor
 * Globally enable or disable floor reflections for the map
 * @param {boolean} reflectFloor 
 */
Game_Map.prototype.setReflectFloor = function (reflectFloor = false) {
    this._reflectFloor = reflectFloor;
};


Game_Map.prototype.reflectMode = function () {
    return this._reflectMode;
};

Game_Map.prototype.setReflectMode = function (mode) {
    this._reflectMode = mode;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// END Game_Map edits                                                                                         //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// START Sprite_Character edits                                                                               //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

KCDev.Mirrors.Sprite_Character_updateOther = Sprite_Character.prototype.updateOther;
/**
 * Aliased method: Sprite_Character.prototype.updateOther
 * Adds a function call to refresh the reflection sprites for this character
 */
Sprite_Character.prototype.updateOther = function () {
    KCDev.Mirrors.Sprite_Character_updateOther.apply(this, arguments);
    this.updateReflectionSprite();
};

/**
 * New method: Sprite_Character.prototype.updateReflectionSprite
 * Handles the creation of, refreshes for, and updates to both reflection sprites
 */
Sprite_Character.prototype.updateReflectionSprite = function () {
    if (!this._reflectionFloor) {
        this._reflectionFloor = new KCDev.Mirrors.Sprite_Reflect(this);
        this._reflectionWall = new KCDev.Mirrors.Sprite_Reflect_Wall(this);
        this._reflectionFloor.bitmap = new Bitmap();
        this._reflectionWall.bitmap = new Bitmap();
        this._character.requestReflectRefresh();
        SceneManager._scene._spriteset._tilemap.addChild(this._reflectionFloor);
        SceneManager._scene._spriteset._tilemap.addChild(this._reflectionWall);
    }

    if (this._character.reflectRefreshRequested()) {
        this._reflectionFloor.refreshGraphic();
        this._reflectionWall.refreshGraphic();
        this._character.clearReflectRefresh();
    }

    this.updateReflectFloor();
    this.updateReflectWall();
    this.updateReflectFilters();
};

/**
 * New method: Sprite_Character.prototype.updateReflectFloor
 * Updates the floor sprite's reflection's position and visibility for this character sprite
 */
Sprite_Character.prototype.updateReflectFloor = function () {
    const /**@type {KCDev.Mirrors.Sprite_Reflect} */ r = this._reflectionFloor;
    const char = this._character;
    const o = char.reflectFloorOpacity();
    r.visible = $gameMap.reflectFloor() && char.reflectFloor() && !KCDev.Mirrors.noReflectRegions.has($gameMap.regionId(char.x, char.y)) && ((o === undefined && !char.isTransparent()) || o);

    if (r.visible) {
        r.opacity = o === undefined ? this.opacity : o;
        this.updateReflectCommon(r);
        // need to add portion of tile height for compatibility with KC_MoveRouteTF
        r.y = this.y + ((this.pivot.y) ? r.patternHeight() * this.scale.y : 0);
        r.angle = -this.angle + 180;
        r.scale.x = -this.scale.x;
        r.scale.y = this.scale.y;
        r.y += char.jumpHeight() * 1.25;
        r.x += ($gameMap.reflectFloorXOffset() + char.reflectFloorXOffset());
        r.y += ($gameMap.reflectFloorYOffset() + char.reflectFloorYOffset());
        KCDev.Mirrors.handleReflectFrame.call(this, r);
    }
};

/**
 * Rebuilds and sets wall reflection cache for current map.
 */
KCDev.Mirrors.refreshReflectWallCache = function () {
    KCDev.Mirrors.reflectWallPositions = KCDev.Mirrors.buildCurrentMapCache();
};

/**
 * Returns the reflectable wall region map for the current game map
 * For performance, we pre-compute the closest wall region for every tile on the map
 * @returns {Map<number, number[]}
 */
KCDev.Mirrors.buildCurrentMapCache = function () {
    const /** @type {Map<number, number[]} */ regionMap = new Map();

    for (let i = $gameMap.width() - 1; i >= 0; i--) {
        for (let j = $gameMap.height() - 1; j >= 0; j--) {
            const regionId = $gameMap.regionId(i, j);

            if (KCDev.Mirrors.wallRegions.has(regionId)) {
                let yArr = regionMap.get(i);

                if (!yArr) {
                    yArr = [];
                }

                yArr.push(j);

                regionMap.set(i, yArr);
            }
        }
    }

    return regionMap;
};

/**
 * Gets the y coordinate of the closest tile with a wall reflection region that is above point (x,y)
 * Returns -1 if no valid wall region found
 * @param {number} x 
 * @param {number} y 
 */
KCDev.Mirrors.getWallY = function (x, y) {
    const mapId = $gameMap.mapId();

    if (KCDev.Mirrors.currMapId !== mapId) {
        KCDev.Mirrors.refreshReflectWallCache();
        KCDev.Mirrors.currMapId = mapId;
    }

    const col = KCDev.Mirrors.reflectWallPositions.get(x);
    if (col) {
        const yArr = col.filter(yCoord => yCoord <= y);
        return yArr.length > 0 ? yArr[0] : -1;
    }
    else {
        return -1;
    }
};

/**
 * New method: Sprite_Character.prototype.updateReflectWall
 * Updates the wall sprite's reflection's position, visibility, and scale for this character sprite
 */
Sprite_Character.prototype.updateReflectWall = function () {

    const r = this._reflectionWall;

    const char = this._character;
    const charX = this._character.x;
    const charY = this._character.y;
    const o = char.reflectWallOpacity();

    r.visible = $gameMap.reflectWall() && char.reflectWall() && !KCDev.Mirrors.noReflectRegions.has($gameMap.regionId(charX, charY)) && ((o === undefined && !char.isTransparent()) || o);

    if (r.visible) {
        this.updateReflectCommon(r);
        const wallY = KCDev.Mirrors.getWallY(charX, charY);
        r.visible = (wallY >= 0);
        if (r.visible) {
            r.opacity = o === undefined ? this.opacity : o;

            const isPerspectiveMode = $gameMap.reflectMode() === KCDev.Mirrors.wallModes.perspective;

            const distToWall = char._realY - wallY;

            const tileH = $gameMap.tileHeight();

            if (isPerspectiveMode) {
                r.y = this.y - tileH * distToWall - distToWall;

                let scale = 1 - (distToWall - 1) / KCDev.Mirrors.maxWallDistance;
                if (scale > 1) {
                    scale = 1;
                }
                else if (scale < 0) {
                    scale = 0;
                }

                r.scale.x = -this.scale.x * scale;
                r.scale.y = this.scale.y * scale;
                r.y -= char.jumpHeight() * scale * 0.1;
                r.y -= r.pivot.y * (1 - scale);
            }
            else {
                r.y = this.y - tileH * distToWall * 2 + tileH;

                r.scale.x = this.scale.x * -1;
                r.scale.y = this.scale.y;
                r.y -= char.jumpHeight();
            }
            r.x += ($gameMap.reflectWallXOffset() + char.reflectWallXOffset());
            r.y += ($gameMap.reflectWallYOffset() + char.reflectWallYOffset());
            KCDev.Mirrors.handleReflectFrame.call(this, r);

        }
    }
};

/**
 * New method: Sprite_Character.prototype.updateReflectCommon
 * Updates some properties that are shared by both reflection sprites
 * @param {Sprite_Character} r Reflection sprite to update properties for
 */
Sprite_Character.prototype.updateReflectCommon = function (r) {
    r.x = this.x;
    r.scale.set(this.scale.x, this.scale.y);
    r.angle = this.angle;
    r.pivot.y = this.pivot.y;
    r.setBlendColor(this.getBlendColor());
    r.setColorTone(this.getColorTone());
    r.blendMode = this.blendMode;
};

/**
 * New method: Sprite_Character.prototype.updateReflectFilter
 * Matches the sprite's reflections to the filters.
 */
Sprite_Character.prototype.updateReflectFilters = function () {
    this._reflectFloor.filters = this.filters;
    this._reflectWall.filters = this.filters;
};

KCDev.Mirrors.Sprite_Character_isImageChanged = Sprite_Character.prototype.isImageChanged;
/**
 * Aliased method: Sprite_Character.prototype.isImageChanged
 * Requests that the reflection sprites are updated if the image changes.
 * @returns {boolean}
 */
Sprite_Character.prototype.isImageChanged = function () {
    const changed = KCDev.Mirrors.Sprite_Character_isImageChanged.apply(this, arguments);
    if (changed) {
        this._character.requestReflectRefresh();
    }
    return changed;
};

/**
 * Handles drawing either a tile or a character
 * @param {KCDev.Mirrors.Sprite_Reflect} r Reflection sprite to be modified
 */
KCDev.Mirrors.handleReflectFrame = function (r) {
    if (this._tileId > 0 && this._characterName === r._characterName) {
        r._tileId = this._tileId;
        r.bitmap = this.bitmap;
        r.scale.x = Math.abs(r.scale.x);
        r.updateTileFrame();
    }
    else {
        KCDev.Mirrors.setReflectFrame(r);
    }
}

/**
 * Switches to the appropriate frame for the reflection sprite
 * @param {Sprite_Character} r Reflection sprite
 */
KCDev.Mirrors.setReflectFrame = function (r) {
    const pw = r.patternWidth();
    const ph = r.patternHeight();
    const sx = (r.characterBlockX() + r.characterPatternX()) * pw;
    const sy = (r.characterBlockY() + r.characterPatternY()) * ph;
    r.setFrame(sx, sy, pw, ph);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// END Sprite_Character edits                                                                                 //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// START Spriteset_Map edits                                                                                  //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

KCDev.Mirrors.Spriteset_Map_update = Spriteset_Map.prototype.update;
/**
 * Aliased method: Spriteset_Map.prototype.update
 */
Spriteset_Map.prototype.update = function () {
    KCDev.Mirrors.Spriteset_Map_update.apply(this, arguments);
    if (KCDev.Mirrors.useZFightFix && $gameMap.reflectMode() === KCDev.Mirrors.wallModes.perspective) {
        KCDev.Mirrors.sortWallSpritesByY(this._characterSprites);
    }
};

/**
 * Fixes Z-fighting in perspective mode by sorting the sprites by their Y values and updating their z values accordingly.
 * @param {Sprite_Character[]} charSprites 
 */
KCDev.Mirrors.sortWallSpritesByY = function (charSprites) {
    let z = 2 * KCDev.Mirrors.zValue;
    const /**@type {Sprite_Character[]} */ sortedSprites = charSprites.clone();
    sortedSprites.sort((a, b) => {
        return a._character._realY - b._character._realY;
    });
    sortedSprites.forEach(sprite => {
        if (sprite._reflectionWall) {
            sprite._reflectionWall.z = z;
            z--;
        }
    });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// END Spriteset_Map edits                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// START FilterControllerMZ Extension                                                                         //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

if (window.Filter_Controller) {
    const Type = Filter_Controller.targetType;
    const targetGetter = Filter_Controller.targetGetter;

    Type.CharReflectionsFloor = 'CharReflectionsFloor';
    Type.CharReflectionsWall = 'CharReflectionsWall';
    Type.CharReflections = 'CharReflections';

    targetGetter[Type.CharReflectionsFloor] = function (targetIds) {
        const targets = [];
        if (this._spriteset && this._spriteset._characterSprites) {
            this._spriteset._characterSprites.forEach(sprite => targets.push(sprite._reflectionFloor));
        }
        return targets;
    };

    targetGetter[Type.CharReflectionsWall] = function (targetIds) {
        const targets = [];
        if (this._spriteset && this._spriteset._characterSprites) {
            this._spriteset._characterSprites.forEach(sprite => targets.push(sprite._reflectionWall));
        }
        return targets;
    };

    targetGetter[Type.CharReflections] = function (targetIds) {
        return Filter_Controller.targetGetter[Filter_Controller.targetType['CharReflectionsFloor']]().concat(Filter_Controller.targetGetter[Filter_Controller.targetType['CharReflectionsWall']]());
    };

    // dummy out this function
    Sprite_Character.prototype.updateReflectFilters = function () { }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// END FilterControllerMZ Extension                                                                           //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
