require.config({
    baseUrl: 'js/',
    paths: {
        'jquery': 'lib/jquery/dist/jquery'
    },
    shim: {
        'jquery': { exports: 'jQuery' }
    }
});

define('main',
    [
        'jquery',
        'modules/recorder/recorder'
    ],
    function($, Recorder) {
        "use strict";

        $(function() {
            var startBtn = $('#start-recording'),
                stopBtn = $('#stop-recording'),
                recordings = $("#recordings");

            Recorder.configure({ recordingsListEl: recordings[0] });

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
    });
