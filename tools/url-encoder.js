let mode = 'component';
function setMode(m) {
    mode = m;
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + m).classList.add('active');
    document.getElementById('output').value = '';
}
function encode() {
    const v = document.getElementById('input').value;
    try {
        let r;
        if (mode === 'component') r = encodeURIComponent(v);
        else if (mode === 'full') r = encodeURI(v);
        else r = btoa(unescape(encodeURIComponent(v)));
        document.getElementById('output').value = r;
    } catch(e) { document.getElementById('output').value = 'Error: ' + e.message; }
}
function decode() {
    const v = document.getElementById('input').value;
    try {
        let r;
        if (mode === 'component') r = decodeURIComponent(v);
        else if (mode === 'full') r = decodeURI(v);
        else r = decodeURIComponent(escape(atob(v)));
        document.getElementById('output').value = r;
    } catch(e) { document.getElementById('output').value = 'Error: ' + e.message; }
}
function swap() {
    const o = document.getElementById('output').value;
    const i = document.getElementById('input').value;
    document.getElementById('input').value = o;
    document.getElementById('output').value = i;
}
function convert() {
    const v = document.getElementById('input').value;
    if (!v) { document.getElementById('output').value = ''; return; }
    encode();
}
function copyOutput() {
    const v = document.getElementById('output').value;
    if (!v) { window.EncrizeLab.toast('Nothing to copy yet.', 'error'); return; }
    window.EncrizeLab.copy(v, 'Output copied!');
}

document.querySelector('[data-split-event="1"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {setMode('component')}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="2"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {setMode('full')}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="3"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {setMode('base64')}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="4"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {document.getElementById('input').value='';convert()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="5"]').addEventListener('input', function(event) {
    const splitEventResult = (function(event) {convert()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="6"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {encode()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="7"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {decode()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="8"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {swap()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="9"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {copyOutput()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
