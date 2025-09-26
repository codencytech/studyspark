function showResult(action, result) {
    document.getElementById('result-title').textContent = action + ' Result';
    document.getElementById('result-content').textContent = result;
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = decodeURIComponent(urlParams.get('action') || 'StudySpark');
    const result = decodeURIComponent(urlParams.get('result') || 'Processing...');

    showResult(action, result);
});

document.getElementById('copy-btn').addEventListener('click', function() {
    const text = document.getElementById('result-content').textContent;
    navigator.clipboard.writeText(text).then(() => {
        const original = this.textContent;
        this.textContent = 'Copied!';
        setTimeout(() => { this.textContent = original; }, 2000);
    });
});
