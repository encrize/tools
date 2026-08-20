const today = new Date().toISOString().split('T')[0];
        document.getElementById('target-date').value = today;
        document.getElementById('start-date').value = today;
        document.getElementById('end-date').value = today;
        document.getElementById('add-base-date').value = today;

        const msInDay = 24 * 60 * 60 * 1000;
        
        const daysInYear = 365;
        const daysInMonth = 30.436875;
        const daysInWeek = 7;

        function calculateCountdown() {
            const targetVal = document.getElementById('target-date').value;
            const resultDiv = document.getElementById('countdown-result');
            if (!targetVal) return;

            const tDate = new Date(targetVal);
            tDate.setHours(0,0,0,0);
            const currDate = new Date();
            currDate.setHours(0,0,0,0);

            const diffTime = tDate - currDate;
            const diffDays = Math.ceil(diffTime / msInDay);

            if (diffDays === 0) {
                resultDiv.innerHTML = `<span style="color: #28a745;">Today is the day!</span>`;
            } else if (diffDays > 0) {
                resultDiv.innerHTML = `<span style="color: #ff5722;">${diffDays} ${diffDays === 1 ? 'day' : 'days'} left</span> until the event.`;
            } else {
                resultDiv.innerHTML = `<span style="color: #dc3545;">${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'} ago.</span>`;
            }
        }

        function calculateRange() {
            const startVal = document.getElementById('start-date').value;
            const endVal = document.getElementById('end-date').value;
            const resultDiv = document.getElementById('range-result');
            if (!startVal || !endVal) return;

            const sDate = new Date(startVal);
            const eDate = new Date(endVal);
            sDate.setHours(0,0,0,0);
            eDate.setHours(0,0,0,0);

            const diffTime = Math.abs(eDate - sDate);
            const diffDays = Math.ceil(diffTime / msInDay);

            resultDiv.innerHTML = `Result: <span style="color: #ff5722;">${diffDays}</span> ${diffDays === 1 ? 'day' : 'days'} difference.`;
        }

        function calculateAddSub() {
            const baseVal = document.getElementById('add-base-date').value;
            const daysCount = parseInt(document.getElementById('add-days-count').value) || 0;
            const resultDiv = document.getElementById('add-result');
            if (!baseVal) return;

            const baseDate = new Date(baseVal);
            baseDate.setDate(baseDate.getDate() + daysCount);

            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = baseDate.toLocaleDateString('en-US', options);

            resultDiv.innerHTML = `Result Date: <span style="color: #ff5722;">${formattedDate}</span>`;
        }

        function updateFromDays() {
            const days = parseFloat(document.getElementById('conv-days').value) || 0;
            document.getElementById('conv-years').value = (days / daysInYear).toFixed(2).replace(/\.00$/, '');
            document.getElementById('conv-months').value = (days / daysInMonth).toFixed(2).replace(/\.00$/, '');
            document.getElementById('conv-weeks').value = (days / daysInWeek).toFixed(2).replace(/\.00$/, '');
        }

        function updateFromUnits() {
            const years = parseFloat(document.getElementById('conv-years').value) || 0;
            const months = parseFloat(document.getElementById('conv-months').value) || 0;
            const weeks = parseFloat(document.getElementById('conv-weeks').value) || 0;

            const totalDays = (years * daysInYear) + (months * daysInMonth) + (weeks * daysInWeek);
            document.getElementById('conv-days').value = Math.round(totalDays);
        }

        document.getElementById('target-date').addEventListener('input', calculateCountdown);
        document.getElementById('start-date').addEventListener('input', calculateRange);
        document.getElementById('end-date').addEventListener('input', calculateRange);
        document.getElementById('add-base-date').addEventListener('input', calculateAddSub);
        document.getElementById('add-days-count').addEventListener('input', calculateAddSub);
        document.getElementById('conv-days').addEventListener('input', updateFromDays);
        document.getElementById('conv-years').addEventListener('input', updateFromUnits);
        document.getElementById('conv-months').addEventListener('input', updateFromUnits);
        document.getElementById('conv-weeks').addEventListener('input', updateFromUnits);

        calculateCountdown();
        calculateRange();
        calculateAddSub();
        updateFromDays();
