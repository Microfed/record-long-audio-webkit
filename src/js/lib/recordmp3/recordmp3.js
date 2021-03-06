/**
 * DEPRECATED
 */
define('lib/recordmp3/recordmp3',
    [],
    function() {
        var WORKER_PATH = 'js/lib/recordmp3/recorderWorker.js',
            encoderWorker = new Worker('js/lib/recordmp3/mp3Worker.js'),

            encode64 = function(buffer) {
                var binary = '',
                    bytes = new Uint8Array(buffer),
                    len = bytes.byteLength;

                for (var i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                return window.btoa(binary);
            },

            parseWav = function(wav) {
                function readInt(i, bytes) {
                    var ret = 0,
                        shft = 0;

                    while (bytes) {
                        ret += wav[i] << shft;
                        shft += 8;
                        i++;
                        bytes--;
                    }
                    return ret;
                }

                if (readInt(20, 2) != 1) {
                    throw 'Invalid compression code, not PCM';
                }
                if (readInt(22, 2) != 1) {
                    throw 'Invalid number of channels, not 1';
                }
                return {
                    sampleRate: readInt(24, 4),
                    bitsPerSample: readInt(34, 2),
                    samples: wav.subarray(44)
                };
            },

            Uint8ArrayToFloat32Array = function(u8a) {
                var f32Buffer = new Float32Array(u8a.length);
                for (var i = 0; i < u8a.length; i++) {
                    var value = u8a[i << 1] + (u8a[(i << 1) + 1] << 8);
                    if (value >= 0x8000) {
                        value |= ~0x7FFF;
                    }
                    f32Buffer[i] = value / 0x8000;
                }
                return f32Buffer;
            };

        return function(source, cfg) {
            var config = cfg || {},
                bufferLen = config.bufferLen || 4096,
                self = this;

            this.context = source.context;
            this.node = (this.context.createScriptProcessor ||
                         this.context.createJavaScriptNode).call(this.context,
                bufferLen, 2, 2);

            var worker = new Worker(config.workerPath || WORKER_PATH);

            worker.postMessage({
                command: 'init',
                config: {
                    sampleRate: this.context.sampleRate
                }
            });

            var recording = false,
                currCallback;

            this.node.onaudioprocess = function(e) {
                if (!recording) {
                    return;
                }

                worker.postMessage({
                    command: 'record',
                    buffer: [
                        e.inputBuffer.getChannelData(0),
                        //e.inputBuffer.getChannelData(1)
                    ]
                });
            };

            this.configure = function(cfg) {
                for (var prop in cfg) {
                    if (cfg.hasOwnProperty(prop)) {
                        config[prop] = cfg[prop];
                    }
                }
            };

            this.record = function() {
                recording = true;
            };

            this.stop = function() {
                recording = false;
            };

            this.clear = function() {
                worker.postMessage({ command: 'clear' });
            };

            this.getBuffer = function(cb) {
                currCallback = cb || config.callback;
                worker.postMessage({ command: 'getBuffer' })
            };

            this.exportWAV = function(cb, type) {
                currCallback = cb || config.callback;
                type = type || config.type || 'audio/wav';
                if (!currCallback) {
                    throw new Error('Callback not set');
                }
                worker.postMessage({
                    command: 'exportWAV',
                    type: type
                });
            };

            //Mp3 conversion
            worker.onmessage = function(e) {
                var blob = e.data;
                //console.log("the blob " +  blob + " " + blob.size + " " + blob.type);

                var arrayBuffer;
                var fileReader = new FileReader();

                fileReader.onload = function() {
                    arrayBuffer = this.result;
                    var buffer = new Uint8Array(arrayBuffer),
                        data = parseWav(buffer);

                    console.log(data);
                    console.log("Converting to Mp3");
                    //log.innerHTML += "\n" + "Converting to Mp3";

                    encoderWorker.postMessage({
                        cmd: 'init', config: {
                            mode: 3,
                            channels: 1,
                            samplerate: data.sampleRate,
                            bitrate: data.bitsPerSample
                        }
                    });

                    encoderWorker.postMessage({ cmd: 'encode', buf: Uint8ArrayToFloat32Array(data.samples) });
                    encoderWorker.postMessage({ cmd: 'finish' });
                    encoderWorker.onmessage = function(e) {
                        if (e.data.cmd == 'data') {
                            console.log("Done converting to Mp3");

                            /*var audio = new Audio();
                             audio.src = 'data:audio/mp3;base64,'+encode64(e.data.buf);
                             audio.play();*/

                            //console.log ("The Mp3 data " + e.data.buf);

                            var mp3Blob = new Blob([new Uint8Array(e.data.buf)], { type: 'audio/mp3' });

                            currCallback(mp3Blob, self);
                        }
                    };
                };

                fileReader.readAsArrayBuffer(blob);
            };

            source.connect(this.node);
            this.node.connect(this.context.destination);    //this should not be necessary
        };
    });
