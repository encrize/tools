const imageInput = document.getElementById('image-input');
        const dropZone = document.getElementById('drop-zone');
        const preview = document.getElementById('image-preview');
        const container = document.getElementById('preview-container');
        const cleanBtn = document.getElementById('clean-btn');
        const status = document.getElementById('status');
        const icon = dropZone.querySelector('.fa-shield-halved');
        
        let currentFile = null;

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
            if (!file || !file.type.match('image.*')) return;

            currentFile = file;
            const reader = new FileReader();
            reader.onload = function(event) {
                preview.src = event.target.result;
                container.style.display = 'block';
                cleanBtn.style.display = 'inline-block';
                status.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }

        function cleanEXIF() {
            if (!currentFile || !preview.src) return;
            
            const img = new Image();
            img.src = preview.src;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                const type = currentFile.type || 'image/jpeg';
                
                canvas.toBlob((blob) => {
                    const link = document.createElement('a');
                    link.download = 'cleaned_' + (currentFile.name || 'image.jpg');
                    link.href = URL.createObjectURL(blob);
                    link.click();
                    
                    status.style.display = 'block';
                    status.innerHTML = `<strong>Success:</strong> Metadata (EXIF) successfully removed. File saved as anonymous!`;
                }, type, 0.85);
            };
        }

document.querySelector('[data-split-event="1"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {cleanEXIF()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
