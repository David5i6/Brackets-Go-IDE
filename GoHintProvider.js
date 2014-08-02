/**
 *
 * Go-IDE
 *
 * Licensed under MIT
 *
 * Author: David Sánchez i Gregori
 *
 */


/**
 * This is the GoHintProvider, This class loads A NodeDomain that executes 'gocode', and receiver events generated from that module.
 */
define(function (require, exports, module) {
    'use strict';




    // Para poder lanzar comandos externos.
    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        NodeDomain = brackets.getModule("utils/NodeDomain"),
        NodeConnection = brackets.getModule("utils/NodeConnection");
    var GoHinterDomain;
    var nodeConnection = new NodeConnection();
    var connection = nodeConnection.connect(true);

    connection.done(function () {
        GoHinterDomain = new NodeDomain("GoHinter", ExtensionUtils.getModulePath(module, "node/GoHinterDomain"));
    });

    // $ is jquery (loaded in the main.js and passed via param)
    // $deferred is a global holder for deferred messages.
    var $deferred, cm, vpet = 0;

    // Cursors
    var lcursor, bcursor;



    function getHintsD(implicitChar, text, cursor) {

        // A new promise
        $deferred = new $.Deferred();
        // Call getHint on a Domain and increment the version of petition.
        GoHinterDomain.exec("getHint", implicitChar, text, cursor, ++vpet)
            .fail(function (err) {
                console.error("[GoHintDomain] failed to get hints: ", err);
            });
        return $deferred;
    }


    var endtokens = [' ', '+', '-', '/', '*', '(', ')', '[', ']', ':', ',', '<', '>', '.', '\n', '\t'];

    function validToken(implicitChar) {
        //return endtokens.indexOf(implicitChar)===-1;
        return true;
    }



    function getLastToken() {

        var cursor = cm.getCursor();
        var txt = cm.getRange({
            line: 0,
            ch: 0
        }, cursor);

        var tl = txt.length - 1;
        var ti = tl;
        var ltoken;

        while ((ti > 0) && (endtokens.indexOf(txt.charAt(ti)) === -1)) {
            --ti;
        }

        ltoken=txt.substring(ti);
        console.log(ltoken);
        
        return ltoken;
    }

    function GoHintProvider(formatter) {


        //$ = jquery;

        this.hasHints = function (editor, implicitChar) {
            cm = editor._codeMirror;

            return validToken(implicitChar);
        };

        this.getHints = function (implicitChar) {
            // If is a valid token for a hint ...
            if (validToken(implicitChar)) {
                var cursor = cm.getCursor();
                var txt = cm.getRange({
                    line: 0,
                    ch: 0
                }, cursor);
                var txt2 = cm.getValue();

                // a Promise of a hint via Domain ...
                return getHintsD(implicitChar, txt2, txt.length);
            } else {
                return false;
            }

        };



        this.insertHint = function ($hint) {
            if (!$hint) {
                console.log('hint:', $hint);
                throw new TypeError("Must provide valid hint and hints object as they are returned by calling getHints");
            } else {
                /*
                var cursor = cm.getCursor();
                var txt = cm.getRange({
                    line: 0,
                    ch: 0
                }, cursor);

                var tl = txt.length - 1;
                var ti = tl;

                while ((ti > 0) && (endtokens.indexOf(txt.charAt(ti)) === -1)) {
                    --ti;
                }
                */

                var lasttoken = getLastToken();
                cm.replaceSelection($hint.data('token').substring(lasttoken.length-1));
            }
        };



        /**
         * When domain send the update event (and only if there're no multiple version events...
         * Format the response and resolve the promise.
         */
        $(nodeConnection).on("GoHinter.update", function (evt, data, petition) {
            if (petition === vpet) {
                $deferred.resolve({
                    hints: formatter.format(data),
                    match: "",
                    selectInitial: true,
                    handleWideResults: false
                });
            }
        });
    }


    return GoHintProvider;

});