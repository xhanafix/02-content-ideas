class ContentGenerator {
    constructor() {
        this.apiKey = localStorage.getItem('openRouterApiKey');
        this.siteUrl = window.location.origin;
        this.siteName = document.title;
        this.init();
        this.setupLoader();
    }

    init() {
        this.form = document.getElementById('targetMarketForm');
        this.filterInput = document.getElementById('filterInput');
        this.sortSelect = document.getElementById('sortSelect');
        this.exportBtn = document.getElementById('exportBtn');
        this.resultsTable = document.getElementById('resultsTable');

        this.checkApiKey();
        this.setupEventListeners();
    }

    checkApiKey() {
        if (!this.apiKey) {
            const apiKey = prompt('Sila masukkan kunci API OpenRouter anda:');
            if (apiKey) {
                localStorage.setItem('openRouterApiKey', apiKey);
                this.apiKey = apiKey;
            } else {
                alert('Kunci API diperlukan untuk menggunakan aplikasi ini.');
            }
        }
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.filterInput.addEventListener('input', () => this.filterResults());
        this.sortSelect.addEventListener('change', () => this.sortResults());
        this.exportBtn.addEventListener('click', () => this.exportToCSV());

        // Add API key management buttons to the UI
        const apiKeyControls = document.createElement('div');
        apiKeyControls.className = 'api-controls';
        apiKeyControls.innerHTML = `
            <button id="changeApiKey">Tukar Kunci API</button>
            <button id="clearApiKey">Padam Kunci API</button>
        `;
        document.querySelector('.controls-section').appendChild(apiKeyControls);

        document.getElementById('changeApiKey').addEventListener('click', () => this.changeApiKey());
        document.getElementById('clearApiKey').addEventListener('click', () => this.clearApiKey());
    }

    changeApiKey() {
        const newApiKey = prompt('Sila masukkan kunci API OpenRouter baharu:');
        if (newApiKey) {
            localStorage.setItem('openRouterApiKey', newApiKey);
            this.apiKey = newApiKey;
            alert('Kunci API telah dikemas kini.');
        }
    }

    clearApiKey() {
        if (confirm('Adakah anda pasti mahu memadamkan kunci API?')) {
            localStorage.removeItem('openRouterApiKey');
            this.apiKey = null;
            alert('Kunci API telah dipadamkan.');
            this.checkApiKey();
        }
    }

    setupLoader() {
        // Create loader element
        const loaderContainer = document.createElement('div');
        loaderContainer.className = 'loader-container';
        loaderContainer.innerHTML = `
            <div class="loader"></div>
            <div class="loader-text">Sedang menjana kandungan...</div>
        `;
        document.body.appendChild(loaderContainer);
        this.loader = loaderContainer;
    }

    showLoader() {
        this.loader.style.display = 'flex';
    }

    hideLoader() {
        this.loader.style.display = 'none';
    }

    async handleSubmit(e) {
        e.preventDefault();
        if (!this.apiKey) {
            alert('Sila masukkan kunci API terlebih dahulu.');
            this.checkApiKey();
            return;
        }

        const targetMarket = document.getElementById('targetMarket').value;
        if (!targetMarket.trim()) {
            alert('Sila masukkan pasaran sasaran.');
            return;
        }
        
        try {
            this.showLoader();
            const response = await this.fetchAIContent(targetMarket);
            if (!response.success) {
                throw new Error(response.error || 'Ralat tidak diketahui');
            }
            this.displayResults(response.data);
        } catch (error) {
            console.error('Error:', error);
            if (error.message.includes('401') || error.message.includes('unauthorized')) {
                alert('Kunci API tidak sah. Sila masukkan kunci API yang betul.');
                this.clearApiKey();
            } else {
                alert(`Ralat semasa menjana kandungan: ${error.message}`);
            }
        } finally {
            this.hideLoader();
        }
    }

    async fetchAIContent(targetMarket) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

            const prompt = `Sila berikan analisis untuk pasaran sasaran: ${targetMarket}
                           Format JSON yang diperlukan:
                           {
                             "painPoints": [
                               {
                                 "issue": "Isu utama",
                                 "contentIdeas": ["Idea 1", "Idea 2", "Idea 3", "Idea 4", "Idea 5"]
                               }
                             ]
                           }
                           Sila berikan 20 isu utama dengan 5 idea kandungan untuk setiap isu.`;

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "HTTP-Referer": this.siteUrl,
                    "X-Title": this.siteName,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "google/learnlm-1.5-pro-experimental:free",
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return this.parseAIResponse(data);
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Permintaan mengambil masa terlalu lama. Sila cuba lagi.');
            }
            throw new Error(`Ralat API: ${error.message}`);
        }
    }

    parseAIResponse(data) {
        try {
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Format respons tidak sah');
            }

            const content = data.choices[0].message.content;
            let parsedContent;

            try {
                parsedContent = JSON.parse(content);
            } catch (e) {
                // If JSON parsing fails, try to extract JSON from the content
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsedContent = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('Tidak dapat mengurai respons JSON');
                }
            }

            if (!parsedContent.painPoints || !Array.isArray(parsedContent.painPoints)) {
                throw new Error('Format data tidak sah');
            }

            return {
                success: true,
                data: parsedContent.painPoints.map(point => ({
                    painPoint: point.issue,
                    contentIdeas: point.contentIdeas
                }))
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    displayResults(results) {
        const tbody = this.resultsTable.querySelector('tbody');
        tbody.innerHTML = '';

        if (!Array.isArray(results) || results.length === 0) {
            const row = tbody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 2;
            cell.textContent = 'Tiada hasil ditemui';
            return;
        }

        // Animate results with longer delays
        results.forEach((result, index) => {
            const row = tbody.insertRow();
            row.style.opacity = '0';
            row.style.transition = 'opacity 0.5s ease-in'; // Increased transition duration
            
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);

            cell1.textContent = result.painPoint || 'Tidak dinyatakan';
            cell2.innerHTML = Array.isArray(result.contentIdeas) 
                ? result.contentIdeas.map(idea => 
                    `<div class="content-idea">${idea}</div>`
                  ).join('')
                : '<div class="content-idea">Tiada idea kandungan</div>';

            // Longer delay between each row animation
            setTimeout(() => {
                row.style.opacity = '1';
            }, index * 100); // Increased from 50ms to 100ms
        });
    }

    filterResults() {
        const filterText = this.filterInput.value.toLowerCase();
        const rows = this.resultsTable.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(filterText) ? '' : 'none';
        });
    }

    sortResults() {
        const sortBy = this.sortSelect.value;
        if (!sortBy) return;

        const tbody = this.resultsTable.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));

        rows.sort((a, b) => {
            const aText = a.cells[sortBy === 'painPoint' ? 0 : 1].textContent;
            const bText = b.cells[sortBy === 'painPoint' ? 0 : 1].textContent;
            return aText.localeCompare(bText);
        });

        tbody.innerHTML = '';
        rows.forEach(row => tbody.appendChild(row));
    }

    exportToCSV() {
        const rows = Array.from(this.resultsTable.querySelectorAll('tr'));
        const csvContent = rows.map(row => {
            return Array.from(row.cells)
                .map(cell => `"${cell.textContent.replace(/"/g, '""')}"`)
                .join(',');
        }).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'kandungan_pasaran_sasaran.csv';
        link.click();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ContentGenerator();
}); 