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

    console.log("Activando GoHintProvider");


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
    var $, $deferred, cm,vpet=0;



    function getHintsD(implicitChar, text, cursor) {
        $deferred = new $.Deferred();
        GoHinterDomain.exec("getHint", implicitChar, text, cursor,++vpet)
            .done(function (value) {
                console.log(
                    "[GoHintDomain] Hints passsed"
                );
            }).fail(function (err) {
                console.error("[GoHintDomain] failed to get hints: ", err);
            });
        return $deferred;
    }


    function validToken(implicitChar) {
        return implicitChar !== ' ' && implicitChar !== '\n' && implicitChar !== '\t';
    }

    function GoHintProvider(jquery) {


        $ = jquery;

        this.hasHints = function (editor, implicitChar) {
            console.log("HasHints [" + implicitChar + "]");

            console.log("CodeMirror: ", editor)
            console.log("CodeMirrorCP: ", editor.getCursorPos())
            // Set CodeMirror editor.
            cm = editor._codeMirror;
            //var cursor = cm.getCursor();
            //var token = editor.getTokenAt(cursor);
            //var txt = cm.getRange({line:0,ch:0},cursor);

            //var txt2=cm.getValue();
            //console.log(txt,txt.length,txt2.substring(txt.length));

            // console.log("Token: ",token);

            return validToken(implicitChar);
        };

        this.getHints = function (implicitChar) {
            console.log("Go getHints [" + implicitChar + "]");

            console.log(implicitChar);

            if (validToken(implicitChar)) {

                console.log(new $.Deferred());


                var cursor = cm.getCursor();
                //var token = editor.getTokenAt(cursor);
                var txt = cm.getRange({
                    line: 0,
                    ch: 0
                }, cursor);
                var txt2 = cm.getValue();


                return getHintsD(implicitChar, txt2, txt.length);
                /*
            return {

                hints: ["1", "2"],
                match: "",
                selectInitial: true,
                handleWideResults: true

            };*/
            } else {
                return false;
            }

        };

        this.insertHint = function (hint) {
            console.log("insertHint");
            return false;
        };



        //console.log("###############################");
        console.log("nodeConection", nodeConnection);
        //console.log("$nodeConection", $(nodeConnection));

        $(nodeConnection).on("GoHinter.update", function (evt, data, petition) {
            //console.log("GO Evento >> ", data,petition, vpet);
            if (petition === vpet) {
                $deferred.resolve({
                    hints: data.split("\n"),
                    match: "",
                    selectInitial: false,
                    handleWideResults: true
                });
            }
        });

    }



    console.log("...");
    return GoHintProvider;

});
