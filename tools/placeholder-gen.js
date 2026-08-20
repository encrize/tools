const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');

    function drawPlaceholder() {
        const w = parseInt(widthInput.value) || 800;
        const h = parseInt(heightInput.value) || 600;
        
        canvas.width = w;
        canvas.height = h;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#000000';
        ctx.font = `${Math.floor(h / 10)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${w} x ${h}`, w / 2, h / 2);
    }

    function downloadPlaceholder() {
        const link = document.createElement('a');
        link.download = `placeholder_${widthInput.value}x${heightInput.value}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }

    drawPlaceholder();

    widthInput.addEventListener('input', drawPlaceholder);
    heightInput.addEventListener('input', drawPlaceholder);

document.querySelector('[data-split-event="1"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {drawPlaceholder()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="2"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {downloadPlaceholder()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
