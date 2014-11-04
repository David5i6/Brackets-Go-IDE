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
            var t2, l2, t3, l3, l4,lv;

            var tipo = linea.substring(0, t);
            

            lin = "<span class='goHint_" + tipo + "'>" + tipo + "</span> ";

            l2 = linea.substring(t + 1);
            t2 = l2.indexOf('(');
            
            if (t2 === -1) {
                t2 = l2.indexOf(' ', 1);
            }

            // Is a procedure ?
            if (t2 !== -1) {
                lv = l2.substring(0, t2);
                lin += '<span class="goHint_m">'+lv + ' </span>';
                /*
                lin += l2.substring(t2);
                */
                // Has return values ?
                l3 = l2.substring(t2);
                t3 = l3.indexOf('(', 1);
                if (t3 === -1) {
                    t3 = l3.lastIndexOf(')');
                }

                if (t3 !== -1) {
                    l4 = l3.substring(0, t3);
                    lin += '<span class="goHint_fp">' + l4 + '</span>';
                    lin += ' <span class="goHint_fr">';
                    lin += l3.substring(t3);
                    lin += '</span>';
                    lin = $(lin).data("token",lv);
                } else {
                    lin += '<span class="goHint_fp">' + l3 + '</span>';
                    lin = $(lin).data("token",lv);
                }

            } else {
                lin += l2+'<i></i>';
                lin = $(lin).data("token",l2);
            }

            return lin;
        }

        /**
         * Parses a line, from a begining position.
         */
        this.parseLine = function (arr, data, bpos) {
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
            var bp = data.indexOf('\n');

            while ((bp = this.parseLine(arr, data, bp)) !== -1);

            return arr;
        }

        /**
         * Receives raw data, and returns a formatted list of hints.
         */
        this.format = function (data) {
            return this.parseAll(data);
        }

    }

    return GoHintFormatter;
});