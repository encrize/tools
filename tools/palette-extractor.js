const imageInput = document.getElementById('image-input');
        const dropZone = document.getElementById('drop-zone');
        const preview = document.getElementById('image-preview');
        const previewContainer = document.getElementById('preview-container');
        const paletteContainer = document.getElementById('palette-container');
        const icon = dropZone.querySelector('.fa-file-image');

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
            const reader = new FileReader();
            reader.onload = function(event) {
                preview.src = event.target.result;
                previewContainer.style.display = 'block';
                preview.onload = extractPalette;
            };
            reader.readAsDataURL(file);
        }

        function extractPalette() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = preview.naturalWidth;
            canvas.height = preview.naturalHeight;
            ctx.drawImage(preview, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            const colors = {};

            for (let i = 0; i < imageData.length; i += 40) {
                const r = imageData[i];
                const g = imageData[i+1];
                const b = imageData[i+2];
                
                const qR = Math.round(r / 10) * 10;
                const qG = Math.round(g / 10) * 10;
                const qB = Math.round(b / 10) * 10;
                const hex = rgbToHex(qR, qG, qB);
                colors[hex] = (colors[hex] || 0) + 1;
            }

            const sortedColors = Object.keys(colors).sort((a, b) => colors[b] - colors[a]).slice(0, 6);
            renderPalette(sortedColors);
        }

        function rgbToHex(r, g, b) {
            const check = (val) => Math.min(255, Math.max(0, val));
            return "#" + ((1 << 24) + (check(r) << 16) + (check(g) << 8) + check(b)).toString(16).slice(1).toUpperCase();
        }

        function renderPalette(colors) {
            paletteContainer.innerHTML = '';
            colors.forEach(color => {
                const card = document.createElement('div');
                card.className = 'tool-card';
                card.style.cursor = 'pointer';
                card.onclick = () => {
                    window.EncrizeLab.copy(color, `Copied ${color}`);
                };
                card.title = `Copy ${color}`;
                card.innerHTML = `
                    <div style="background-color: ${color}; height: 100px; border-radius: 8px; margin-bottom: 10px; border: 1px solid var(--clr-border);"></div>
                    <p style="font-family: monospace; font-weight: bold;">${color}</p>
                `;
                paletteContainer.appendChild(card);
            });
        }
