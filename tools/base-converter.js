const inputText = document.getElementById('input-text');
        const resultArea = document.getElementById('result');

        const ALPHABETS = {
            base32: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
            base58: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
            base62: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            base45: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./: "
        };

        const b64 = {
            encode: (str) => btoa(unescape(encodeURIComponent(str))),
            decode: (str) => decodeURIComponent(escape(atob(str)))
        };

        function baseBignumConvert(bytes, alphabet, encode) {
            const base = BigInt(alphabet.length);
            if (encode) {
                let num = 0n;
                for (let b of bytes) {
                    num = (num << 8n) + BigInt(b);
                }
                let result = '';
                while (num > 0n) {
                    result = alphabet[Number(num % base)] + result;
                    num = num / base;
                }
                for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
                    result = alphabet[0] + result;
                }
                return result || alphabet[0];
            } else {
                let leadingZeros = 0;
                while (leadingZeros < bytes.length && bytes[leadingZeros] === alphabet[0]) {
                    leadingZeros++;
                }
                let num = 0n;
                for (let i = leadingZeros; i < bytes.length; i++) {
                    const idx = alphabet.indexOf(bytes[i]);
                    if (idx === -1) throw new Error(`Invalid character: ${bytes[i]}`);
                    num = num * base + BigInt(idx);
                }
                let hex = num.toString(16);
                if (hex.length % 2 !== 0) hex = '0' + hex;
                let resBytes = hex === '0' ? [] : hex.match(/.{1,2}/g).map(b => parseInt(b, 16));
                return new Uint8Array([...new Array(leadingZeros).fill(0), ...resBytes]);
            }
        }

        const b32 = {
            encode: (bytes) => {
                let bits = 0, value = 0, output = '';
                for (let i = 0; i < bytes.length; i++) {
                    value = (value << 8) | bytes[i];
                    bits += 8;
                    while (bits >= 5) {
                        output += ALPHABETS.base32[(value >>> (bits - 5)) & 31];
                        bits -= 5;
                    }
                }
                if (bits > 0) output += ALPHABETS.base32[(value << (5 - bits)) & 31];
                while (output.length % 8 !== 0) output += '=';
                return output;
            },
            decode: (str) => {
                str = str.replace(/=+$/, '').toUpperCase();
                let bits = 0, value = 0, output = [];
                for (let i = 0; i < str.length; i++) {
                    const idx = ALPHABETS.base32.indexOf(str[i]);
                    if (idx === -1) throw new Error("Invalid Base32 character");
                    value = (value << 5) | idx;
                    bits += 5;
                    if (bits >= 8) {
                        output.push((value >>> (bits - 8)) & 255);
                        bits -= 8;
                    }
                }
                return new Uint8Array(output);
            }
        };

        const b45 = {
            encode: (bytes) => {
                let res = '';
                for (let i = 0; i < bytes.length; i += 2) {
                    if (i + 1 < bytes.length) {
                        let val = (bytes[i] << 8) + bytes[i + 1];
                        let c = val % 45; val = Math.floor(val / 45);
                        let b = val % 45;
                        let a = Math.floor(val / 45);
                        res += ALPHABETS.base45[c] + ALPHABETS.base45[b] + ALPHABETS.base45[a];
                    } else {
                        let val = bytes[i];
                        let c = val % 45;
                        let b = Math.floor(val / 45);
                        res += ALPHABETS.base45[c] + ALPHABETS.base45[b];
                    }
                }
                return res;
            },
            decode: (str) => {
                let output = [];
                for (let i = 0; i < str.length; i += 3) {
                    if (i + 2 < str.length) {
                        let c = ALPHABETS.base45.indexOf(str[i]);
                        let b = ALPHABETS.base45.indexOf(str[i + 1]);
                        let a = ALPHABETS.base45.indexOf(str[i + 2]);
                        if (a === -1 || b === -1 || c === -1) throw new Error("Invalid Base45 character");
                        let val = c + b * 45 + a * 45 * 45;
                        output.push((val >> 8) & 255, val & 255);
                    } else {
                        let c = ALPHABETS.base45.indexOf(str[i]);
                        let b = ALPHABETS.base45.indexOf(str[i + 1]);
                        if (b === -1 || c === -1) throw new Error("Invalid Base45 character");
                        let val = c + b * 45;
                        output.push(val);
                    }
                }
                return new Uint8Array(output);
            }
        };

        function process(type, action) {
            const val = inputText.value;
            if (!val) {
                resultArea.innerText = "Enter text to process";
                return;
            }

            try {
                const encoder = new TextEncoder();
                const decoder = new TextDecoder();
                let res;

                if (type === 'base64') {
                    res = action === 'encode' ? b64.encode(val) : b64.decode(val);
                } else if (type === 'base32') {
                    res = action === 'encode' ? b32.encode(encoder.encode(val)) : decoder.decode(b32.decode(val));
                } else if (type === 'base45') {
                    res = action === 'encode' ? b45.encode(encoder.encode(val)) : decoder.decode(b45.decode(val));
                } else {
                    if (action === 'encode') {
                        res = baseBignumConvert(encoder.encode(val), ALPHABETS[type], true);
                    } else {
                        const bytes = baseBignumConvert(val.trim(), ALPHABETS[type], false);
                        res = decoder.decode(bytes);
                    }
                }
                resultArea.innerText = res;
            } catch (e) {
                resultArea.innerText = "Error: " + e.message;
            }
        }

document.querySelector('[data-split-event="1"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {process('base32', 'encode')}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="2"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {process('base32', 'decode')}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="3"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {process('base45', 'encode')}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="4"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {process('base45', 'decode')}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="5"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {process('base58', 'encode')}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="6"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {process('base58', 'decode')}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="7"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {process('base62', 'encode')}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="8"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {process('base62', 'decode')}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="9"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {process('base64', 'encode')}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="10"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {process('base64', 'decode')}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
