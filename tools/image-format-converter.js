const imageInput = document.getElementById('image-input');
        const dropZone = document.getElementById('drop-zone');
        const preview = document.getElementById('image-preview');
        const container = document.getElementById('preview-container');
        const convertBtn = document.getElementById('convert-btn');
        const qualityRange = document.getElementById('quality-range');
        const qualityVal = document.getElementById('quality-val');
        const formatSelect = document.getElementById('format-select');
        const qualityBox = document.getElementById('quality-box');
        const sizeInfo = document.getElementById('size-info');
        const icon = dropZone.querySelector('.fa-file-image');
        
        let sourceImg = new Image();
        let originalSize = 0;

        function updateLiveSize() {
            if (!sourceImg.src || !sourceImg.complete) return;

            const canvas = document.createElement('canvas');
            const format = formatSelect.value;
            
            if (format === 'image/x-icon') {
                canvas.width = 32;
                canvas.height = 32;
            } else {
                canvas.width = sourceImg.width;
                canvas.height = sourceImg.height;
            }
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(sourceImg, 0, 0, canvas.width, canvas.height);
            
            const quality = qualityRange.value / 100;
            const dataUrl = canvas.toDataURL(format === 'image/x-icon' ? 'image/png' : format, quality);
            
            const head = 'data:' + (format === 'image/x-icon' ? 'image/png' : format) + ';base64,';
            const estimatedSize = Math.round((dataUrl.length - head.length) * 3 / 4);
            
            sizeInfo.style.display = 'block';
            sizeInfo.innerHTML = `<strong>Estimated size:</strong> Original: ${formatSize(originalSize)} &rarr; New: ~${formatSize(estimatedSize)}`;
        }

        formatSelect.addEventListener('change', () => {
            if (formatSelect.value === 'image/png' || formatSelect.value === 'image/x-icon') {
                qualityBox.style.opacity = '0.4';
                qualityRange.disabled = true;
                qualityVal.innerText = '—';
            } else {
                qualityBox.style.opacity = '1';
                qualityRange.disabled = false;
                qualityVal.innerText = qualityRange.value + '%';
            }
            updateLiveSize();
        });

        qualityRange.addEventListener('input', () => {
            qualityVal.innerText = qualityRange.value + '%';
            updateLiveSize();
        });

        dropZone.addEventListener('click', () => imageInput.click());

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
            }, false);
        });

        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                imageInput.files = files;
                handleFile(files[0]);
            }
        });

        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) handleFile(file);
        });

        function handleFile(file) {
            originalSize = file.size;
            const reader = new FileReader();
            reader.onload = function(event) {
                sourceImg.onload = function() {
                    container.style.display = 'block';
                    convertBtn.style.display = 'inline-block';
                    updateLiveSize();
                };
                sourceImg.src = event.target.result;
                preview.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }

        function convertImage() {
            if (!sourceImg.src) return;
            
            const canvas = document.createElement('canvas');
            const format = formatSelect.value;
            
            if (format === 'image/x-icon') {
                canvas.width = 32;
                canvas.height = 32;
            } else {
                canvas.width = sourceImg.width;
                canvas.height = sourceImg.height;
            }
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(sourceImg, 0, 0, canvas.width, canvas.height);
            
            const quality = qualityRange.value / 100;
            const ext = format === 'image/x-icon' ? 'ico' : format.split('/')[1];
            
            const dataUrl = canvas.toDataURL(format === 'image/x-icon' ? 'image/png' : format, quality);
            
            const link = document.createElement('a');
            link.download = `converted_${Date.now()}.${ext}`;
            link.href = dataUrl;
            link.click();
        }

        function formatSize(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
            return (bytes / 1048576).toFixed(2) + ' MB';
        }

document.querySelector('[data-split-event="1"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {convertImage()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
