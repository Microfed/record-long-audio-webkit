require.config({
    baseUrl: 'js/',
    paths: {
        'jquery': 'lib/jquery/dist/jquery',
        'underscore': 'lib/underscore/underscore'
    },
    shim: {
        'jquery': { exports: 'jQuery' },
        'underscore': { exports: '_' }
    }
});

define('main',
    [
    ],
    function() {
        "use strict";
    });
