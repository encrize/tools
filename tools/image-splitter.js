const dropZone = document.getElementById('drop-zone');
        const imageInput = document.getElementById('image-input');
        const previewGrid = document.getElementById('preview-grid');
        const splitBtn = document.getElementById('split-btn');
        let sourceImg = new Image();
		
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
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                sourceImg.src = event.target.result;
                sourceImg.onload = () => {
                    splitBtn.style.display = 'inline-block';
                    updatePreview();
                };
            };
            reader.readAsDataURL(file);
        });

        function updatePreview() {
            if (!sourceImg.src) return;
            
            let rows = parseInt(document.getElementById('rows').value) || 1;
            let cols = parseInt(document.getElementById('cols').value) || 1;
            
            if (rows < 1) rows = 1; if (rows > 10) rows = 10;
            if (cols < 1) cols = 1; if (cols > 10) cols = 10;

            previewGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            previewGrid.innerHTML = '';
            
            const partWidth = sourceImg.width / cols;
            const partHeight = sourceImg.height / rows;
            
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const canvas = document.createElement('canvas');
                    canvas.width = 150;
                    canvas.height = 150;
                    const ctx = canvas.getContext('2d');
                    
                    ctx.drawImage(sourceImg, c * partWidth, r * partHeight, partWidth, partHeight, 0, 0, 150, 150);
                    
                    const div = document.createElement('div');
                    div.style.width = '100%';
                    div.style.aspectRatio = '1 / 1';
                    div.style.backgroundImage = `url(${canvas.toDataURL()})`;
                    div.style.backgroundSize = 'cover';
                    div.style.backgroundPosition = 'center';
                    div.style.border = '2px solid #111';
                    previewGrid.appendChild(div);
                }
            }
        }

        async function splitImage() {
            if (!sourceImg.src) return;

            const rows = parseInt(document.getElementById('rows').value) || 1;
            const cols = parseInt(document.getElementById('cols').value) || 1;
            const zip = new JSZip();
            
            const partWidth = Math.floor(sourceImg.width / cols);
            const partHeight = Math.floor(sourceImg.height / rows);
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = partWidth;
            canvas.height = partHeight;

            const originalText = splitBtn.innerText;
            splitBtn.innerText = "Processing...";
            splitBtn.disabled = true;

            try {
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        ctx.clearRect(0, 0, partWidth, partHeight);
                        ctx.drawImage(sourceImg, c * partWidth, r * partHeight, partWidth, partHeight, 0, 0, partWidth, partHeight);
                        
                        const dataUrl = canvas.toDataURL('image/png');
                        const base64Data = dataUrl.split(',')[1];
                        
                        zip.file(`grid_row${r+1}_col${c+1}.png`, base64Data, {base64: true});
                    }
                }

                const content = await zip.generateAsync({type: "blob"});
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = "sliced_image_grid.zip";
                link.click();
            } catch (err) {
                window.EncrizeLab.toast("Error generating archive: " + err.message, "error");
            } finally {
                splitBtn.innerText = originalText;
                splitBtn.disabled = false;
            }
        }

        document.getElementById('rows').addEventListener('input', updatePreview);
        document.getElementById('cols').addEventListener('input', updatePreview);

document.querySelector('[data-split-event="1"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {splitImage()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
