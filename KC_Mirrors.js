/*!

MIT License

Copyright (c) 2022 K. Chavez

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
 * @plugindesc [v1.0]Add reflections to events and actors.
 *
 * @help 
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
 * Also note that most parameters can have their values substituted with
 * variables by using \v[x] as an argument where x is a game variable ID.
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
 * quickly a character shrinks as they move away from the wall.
 * 
 * ------------------------------Plugin Note Tags------------------------------
 * 
 * Shared Note Tags:
 * 
 *   | <REFLECT_TYPE:[ALL/FLOOR/WALL]>
 *     | Determines which reflections are enabled for this character.
 *     | This overrides the defaults in this plugin's parameters.
 *     | ALL enables both wall and floor reflections
 *     | FLOOR enables floor reflections and disables wall reflections
 *     | WALL enabled wall reflections and disables floor reflections
 * 
 *   | <REFLECT_INDEX:[x]>
 *     | x is the index of this character's reflection on the character sheet.
 *     | This parameters has no effect if the character is using a big
 *     | character for their reflection sprite.
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
 * Refresh Wall Reflections
 *   | Refreshes the wall reflection positions on the current map. Useful if
 *   | tiles on the current map have their regions updated.
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
 * setEventReflect(event_id, reflection_filename, reflection_index, floor_enabled, wall_enabled)
 *   | Same as Change Event Reflection command
 * 
 * resetEventReflectImage(event_id)
 *   | Same as Match Event Reflection
 * 
 * setActorReflect(actor_id, reflection_filename, reflection_index, floor_enabled, wall_enabled)
 *   | Same as Change Actor Reflection command
 * 
 * resetActorReflectImage(actor_id)
 *   | Same as Match Actor Reflection command
 * 
 * refreshReflectWallCache()
 *   | Same as Refresh Wall Reflections command
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
 * @param maxWallDistance
 * @parent advancedOptsParent
 * @text Maximum Wall Distance
 * @desc Determines how far up the plugin checks for wall reflection. Also affects how quickly sprite shrinks in mirror.
 * @type number
 * @default 20
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
 * @arg reflectFloor
 * @text Enable Floor Reflection
 * @type select
 * @option Enable
 * @value true
 * @option Disable
 * @value false
 * @option Unchanged
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
 * @default unchanged
 * 
 * @command resetEventReflect
 * @text Match Event Reflection
 * @desc Set the chosen event's graphic to its current top view character graphic. Changes are reset on map reload.
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
 * @command resetActorReflect
 * @text Match Actor Reflection
 * @desc Set the actor's reflection to the same graphic as their top view character.
 * 
 * @arg id
 * @text Actor ID
 * @type actor
 * @desc Specify the actor to change. 0 refers to the current party leader and negatives refer to followers in order.
 * @default 0
 * 
 * @command refreshReflectMap
 * @text Refresh Wall Reflections
 * @desc Force refresh wall reflections on current map. Useful if region IDs of tiles are changed during gameplay.
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
/**
 * @typedef {object} KCNamespace
 * @property {KCMirrors} Mirrors
 */
/**
 * @type {KCNamespace}
 */
var KCDev = KCDev || {};

/**
 * @typedef {object} KCMirrors Represents this plugin's objects and functions
 * @property {Set<number>} WALL_REGIONS Tiles with this region ID will have reflections appear.
 * @property {Set<number>} NO_REFLECT_REGIONS If a character stands on a tile with this region ID, all reflections are disabled for said character
 * @property {(eventId: number, reflectChar: string, reflectIndex: number, enableFloor: boolean, enableWall: boolean) => void} setEventReflect Set reflection properties of an event on the map.
 * @property {(eventId: number) => void} resetEventReflectImage Removes the custom reflection of an event.
 * @property {(actorId: number, reflectChar: string, reflectIndex: number, enableFloor: boolean, enableWall: boolean) => void} setActorReflect Set reflection properties of an actor.
 * @property {(actorId: number) => void} resetActorReflectImage Removes custom reflection image of an actor.
 * @property {(actorId: number) => void} Game_Actor_setup Alias for Game_Actor.prototype.setup
 * @property {() => void} Game_Follower_update Alias for Game_Follower.prototype.update
 * @property {() => void} Game_Player_update Alias for Game_Player.prototype.update
 * @property {() => void} Game_Event_setupPage Alias for Game_Event.prototype.setupPage
 * @property {() => void} Game_CharacterBase_initMembers Alias for Game_CharacterBase.prototype.initMembers
 * @property {(characterName: string, characterIndex: number) => void} Game_CharacterBase_setImage Alias for Game_CharacterBase.prototype.setImage
 * @property {() => void} Sprite_Character_updateOther Alias for Sprite_Character.prototype.updateOther
 * @property {number} currMapId Keep track of the current map ID to avoid building the wall cache more than once
 * @property {Map<number, number[]>} reflectWallPositions Maps x coordinates to array of the y coordinates of wall regions
 * @property {() => void} refreshReflectWallCache Updates the cached wall reflection positions for current map.
 */

KCDev.Mirrors = {};

(
    /**
     * IIFE that handles this plugin's changes. We add a JSDoc 
     * @param {KCMirrors} $ This plugin's object
     */
    ($) => {
        'use strict';

        const script = document.currentScript;

        /**
         * @typedef KCMirrorParams
         * @property {number} zValue
         * @property {number} maxWallDistance
         * @property {number} mapCacheSize
         * @property {object} actorDefault
         * @property {boolean} actorDefault.reflectFloor
         * @property {boolean} actorDefault.reflectWall
         * @property {object} eventDefault
         * @property {boolean} eventDefault.reflectFloor
         * @property {boolean} eventDefault.reflectWall
         */

        /**
         * @type {KCMirrorParams}
         */
        const parameters = PluginManagerEx.createParameter(script);

        // delete decoration parameters
        delete parameters['regionsParent'];
        delete parameters['defaultParent'];
        delete parameters['advancedOptsParent'];

        // Setup default values for these parameters
        parameters.zValue = (parameters.zValue === undefined) ? -1 : parameters.zValue;
        parameters.maxWallDistance = (parameters.maxWallDistance === undefined) ? 20 : parameters.maxWallDistance;

        $.WALL_REGIONS = new Set(parameters.wallRegions);
        $.NO_REFLECT_REGIONS = new Set(parameters.noReflectRegions);

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
        class Sprite_Reflect extends Sprite_Character {

            /**
             * 
             * @param {Sprite_Character} parentCharSprite This is the character this sprite represents a reflection of
             * @param  {...any} spriteArgs 
             */
            constructor(parentCharSprite, ...spriteArgs) {
                super(spriteArgs);
                this.anchor.x = 0.5;
                this.anchor.y = 1;
                this.z = 2 * parameters.zValue;
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
        };

        class Sprite_Reflect_Wall extends Sprite_Reflect {

            // draw graphic for opposite facing direction
            characterPatternY = function () {
                let dir = 0;
                switch (this._character.direction()) {
                    case 2:
                        dir = 8;
                        break;

                    case 4:
                        dir = 6;
                        break;

                    case 6:
                        dir = 4;
                        break;

                    case 8:
                        dir = 2;

                    default:
                        break;
                }
                return (dir - 2) / 2;
            };
        };

        $.Sprite_Reflect = Sprite_Reflect;
        $.Sprite_Reflect_Wall = Sprite_Reflect_Wall;

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
         */
        $.setEventReflect = function (eventId, reflectChar, reflectIndex, enableFloor, enableWall) {
            const event = $gameMap.event(eventId === 0 ? this.eventId() : eventId);
            event.setReflectImage(reflectChar, reflectIndex);
            event.reflectFloorToggle(enableFloor);
            event.reflectWallToggle(enableWall);
        };

        /**
         * Makes the event's reflection the same as the event graphic.
         * @param {number} eventId Event to target
         */
        $.resetEventReflectImage = function (eventId) {
            const event = $gameMap.event(eventId === 0 ? this.eventId() : eventId);
            
            event.setReflectImage();
        };

        /**
         * Takes an actor ID and converts 0 to the party leader's actor ID and negative numbers to
         * the follower actors' IDs.
         * @param {number} actorId ID of the actor or party member index
         * @returns {number}
         */
        function getRealActorId(actorId) {
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
                    if (follower) {
                        return follower.actor().actorId();
                    }
                    else {
                        return -1;
                    }
                }
            }
            return actorId;
        }

        /**
         * Set reflection properties of an actor.
         * @param {number} actorId ID the actor to target.
         * @param {string} reflectChar File name of the new graphic to use as a reflection.
         * @param {number} reflectIndex Index of the character in the file to use as a reflection.
         * @param {boolean} enableFloor If true, enable floor reflections for the target actor.
         * @param {boolean} enableWall If true, enable wall reflections for the target actor.
         */
        $.setActorReflect = function (actorId, reflectChar, reflectIndex, enableFloor, enableWall) {
            const realId = getRealActorId(actorId);
            if (realId < 0) return;
            const actor = $gameActors.actor(realId);
            actor.setReflectImage(reflectChar, reflectIndex)
            actor.reflectFloorToggle(enableFloor);
            actor.reflectWallToggle(enableWall);
        };

        /**
         * Sets the target actor's reflection graphic to be the same as their character graphic.
         * @param {number} actorId Targetted actor's ID
         * @returns {void}
         */
        $.resetActorReflectImage = function (actorId) {
            const realId = getRealActorId(actorId);
            if (realId < 0) return;
            const actor = $gameActors.actor(realId);
            actor._reflectName = '';
            actor._reflectIndex = -1;
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
         * @returns {Array<any>}
         */
        function convertChangeReflectArgs(char, args) {
            const id = args.id;
            const character = args.character === '' ? char.reflectName() : args.character;
            const index = args.index === '' ? char.reflectIndex() : args.index;
            const reflectFloor = args.reflectFloor === 'unchanged' ? char.reflectFloor() : args.reflectFloor;
            const reflectWall = args.reflectWall === 'unchanged' ? char.reflectWall() : args.reflectWall;
            return [id, character.trim(), index, reflectFloor, reflectWall]
        }

        PluginManagerEx.registerCommand(script, 'changeEventReflect', function (args) {
            $.setEventReflect.apply(this, convertChangeReflectArgs($gameMap.event(this.eventId()), args));
        });

        PluginManagerEx.registerCommand(script, 'changeActorReflect', function (args) {
            const actorId = getRealActorId(args.id);
            const actor = $gameActors.actor(actorId);
            args.id = actorId;
            $.setActorReflect(...convertChangeReflectArgs(actor, args));
        });

        PluginManagerEx.registerCommand(script, 'resetEventReflect', function (args) {
            $.resetEventReflectImage.call(this, args.id);
        });

        PluginManagerEx.registerCommand(script, 'resetActorReflect', function (args) {
            $.resetActorReflectImage.call(this, args.id);
        });

        PluginManagerEx.registerCommand(script, 'refreshReflectMap', function (args) {
            $.refreshReflectWallCache();
        });

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // END EVENT COMMAND DEFINITIONS                                                                              //
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // START Game_CharacterBase edits                                                                             //
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        $.Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
        /**
         * Aliased method: Game_CharacterBase.prototype.initMembers
         * Adds default values for the reflection name and index. These values tell this plugin that
         * the reflection should use the character graphic.
         */
        Game_CharacterBase.prototype.initMembers = function () {
            $.Game_CharacterBase_initMembers.apply(this, arguments);
            this._reflectName = '';
            this._reflectIndex = -1;
        };

        $.Game_CharacterBase_setImage = Game_CharacterBase.prototype.setImage;
        /**
         * Aliased method: Game_CharacterBase.prototype.setImage
         * Added a reflection refresh whenever the event's character image changes.
         * @param {string} characterName New character file name
         * @param {number} characterIndex Index of the character to use
         */
        Game_CharacterBase.prototype.setImage = function (characterName, characterIndex) {
            $.Game_CharacterBase_setImage.apply(this, arguments);
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
            return this._refreshRequested;
        };

        /**
         * New method: Game_CharacterBase.prototype.requestReflectRefresh
         * Requests for the reflection graphic to be updated on the next update
         */
        Game_CharacterBase.prototype.requestReflectRefresh = function () {
            this._refreshRequested = true;
        };

        /**
         * New method: Game_CharacterBase.prototype.clearReflectRefresh
         * Clears reflection graphic refresh requests.
         */
        Game_CharacterBase.prototype.clearReflectRefresh = function () {
            this._refreshRequested = false;
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
        function updateActorCharacterReflect(actor, character) {
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
        }

        $.Game_Actor_setup = Game_Actor.prototype.setup;
        /**
         * Aliased Method: Game_Actor.prototype.setup
         * Add note tag parsing to determine reflection visibility and appearance. Also set up default values.
         * @param {number} actorId ID of the actor to set default values for
         */
        Game_Actor.prototype.setup = function (actorId) {
            $.Game_Actor_setup.apply(this, arguments);
            const actor = $dataActors[actorId];
            parseMetaValues(this, actor, parameters.actorDefault, true);
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

        $.Game_Follower_update = Game_Follower.prototype.update;
        /**
         * Aliased method: Game_Follower.prototype.update
         * Adds a check to update the reflection to the update function.
         */
        Game_Follower.prototype.update = function () {
            $.Game_Follower_update.apply(this, arguments);
            updateActorCharacterReflect(this.actor(), this);
        };

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // END Game_Follower edits                                                                                    //
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // START Game_Player edits                                                                                    //
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        $.Game_Player_update = Game_Player.prototype.update;
        /**
         * Aliased method: Game_Player.prototype.update
         * Adds a check to update the reflection to the update function.
         */
        Game_Player.prototype.update = function () {
            $.Game_Player_update.apply(this, arguments);
            if ($gameParty.size() > 0) {
                const actor = $gameParty.leader();
                updateActorCharacterReflect(actor, this);
            }
        };

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // END Game_Player edits                                                                                      //
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // START Game_Event edits                                                                                     //
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        $.Game_Event_setupPage = Game_Event.prototype.setupPage;
        /**
         * Aliased method: Game_Event.prototype.setupPage
         * Adds note tag parsing to override default event reflection settings.
         */
        Game_Event.prototype.setupPage = function () {
            $.Game_Event_setupPage.apply(this, arguments);
            parseMetaValues(this, this.event(), parameters.eventDefault)
        };

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // END Game_Event edits                                                                                       //
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * Parses note tags for events and actors
         * @param {Game_Event | Game_Actor} reflectableObj Game object with reflection setting and getting methods
         * @param {rm.types.Actor | rm.types.Event} target Database information that will be used to find the note tags
         * @param {{reflectFloor: boolean, reflectWall: boolean}} defaults Default values for floor and wall reflections for the target object
         * @param {boolean} isActor True if this 
         */
        function parseMetaValues(reflectableObj, target, defaults, isActor = false) {
            const refChar = isActor ? 'Reflect_Actor' : 'Reflect_Char';
            const refIdx = 'Reflect_Index';
            const refType = 'Reflect_Type';
            const metaChar = PluginManagerEx.findMetaValue(target, [refChar, refChar.toLowerCase(), refChar.toUpperCase()]);
            const metaIdx = PluginManagerEx.findMetaValue(target, [refIdx, refIdx.toLowerCase(), refIdx.toUpperCase()]);
            const reflectType = PluginManagerEx.findMetaValue(target, [refType, refType.toLowerCase(), refType.toUpperCase()]);
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
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // START Sprite_Character edits                                                                               //
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        $.Sprite_Character_updateOther = Sprite_Character.prototype.updateOther;
        /**
         * Aliased method: Sprite_Character.prototype.updateOther
         * Adds a function call to refresh the reflection sprites for this character
         */
        Sprite_Character.prototype.updateOther = function () {
            $.Sprite_Character_updateOther.apply(this, arguments);
            this.updateReflectionSprite();
        };

        /**
         * New method: Sprite_Character.prototype.updateReflectionSprite
         * Handles the creation of, refreshes for, and updates to both reflection sprites
         */
        Sprite_Character.prototype.updateReflectionSprite = function () {
            if (!this._reflectionFloor) {
                this._reflectionFloor = new $.Sprite_Reflect(this);
                this._reflectionWall = new $.Sprite_Reflect_Wall(this);
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
        };

        /**
         * Returns a fraction of the jump height to update reflection sprites while a character jumps.
         * @param {Game_Character} char Character that is jumping
         * @returns {number}
         */
        function getJumpOffset(char) {
            return (char.isJumping()) ? char.jumpHeight() * 1.25 : 0;
        }

        /**
         * New method: Sprite_Character.prototype.updateReflectFloor
         * Updates the floor sprite's reflection's position and visibility for this character sprite
         */
        Sprite_Character.prototype.updateReflectFloor = function () {
            const r = this._reflectionFloor;
            r.visible = r.visible = !$.NO_REFLECT_REGIONS.has($gameMap.regionId(this._character.x, this._character.y)) && this._character.reflectFloor();

            if (r.visible) {
                this.updateReflectCommon(r);
                r.y = this.y;
                r.scale.x = this.scale.x;
                r.scale.y = this.scale.y * -1;
                r.y += getJumpOffset(this._character);
                if (this.isTile() && this._characterName === r._characterName) {
                    r._tileId = this._tileId;
                    r.bitmap = this.bitmap;
                    r.updateTileFrame();
                }
                else {
                    setReflectFrame(r);
                };
            }
        };

        /**
         * Rebuilds and sets wall reflection cache for current map.
         */
        $.refreshReflectWallCache = function () {
            $.reflectWallPositions = buildCurrentMapCache();
        }

        /**
         * Returns the reflectable wall region map for the current game map
         * @returns {Map<number, number[]}
         */
        function buildCurrentMapCache() {
            /**
             * @type {Map<number, number[]}
             */
            const regionMap = new Map();

            for (let i = $gameMap.width() - 1; i >= 0; i--) {
                for (let j = $gameMap.height() - 1; j >= 0; j--) {
                    const regionId = $gameMap.regionId(i, j);

                    if ($.WALL_REGIONS.has(regionId)) {
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
        }

        /**
         * Gets the y coordinate of the closest tile with a wall reflection region that is above point (x,y)
         * Returns -1 if no region with a wall reflection ID in the same column as (x,y)
         * @param {number} x 
         * @param {number} y 
         */
        function getWallY(x, y) {
            const mapId = $gameMap.mapId();

            if ($.currMapId !== mapId) {
                $.refreshReflectWallCache();
                $.currMapId = mapId;
            }

            const col = $.reflectWallPositions.get(x);
            if (col) {
                const yArr = col.filter(yCoord => yCoord <= y);
                return yArr.length > 0 ? yArr[0] : -1;
            }
            else {
                return -1;
            }
        }

        /**
         * New method: Sprite_Character.prototype.updateReflectWall
         * Updates the wall sprite's reflection's position, visibility, and scale for this character sprite
         */
        Sprite_Character.prototype.updateReflectWall = function () {
            const r = this._reflectionWall;

            const char = this._character;
            const charX = this._character.x;
            const charY = this._character.y;

            r.visible = !$.NO_REFLECT_REGIONS.has($gameMap.regionId(charX, charY)) && char.reflectWall() && !this.isTile();

            if (r.visible) {
                this.updateReflectCommon(r);
                const wallY = getWallY(charX, charY);
                r.visible = (wallY >= 0);
                if (r.visible) {

                    const distToWall = char._realY - wallY;

                    const tileH = $gameMap.tileHeight();

                    r.y = this.y - tileH * distToWall - distToWall;

                    // fix wall mirrors near the top of a vertically looping map
                    if (r.y < 0) {
                        r.y += $gameMap.height() * tileH;
                    }

                    let scale = 1 - (distToWall - 1) / parameters.maxWallDistance;
                    if (scale > 1) {
                        scale = 1;
                    }
                    else if (scale < 0) {
                        scale = 0;
                    }

                    r.scale.x = this.scale.x * -1 * scale;
                    r.scale.y = this.scale.y * scale;
                    r.y -= getJumpOffset(this._character) * scale * 0.1;
                    setReflectFrame(r);
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
            r.setBlendColor(this.getBlendColor());
            r.setColorTone(this.getColorTone());
            r.blendMode = this.blendMode;
            r.filters = this.filters;
            r.opacity = this.opacity;
        };

        $.Sprite_Character_isImageChanged = Sprite_Character.prototype.isImageChanged;
        /**
         * Aliased method: Sprite_Character.prototype.isImageChanged
         * Requests that the reflection sprites are updated if the image changes.
         * @returns {boolean}
         */
        Sprite_Character.prototype.isImageChanged = function () {
            const changed = $.Sprite_Character_isImageChanged.apply(this, arguments);
            if (changed) {
                this._character.requestReflectRefresh();
            }
            return changed;
        };

        /**
         * Switches to the appropriate frame for the reflection sprite
         * @param {Sprite_Character} r Reflection sprite
         */
        function setReflectFrame(r) {
            const pw = r.patternWidth();
            const ph = r.patternHeight();
            const sx = (r.characterBlockX() + r.characterPatternX()) * pw;
            const sy = (r.characterBlockY() + r.characterPatternY()) * ph;
            r.setFrame(sx, sy, pw, ph);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // END Sprite_Character edits                                                                                 //
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    })(KCDev.Mirrors);
