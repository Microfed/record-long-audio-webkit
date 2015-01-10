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
            recordingsListEl,
            recordings = [],
            currentRecordingIndex = 0,
            partLength = 5000, // timeout in milliseconds
            isRecording = false,

            encode64 = function(buffer) {
                var binary = '',
                    bytes = new Uint8Array(buffer),
                    len = bytes.byteLength;

                for (var i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                return window.btoa(binary);
            },

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

                recordings.push({ blobs: [], recording: null });
                isRecording = true;
                setTimeout(filePartRecorded, partLength);
            },

            stopRecording = function() {
                isRecording = false;

                recorder && recorder.stop();
                __log('Stopped recording.');

                // create WAV download link using audio data blob
                createDownloadLink();

                currentRecordingIndex += 1;
            },

            filePartRecorded = function() {
                if (isRecording) {
                    recorder.stop();

                    recorder.exportWAV(function(blob, self) {
                        recordings[currentRecordingIndex].blobs.push(blob);
                        self.clear();
                    });

                    recorder = new RecorderMP3(input);
                    recorder.record();
                    setTimeout(filePartRecorded, partLength);
                }
            },

            createDownloadLink = function() {
                var record = recordings[currentRecordingIndex];

                recorder && recorder.exportWAV(function(blob) {
                    recorder.clear();
                    console.log('New blob created:', blob);

                    record.blobs.push(blob);

                    var recording = new Blob(record.blobs, { type: "audio/mp3" });

                    var fileReader = new FileReader();

                    fileReader.onload = function() {
                        var url = 'data:audio/mp3;base64,' + encode64(this.result);

                        console.log('MP3 url:', url);

                        if (recordingsListEl) {
                            var li = document.createElement('li');
                            var au = document.createElement('audio');
                            var hf = document.createElement('a');

                            au.controls = true;
                            au.src = url;
                            hf.href = url;
                            hf.download = 'audio_recording_' + new Date().getTime() + '.mp3';
                            hf.innerHTML = hf.download;
                            li.appendChild(au);
                            li.appendChild(hf);
                            recordingsListEl.appendChild(li);
                        }
                    };

                    fileReader.readAsArrayBuffer(recording);
                });
            },

            initializeRecorder = function() {
                if (input) {
                    recorder = new RecorderMP3(input);
                    __log('Recorder initialised.');
                } else {
                    __log('Input is undefined');
                }
            },

            configure = function(cfg) {
                var config = cfg || {};

                recordingsListEl = config.recordingsListEl;
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
            configure: configure,
            resetRecorder: initializeRecorder
        }
    });
