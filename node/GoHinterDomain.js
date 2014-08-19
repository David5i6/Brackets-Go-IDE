/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, node: true */
/*global */

(function () {
    "use strict";


    var spawn         = require('child_process').spawn;
    var ProcessUtils  = require('./ProcessUtils');
    var extName       = '[go-ide] ';
    var _domainManager;
    var gocodeResolvedPath;


    function formatHints(hints) {
        return {
            hints: hints,
            match: "",
            selectInitial: true,
            handleWideResults: true
        };
    }

    /**
     * Uses ProcessUtils from Brackets-Git to check if an executable exists
     */
    function which(filePath, callback) {
        ProcessUtils.executableExists(filePath, function (err, exists, resolvedPath) {
            if (exists) {
                callback(null, resolvedPath);
            } else {
                callback("ProcessUtils can't resolve the path requested: " + filePath);
            }
        });
    }

    /**
     * @private
     * Handler function for the simple.getMemory command.
     * @param implicitChar {boolean} total If true, return total memory; if false, return free memory only.
     * @param text {string} text of the current editor
     * @param cursor {number} cursor position
     * @return {number} The amount of memory.
     */
    function cmdGetHint(implicitChar, text, cursor, petition) {
    
        // use 'which' to test if the gocode executable exists,
        // otherwise spawn will throw a global ENOENT exception ignoring try-catch,
        // which will cause Brackets Node domain to crash
        if (!gocodeResolvedPath) {
            which('gocode', function (err, resolvedPath) {
                if (err) {
                    console.error(extName + err);
                    return;
                }
                gocodeResolvedPath = resolvedPath;
                executeGoCode();
            });
        } else {
            executeGoCode();
        }

        function executeGoCode() {
            try {
                var gocode = spawn(gocodeResolvedPath, ['autocomplete', 'c' + cursor]);

                // Send current buffer file to stdin and close stdin.
                gocode.stdin.write(text);
                gocode.stdin.end();


                // Temp data
                var temp = "";

                // Capture output and concatenate to temp.
                gocode.stdout.on('data', function (data) {
                    temp += data.toString();
                });

                gocode.stderr.on('data', function (data) {
                    console.error(extName + 'stderr: ' + data);
                });

                gocode.on('close', function (code) {
                    // emit the result.
                    _domainManager.emitEvent("GoHinter", "update", [temp, petition]);
                });

                gocode.unref();
            } catch (e) {
                console.error(extName + e);
            }
        }

    }

    /**
     * Initializes the domain.
     * @param {DomainManager} domainManager The DomainManager for the server
     */
    function init(domainManager) {
        if (!domainManager.hasDomain("GoHinter")) {
            domainManager.registerDomain("GoHinter", {
                major: 0,
                minor: 1
            });
        }
        domainManager.registerCommand(
            "GoHinter", // domain name
            "getHint", // command name
            cmdGetHint, // command handler function
            false, // this command is asynchronous in Node
            "Returns a Hint for Go code autocompletion", [
                {
                    name: "implicitChar", // parameters
                    type: "string",
                    description: "Either null, if the hinting request was explicit, or a single character that represents the last insertion and that indicates an implicit hinting request"
            },
                {
                    name: "text", // parameters
                    type: "string",
                    description: "Current editor file text."
            },
                {
                    name: "cursor", // parameters
                    type: "number",
                    description: "Current cursor position"
            },
                {
                    name: "petition", // parameters
                    type: "number",
                    description: "Current petition number"
            }
            ], []
        );

        // Register Event update
        domainManager.registerEvent(
            "GoHinter",
            "update", [{
                name: "data",
                type: "string"
            },{
                name: "petition",
                type: "number"
            }]
        );

        _domainManager = domainManager;
    }

    // In domains export the initialization function.
    exports.init = init;

}());
