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
 * @plugindesc [v1.0]Jump to the label stored in a game variable.
 *
 * @help
 * This is a simple plugin that allows you to jump to the label name stored in
 * any game variable.
 * 
 * The easiest way to store a label name in a variable is to use the "Control
 * Variables" command and use the script option to enter a string (text
 * surrounded by quotes, e.g. 'LabelA' or "LabelA" would jump to the label
 * named LabelA).
 * 
 * This is plug and play. No configuration needed.
 * 
 * Commands:
 *  Jump to Variable Label
 *      | This runs the Jump to Label command on the label name stored
 *        in a chosen variable.
 * 
 * @command jumpVarLabel
 * @text Jump to Variable Lable
 * @desc Jump to the label name stored in the variable.
 * 
 * @arg var
 * @text Variable ID
 * @type variable
 * @desc This variable should have the name of the label being jumped to.
 * @default 0
 * 
 */

(() => {
    'use strict';

    const script = document.currentScript.src.split("/").pop().replace(/\.js$/, "");

    PluginManager.registerCommand(script, "jumpVarLabel", function (args) {
        this.command119([$gameVariables.value(parseInt(args.var))]);
    });

})();
