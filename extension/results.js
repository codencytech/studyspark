// --- Typing effect ---
async function typeChunk(container, html, minSpeed = 15, maxSpeed = 35) {
    return new Promise((resolve) => {
        let i = 0;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const nodes = Array.from(tempDiv.childNodes);

        function typeNode(node, callback) {
            if (node.nodeType === Node.TEXT_NODE) {
                let text = node.textContent;
                let j = 0;
                function typeChar() {
                    if (j < text.length) {
                        container.innerHTML += text.charAt(j);
                        j++;
                        const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
                        setTimeout(typeChar, speed);
                    } else callback();
                }
                typeChar();
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const el = document.createElement(node.tagName);
                container.appendChild(el);
                if (node.attributes) {
                    Array.from(node.attributes).forEach(attr => el.setAttribute(attr.name, attr.value));
                }
                const childNodes = Array.from(node.childNodes);
                let k = 0;
                function nextChild() {
                    if (k < childNodes.length) {
                        typeNode(childNodes[k], () => { k++; nextChild(); });
                    } else callback();
                }
                nextChild();
            } else {
                callback();
            }
        }

        let n = 0;
        function nextNode() {
            if (n < nodes.length) {
                typeNode(nodes[n], () => { n++; nextNode(); });
            } else resolve();
        }
        nextNode();
    });
}

// --- State & Queue ---
const state = {
    currentAction: null,
    displayedCount: 0,
    queue: [],
    processing: false
};

// --- Loader ---
function ensureLoader() {
    let loader = document.getElementById("loading");
    if (!loader) {
        const container = document.getElementById("result-content");
        loader = document.createElement("div");
        loader.id = "loading";
        loader.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
        loader.style.display = "none";
        loader.style.justifyContent = "center";
        loader.style.marginTop = "12px";
        container.parentNode.appendChild(loader);
    }
    return loader;
}

// --- Format AI text into HTML ---
function formatText(text) {
    if (!text) return "";

    // Headings
    text = text.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    text = text.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    text = text.replace(/^# (.*$)/gim, "<h1>$1</h1>");

    // Bullet lists
    text = text.replace(/^\s*-\s+(.*)$/gim, "<li>$1</li>");
    if (text.includes("<li>")) text = "<ul>" + text + "</ul>";

    // Paragraphs (avoid wrapping headings/lists)
    const lines = text.split("\n\n").map(line => {
        if (line.match(/^<h[1-3]>.*<\/h[1-3]>$/) || line.startsWith("<ul>")) return line;
        return `<p>${line}</p>`;
    });
    return lines.join("");
}

// --- Queue processing ---
function enqueueChunks(action, chunks) {
    if (action !== state.currentAction) {
        state.currentAction = action;
        state.displayedCount = 0;
        state.queue = [];
        const container = document.getElementById("result-content");
        container.innerHTML = "";
        chrome.storage.local.remove("studySparkResult");
    }

    state.queue.push(...chunks);

    if (!state.processing) processQueue();
}

async function processQueue() {
    state.processing = true;
    const loader = ensureLoader();
    const container = document.getElementById("result-content");
    loader.style.display = "block";

    while (state.queue.length > 0) {
        const chunk = state.queue.shift();
        await new Promise(r => setTimeout(r, 150));

        const chunkContainer = document.createElement("div");
        chunkContainer.className = "chunk";
        container.appendChild(chunkContainer);

        try {
            const formatted = formatText(chunk);
            await typeChunk(chunkContainer, formatted);
        } catch (e) {
            chunkContainer.textContent += chunk;
        }

        container.scrollTop = container.scrollHeight;
    }

    loader.style.display = "none";
    state.processing = false;
}

// --- Display result ---
function showResult(action, result) {
    if (Array.isArray(result)) {
        const normalized = result.map(r => typeof r === "string" ? r : JSON.stringify(r, null, 2));
        if (normalized.length > state.displayedCount || action !== state.currentAction) {
            const newChunks = normalized.slice(state.displayedCount);
            state.displayedCount = normalized.length;
            enqueueChunks(action, newChunks);
        }
        return;
    }

    const single = typeof result === "string" ? result : JSON.stringify(result, null, 2);
    enqueueChunks(action, [single]);
    state.displayedCount += 1;
}

// --- Load from storage on init ---
function loadFromStorage() {
    chrome.storage.local.get("studySparkResult", (data) => {
        if (chrome.runtime.lastError) return;
        const item = data.studySparkResult;
        if (item && item.result !== undefined) {
            showResult(item.action, item.result);
        } else {
            const container = document.getElementById("result-content");
            container.textContent = "Processing...";
        }
    });
}

// --- Download result ---
function downloadResult() {
    const container = document.getElementById("result-content");
    const text = container.innerText || container.textContent || "";
    if (!text.trim()) return;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({ url, filename: "studyspark_result.txt" }, () => {
        URL.revokeObjectURL(url);
    });
}

// --- Event listeners ---
document.addEventListener("DOMContentLoaded", () => {
    ensureLoader();
    loadFromStorage();

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && changes.studySparkResult?.newValue) {
            const newVal = changes.studySparkResult.newValue;
            showResult(newVal.action, newVal.result);
        }
    });

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === "RESULT_AVAILABLE" || msg.type === "UPDATE_RESULT") {
            showResult(msg.action, msg.result);
        }
        if (msg.type === "DOWNLOAD_RESULT") downloadResult();
    });

    const copyBtn = document.getElementById("copy-btn");
    if (copyBtn) {
        copyBtn.addEventListener("click", async function () {
            const container = document.getElementById("result-content");
            const text = container.innerText || container.textContent || "";
            if (!text.trim()) return;

            try {
                await navigator.clipboard.writeText(text);
                const original = this.textContent;
                this.textContent = "Copied!";
                setTimeout(() => { this.textContent = original; }, 1500);
            } catch (err) {
                console.error("Copy failed:", err);
                this.textContent = "Failed";
                setTimeout(() => { this.textContent = "Copy"; }, 1500);
            }
        });
    }
});
