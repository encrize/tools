async function generateHashes() {
    const text = document.getElementById('inputText').value;
    if (!text) return;
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    async function hash(algo) {
        const buf = await crypto.subtle.digest(algo, data);
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
    }

    function md5(inputStr) {
        function safeAdd(x,y){var lsw=(x&0xFFFF)+(y&0xFFFF);var msw=(x>>16)+(y>>16)+(lsw>>16);return(msw<<16)|(lsw&0xFFFF);}
        function bitRotateLeft(num,cnt){return(num<<cnt)|(num>>>(32-cnt));}
        function md5cmn(q,a,b,x,s,t){return safeAdd(bitRotateLeft(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b);}
        function md5ff(a,b,c,d,x,s,t){return md5cmn((b&c)|((~b)&d),a,b,x,s,t);}
        function md5gg(a,b,c,d,x,s,t){return md5cmn((b&d)|(c&(~d)),a,b,x,s,t);}
        function md5hh(a,b,c,d,x,s,t){return md5cmn(b^c^d,a,b,x,s,t);}
        function md5ii(a,b,c,d,x,s,t){return md5cmn(c^(b|(~d)),a,b,x,s,t);}
        var str=unescape(encodeURIComponent(inputStr));
        var n=str.length,state=[1732584193,-271733879,-1732584194,271733878],i;
        for(i=64;i<=n;i+=64){processBlock(str.substring(i-64,i));}
        str=str.substring(i-64);
        var tail=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        for(i=0;i<str.length;i++){tail[i>>2]|=str.charCodeAt(i)<<((i%4)<<3);}
        tail[i>>2]|=0x80<<((i%4)<<3);
        if(i>55){processBlock(tail);tail=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];}
        tail[14]=n*8;
        processBlock(tail);
        function processBlock(str){
            var X=typeof str==='string'?[...Array(16)].map((_,i)=>str.charCodeAt(i*4)|(str.charCodeAt(i*4+1)<<8)|(str.charCodeAt(i*4+2)<<16)|(str.charCodeAt(i*4+3)<<24)):str;
            var a=state[0],b=state[1],c=state[2],d=state[3];
            a=md5ff(a,b,c,d,X[0],7,-680876936);d=md5ff(d,a,b,c,X[1],12,-389564586);c=md5ff(c,d,a,b,X[2],17,606105819);b=md5ff(b,c,d,a,X[3],22,-1044525330);
            a=md5ff(a,b,c,d,X[4],7,-176418897);d=md5ff(d,a,b,c,X[5],12,1200080426);c=md5ff(c,d,a,b,X[6],17,-1473231341);b=md5ff(b,c,d,a,X[7],22,-45705983);
            a=md5ff(a,b,c,d,X[8],7,1770035416);d=md5ff(d,a,b,c,X[9],12,-1958414417);c=md5ff(c,d,a,b,X[10],17,-42063);b=md5ff(b,c,d,a,X[11],22,-1990404162);
            a=md5ff(a,b,c,d,X[12],7,1804603682);d=md5ff(d,a,b,c,X[13],12,-40341101);c=md5ff(c,d,a,b,X[14],17,-1502002290);b=md5ff(b,c,d,a,X[15],22,1236535329);
            a=md5gg(a,b,c,d,X[1],5,-165796510);d=md5gg(d,a,b,c,X[6],9,-1069501632);c=md5gg(c,d,a,b,X[11],14,643717713);b=md5gg(b,c,d,a,X[0],20,-373897302);
            a=md5gg(a,b,c,d,X[5],5,-701558691);d=md5gg(d,a,b,c,X[10],9,38016083);c=md5gg(c,d,a,b,X[15],14,-660478335);b=md5gg(b,c,d,a,X[4],20,-405537848);
            a=md5gg(a,b,c,d,X[9],5,568446438);d=md5gg(d,a,b,c,X[14],9,-1019803690);c=md5gg(c,d,a,b,X[3],14,-187363961);b=md5gg(b,c,d,a,X[8],20,1163531501);
            a=md5gg(a,b,c,d,X[13],5,-1444681467);d=md5gg(d,a,b,c,X[2],9,-51403784);c=md5gg(c,d,a,b,X[7],14,1735328473);b=md5gg(b,c,d,a,X[12],20,-1926607734);
            a=md5hh(a,b,c,d,X[5],4,-378558);d=md5hh(d,a,b,c,X[8],11,-2022574463);c=md5hh(c,d,a,b,X[11],16,1839030562);b=md5hh(b,c,d,a,X[14],23,-35309556);
            a=md5hh(a,b,c,d,X[1],4,-1530992060);d=md5hh(d,a,b,c,X[4],11,1272893353);c=md5hh(c,d,a,b,X[7],16,-155497632);b=md5hh(b,c,d,a,X[10],23,-1094730640);
            a=md5hh(a,b,c,d,X[13],4,681279174);d=md5hh(d,a,b,c,X[0],11,-358537222);c=md5hh(c,d,a,b,X[3],16,-722521979);b=md5hh(b,c,d,a,X[6],23,76029189);
            a=md5hh(a,b,c,d,X[9],4,-640364487);d=md5hh(d,a,b,c,X[12],11,-421815835);c=md5hh(c,d,a,b,X[15],16,530742520);b=md5hh(b,c,d,a,X[2],23,-995338651);
            a=md5ii(a,b,c,d,X[0],6,-198630844);d=md5ii(d,a,b,c,X[7],10,1126891415);c=md5ii(c,d,a,b,X[14],15,-1416354905);b=md5ii(b,c,d,a,X[5],21,-57434055);
            a=md5ii(a,b,c,d,X[12],6,1700485571);d=md5ii(d,a,b,c,X[3],10,-1894986606);c=md5ii(c,d,a,b,X[10],15,-1051523);b=md5ii(b,c,d,a,X[1],21,-2054922799);
            a=md5ii(a,b,c,d,X[8],6,1873313359);d=md5ii(d,a,b,c,X[15],10,-30611744);c=md5ii(c,d,a,b,X[6],15,-1560198380);b=md5ii(b,c,d,a,X[13],21,1309151649);
            a=md5ii(a,b,c,d,X[4],6,-145523070);d=md5ii(d,a,b,c,X[11],10,-1120210379);c=md5ii(c,d,a,b,X[2],15,718787259);b=md5ii(b,c,d,a,X[9],21,-343485551);
            state[0]=safeAdd(a,state[0]);state[1]=safeAdd(b,state[1]);state[2]=safeAdd(c,state[2]);state[3]=safeAdd(d,state[3]);
        }
        return state.map(n=>{var s='';for(var j=0;j<4;j++){s+=('0'+((n>>>(j*8))&0xFF).toString(16)).slice(-2);}return s;}).join('');
    }

    document.getElementById('md5').textContent = md5(text);
    document.getElementById('sha1').textContent = await hash('SHA-1');
    document.getElementById('sha256').textContent = await hash('SHA-256');
    document.getElementById('sha512').textContent = await hash('SHA-512');
    document.getElementById('results').style.display = 'block';
}

function copyHash(id) {
    const val = document.getElementById(id).textContent;
    if (!val || val === '—') { window.EncrizeLab.toast('Generate a hash first.', 'error'); return; }
    window.EncrizeLab.copy(val, id.toUpperCase() + ' hash copied!');
}

function clearAll() {
    document.getElementById('inputText').value = '';
    document.getElementById('results').style.display = 'none';
}

document.getElementById('inputText').addEventListener('input', function() {
    if (this.value) generateHashes();
    else document.getElementById('results').style.display = 'none';
});

document.querySelector('[data-split-event="1"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {generateHashes()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="2"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {clearAll()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="3"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {copyHash('md5')}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="4"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {copyHash('sha1')}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="5"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {copyHash('sha256')}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="6"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {copyHash('sha512')}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
