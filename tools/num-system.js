const decInput = document.getElementById('dec-input');
        const octInput = document.getElementById('oct-input');
        const hexInput = document.getElementById('hex-input');
        const binInput = document.getElementById('bin-input');

        const RADIX = { dec: 10n, oct: 8n, hex: 16n, bin: 2n };
        const PATTERN = {
            dec: /^[0-9]+$/,
            oct: /^[0-7]+$/,
            hex: /^[0-9a-fA-F]+$/,
            bin: /^[01]+$/
        };
        const inputs = { dec: decInput, oct: octInput, hex: hexInput, bin: binInput };

        // Parse a string in an arbitrary base (2-16) into a BigInt.
        function parseBig(str, radix) {
            let result = 0n;
            for (const ch of str.toLowerCase()) {
                const digit = BigInt(parseInt(ch, 16));
                result = result * radix + digit;
            }
            return result;
        }

        function setError(el, on) {
            el.classList.toggle('gl-field-error', on);
        }

        function updateAll(rawValue, from) {
            const value = rawValue.trim();
            setError(inputs[from], false);

            if (value === '') { clearAll(true); return; }

            // Allow an optional leading minus sign for negative numbers.
            const negative = value.startsWith('-');
            const digits = negative ? value.slice(1) : value;

            if (!PATTERN[from].test(digits)) {
                setError(inputs[from], true);
                return;
            }

            const magnitude = parseBig(digits, RADIX[from]);
            const decimalValue = negative ? -magnitude : magnitude;
            const sign = decimalValue < 0n ? '-' : '';
            const abs = decimalValue < 0n ? -decimalValue : decimalValue;

            if (from !== 'dec') decInput.value = sign + abs.toString(10);
            if (from !== 'oct') octInput.value = sign + abs.toString(8);
            if (from !== 'hex') hexInput.value = sign + abs.toString(16).toUpperCase();
            if (from !== 'bin') binInput.value = sign + abs.toString(2);
        }

        decInput.addEventListener('input', (e) => updateAll(e.target.value, 'dec'));
        octInput.addEventListener('input', (e) => updateAll(e.target.value, 'oct'));
        hexInput.addEventListener('input', (e) => updateAll(e.target.value, 'hex'));
        binInput.addEventListener('input', (e) => updateAll(e.target.value, 'bin'));

        function clearAll(keepFocusValue) {
            [decInput, octInput, hexInput, binInput].forEach((el) => {
                if (!keepFocusValue || el !== document.activeElement) el.value = '';
                setError(el, false);
            });
        }

document.querySelector('[data-split-event="1"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {clearAll()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
