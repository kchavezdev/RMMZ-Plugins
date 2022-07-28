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
 *
 * @plugindesc [v1.0]Display Actor Face based on conditions.
 *
 * @help
 * This plugin switches which actor face is displayed in menus based on
 * conditions specified in the actor's notes.
 * 
 * To begin a face condition list, start with the tag <face_conditions>, and to
 * end the list, use the tag </face_conditions>. This list will be processed
 * line by line. In general, every line has to be true for a face to be shown.
 * However, using || between commands on the same line acts as an OR, so any
 * condition on that line being true is treated as if the line is true.
 * 
 * The commands that can be used in the list are as follows.
 * Arguments will be denoted as <argument_name>. If an argument is invertible
 * (i.e. you want the condition to be met when it is false), it can be prefixed
 * by '!'.
 * 
 * > addface <face_index> <face_name>
 * * NOT INVERTIBLE
 * | face_index: Index of the face to use if all conditions are true
 * | face_name : Optional argument. Name of the face file to use if all
 *               conditions are true. If this is not specified, the face
 *               file currently being used by the actor will be used as
 *               the source image.
 *   This is the first command that should be written. All commands following
 *   this one will add conditions that apply to this particular combination of
 *   index and face file. Every condition must be satisfied for the actor's
 *   face to be replaced by the one specified in this command.
 * # EXAMPLES: addface 2
 *             addface 4 my_faces_file
 *             addface 0 my faces file
 * 
 * > svmotion <motion_name>
 * * INVERTIBLE
 * | motion_name: Name of the motion
 *   This command only has any effect when the sideview battle system is
 *   enabled. This condition is true if the actor's current side view
 *   motion (animation) is the same as motion_name.
 * 
 *   In RPG Maker MZ, the possible motion names are walk, wait, chant, guard,
 *   damage, evade, thrust, swing, missile, skill, spell, item, escape,
 *   victory, dying, abnormal, sleep, and dead
 * # EXAMPLES: svmotion damage
 *             !svmotion chant
 * 
 * > state <state_id>
 * * INVERTIBLE
 * | state_id: The single state to look for. This value can be found by
 *               looking at the number given for the state in the States tab
 *               of the database.
 *   This condition is true if the actor currently has the specified state.
 * # EXAMPLES: state 1
 *             !state 5
 * 
 * > stateset <state_id_list>
 * * INVERTIBLE
 * | state_id_list: A list of state IDs separated by commas. The format x-y
 *                  where x and y are state IDs will add x and y as well as
 *                  every state with an ID between x and y.
 *   This condition is met if the actor has ANY of the states with the IDs in
 *   the specified state ID list. For example, if the list was "1 3-5 7," then
 *   this condition would be true if the actor had state 1, 3, 4, 5, or 7.
 * # EXAMPLES: stateset 1 3-10 20
 *             !stateset 2 4 5
 * 
 * > switch <switch_id>
 * * INVERTIBLE
 * | switch_id: The ID of the single game switch this condition will check.
 *   This condition is true if the game switch with the specified ID is ON.
 * # EXAMPLE: switch 10
 * 
 * > switchset <switch_id_list>
 * * INVERTIBLE
 * | switch_id_list: A list of switch IDs separated by commas. The format x-y
 *                  where x and y are switch IDs will add x and y as well as
 *                  every switch with an ID between x and y.
 *   This condition is met if ANY of the switches in the list are ON. For 
 *   example, if the list is "1 3-5 7", then this condition would be true
 *   if any of the switches 1, 3, 4, 5, or 7 are on.
 * # EXAMPLES: switchset 4 1 5 12-16 2 41-68
 *             !switchset 1 3 5 9-15 2
 * 
 * > compare <parameter1> <operation> <parameter2>
 * * NOT INVERTIBLE
 * | parameter1: First parameter. \v[x] gets the value in game variable x,
 *               and \s[y] gets the value in game switch y
 * | operation : Possible symbols include =, !=, <, >, <=, and >=
 * | parameter2: Second parameter. Also supports switch and variable
 *               substitution.
 *   This is one of the most verastile commands. The operation argument is
 *   the simplest and most self-explanatory. They are comparison operators,
 *   where = checks if parameter1 is equal to parameter 2, != checks if
 *   parameter 1 is NOT equal to parameter to, and so on.
 * 
 *   The parameters can take on many values. As mentioned, game switches and
 *   game variables can be accessed using the \v[x] and \s[x] special codes.
 *   Another useful format that can be used is a.<some_property> where a is
 *   the current actor and <some_property> is a property of the actor. If it
 *   is accessible in a damage formula, it can be checked here. For example,
 *   a.atk gets the current attack of the character, and a.hp gets the
 *   current hp of the character. Unlike most of this list, these properties
 *   ARE case sensitive! So, a.atk is NOT the same as a.Atk!
 * 
 *   The actor properties hp, mp, and tp are special cases. They an be used
 *   like other properties, but there is another check that is exclusive to
 *   these stats. If the % symbol is at the end of the other parameter, then
 *   the percentage of these properties with respect to their maximums is
 *   calculated. So, a.hp > 90%, for example, would be true if the actor's
 *   hp is above 90%, regardless of what the 'raw' number values for the hp
 *   and max hp. This is only valid if one of the parameters is a.hp, a.mp,
 *   or a.tp and if the other parameter is a raw number or a game variable 
 *   with a number stored in it. Also, to test for strings, only double quotes
 *   (") are supported.
 * # EXAMPLES: compare a.atk > 10
 *             compare \v[1] = "test string"
 *             compare \v[11] > a.mp
 *             compare a.mp > 50%
 *             compare \v[11]% <= a.tp
 *             compare \s[2] = \s[5]
 *             compare "some value" != \v[2]
 * 
 * > eval {<javascript_code>}
 * * NOT INVERTIBLE
 * | javascript_code: Raw JavaScript code to evaluate
 *   This condition evaluates the javascript code enclosed in the {} and is
 *   true if that code resolves to some truthy value. Unlike every other
 *   command except 'function', this command can span multiple lines as long
 *   as the opening { is on the same line as 'eval'. For convenience, a
 *   reference to this actor is stored in the constant 'actor'. To get this
 *   actor's ID, for example, you would write actor.actorId().
 * # EXAMPLES: eval {$gameParty.inBattle() && actor.hp > 0}
 *             eval {
 *               Math.random() > 0.5 &&
 *               actor.hasSkill(1)
 *             }
 * 
 * > function {<javascript_code>}
 * * NOT INVERTIBLE
 * | javascript_code: The body of a javascript function that takes no
 *                    arguments.
 *   This condition is similar to eval. The main difference is that this
 *   command expects the you to explicitly return some truthy or
 *   falsey value. If not, nothing is returned and this condition is always
 *   falsey. Like eval, this command can take up multiple lines as long as the
 *   opening { is on the same line as 'function'.
 * # EXAMPLES: function { return true; }
 *             function {
 *               let x = $gamePlayer.x;
 *               let y = $gamePlayer.y;
 *               return x < 22 && y >= 5;
 *             }
 * 
 */

var KCDev = KCDev || {};
KCDev.ActorFaceConditions = {};

(($) => {
    'use strict';
    const pluginName = document.currentScript.src.split("/").pop().replace(/\.js$/, "");
    const parameters = PluginManager.parameters(pluginName);

    $.comparisonFunctions = {
        '=': function (param1, param2) { return param1 === param2; },
        '!=': function (param1, param2) { return param1 !== param2; },
        '<': function (param1, param2) { return param1 < param2; },
        '>': function (param1, param2) { return param1 > param2; },
        '<=': function (param1, param2) { return param1 <= param2; },
        '>=': function (param1, param2) { return param1 >= param2; },
    };
    $.actorToCondList = new Map();

    class Face_Condition_Block {

        /**
         * @param {number} actorId 
         */
        constructor(actorId) {
            /**@type {number}*/ this._actorId = actorId;
            this._conditions = [];
        }

        isAnyTrue() {
            const conds = this._conditions;
            if (conds.length === 0) return true;
            for (let i = 0; i < this._conditions.length; i++) {
                const cond = conds[i];
                if (cond.isTrue()) return true;
            }
            return false;
        }

        /**
         * @param {string} param 
         */
        getParamObj(param) {

            // a.someProperty
            let matched = param.match(/A\.[A-Z]([A-Z]|\d)*/i);
            if (matched) {
                const /**@type {string} */ propName = param.slice(2);
                if (propName.endsWith('()')) {
                    return {
                        actorId: this._actorId,
                        propertyName: propName.slice(0, propName.length - 2),
                        get val() { return $gameActors.actor(this.actorId)[this.propertyName](); }
                    }
                }
                else {
                    return {
                        actorId: this._actorId,
                        propertyName: propName,
                        get val() { return $gameActors.actor(this.actorId)[this.propertyName]; }
                    }
                }
            }

            // game variable \v[x]
            matched = param.match(/\\V\[\d+\]/i);
            if (matched) {
                return {
                    varId: parseInt(matched[0].match(/\d+/)[0]),
                    get val() { return $gameVariables.value(this.varId) }
                }
            }

            // game switch \s[x]
            matched = param.match(/\\S\[\d+\]/i);
            if (matched) {
                return {
                    switchId: parseInt(matched[0].match(/\d+/)[0]),
                    get val() { return $gameVariables.value(this.switchId) }
                }
            }

            // try and eval; if it fails, then fall back to string
            let chkVal;
            try {
                chkVal = eval(param);
            } catch (error) {
                // ignore error
            }

            return { val: chkVal ? chkVal : param }
        }

        /**
         * @param {string} opSym 
         * @param {string} param1 
         * @param {string} param2 
         */
        addComparisonCondition(opSym, param1, param2) {
            const op = $.comparisonFunctions[opSym];
            const p1 = this.getParamObj(param1);
            const p2 = this.getParamObj(param2);

            if (param1.charAt(param1.length - 1) === '%') {
                if (p2.propertyName === 'mp' || p2.propertyName === 'hp' || p2.propertyName === 'tp') {
                    this._conditions.push({
                        param1: this.getParamObj(param1.slice(0, param1.length - 1)),
                        param2: p2,
                        op: op,
                        actorId: this._actorId,
                        isTrue: function () {
                            const a = $gameActors.actor(this.actorId);
                            switch (this.param2.propertyName) {
                                case 'hp':
                                case 'mp':
                                    return this.op(this.param1.val, this.param2.val * 1.0 / a['m' + this.param2.propertyName] * 100);
                                    break;

                                case 'tp':
                                    return this.op(this.param1.val, this.param2.val / 100.0 * 100);
                                    break;

                                default:
                                    break;
                            }
                        }
                    });
                }
                else {
                    throw new Error('Incorrectly formatted %');
                }
            }
            else if (param2.charAt(param2.length - 1) === '%') {
                if (p1.propertyName === 'mp' || p1.propertyName === 'hp' || p1.propertyName === 'tp') {
                    this._conditions.push({
                        param1: p1,
                        param2: this.getParamObj(param2.slice(0, param2.length - 1)),
                        op: op,
                        actorId: this._actorId,
                        isTrue: function () {
                            const a = $gameActors.actor(this.actorId);
                            switch (this.param1.propertyName) {
                                case 'hp':
                                case 'mp':
                                    return this.op(this.param1.val * 1.0 / a['m' + this.param1.propertyName] * 100, this.param2.val);
                                    break;

                                case 'tp':
                                    return this.op(this.param1.val / 100.0 * 100, this.param2.val);
                                    break;

                                default:
                                    break;
                            }
                        }
                    });
                }
                else {
                    throw new Error('Incorrectly formatted %');
                }
            }
            else {
                this._conditions.push({
                    op: op,
                    param1: p1,
                    param2: p2,
                    isTrue: function () {
                        return this.op(this.param1.val, this.param2.val);
                    }
                });
            }
        }

        addSvMotionCondition(motionName, invert) {
            this._conditions.push({
                actorId: this._actorId,
                motion: motionName,
                truthVal: !invert,
                isTrue: function () {
                    const a = $gameActors.actor(this.actorId);
                    return (a.motionType() === motionName) === this.truthVal;
                }
            })
        }

        /**
         * @param {number} switchId 
         * @param {boolean} invert 
         */
        addSwitchCondition(switchId, invert) {
            this._conditions.push({
                switchId: switchId,
                truthVal: !invert,
                isTrue: function () {
                    return $gameSwitches.value(this.switchId) === this.truthVal;
                }
            })
        }

        /**
         * @param {number} stateId 
         * @param {boolean} invert 
         */
        addStateCondition(stateId, invert) {
            this._conditions.push({
                stateId: stateId,
                actorId: this._actorId,
                truthVal: !invert,
                isTrue: function () {
                    return ($gameActors.actor(this.actorId).states().filter(state => this.stateId === state.id).length > 0) === this.truthVal;
                }
            });
        }

        /**
         * @param {string} stateset 
         * @param {boolean} invert 
         */
        addStateSetCondition(stateset, invert = false) {
            const parsedSet = getSetFromNumList(stateset);

            this._conditions.push({
                stateset: parsedSet,
                actorId: this._actorId,
                truthVal: !invert,
                isTrue: function () {
                    const a = $gameActors.actor(this.actorId);
                    const states = a.states();
                    for (let i = 0; i < states.length; i++) {
                        if (this.stateset.has(states[i].id) === this.truthVal) return true;
                    }
                    return false;
                }
            });
        }

        /**
         * @param {string} switchset 
         * @param {boolean} invert 
         */
        addSwitchSetCondition(switchset, invert = false) {
            const parsedArr = Array.from(getSetFromNumList(switchset));

            this._conditions.push({
                switches: parsedArr,
                truthVal: !invert,
                isTrue: function () {
                    for (let i = 0; i < this.switches.length; i++) {
                        if ($gameSwitches.value(this.switches[i]) === this.truthVal) return true;
                    }
                    return false;
                }
            });
        }

        /**
         * @param {string} evalStr 
         */
        addEvalCondition(evalStr) {
            this._conditions.push({
                isTrue: new Function('const actor = $gameActors.actor(' + this._actorId + '); return (' + evalStr + ')')
            });
        }

        /**
         * @param {string} fnStr 
         */
        addFuncCondition(fnStr) {
            this._conditions.push({
                isTrue: new Function('const actor = $gameActors.actor(' + this._actorId + ');' + fnStr)
            });
        }
    };

    /**
     * @param {string} numList 
     */
    function getSetFromNumList(numList) {
        const /**@type {string[]} */ list = numList.replaceAll(/\s+/g, ' ').split(' ');
        const /**@type {Set<number>}*/ finalSet = new Set();
        list.forEach(numStr => {

            const split = numStr.split('-');

            let errored = false;

            switch (split.length) {
                case 1:
                    const num = parseInt(numStr);
                    if (num) {
                        finalSet.add(num);
                    }
                    else {
                        errored = true;
                    }
                    break;

                case 2:
                    let num1 = parseInt(split[0]);
                    let num2 = parseInt(split[1]);
                    if (num1 && num2) {
                        if (num1 > num2) {
                            const temp = num1;
                            num1 = num2;
                            num2 = temp;
                        }
                        for (let i = num1; i <= num2; i++) {
                            finalSet.add(i);
                        }
                    }
                    else {
                        errored = true;
                    }
                    break;

                default:
                    errored = true;
                    break;
            }

            if (errored) {
                console.error("tried to add invalid number " + numStr + " to set");
            }
        });

        return finalSet;
    }

    class Face_Condition_List {

        /**
         * Face_Condition_List constructor
         * @param {number} actorId Actor ID
         * @param {number} faceIndex
         * @param {string} faceName Name of the face file
         */
        constructor(actorId, faceIndex, faceName = '') {
            this._actorId = actorId;
            this._faceIndex = faceIndex;
            if (faceName === '') {
                this.faceName = function () { return this.actor().faceName(); }
            }
            else {
                this._faceName = faceName;
            }
            this._conditionBlocks = [];
        }

        /**
         * @param {Face_Condition_Block} condBlock 
         */
        addConditionBlock(condBlock) {
            this._conditionBlocks.push(condBlock);
        }

        faceName() {
            return this._faceName;
        }

        actorId() {
            return this._actorId;
        }

        faceIndex() {
            return this._faceIndex;
        }

        /**
         * Get the actor this condition applies to
         * @returns {Game_Actor}
         */
        actor() {
            return $gameActors.actor(this.actorId());
        }

        isAllConditionsTrue() {
            for (let i = 0; i < this._conditionBlocks.length; i++) {
                if (!this._conditionBlocks[i].isAnyTrue()) return false;
            }
            return true;
        }
    };

    function printNoteLineError(line, actorId) {
        console.error("There was an error processing the line \n" + line + "\n in actor " + actorId + "'s notetag");
    }

    function printCommandArgNumError(commandName) {
        console.error("Incorrect number of arguments for command " + commandName);
    }

    function throwGenericError() {
        throw new Error("An error occurred in KC_ActorFaceConditions");
    }

    /**
     * @param {string} s string to have parts replaced
     * @param {string} openingChar Closing wrapper char
     * @param {string} closingChar Opening wrapper char
     * @param {string} placeholderBase This is the string substituted in for the replaced characters
     * @param {string} placeholderPre This is placed before the base when substituting it in
     * @param {string} placeholderPost This is placed after the base when substituting it in
     * @returns {{newStr: string, blockMap: Map<string, string>}}
     */
    function extractWrappers(s, openingChar, closingChar, placeholderBase, placeholderPre, placeholderPost) {
        const /**@type {Map<string, string>} */ finalMap = new Map();
        let placeholderCounter = 0;
        let closeCounter = 0;
        let openCounter = 0;
        let openIndex = -1;
        let pos = 0;

        let done = false;

        while (!done) {
            if (openIndex < 0) {
                openIndex = s.indexOf(openingChar, pos);

                if (openIndex < 0) {
                    done = true;
                    continue;
                }
                closeCounter = 0;
                openCounter = 1;
                pos = openIndex;
            }

            while (closeCounter < openCounter) {
                pos++;
                if (s.charAt(pos) === openingChar) {
                    openCounter++;
                }
                else if (s.charAt(pos) === closingChar) {
                    closeCounter++;
                }
            }

            const extractedText = s.substring(openIndex + 1, pos);
            finalMap.set(placeholderBase + placeholderCounter, extractedText);

            openIndex = -1;
        }

        let finalStr = s;

        for (const entry of finalMap.entries()) {
            finalStr = finalStr.replace(openingChar + entry[1] + closingChar, placeholderPre + entry[0] + placeholderPost);
        }

        return {
            newStr: finalStr,
            blockMap: finalMap
        }
    }

    /**
     * Parses note tag to set up face condition list
     * @param {string} tag The value of the FACE_CONDITIONS note tag
     */
    function parseNoteTag(actorId, tag) {
        console.log(tag);
        const extract = extractWrappers(tag, '{', '}', 'code', '', '\n');
        console.log(extract);
        const lines = extract.newStr.split('\n');
        const /**@type {Face_Condition_List[]} */ finalList = [];
        let /**@type {Face_Condition_List} */ currList;
        lines.forEach(line => {
            const /**@type {string}*/ formattedLine = line.replaceAll(/\s+/g, ' ').trim();
            if (formattedLine === '') return;
            const firstSpaceIdx = formattedLine.indexOf(' ');
            console.log(formattedLine);
            if (firstSpaceIdx > 0) {
                const noteKeyword = formattedLine.slice(0, firstSpaceIdx).toLowerCase();
                const noteArgs = formattedLine.slice(firstSpaceIdx + 1, line.length);

                if (noteKeyword === 'addface') {
                    const addFaceArgs = noteArgs.split(' ');
                    if (!addFaceArgs[0].match(/\d+/)) {
                        printNoteLineError(line, actorId);
                        throwGenericError();
                    }

                    const addFaceIndex = parseInt(addFaceArgs[0]);
                    currList = new Face_Condition_List(actorId, addFaceIndex, noteArgs.replace(addFaceArgs[0], '').trim());
                    finalList.push(currList);
                }
                else {
                    if (!currList) {
                        printNoteLineError(line, actorId)
                        console.error("No face specified before argument!");
                        throwGenericError();
                    }

                    const condBlock = new Face_Condition_Block(actorId);
                    const /**@type {string[]} */ blockComponents = formattedLine.split('||');
                    blockComponents.forEach(command => {
                        const trimmed = command.trim();
                        //console.log(trimmed);
                        const commandFirstSpace = trimmed.indexOf(' ');

                        if (commandFirstSpace > 0) {
                            const commandKeyword = trimmed.slice(0, commandFirstSpace).toLowerCase();
                            const commandArgs = trimmed.slice(commandFirstSpace + 1, trimmed.length);

                            switch (commandKeyword) {
                                case 'compare':
                                    const extractedQuotes = extractWrappers(commandArgs, '"', '"', "arg");
                                    const cmpArgs = extractedQuotes.newStr.split(' ');
                                    if (cmpArgs.length === 3) {
                                        if ($.comparisonFunctions[cmpArgs[1]]) {
                                            try {
                                                condBlock.addComparisonCondition(cmpArgs[1], cmpArgs[0], cmpArgs[2]);
                                            } catch (error) {
                                                printNoteLineError(line, actorId);
                                                console.error(error.message);
                                                throwGenericError();
                                            }
                                        }
                                        else {
                                            printNoteLineError(line, actorId);
                                            console.error('Invalid operation specified!');
                                            throwGenericError();
                                        }
                                    }
                                    else {
                                        printNoteLineError(line, actorId);
                                        printCommandArgNumError(commandKeyword);
                                        throwGenericError();
                                    }
                                    break;

                                case 'switch':
                                case '!switch':
                                    const switchId = parseInt(commandArgs);
                                    if (switchId) {
                                        condBlock.addSwitchCondition(switchId, commandKeyword.charAt(0) === '!');
                                    }
                                    else {
                                        printNoteLineError(line, actorId);
                                        console.error('Invalid switch ID specified');
                                        throwGenericError();
                                    }
                                    break;

                                case 'switchset':
                                case '!switchset':
                                    condBlock.addSwitchSetCondition(commandArgs, commandKeyword.charAt(0) === '!')
                                    break;

                                case 'state':
                                case '!state':
                                    const stateId = parseInt(commandArgs);
                                    if (stateId) {
                                        condBlock.addStateCondition(stateId, commandKeyword.charAt(0) === '!');
                                    }
                                    else {
                                        printNoteLineError(line, actorId);
                                        console.error('Invalid state ID specified');
                                        throwGenericError();
                                    }
                                    break;

                                case 'stateset':
                                case '!stateset':
                                    condBlock.addStateSetCondition(commandArgs, commandKeyword.charAt(0) === '!')
                                    break;

                                case 'eval':
                                    try {
                                        condBlock.addEvalCondition(extract.blockMap.get(commandArgs));
                                    } catch (error) {
                                        printNoteLineError(line, actorId);
                                        console.error(error.message);
                                        console.error('Error creating function');
                                        throwGenericError();
                                    }
                                    break;

                                case 'function':
                                    try {
                                        condBlock.addFuncCondition(extract.blockMap.get(commandArgs));
                                    } catch (error) {
                                        printNoteLineError(line, actorId);
                                        console.error(error.message);
                                        console.error('Error creating function');
                                        throwGenericError();
                                    }
                                    break;

                                case 'svmotion':
                                case '!svmotion':
                                    condBlock.addSvMotionCondition(commandArgs, commandKeyword.charAt(0) === '!');
                                    break;

                                default:
                                    printNoteLineError(line, actorId);
                                    console.error('Unrecognized command!');
                                    throwGenericError();
                                    break;
                            }
                        }
                        else {
                            printNoteLineError(line, actorId);
                            console.error('No arguments specified!');
                            throwGenericError();
                        }
                    });
                    currList.addConditionBlock(condBlock);
                }
            }
            else {
                printNoteLineError(line, actorId);
                console.error('No arguments specified!');
                throwGenericError();
            }
        });
        $.actorToCondList.set(actorId, finalList)
    };

    $.Scene_Boot_onDatabaseLoaded = Scene_Boot.prototype.onDatabaseLoaded;
    Scene_Boot.prototype.onDatabaseLoaded = function () {
        $.Scene_Boot_onDatabaseLoaded.apply(this, arguments);
        for (let i = 1; i < $dataActors.length; i++) {
            const actor = $dataActors[i];
            const /**@type {string} */ note = actor.note;
            const conditionTag = note.match(/<face_conditions>(.|\s)*<\/face_conditions>/i);
            if (conditionTag) {
                const cond = conditionTag[0];
                const endTag = '</face_conditions>';
                parseNoteTag(actor.id, cond.slice(endTag.length, cond.length - endTag.length));
            }
        }
        console.log($.actorToCondList);
    };

    $.Window_StatusBase_drawActorFace = Window_StatusBase.prototype.drawActorFace;
    /**
     * @param {Game_Actor} actor 
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     */
    Window_StatusBase.prototype.drawActorFace = function (actor, x, y, width, height) {
        const /**@type {Face_Condition_List[]} */ faceConditions = $.actorToCondList.get(actor.actorId());
        if (faceConditions && actor.isFaceConditionEnabled()) {
            for (let i = 0; i < faceConditions.length; i++) {
                const condList = faceConditions[i];
                if (condList.isAllConditionsTrue()) {
                    this.drawFace(condList.faceName(), condList.faceIndex(), x, y, width, height);
                    return;
                }
            }
        }
        $.Window_StatusBase_drawActorFace.apply(this, arguments);
    };

    /**
     * @returns {boolean}
     */
    Game_Actor.prototype.isFaceConditionEnabled = function () {
        return this._faceConditionEnabled;
    }

    /**
     * @param {boolean} enabled 
     */
    Game_Actor.prototype.setFaceConditionEnabled = function (enabled) {
        this._faceConditionEnabled = enabled;
    }

    $.Game_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function () {
        $.Game_Actor_setup.apply(this, arguments);
        this._faceConditionEnabled = !!$.actorToCondList.get(this.actorId()) && !$dataActors[this.actorId()].note.match(/<face_conditions_disabled>/i);
    }

    $.BattleManager_displayBattlerStatus = BattleManager.displayBattlerStatus;
    BattleManager.displayBattlerStatus = function (battler, current) {
        $gameTemp.requestBattleRefresh();
        $.BattleManager_displayBattlerStatus.apply(this, arguments);
    };

    $.Game_Actor_requestMotion = Game_Actor.prototype.requestMotion;
    Game_Actor.prototype.requestMotion = function (motion) {
        $.Game_Actor_requestMotion.apply(this, arguments);
        if (this.isFaceConditionEnabled()) {
            $gameTemp.requestBattleRefresh();
        }
    }

})(KCDev.ActorFaceConditions);
