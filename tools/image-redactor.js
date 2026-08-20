let cropper;
    let scaleX = 1;
    let scaleY = 1;
    
    const imageInput = document.getElementById('image-input');
    const dropZone = document.getElementById('drop-zone');
    const imageToEdit = document.getElementById('image-to-edit');
    const workspace = document.getElementById('editor-workspace');
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
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            if (cropper) cropper.destroy();
            
            imageToEdit.src = event.target.result;
            workspace.style.display = 'grid';
            
            scaleX = 1; scaleY = 1;
            document.getElementById('filter-brightness').value = 100;
            document.getElementById('filter-contrast').value = 100;
            document.getElementById('filter-saturate').value = 100;
            document.getElementById('filter-sharp').value = 0;
            
            document.querySelector('input[name="format"][value="image/png"]').checked = true;
            toggleQualityRow();

            cropper = new Cropper(imageToEdit, {
                aspectRatio: NaN,
                viewMode: 1,
                autoCropArea: 1,
                responsive: true,
                background: false,
                ready: function () { applyFiltersPreview(); }
            });
        };
        reader.readAsDataURL(file);
    }

    function rotateLeft() { if (cropper) cropper.rotate(-90); }
    function rotateRight() { if (cropper) cropper.rotate(90); }
    function flipX() { if (cropper) { scaleX *= -1; cropper.scaleX(scaleX); } }
    function flipY() { if (cropper) { scaleY *= -1; cropper.scaleY(scaleY); } }
    function changeAspect(ratio) { if (cropper) cropper.setAspectRatio(ratio); }

    function applyFiltersPreview() {
        const b = document.getElementById('filter-brightness').value;
        const c = document.getElementById('filter-contrast').value;
        const s = document.getElementById('filter-saturate').value;
        const sh = document.getElementById('filter-sharp').value;

        document.getElementById('val-bright').innerText = b + '%';
        document.getElementById('val-contrast').innerText = c + '%';
        document.getElementById('val-saturate').innerText = s + '%';
        document.getElementById('val-sharp').innerText = sh + '%';

        const matrixInput = document.getElementById('sharpen-matrix');
        if (matrixInput) {
            const a = -(sh / 100);
            const center = 1 + (-a * 4);
            matrixInput.setAttribute('kernelMatrix', `0 ${a} 0 ${a} ${center} ${a} 0 ${a} 0`);
        }

        const container = document.querySelector('.cropper-container');
        if (container) {
            container.style.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%) ${sh > 0 ? 'url(#svg-sharpen)' : ''}`;
        }
    }

    function toggleQualityRow() {
        const format = document.querySelector('input[name="format"]:checked').value;
        const input = document.getElementById('export-quality');
        input.disabled = format !== 'image/jpeg';
        document.getElementById('val-quality').innerText = format === 'image/jpeg' ? input.value + '%' : "Max (Lossless)";
    }

    function updateQualityLabel(val) { document.getElementById('val-quality').innerText = val + '%'; }

    function resetEditor() {
        if (!cropper) return;
        cropper.reset();
        scaleX = 1; scaleY = 1;
        document.getElementById('filter-brightness').value = 100;
        document.getElementById('filter-contrast').value = 100;
        document.getElementById('filter-saturate').value = 100;
        document.getElementById('filter-sharp').value = 0;
        applyFiltersPreview();
    }

    function sharpenCanvas(ctx, width, height, mix) {
        if (mix === 0) return;
        const weights = [0, -mix, 0, -mix, 1 + mix * 4, -mix, 0, -mix, 0];
        const src = ctx.getImageData(0, 0, width, height);
        const output = ctx.createImageData(width, height);
        ctx.putImageData(output, 0, 0);
    }

    function saveImage() {
        if (!cropper) return;
        const canvas = cropper.getCroppedCanvas({ imageSmoothingEnabled: true, imageSmoothingQuality: 'high' });
        const format = document.querySelector('input[name="format"]:checked').value;
        const link = document.createElement('a');
        link.download = `edited_image_${Date.now()}.${format === 'image/jpeg' ? 'jpg' : 'png'}`;
        link.href = canvas.toDataURL(format, format === 'image/jpeg' ? document.getElementById('export-quality').value / 100 : undefined);
        link.click();
    }

document.querySelector('[data-split-event="1"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {rotateLeft()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="2"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {rotateRight()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="3"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {flipX()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="4"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {flipY()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="5"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {resetEditor()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="6"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {changeAspect(NaN)}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="7"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {changeAspect(1)}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="8"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {changeAspect(4/3)}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="9"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {changeAspect(16/9)}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="10"]').addEventListener('input', function(event) {
    const splitEventResult = (function(event) {applyFiltersPreview()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="11"]').addEventListener('input', function(event) {
    const splitEventResult = (function(event) {applyFiltersPreview()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="12"]').addEventListener('input', function(event) {
    const splitEventResult = (function(event) {applyFiltersPreview()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="13"]').addEventListener('input', function(event) {
    const splitEventResult = (function(event) {applyFiltersPreview()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="14"]').addEventListener('change', function(event) {
    const splitEventResult = (function(event) {toggleQualityRow()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="15"]').addEventListener('change', function(event) {
    const splitEventResult = (function(event) {toggleQualityRow()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="16"]').addEventListener('input', function(event) {
    const splitEventResult = (function(event) {updateQualityLabel(this.value)}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="17"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {saveImage()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
