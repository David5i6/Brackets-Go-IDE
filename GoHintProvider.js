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


    var endtokens = [' ', '+', '-', '/', '*', '(', ')', '[', ']', ':', ',', '<', '>'];

    function validToken(implicitChar) {
        if (implicitChar) {
            var code = implicitChar.charCodeAt(0);
            console.log(" >> [", implicitChar, "] : ", endtokens.indexOf(implicitChar), " <--> ", implicitChar.length, " ----> ", code);
            return (endtokens.indexOf(implicitChar) === -1)&&(code!==13)&&(code!==9);
        } else {
            return false
        }
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

        ltoken = txt.substring(ti + 1);
        // console.log(ltoken);

        return ltoken;
    }


    var langtokens = ['bool', 'byte', 'const', 'complex128', 'complex64', 'error', 'flot32', 'float64',
                      'for', 'func', 'go', 'if', 'int', 'int16', 'int32', 'int64', 'int8', 'interface', 'import',
                      'il', 'package', 'return', 'rune', 'string', 'struct', 'type',
                      'uint', 'uint16', 'uint32', 'uint64', 'uint8', 'uintptr', 'var'];
    var langtokensL = langtokens.length;


    var langftokens = ['append', 'cap', 'close', 'complex', 'copy', 'delete', 'imag', 'len', 'make', 'new',
                       'panic', 'print', 'prntln', 'real', 'recover'];
    var langftokens2 = [
        '(slice []Type, elems ...Type) []Type',
        '(v Type) int',
        '(c chan<- Type)',
        '(r, i FloatType) ComplexType',
        '(dst, src []Type) int',
        '(m map[Type]Type1, key Type)',
        '(c ComplexType) FloatType',
        '(v Type) int',
        '(Type, size IntegerType) Type',
        '(Type) *Type',
        '(v interface{})',
        '(args ...Type)',
        '(args ...Type)',
        '(c ComplexType) FloatType',
        '() interface{}'
    ]
    var langftokensL = langftokens.length;





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

        function resolveHint(data, petition) {
            if (petition === vpet) {
                $deferred.resolve({
                    hints: formatter.format(data),
                    match: "",
                    selectInitial: true,
                    handleWideResults: false
                });
            }
        }

        function addLanguageHints(data, petition) {
            if (petition === vpet) {
                var lasttoken = getLastToken(),
                    i, tok;

                for (i = 0; i < langtokensL; ++i) {
                    tok = langtokens[i];
                    if (tok.indexOf(lasttoken) === 0) {
                        data += 'lang ' + tok + '\n';
                    }
                }

                window.setTimeout(function () {
                    addLanguageFunctionHints(data, petition);
                }, 0);
            }
        }

        function addLanguageFunctionHints(data, petition) {
            if (petition === vpet) {
                var lasttoken = getLastToken(),
                    i, tok;

                for (i = 0; i < langftokensL; ++i) {
                    tok = langftokens[i];
                    if (tok.indexOf(lasttoken) === 0) {
                        data += 'langfunc ' + tok + langftokens2[i] + '\n';
                    }
                }

                window.setTimeout(function () {
                    resolveHint(data, petition);
                }, 0);
            }
        }

        this.insertHint = function ($hint) {
            if (!$hint) {
                // console.log('hint:', $hint);
                throw new TypeError("Must provide valid hint and hints object as they are returned by calling getHints");
            } else {
                var lasttoken = getLastToken();
                cm.replaceSelection($hint.data('token').substring(lasttoken.length));
            }
        };



        /**
         * When domain send the update event (and only if there're no multiple version events...
         * Format the response and resolve the promise.
         */
        $(nodeConnection).on("GoHinter.update", function (evt, data, petition) {
            if (petition === vpet) {
                if (data === 'PANIC PANIC PANIC\n') {
                    data = '';
                }
                window.setTimeout(function () {
                    addLanguageHints(data, petition);
                }, 0);

            }
        });
    }


    return GoHintProvider;

});