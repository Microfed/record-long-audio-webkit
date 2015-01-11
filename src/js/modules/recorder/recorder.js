/**
 * Module recorder
 */
define('modules/recorder/recorder',
    [
        'lib/recordmp3onfly/recorder',
        'modules/logger/log',
        'jquery'
    ],
    function(RecorderMP3, __log, $) {
        "use strict";

        var audio_context,
            input,
            recorder,
            recordingsListEl,

            startUserMedia = function(stream) {
                input = audio_context.createMediaStreamSource(stream);

                __log('Media stream created.');
                __log("input sample rate " + input.context.sampleRate);

                input.connect(audio_context.destination);
                __log('Input connected to audio context destination.');

                initializeRecorder();
            },

            startRecording = function() {
                recorder && recorder.record();
                __log('Recording...');
            },

            stopRecording = function() {
                recorder && recorder.stop();
                __log('Stopped recording.');
            },

            fileCreatedHandler = function(blob, extension) {
                var url = URL.createObjectURL(blob),
                    liEl = document.createElement('li'),
                    linkEl = document.createElement('a'),
                    audioEl = document.createElement('audio');

                linkEl.href = url;
                linkEl.download = new Date().toISOString() + '.' + extension;
                linkEl.innerHTML = linkEl.download;
                liEl.appendChild(linkEl);

                audioEl.controls = true;
                audioEl.src = url;
                liEl.appendChild(audioEl);

                recordingsListEl.appendChild(liEl);
            },

            initializeRecorder = function() {
                if (input) {
                    recorder = new RecorderMP3(input, { fileCreatedHandler: fileCreatedHandler });

                    __log('Recorder initialised.');
                } else {
                    __log('Input is undefined');
                }
            },

            configure = function(cfg) {
                var config = cfg || {};

                recordingsListEl = config.recordingsListEl;
            };

        $(function() {
            try {
                // webkit shim
                window.AudioContext = window.AudioContext || window.webkitAudioContext;

                navigator.getUserMedia = ( navigator.getUserMedia ||
                                           navigator.webkitGetUserMedia ||
                                           navigator.mozGetUserMedia ||
                                           navigator.msGetUserMedia);

                window.URL = window.URL || window.webkitURL;

                audio_context = new AudioContext;

                __log('Audio context set up.');
                __log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
            } catch (e) {
                alert('No web audio support in this browser!');
            }

            navigator.getUserMedia({ audio: true }, startUserMedia, function(e) {
                __log('No live audio input: ' + e);
            });
        });

        return {
            start: startRecording,
            stop: stopRecording,
            configure: configure,
            resetRecorder: initializeRecorder
        }
    });
