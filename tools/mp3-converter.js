const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('media-input');
        const fileInfo = document.getElementById('file-info');
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');
        const qualBlock = document.getElementById('quality-block');
        const convertBtn = document.getElementById('convert-btn');
        const progressBlk = document.getElementById('progress-block');
        const progressBar = document.getElementById('progress-bar');
        const progressLbl = document.getElementById('progress-label');
        const resultBlock = document.getElementById('result-block');
        const resultText = document.getElementById('result-text');
        const dlLink = document.getElementById('download-link');
        const errorBlock = document.getElementById('error-block');
        const errorText = document.getElementById('error-text');

        let currentFile = null;
        let objectURL = null;

        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
        dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('dragover'); });
        dropZone.addEventListener('drop', e => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            handleFile(e.dataTransfer.files[0]);
        });
        fileInput.addEventListener('change', e => handleFile(e.target.files[0]));

        function handleFile(file) {
            if (!file) return;
            const ok = file.type.startsWith('video/') || /\.(mp4|m4v|mov)$/i.test(file.name);
            if (!ok) { showError('Please select a valid video file (.mp4, .m4v, .mov)'); return; }

            currentFile = file;
            fileName.textContent = file.name;
            fileSize.textContent = formatSize(file.size);
            fileInfo.style.display = 'block';
            qualBlock.style.display = 'block';
            convertBtn.style.display = 'block';
            errorBlock.style.display = 'none';
            resultBlock.style.display = 'none';
        }

        function formatSize(bytes) {
            if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
            return (bytes/1024/1024).toFixed(1) + ' MB';
        }

        function showError(msg) {
            errorText.textContent = msg;
            errorBlock.style.display = 'block';
            progressBlk.style.display = 'none';
        }

        function resetUI() {
            currentFile = null;
            fileInput.value = '';
            [fileInfo, qualBlock, convertBtn, progressBlk, resultBlock, errorBlock].forEach(el => el.style.display = 'none');
            if (objectURL) { URL.revokeObjectURL(objectURL); objectURL = null; }
        }

        async function startConvert() {
            if (!currentFile) return;

            convertBtn.style.display = 'none';
            progressBlk.style.display = 'block';
            resultBlock.style.display = 'none';
            errorBlock.style.display = 'none';
            progressBar.style.width = '0%';
            progressLbl.textContent = 'Reading file...';

            try {
                const bitrate = parseInt(document.querySelector('input[name="quality"]:checked').value);
                const arrayBuf = await currentFile.arrayBuffer();
                progressBar.style.width = '15%';
                progressLbl.textContent = 'Decoding audio via Web Audio API...';

                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const audioBuffer = await audioCtx.decodeAudioData(arrayBuf);
                await audioCtx.close();

                progressBar.style.width = '40%';
                progressLbl.textContent = 'Encoding to MP3...';

                const mp3Blob = await encodeMP3(audioBuffer, bitrate);

                progressBar.style.width = '100%';
                progressLbl.textContent = 'Done!';

                if (objectURL) URL.revokeObjectURL(objectURL);
                objectURL = URL.createObjectURL(mp3Blob);
                const outName = currentFile.name.replace(/\.[^.]+$/, '') + '.mp3';
                dlLink.href = objectURL;
                dlLink.download = outName;

                const sizeMB = (mp3Blob.size / 1024 / 1024).toFixed(2);
                resultText.textContent = `${outName} (${sizeMB} MB, ${bitrate} kbps)`;

                progressBlk.style.display = 'none';
                resultBlock.style.display = 'block';

            } catch (err) {
                console.error(err);
                const hint = err.message && err.message.includes('decode')
                    ? ' (Video may be DRM protected or codec not supported)'
                    : '';
                showError('Error: ' + err.message + hint);
                convertBtn.style.display = 'block';
            }
        }

        function encodeMP3(audioBuffer, kbps) {
            return new Promise((resolve, reject) => {
                try {
                    const channels = Math.min(audioBuffer.numberOfChannels, 2);
                    const sampleRate = audioBuffer.sampleRate;
                    const samples = audioBuffer.length;

                    const mp3enc = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
                    const chunks = [];

                    const left = float32ToInt16(audioBuffer.getChannelData(0));
                    const right = channels > 1 ? float32ToInt16(audioBuffer.getChannelData(1)) : left;

                    const blockSize = 1152;
                    const total = Math.ceil(samples / blockSize);

                    for (let i = 0; i < total; i++) {
                        const start = i * blockSize;
                        const end = Math.min(start + blockSize, samples);
                        const lChunk = left.subarray(start, end);
                        const rChunk = right.subarray(start, end);

                        const encoded = channels > 1 ? mp3enc.encodeBuffer(lChunk, rChunk) : mp3enc.encodeBuffer(lChunk);
                        if (encoded.length > 0) chunks.push(new Int8Array(encoded));

                        if (i % Math.max(1, Math.floor(total / 20)) === 0) {
                            const pct = 40 + Math.round((i / total) * 55);
                            progressBar.style.width = pct + '%';
                            progressLbl.textContent = `Encoding MP3... ${Math.round((i/total)*100)}%`;
                        }
                    }

                    const flushed = mp3enc.flush();
                    if (flushed.length > 0) chunks.push(new Int8Array(flushed));
                    resolve(new Blob(chunks, { type: 'audio/mpeg' }));
                } catch (e) {
                    reject(e);
                }
            });
        }

        function float32ToInt16(float32arr) {
            const int16 = new Int16Array(float32arr.length);
            for (let i = 0; i < float32arr.length; i++) {
                const s = Math.max(-1, Math.min(1, float32arr[i]));
                int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            return int16;
        }

document.querySelector('[data-split-event="1"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {startConvert()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="2"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {resetUI()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
