define(function (require, exports, module) {
    'use strict';

    /**
     * Definition of GoHintFormatter
     */
    function GoHintFormatter() {



        this.formatLine = function (linea) {
            linea = linea || '';


            var t = linea.indexOf(' ');
            var lin = '';
            var t2, l2, t3, l3;

            var tipo = linea.substring(0, t);

            lin = "<span class='goHint_" + tipo + "'>" + tipo + "</span> ";

            l2 = linea.substring(t + 1);
            t2 = l2.indexOf('(');

            // Is a procedure ?
            if (t2 !== -1) {
                
                lin += l2.substring(0, t2)+ ' ';
                /*
                lin += l2.substring(t2);
                */
                // Has return values ?
                l3 = l2.substring(t2 );
                t3 = l3.indexOf('(',1);

                if (t3 !== -1) {
                    lin += '<span class="goHint_fp">'+l3.substring(0, t3)+'</span>';
                    lin += ' <span class="goHint_fr">(';
                    lin += l3.substring(t3);
                    lin += '</span>';
                } else {
                    lin += '<span class="goHint_fp">'+l3+'</span>';
                }

            } else {
                lin += l2;
            }

            return lin;
        }

        /**
         * Parses a line, from a begining position.
         */
        this.parseLine = function (arr, data, bpos) {
            arr = arr || []; // An Array
            bpos = bpos | 0; // Is an integer
            data = data || ''; // Is an String

            var nl = data.indexOf('\n', bpos + 1);
            var line;
            if (nl !== -1) {
                line = data.substring(bpos, nl);
                arr.push(this.formatLine(line.trim()));
                return nl;
            } else {
                return -1;
            }
        }

        /**
         * Parses all the data.
         */
        this.parseAll = function (data) {
            var arr = [];

            console.log(data);

            var bp = data.indexOf('\n');

            while ((bp = this.parseLine(arr, data, bp)) !== -1);

            /*
            bp=this.parseLine(arr,data,bp);
            console.log("### PARSELINE : ",bp);
            
            bp=this.parseLine(arr,data,bp);
            console.log("### PARSELINE : ",bp);
            */


            return arr;

        }

        /**
         * Receives raw data, and returns a formatted list of hints.
         */
        this.format = function (data) {
            /*
            var hints = data.substring(
                data.indexOf('\n') + 1, data.lastIndexOf('\n')
            ).split('\n');
            */

            var hints = this.parseAll(data);

            return hints;

        }


    }


    return GoHintFormatter;
});