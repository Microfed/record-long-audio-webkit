define('lib/recordmp3onfly/recorder',
    [],
    function() {
        var encoderMp3Worker = new Worker('js/lib/recordmp3onfly/enc/mp3/mp3Worker.js'),

            endFile = function(blob, extension, fileCreatedCallback) {
                console.log("Done converting to " + extension);
                console.log("the blob " + blob + " " + blob.size + " " + blob.type);

                if (fileCreatedCallback) { fileCreatedCallback(blob, extension); }
            };

        return function(source, cfg) {
            var bufferLen = 4096,
                recording = false,
                config = cfg || {},
                fileCreatedCallback = config.fileCreatedHandler;

            this.context = source.context;

            this.node = (this.context.createScriptProcessor || this.context.createJavaScriptNode).call(this.context,
                bufferLen,
                1,
                1);

            this.node.connect(this.context.destination); //this should not be necessary

            this.node.onaudioprocess = function(e) {
                var channelLeft;

                if (recording) {
                    channelLeft = e.inputBuffer.getChannelData(0);

                    console.log('onAudioProcess' + channelLeft.length);

                    encoderMp3Worker.postMessage({
                        command: 'encode',
                        buf: channelLeft
                    });
                }
            };

            this.record = function() {
                var sampleRate;

                if (!recording) {
                    recording = true;
                    sampleRate = this.context.sampleRate;

                    console.log("Initializing to Mp3");

                    encoderMp3Worker.postMessage({
                        command: 'init',
                        config: {
                            channels: 1,
                            mode: 3 /* means MONO*/,
                            samplerate: 22050,
                            bitrate: 64,
                            insamplerate: sampleRate
                        }
                    });
                } else {
                    return false;
                }
            };

            this.stop = function() {
                if (recording) {
                    encoderMp3Worker.postMessage({
                        command: 'finish'
                    });

                    recording = false;
                }
            };

            encoderMp3Worker.onmessage = function(e) {
                var command = e.data.command;

                console.log('encoderMp3Worker - onmessage: ' + command);

                switch (command) {
                case 'mp3':
                    var buf = e.data.buf;
                    endFile(buf, 'mp3', fileCreatedCallback);
                    break;
                }
            };

            source.connect(this.node);
        };
    });
