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
        Editor = brackets.getModule("thirdparty/CodeMirror2/lib/codemirror"), // CodeMirror
        PanelManager = brackets.getModule('view/PanelManager'), // PanelManager
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"); // ExtensionUtils (to load css)

    var Menus = brackets.getModule("command/Menus"), // Menus
        CommandManager = brackets.getModule("command/CommandManager"), // COmmand Manager
        EditorManager = brackets.getModule("editor/EditorManager"); // EditorManager

    var GoHintProvider = require('GoHintProvider'); // load goHintProvider.
    var GoHintFormatter = require('GoHintFormatter'); // load goHintProvider.




    var panelHTML = $(require('text!res/mainToolbar.html'));
    var mainToolbar;


    function doCompile() {
        console.log("Compile !!");
    }


    // Configure Main Toolbar
    panelHTML.children("#goide_maintb_btn_compile").on("click", doCompile);


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
    
    
    
    // Menu commands
            var menu_goFmtCmd='menu_goFmt';
            /*
             * Implementation
             */
            function menu_goFmt() {
                var doc = EditorManager.getCurrentFullEditor().document;
                doc.replaceRange("// copyright text \n", {
                    line: 0,
                    ch: 0
                });
            }
    

    function startup() {
        try {
            var goHintProvider = new GoHintProvider(new GoHintFormatter());

            
            console.info('Registering Hint Provider.');
            // Set the hint provider for Go language.
            CodeHintManager.registerHintProvider(goHintProvider, ["go"], 1);
            console.info('Registered go Hint Provider');


            // Also register a panel:
            //mainToolbar=PanelManager.createBottomPanel( 'david5i6.bracketsgoide.mainToolbar.panel', panelHTML, 32 );
            //mainToolbar.show();


            // ===== ==== ==== ==== 

            
            /*
             * Command
             */
            //CommandManager.register("Go Format", menu_goFmtCmd, menu_goFmt);
            /*
             * Custom menu
             */
            //var menu = Menus.addMenu("Go", "david5i6.bracketsgoide.gomenu");
            //menu.addMenuItem(menu_goFmtCmd);
        } catch (e) {
            console.log('Error starting up go hint provider',e);
            setTimeout(startup, 100);
        }
    }

    // Where the app starts
    AppInit.appReady(function () {

        startup();

    });

});