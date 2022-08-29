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
 * @plugindesc [v1.0]Call an event from elsewhere on the map.
 *
 * @help
 * KC_CallMapEvent.js
 * 
 * This plugin lets you call any page of any event on the current map.
 * 
 * It's simple and as a result only contains a single plugin command that should
 * be fairly self-explanatory.
 * 
 * Plugin Commands:
 * Call Map Event
 * | Call a page of any event on the current map.
 * 
 * Script Calls:
 * KCDev.CallMapEvent.callEvent(event ID, [event page])
 * | Call a page of any event on the current map. Leaving the second parameter
 * | blank will use the currently selected page of the event.
 * 
 * @command callEvent
 * @text Call Map Event
 * @desc Call an event on the map.
 * 
 * @arg eventId
 * @text Event ID
 * @type number
 * @desc Target event to run. 0 calls the current event.
 * @default 0
 * 
 * @arg eventPage
 * @text Event Page
 * @type number
 * @desc Run this page of the common event
 * @default 0
 * 
 */

var KCDev = KCDev || {};

KCDev.CallMapEvent = {};

(($) => {

    const script = document.currentScript.src.split("/").pop().replace(/\.js$/, "");

    function printError(message = '') {
        console.error('KC_CallMapEvent: ' + message);
    }

    $.callEvent = function(eventId = 0, eventPage = 0) {

        if (eventId === 0) {
            eventId = this.eventId();
        }

        if (!$gameMap.event(eventId)) {
            printError('Non-existent event referenced with ID ' + eventId);
            return;
        }

        if (eventPage === 0) {
            eventPage = $gameMap.event(eventId)._pageIndex + 1;
        }

        const page = $gameMap.event(eventId).event().pages[eventPage - 1];

        if (page) {
            this.setupChild(page.list, this.eventId());
        }
        else {
            printError('Invalid page passed in.');
        }

    };

    PluginManager.registerCommand(script, 'callEvent', function(args) {
        $.callEvent.call(this, parseInt(args.eventId), parseInt(args.eventPage));
    });

})(KCDev.CallMapEvent);

