const presets = ['#e8633a','#f44336','#e91e63','#9c27b0','#673ab7','#3f51b5','#2196f3','#03a9f4','#00bcd4','#009688','#4caf50','#8bc34a','#cddc39','#ffeb3b','#ffc107','#ff9800','#ff5722','#795548','#607d8b','#ffffff','#aaaaaa','#333333','#000000'];

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return {r,g,b};
}
function rgbToHsl(r,g,b) {
    r/=255; g/=255; b/=255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b);
    let h,s,l=(max+min)/2;
    if(max===min){h=s=0;}
    else{const d=max-min;s=l>.5?d/(2-max-min):d/(max+min);
    switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break;}}
    return {h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};
}
function shadeHex(hex, pct) {
    let {r,g,b}=hexToRgb(hex);
    r=Math.min(255,Math.round(r+pct*2.55));
    g=Math.min(255,Math.round(g+pct*2.55));
    b=Math.min(255,Math.round(b+pct*2.55));
    return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
}
function update(hex) {
    document.getElementById('preview').style.background = hex;
    document.getElementById('colorPicker').value = hex;
    document.getElementById('hexVal').value = hex.toUpperCase();
    const {r,g,b}=hexToRgb(hex);
    document.getElementById('rgbVal').value = `rgb(${r}, ${g}, ${b})`;
    const {h,s,l}=rgbToHsl(r,g,b);
    document.getElementById('hslVal').value = `hsl(${h}, ${s}%, ${l}%)`;
    document.getElementById('cssVal').value = `--color: ${hex.toUpperCase()};`;
    const shadesEl = document.getElementById('shades');
    shadesEl.innerHTML = '';
    for(let p=-50;p<=50;p+=10) {
        const sh = shadeHex(hex, p);
        const d = document.createElement('div');
        d.className = 'shade';
        d.style.background = sh;
        d.title = sh;
        d.onclick = () => update(sh);
        shadesEl.appendChild(d);
    }
}
function updateFromPicker() { update(document.getElementById('colorPicker').value); }
function updateFromHex() {
    let v = document.getElementById('hexVal').value.trim();
    if (!v.startsWith('#')) v = '#' + v;
    if (/^#[0-9a-fA-F]{6}$/.test(v)) update(v);
}
function copyVal(id) {
    const val = document.getElementById(id).value;
    if (!val) return;
    window.EncrizeLab.copy(val, 'Copied ' + val);
}

const sw = document.getElementById('swatches');
presets.forEach(c => {
    const d = document.createElement('div');
    d.className = 'swatch';
    d.style.background = c;
    d.title = c;
    d.onclick = () => update(c);
    sw.appendChild(d);
});

update('#e8633a');

document.querySelector('[data-split-event="1"]').addEventListener('input', function(event) {
    const splitEventResult = (function(event) {updateFromPicker()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="2"]').addEventListener('input', function(event) {
    const splitEventResult = (function(event) {updateFromHex()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="3"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {copyVal('hexVal')}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="4"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {copyVal('rgbVal')}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="5"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {copyVal('hslVal')}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="6"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {copyVal('cssVal')}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
