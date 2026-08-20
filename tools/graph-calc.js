let myChart;
    const COLORS = ['#4a90e2','#e24a4a','#28a745','#e2a14a','#a14ae2','#4ae2e2','#e24aa1'];
    const SUBS   = ['₁','₂','₃','₄','₅','₆','₇','₈','₉'];
    function yLabel(i) { return 'y' + (SUBS[i] || (i+1)); }

    let viewXMin = -6, viewXMax = 6;
    let isDefaultSpawn = true; 

    function parseExpr(raw) {
        return raw.trim()
            .replace(/^\s*y\s*\d*\s*=\s*/i, '')
            .replace(/\*\转/g, '^') 
            .replace(/\*\*/g, '^')
            .trim();
    }

    function addInput() {
        const container = document.getElementById('equation-container');
        const idx = container.querySelectorAll('.eq-row').length;
        const color = COLORS[idx % COLORS.length];
        const div = document.createElement('div');
        div.className = 'eq-row';
        div.style.cssText = 'display:flex;gap:10px;margin-bottom:10px;align-items:center;';
        div.innerHTML = `
            <span class="eq-label" style="color:${color};font-weight:bold;min-width:36px;">${yLabel(idx)} =</span>
            <input type="text" class="equation-input" placeholder="e.g., x**2, sin(x), 1/x**0.5">
            <button class="btn" onclick="removeInput(this)" style="background:#ff4444;padding:6px 12px;">×</button>
        `;
        container.appendChild(div);
        updateLabels();
    }
    function removeInput(btn) { btn.closest('.eq-row').remove(); updateLabels(); }
    function updateLabels() {
        document.querySelectorAll('.eq-row').forEach((row, i) => {
            const lbl = row.querySelector('.eq-label');
            if (lbl) { lbl.textContent = yLabel(i) + ' ='; lbl.style.color = COLORS[i % COLORS.length]; }
            const btn = row.querySelector('button');
            if (btn) btn.style.display = i === 0 ? 'none' : '';
        });
    }

    function safeEval(compiled, x) {
        try {
            const v = compiled.evaluate({ x });
            if (typeof v === 'number') return isFinite(v) ? v : null;
            if (v && typeof v === 'object' && ('im' in v)) {
                return Math.abs(v.im) < 1e-9 && isFinite(v.re) ? v.re : null;
            }
            return null;
        } catch { return null; }
    }

    function findRoots(compiled, xMin, xMax) {
        const roots = [];
        const span = xMax - xMin;
        const step = Math.max(0.01, span / 5000);

        let prevX = xMin;
        let prevY = safeEval(compiled, xMin);

        for (let x = xMin + step; x <= xMax + step * 0.5; x += step) {
            const cx = Math.min(x, xMax);
            const y  = safeEval(compiled, cx);

            if (prevY !== null && y !== null) {
                if (Math.abs(y) < 1e-9) {
                    if (!roots.some(r => Math.abs(r - cx) < step * 1.5)) roots.push(cx);
                } else if (prevY * y < 0) {
                    const root = bisect(compiled, prevX, cx);
                    if (root !== null && !roots.some(r => Math.abs(r - root) < step * 1.5)) {
                        roots.push(root);
                    }
                }
            }
            prevX = cx;
            prevY = y;
            if (cx >= xMax) break;
        }
        return roots.sort((a, b) => a - b);
    }

    function bisect(compiled, a, b) {
        let ya = safeEval(compiled, a);
        let yb = safeEval(compiled, b);
        if (ya === null || yb === null) return null;
        for (let i = 0; i < 52; i++) {
            const mid = (a + b) / 2;
            const ym  = safeEval(compiled, mid);
            if (ym === null) return null;
            if (Math.abs(ym) < 1e-12) return mid;
            if (ya * ym < 0) { b = mid; yb = ym; } else { a = mid; ya = ym; }
        }
        return (a + b) / 2;
    }

    function findIntersections(ca, cb, xMin, xMax) {
        const diff = { evaluate: ({x}) => {
            const ya = safeEval(ca, x), yb = safeEval(cb, x);
            return (ya === null || yb === null) ? null : ya - yb;
        }};
        return findRoots(diff, xMin, xMax).map(x => {
            const y = safeEval(ca, x);
            return { x, y };
        }).filter(p => p.y !== null);
    }

    function buildPoints(compiled, xMin, xMax) {
        const POINTS = 600;
        const step = (xMax - xMin) / POINTS;
        const pts = [];
        for (let i = 0; i <= POINTS; i++) {
            const x = xMin + i * step;
            pts.push({ x, y: safeEval(compiled, x) });
        }
        return pts;
    }

    function updateYRangeToMatchAspect(chart) {
        if (!chart || !chart.chartArea) return;
        
        const areaWidth = chart.chartArea.right - chart.chartArea.left;
        const areaHeight = chart.chartArea.bottom - chart.chartArea.top;
        
        const xUnitsPerPixel = (viewXMax - viewXMin) / areaWidth;
        const targetYSpan = areaHeight * xUnitsPerPixel;
        
        let currentYCenter = 0;
        if (!isDefaultSpawn && chart.scales && chart.scales.y && !isNaN(chart.scales.y.min)) {
            currentYCenter = (chart.scales.y.min + chart.scales.y.max) / 2;
        }
        
        chart.options.scales.y.min = currentYCenter - targetYSpan / 2;
        chart.options.scales.y.max = currentYCenter + targetYSpan / 2;
    }

    function drawGraph() {
        const inputs   = document.querySelectorAll('.equation-input');
        const rootXMin = parseFloat(document.getElementById('root-xmin').value) || -100;
        const rootXMax = parseFloat(document.getElementById('root-xmax').value) ||  100;

        const exprs    = [];
        const datasets = [];
        let infoHTML   = '';

        inputs.forEach((inp, i) => {
            const raw = parseExpr(inp.value || (i === 0 ? 'x^2' : ''));
            if (!raw) return;
            try {
                const compiled = math.compile(raw);
                exprs.push({ label: yLabel(i), raw, compiled, color: COLORS[i % COLORS.length] });
            } catch(e) {
                infoHTML += `<div style="color:#f44336;"><b>${yLabel(i)} = ${raw}</b>: error — ${e.message}</div>`;
            }
        });

        exprs.forEach(e => {
            const pts = buildPoints(e.compiled, viewXMin, viewXMax);
            datasets.push({
                label: `${e.label} = ${e.raw}`,
                data: pts.map(p => ({ x: p.x, y: p.y })),
                borderColor: e.color,
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0.1,
                pointRadius: 0,
                spanGaps: false,
            });
        });

        const specialPoints = [];
        exprs.forEach(e => {
            const roots = findRoots(e.compiled, rootXMin, rootXMax);
            let block = `<div class="roots-section">
                <h4 style="color:${e.color};">● ${e.label} = ${e.raw}
                    <span style="font-weight:normal;font-size:.8rem;color:var(--clr-muted);"> (roots on [${rootXMin}; ${rootXMax}])</span>
                </h4>`;
            if (roots.length > 0) {
                block += '<ul>';
                roots.forEach(r => {
                    block += `<li>x = <b>${fmt(r)}</b> → (${fmt(r)}, 0)</li>`;
                    if (r >= viewXMin && r <= viewXMax)
                        specialPoints.push({ x: r, y: 0, color: e.color });
                });
                block += '</ul>';
            } else {
                block += `<ul><li style="color:var(--clr-muted);">no roots found</li></ul>`;
            }
            block += '</div>';
            infoHTML += block;
        });

        if (exprs.length >= 2) {
            let interHTML = `<div class="roots-section"><h4><i aria-hidden="true" class="fas fa-project-diagram"></i> Intersections
                <span style="font-weight:normal;font-size:.8rem;color:var(--clr-muted);"> (on [${rootXMin}; ${rootXMax}])</span>
            </h4><ul>`;
            for (let i = 0; i < exprs.length; i++) {
                for (let j = i + 1; j < exprs.length; j++) {
                    const ea = exprs[i], eb = exprs[j];
                    const pts = findIntersections(ea.compiled, eb.compiled, rootXMin, rootXMax);
                    if (pts.length > 0) {
                        pts.forEach(p => {
                            interHTML += `<li>
                                <span class="intersection-dot" style="background:${ea.color}"></span>
                                <span class="intersection-dot" style="background:${eb.color}"></span>
                                <b>${ea.label}</b> ∩ <b>${eb.label}</b>:
                                x = <b>${fmt(p.x)}</b>, y = <b>${fmt(p.y)}</b>
                            </li>`;
                            if (p.x >= viewXMin && p.x <= viewXMax)
                                specialPoints.push({ x: p.x, y: p.y, color: '#ffffff' });
                        });
                    } else {
                        interHTML += `<li style="color:var(--clr-muted);">${ea.label} and ${eb.label}: no intersections</li>`;
                    }
                }
            }
            interHTML += '</ul></div>';
            infoHTML += interHTML;
        }

        document.getElementById('roots-info').innerHTML = infoHTML || 'Please enter an expression.';

        if (specialPoints.length > 0) {
            datasets.push({
                label: 'Special Points',
                data: specialPoints.map(p => ({ x: p.x, y: p.y })),
                type: 'scatter',
                pointRadius: 6,
                pointBackgroundColor: specialPoints.map(p => p.color),
                pointBorderColor: '#333',
                pointBorderWidth: 2,
                showLine: false,
            });
        }

        if (myChart) myChart.destroy();

        let initialYMin = undefined;
        let initialYMax = undefined;
        if (isDefaultSpawn) {
            const approximateInitialYSpan = (viewXMax - viewXMin) / 1.7; 
            initialYMin = 0 - approximateInitialYSpan / 2;
            initialYMax = 0 + approximateInitialYSpan / 2;
        }

        const ctx = document.getElementById('myChart').getContext('2d');
        myChart = new Chart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.7, 
                animation: false,
                interaction: { mode: 'nearest', intersect: false },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: c => `${c.dataset.label}: (${fmt(c.parsed.x)}, ${fmt(c.parsed.y)})`
                        }
                    },
                    legend: { position: 'top' },
                    zoom: {
                        pan: { enabled: true, mode: 'xy', onPan: onViewChange },
                        zoom: {
                            wheel: { enabled: true },
                            pinch: { enabled: true },
                            mode: 'xy',
                            onZoom: onViewChange
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear', min: viewXMin, max: viewXMax,
                        title: { display: true, text: 'X' },
                        grid: {
                            color: (context) => context.tick.value === 0 ? '#000000' : 'rgba(128,128,128,0.15)',
                            lineWidth: (context) => context.tick.value === 0 ? 2 : 1,
                            z: 1
                        },
                        ticks: { z: 2 }
                    },
                    y: {
                        type: 'linear',
                        min: initialYMin, 
                        max: initialYMax,
                        title: { display: true, text: 'Y' },
                        grid: {
                            color: (context) => context.tick.value === 0 ? '#000000' : 'rgba(128,128,128,0.15)',
                            lineWidth: (context) => context.tick.value === 0 ? 2 : 1,
                            z: 1
                        },
                        ticks: { z: 2 }
                    }
                }
            },
            plugins: [{
                beforeLayout: (chart) => {
                    updateYRangeToMatchAspect(chart);
                }
            }]
        });
    }

    let redrawTimer = null;
    function onViewChange({ chart }) {
        isDefaultSpawn = false; 
        
        const scaleX = chart.scales.x;
        viewXMin = scaleX.min;
        viewXMax = scaleX.max;

        updateYRangeToMatchAspect(chart);

        clearTimeout(redrawTimer);
        redrawTimer = setTimeout(() => {
            const exprs = [];
            document.querySelectorAll('.equation-input').forEach((inp, i) => {
                const raw = parseExpr(inp.value || (i === 0 ? 'x^2' : ''));
                if (!raw) return;
                try { exprs.push({ compiled: math.compile(raw) }); } catch {}
            });
            exprs.forEach((e, i) => {
                if (chart.data.datasets[i] && chart.data.datasets[i].type !== 'scatter') {
                    chart.data.datasets[i].data = buildPoints(e.compiled, viewXMin, viewXMax)
                        .map(p => ({ x: p.x, y: p.y }));
                }
            });
            chart.update('none');
        }, 30); 
    }

    function resetZoom() {
        viewXMin = -6; 
        viewXMax = 6;
        isDefaultSpawn = true; 
        drawGraph();
    }

    function fmt(n) {
        if (n === null || n === undefined) return '?';
        const abs = Math.abs(n);
        if (abs === 0) return '0';
        if (abs < 0.001) return n.toExponential(4);
        if (abs < 1)      return parseFloat(n.toFixed(6)).toString();
        return parseFloat(n.toFixed(4)).toString();
    }

    window.onload = () => { updateLabels(); drawGraph(); };

document.querySelector('[data-split-event="1"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {removeInput(this)}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="2"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {addInput()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="3"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {drawGraph()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="4"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {resetZoom()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
