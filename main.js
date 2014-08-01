/**
 *
 * Go-IDE
 *
 * Licensed under MIT
 *
 * Author: David Sánchez i Gregori
 *
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, brackets, $, window */


// Here i the module definition
define(function (require, exports, module) {
    "use strict";

    var AppInit = brackets.getModule("utils/AppInit"), // Brackets init
        CodeHintManager = brackets.getModule("editor/CodeHintManager"), // CodeMirror Hints
        LanguageManager = brackets.getModule("language/LanguageManager"), // Language
        Editor = brackets.getModule("thirdparty/CodeMirror2/lib/codemirror"),// CodeMirror
        ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"); // ExtensionUtils (to load css)

    var GoHintProvider = require('GoHintProvider'); // load goHintProvider.
    var GoHintFormatter = require('GoHintFormatter'); // load goHintProvider.



    // Load CSS
    ExtensionUtils.loadStyleSheet(module, "style/main.css");


    // Mime
    Editor.defineMIME("text/x-go", "go");

    // Define go language
    LanguageManager.defineLanguage("go", {
        name: "go-lang",
        mode: "go",
        fileExtensions: ["go"],
        blockComment: ["/*", "*/"],
        lineComment: ["//", "//"]
    });

    // Where the app starts
    AppInit.appReady(function () {

        var goHintProvider = new GoHintProvider($,new GoHintFormatter());
        // Set the hint provider for Go language.
        CodeHintManager.registerHintProvider(goHintProvider, ["go"], 1);

    });


});
