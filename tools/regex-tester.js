function test() {
    const pat = document.getElementById('pattern').value;
    const flags = document.getElementById('flags').value;
    const text = document.getElementById('testStr').value;
    const errEl = document.getElementById('regexError');
    const highlighted = document.getElementById('highlighted');
    const matchInfo = document.getElementById('matchInfo');
    const matchCount = document.getElementById('matchCount');
    const matchList = document.getElementById('matchList');

    if (!pat) {
        highlighted.innerHTML = escHtml(text);
        matchInfo.style.display = 'none';
        matchList.innerHTML = '';
        errEl.textContent = '';
        return;
    }

    let re;
    try {
        re = new RegExp(pat, flags.includes('g') ? flags : flags + 'g');
        errEl.textContent = '';
    } catch(e) {
        errEl.textContent = e.message;
        highlighted.innerHTML = escHtml(text);
        matchInfo.style.display = 'none';
        matchList.innerHTML = '';
        return;
    }

    const matches = [...text.matchAll(re)];
    matchCount.textContent = matches.length + ' match' + (matches.length !== 1 ? 'es' : '') + ' found';
    matchInfo.style.display = 'block';

    let result = '', lastIdx = 0;
    for (const m of matches) {
        result += escHtml(text.slice(lastIdx, m.index));
        result += '<mark>' + escHtml(m[0]) + '</mark>';
        lastIdx = m.index + m[0].length;
    }
    result += escHtml(text.slice(lastIdx));
    highlighted.innerHTML = result;

    matchList.innerHTML = matches.map((m, i) =>
        `<div class="match-item">[${i+1}] index ${m.index}: <strong>${escHtml(m[0])}</strong>${m.length > 1 ? ' | groups: ' + m.slice(1).map(g=>escHtml(String(g))).join(', ') : ''}</div>`
    ).join('');
}

function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

test();

document.querySelector('[data-split-event="1"]').addEventListener('input', function(event) {
    const splitEventResult = (function(event) {test()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="2"]').addEventListener('input', function(event) {
    const splitEventResult = (function(event) {test()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="3"]').addEventListener('input', function(event) {
    const splitEventResult = (function(event) {test()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
