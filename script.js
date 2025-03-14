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
        this.resultsSummary = document.getElementById('resultsSummary');

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

        // API key buttons
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
            <div class="loader-content">
                <div class="loader"></div>
                <div class="loader-text">Sedang menjana kandungan...</div>
            </div>
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

        const productService = document.getElementById('productService').value;
        const targetMarket = document.getElementById('targetMarket').value;
        const contentCount = document.getElementById('contentCount').value;
        
        if (!productService.trim()) {
            alert('Sila masukkan produk atau perkhidmatan anda.');
            return;
        }
        
        if (!targetMarket.trim()) {
            alert('Sila masukkan pasaran sasaran.');
            return;
        }
        
        try {
            this.showLoader();
            this.clearResults();
            const response = await this.fetchAIContent(productService, targetMarket, contentCount);
            if (!response.success) {
                throw new Error(response.error || 'Ralat tidak diketahui');
            }
            this.displayResults(response.data, productService, targetMarket);
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

    clearResults() {
        const tbody = this.resultsTable.querySelector('tbody');
        tbody.innerHTML = '';
        this.resultsSummary.innerHTML = '';
    }

    async fetchAIContent(productService, targetMarket, contentCount) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout

            const prompt = `Sila berikan analisis untuk produk/perkhidmatan berikut: "${productService}" 
                           yang menyasarkan pasaran: "${targetMarket}"
                           
                           Sila fokus pada bagaimana ${productService} boleh membantu menyelesaikan masalah 
                           atau memenuhi keperluan ${targetMarket}.
                           
                           Format JSON yang diperlukan:
                           {
                             "summary": "Ringkasan keseluruhan tentang ${productService} untuk ${targetMarket}",
                             "painPoints": [
                               {
                                 "issue": "Isu utama yang dihadapi oleh ${targetMarket}",
                                 "contentIdeas": [
                                   "Idea kandungan 1 yang menunjukkan bagaimana ${productService} menyelesaikan isu ini",
                                   "Idea kandungan 2 yang menunjukkan bagaimana ${productService} menyelesaikan isu ini",
                                   "Idea kandungan 3 yang menunjukkan bagaimana ${productService} menyelesaikan isu ini",
                                   "Idea kandungan 4 yang menunjukkan bagaimana ${productService} menyelesaikan isu ini",
                                   "Idea kandungan 5 yang menunjukkan bagaimana ${productService} menyelesaikan isu ini"
                                 ]
                               }
                             ]
                           }
                           
                           Sila berikan ${contentCount} isu utama dengan 5 idea kandungan untuk setiap isu.
                           Setiap idea kandungan perlu spesifik dan berkaitan langsung dengan produk/perkhidmatan untuk pasaran sasaran.`;

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
                data: {
                    summary: parsedContent.summary || '',
                    painPoints: parsedContent.painPoints.map(point => ({
                        painPoint: point.issue,
                        contentIdeas: point.contentIdeas
                    }))
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    displayResults(data, productService, targetMarket) {
        const { summary, painPoints } = data;
        const tbody = this.resultsTable.querySelector('tbody');
        tbody.innerHTML = '';

        // Display summary
        if (summary) {
            this.resultsSummary.innerHTML = `
                <p><strong>Produk/Perkhidmatan:</strong> ${productService}</p>
                <p><strong>Pasaran Sasaran:</strong> ${targetMarket}</p>
                <p><strong>Ringkasan:</strong> ${summary}</p>
            `;
        }

        if (!Array.isArray(painPoints) || painPoints.length === 0) {
            const row = tbody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 2;
            cell.textContent = 'Tiada hasil ditemui';
            return;
        }

        // Animate results with staggered delay
        painPoints.forEach((result, index) => {
            const row = tbody.insertRow();
            row.classList.add('result-row');
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            row.style.transition = 'opacity 0.5s ease-in, transform 0.5s ease-out';
            
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            
            cell1.className = 'pain-point-cell';
            cell2.className = 'content-ideas-cell';

            cell1.textContent = result.painPoint || 'Tidak dinyatakan';
            
            if (Array.isArray(result.contentIdeas)) {
                const ideasContainer = document.createElement('div');
                ideasContainer.className = 'content-ideas-container';
                
                result.contentIdeas.forEach(idea => {
                    const ideaElement = document.createElement('div');
                    ideaElement.className = 'content-idea';
                    ideaElement.textContent = idea;
                    ideasContainer.appendChild(ideaElement);
                });
                
                cell2.appendChild(ideasContainer);
            } else {
                cell2.innerHTML = '<div class="content-idea">Tiada idea kandungan</div>';
            }

            // Staggered animation
            setTimeout(() => {
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    filterResults() {
        const filterText = this.filterInput.value.toLowerCase();
        const rows = this.resultsTable.querySelectorAll('tbody tr');
        let visibleCount = 0;

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const visible = text.includes(filterText);
            row.style.display = visible ? '' : 'none';
            if (visible) visibleCount++;
        });

        // Update visible count
        const totalCount = rows.length;
        const filterInfo = document.createElement('div');
        filterInfo.className = 'filter-info';
        filterInfo.textContent = filterText ? 
            `Menunjukkan ${visibleCount} daripada ${totalCount} hasil untuk "${filterText}"` : 
            `Menunjukkan ${totalCount} hasil`;
            
        const existingInfo = document.querySelector('.filter-info');
        if (existingInfo) {
            existingInfo.remove();
        }
        
        this.resultsSummary.appendChild(filterInfo);
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
        const productService = document.getElementById('productService').value || 'Tidak dinyatakan';
        const targetMarket = document.getElementById('targetMarket').value || 'Tidak dinyatakan';
        const summary = this.resultsSummary.querySelector('p:nth-child(3)')?.textContent.replace('Ringkasan: ', '') || '';
        
        // Header row
        let csvContent = `"Produk/Perkhidmatan","${productService.replace(/"/g, '""')}"\n`;
        csvContent += `"Pasaran Sasaran","${targetMarket.replace(/"/g, '""')}"\n`;
        csvContent += `"Ringkasan","${summary.replace(/"/g, '""')}"\n\n`;
        
        // Column headers
        csvContent += '"Isu","Cadangan Kandungan"\n';
        
        // Data rows
        const rows = Array.from(this.resultsTable.querySelectorAll('tbody tr'));
        rows.forEach(row => {
            const painPoint = row.cells[0].textContent.replace(/"/g, '""');
            const contentIdeasContainer = row.cells[1].querySelector('.content-ideas-container');
            
            if (contentIdeasContainer) {
                const ideas = Array.from(contentIdeasContainer.querySelectorAll('.content-idea'));
                ideas.forEach((idea, index) => {
                    const ideaText = idea.textContent.replace(/"/g, '""');
                    if (index === 0) {
                        csvContent += `"${painPoint}","${ideaText}"\n`;
                    } else {
                        csvContent += `,"${ideaText}"\n`;
                    }
                });
            } else {
                csvContent += `"${painPoint}","Tiada idea kandungan"\n`;
            }
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const date = new Date().toISOString().slice(0, 10);
        link.download = `kandungan_pasaran_sasaran_${date}.csv`;
        link.click();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ContentGenerator();
}); 