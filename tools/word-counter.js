const textInput = document.getElementById('text-input');
    const wordCount = document.getElementById('word-count');
    const charCount = document.getElementById('char-count');
    const charNoSpace = document.getElementById('char-no-space');
    const sentenceCount = document.getElementById('sentence-count');
    const paragraphCount = document.getElementById('paragraph-count');
    const lineCount = document.getElementById('line-count');
    const readingTime = document.getElementById('reading-time');

    const WORDS_PER_MINUTE = 200;

    function formatReadingTime(words) {
        const seconds = Math.round((words / WORDS_PER_MINUTE) * 60);
        if (seconds < 60) return seconds + 's';
        const minutes = Math.floor(seconds / 60);
        const rem = seconds % 60;
        return rem ? `${minutes}m ${rem}s` : `${minutes}m`;
    }

    function updateCounts() {
        const text = textInput.value;
        const trimmed = text.trim();

        const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
        wordCount.innerText = words.length.toLocaleString();

        charCount.innerText = text.length.toLocaleString();
        charNoSpace.innerText = text.replace(/\s/g, '').length.toLocaleString();

        const sentences = trimmed ? (trimmed.match(/[^.!?…]+[.!?…]+(\s|$)|[^.!?…]+$/g) || []).length : 0;
        sentenceCount.innerText = sentences.toLocaleString();

        const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(p => p.trim().length > 0).length : 0;
        paragraphCount.innerText = paragraphs.toLocaleString();

        lineCount.innerText = (text === '' ? 0 : text.split(/\r\n|\r|\n/).length).toLocaleString();

        readingTime.innerText = formatReadingTime(words.length);
    }

    textInput.addEventListener('input', updateCounts);
    updateCounts();
