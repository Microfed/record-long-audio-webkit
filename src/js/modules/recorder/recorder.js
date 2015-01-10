/**
 * Module recorder
 */
define('modules/recorder/recorder',
    [
        'lib/recordmp3/recordmp3',
        'modules/logger/log'
    ],
    function(RecorderMP3, __log) {
        "use strict";

        var audio_context,
            input,
            recorder,

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

                // create WAV download link using audio data blob
                createDownloadLink();

                recorder.clear();
            },

            createDownloadLink = function() {
                recorder && recorder.exportWAV(function(blob) {
                    console.log('New blob created:', blob);
                    /*var url = URL.createObjectURL(blob);
                     var li = document.createElement('li');
                     var au = document.createElement('audio');
                     var hf = document.createElement('a');

                     au.controls = true;
                     au.src = url;
                     hf.href = url;
                     hf.download = new Date().toISOString() + '.wav';
                     hf.innerHTML = hf.download;
                     li.appendChild(au);
                     li.appendChild(hf);
                     recordingslist.appendChild(li);*/
                });
            },

            initializeRecorder = function() {
                if (input) {
                    recorder = new RecorderMP3(input);
                    __log('Recorder initialised.');
                } else {
                    __log('Input is undefined');
                }
            };

        window.onload = function init() {
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
        };

        return {
            start: startRecording,
            stop: stopRecording,
            resetRecorder: initializeRecorder
        }
    });
