function parse() {
    try { return { ok: true, data: JSON.parse(document.getElementById('input').value) }; }
    catch(e) { return { ok: false, error: e.message }; }
}
function format() {
    const r = parse();
    if (r.ok) {
        document.getElementById('output').value = JSON.stringify(r.data, null, 2);
        showStatus('Valid JSON ✓', true);
    } else showStatus('Error: ' + r.error, false);
}
function minify() {
    const r = parse();
    if (r.ok) {
        document.getElementById('output').value = JSON.stringify(r.data);
        showStatus('Minified ✓', true);
    } else showStatus('Error: ' + r.error, false);
}
function validate() {
    const r = parse();
    showStatus(r.ok ? 'Valid JSON ✓' : 'Invalid JSON: ' + r.error, r.ok);
}
function sortKeys() {
    const r = parse();
    if (!r.ok) { showStatus('Error: ' + r.error, false); return; }
    function sortObj(obj) {
        if (Array.isArray(obj)) return obj.map(sortObj);
        if (obj && typeof obj === 'object') {
            return Object.keys(obj).sort().reduce((acc, k) => { acc[k] = sortObj(obj[k]); return acc; }, {});
        }
        return obj;
    }
    document.getElementById('output').value = JSON.stringify(sortObj(r.data), null, 2);
    showStatus('Keys sorted ✓', true);
}
function showStatus(msg, ok) {
    const s = document.getElementById('statusBar');
    s.textContent = msg;
    s.style.display = 'block';
    s.style.background = ok ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.15)';
    s.style.border = ok ? '1px solid rgba(76,175,80,0.4)' : '1px solid rgba(244,67,54,0.4)';
    s.style.color = ok ? '#4caf50' : '#f44336';
}
function updateStatus() {
    const v = document.getElementById('input').value.trim();
    if (!v) { document.getElementById('statusBar').style.display='none'; document.getElementById('output').value=''; return; }
    const r = parse();
    showStatus(r.ok ? 'Valid JSON ✓' : 'Invalid JSON: ' + r.error, r.ok);
}
function copyOutput() {
    const val = document.getElementById('output').value;
    if (!val) { window.EncrizeLab.toast('Nothing to copy yet.', 'error'); return; }
    window.EncrizeLab.copy(val, 'JSON copied!');
}

document.querySelector('[data-split-event="1"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {document.getElementById('input').value='';updateStatus();}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="2"]').addEventListener('input', function(event) {
    const splitEventResult = (function(event) {updateStatus()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="3"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {copyOutput()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="4"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {format()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="5"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {minify()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="6"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {validate()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="7"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {sortKeys()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
