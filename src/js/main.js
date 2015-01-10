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
        'jquery',
        'modules/recorder/recorder'
    ],
    function($, Recorder) {
        "use strict";

        $(function(){
            var startBtn = $('#start-recording'),
                stopBtn = $('#stop-recording');

            startBtn.click(function() {
                Recorder.start();
                $(this).attr('disabled', true);
                stopBtn.removeAttr('disabled');
            });

            stopBtn.click(function() {
                Recorder.stop();
                $(this).attr('disabled', true);
                startBtn.removeAttr('disabled');
            });
        });

        window.blobs = [];
    });
