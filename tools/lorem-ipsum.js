const words = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate", "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"];

    function generateLorem() {
        let count = parseInt(document.getElementById('word-count').value);
        if (count <= 0) return;

        let sentences = [];
        let remainingWords = count;
        
        let firstSentence = ["Lorem", "ipsum"];
        let firstLen = Math.floor(Math.random() * 5) + 3;
        
        while (firstSentence.length < firstLen && remainingWords > 0) {
            firstSentence.push(words[Math.floor(Math.random() * words.length)]);
            remainingWords--;
        }
        sentences.push(firstSentence.join(' ') + '.');

        while (remainingWords > 0) {
            let sentenceLen = Math.floor(Math.random() * 7) + 5;
            let currentSentence = [];
            
            for (let i = 0; i < sentenceLen && remainingWords > 0; i++) {
                let word = words[Math.floor(Math.random() * words.length)];
                currentSentence.push(i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word);
                remainingWords--;
            }
            sentences.push(currentSentence.join(' ') + '.');
        }

        document.getElementById('lorem-output').value = sentences.join(' ');
    }

    function copyText() {
        const output = document.getElementById('lorem-output');
        if (!output.value) { window.EncrizeLab.toast('Nothing to copy yet.', 'error'); return; }
        window.EncrizeLab.copy(output.value, 'Lorem ipsum copied!');
    }

    generateLorem();

document.querySelector('[data-split-event="1"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {generateLorem()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="2"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {copyText()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
