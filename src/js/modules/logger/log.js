/**
 * Module log. Simple stub for log functions
 */
define('modules/logger/log',
    [],
    function() {
        "use strict";

        return console.log.bind(console);
    });
