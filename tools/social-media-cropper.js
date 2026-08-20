let cropper;
    const imageInput = document.getElementById('image-input');
    const dropZone = document.getElementById('drop-zone');
    const imageToCrop = document.getElementById('image-to-crop');
    const container = document.getElementById('cropper-container');
    const actions = document.getElementById('actions');
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
            if (cropper) {
                cropper.destroy();
            }
            
            imageToCrop.src = event.target.result;
            container.style.display = 'block';
            actions.style.display = 'flex';
            
            cropper = new Cropper(imageToCrop, {
                aspectRatio: 1,
                viewMode: 1,
                autoCropArea: 0.8,
                responsive: true,
                background: false
            });
        };
        reader.readAsDataURL(file);
    }

    function cropImage() {
        if (!cropper) return;
        
        const canvas = cropper.getCroppedCanvas({
            width: 1080,
            height: 1080,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });

        const link = document.createElement('a');
        link.download = 'cropped_social_' + Date.now() + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    function rotateLeft() { if (cropper) cropper.rotate(-90); }
    function rotateRight() { if (cropper) cropper.rotate(90); }
    function resetCropper() { if (cropper) cropper.reset(); }

document.querySelector('[data-split-event="1"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {cropImage()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="2"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {rotateLeft()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="3"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {rotateRight()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="4"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {resetCropper()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
