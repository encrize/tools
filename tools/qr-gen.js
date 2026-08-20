const qrInput = document.getElementById('qr-input');
        const qrContainer = document.getElementById('qrcode');
        
        const qrcode = new QRCode(qrContainer, {
            width: 256,
            height: 256,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });

        function generateQR() {
            const text = qrInput.value.trim();
            if (text) {
                qrcode.makeCode(text);
            } else {
                window.EncrizeLab.toast("Please enter text or a URL.", "error");
            }
        }

        function downloadQR() {
            const canvas = qrContainer.querySelector('canvas');
            if (canvas) {
                const tempCanvas = document.createElement('canvas');
                const ctx = tempCanvas.getContext('2d');
                const padding = 15;
                
                tempCanvas.width = canvas.width + padding * 2;
                tempCanvas.height = canvas.height + padding * 2;
                
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                
                ctx.drawImage(canvas, padding, padding);
                
                const link = document.createElement('a');
                link.download = 'qrcode.png';
                link.href = tempCanvas.toDataURL('image/png');
                link.click();
            } else {
                window.EncrizeLab.toast("Generate a QR code first.", "error");
            }
        }

        qrInput.value = "https://google.com";
        generateQR();

document.querySelector('[data-split-event="1"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {generateQR()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="2"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {downloadQR()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
