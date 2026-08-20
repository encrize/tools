const imageInput = document.getElementById('image-input');
        const dropZone = document.getElementById('drop-zone');
        const preview = document.getElementById('image-preview');
        const container = document.getElementById('preview-container');
        const viewBtn = document.getElementById('view-btn');
        const outputBlock = document.getElementById('meta-output-block');
        const tableBody = document.querySelector('#metadata-table tbody');
        const warningBox = document.getElementById('no-exif-warning');
        const tableWrapper = document.getElementById('table-wrapper');
        const icon = dropZone.querySelector('.fa-search-plus');
        
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
                viewBtn.style.display = 'inline-block';
                outputBlock.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }

        function readMetadata() {
            if (!currentFile || !preview.src) return;

            tableBody.innerHTML = "";
            warningBox.style.display = 'none';
            tableWrapper.style.display = 'block';
            outputBlock.style.display = 'block';

            const tempImg = new Image();
            tempImg.src = preview.src;
            tempImg.onload = function() {
                EXIF.getData(tempImg, function() {
                    const allMetaData = EXIF.getAllTags(this);
                    
                    addMetaRow("File Name", currentFile.name);
                    addMetaRow("File Size", (currentFile.size / 1024).toFixed(2) + " KB");
                    addMetaRow("Dimensions", `${tempImg.naturalWidth} x ${tempImg.naturalHeight} px`);

                    if (Object.keys(allMetaData).length === 0) {
                        tableWrapper.style.display = 'none';
                        warningBox.style.display = 'block';
                        return;
                    }

                    const tagMap = {
                        "Make": "Camera Manufacturer",
                        "Model": "Camera Model",
                        "Software": "Software / Firmware",
                        "DateTime": "Capture Date & Time",
                        "ExposureTime": "Shutter Speed (Exposure)",
                        "FNumber": "Aperture (F-Number)",
                        "ISOSpeedRatings": "ISO Speed",
                        "FocalLength": "Focal Length",
                        "LensModel": "Lens Model",
                        "Orientation": "Orientation Tag"
                    };

                    let detailsFound = false;

                    for (let tag in tagMap) {
                        if (allMetaData[tag]) {
                            detailsFound = true;
                            let val = allMetaData[tag];
                            if (tag === "ExposureTime" && val < 1) {
                                val = `1/${Math.round(1/val)}`;
                            }
                            addMetaRow(tagMap[tag], val);
                        }
                    }

                    const lat = EXIF.getTag(this, "GPSLatitude");
                    const latRef = EXIF.getTag(this, "GPSLatitudeRef");
                    const lon = EXIF.getTag(this, "GPSLongitude");
                    const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

                    if (lat && lon && latRef && lonRef) {
                        detailsFound = true;
                        const latitude = convertDMSToDD(lat[0], lat[1], lat[2], latRef);
                        const longitude = convertDMSToDD(lon[0], lon[1], lon[2], lonRef);
                        addMetaRow("GPS Coordinates", `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, true);
                    }
                });
            };
        }

        function addMetaRow(label, value, isGPS = false) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="meta-label">${label}</td>
                <td class="meta-value ${isGPS ? 'highlight-gps' : ''}">${value}</td>
            `;
            tableBody.appendChild(tr);
        }

        function convertDMSToDD(degrees, minutes, seconds, direction) {
            let dd = degrees + minutes / 60 + seconds / (60 * 60);
            if (direction === "S" || direction === "W") dd = dd * -1;
            return dd;
        }

document.querySelector('[data-split-event="1"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {readMetadata()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
