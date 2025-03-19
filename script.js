class ContentGenerator {
    constructor() {
        this.apiKey = localStorage.getItem('openRouterApiKey');
        this.siteUrl = window.location.origin;
        this.siteName = document.title;
        this.searchHistory = this.loadSearchHistory() || [];
        this.init();
        this.setupLoader();
    }

    init() {
        try {
            // Get the DOM elements with error checking
            this.form = document.getElementById('targetMarketForm');
            this.filterInput = document.getElementById('filterInput');
            this.sortSelect = document.getElementById('sortSelect');
            this.exportBtn = document.getElementById('exportBtn');
            this.resultsTable = document.getElementById('resultsTable');
            this.resultsSummary = document.getElementById('resultsSummary');
            this.historyContainer = document.getElementById('historyContainer');
            this.historyFileInput = document.getElementById('historyFileInput');
            
            // Check for essential elements and log warnings if missing
            if (!this.form) console.warn('Warning: Target market form element not found. Form submission will not work.');
            if (!this.resultsTable) console.warn('Warning: Results table element not found. Results display will not work.');
            if (!this.resultsSummary) console.warn('Warning: Results summary element not found. Summary display will not work.');
            if (!this.historyContainer) console.warn('Warning: History container element not found. History display will not work.');

            this.checkApiKey();
            this.setupEventListeners();
            this.displaySearchHistory();
        } catch (error) {
            console.error('Initialization error:', error);
            // Try to show an error message to the user
            const errorDiv = document.createElement('div');
            errorDiv.style.color = 'red';
            errorDiv.style.padding = '20px';
            errorDiv.style.margin = '20px auto';
            errorDiv.style.maxWidth = '600px';
            errorDiv.style.textAlign = 'center';
            errorDiv.style.border = '1px solid red';
            errorDiv.textContent = 'Ralat semasa memulakan aplikasi. Sila muat semula halaman.';
            
            // Try to add the error message to the page
            try {
                const container = document.querySelector('.container');
                if (container) {
                    container.prepend(errorDiv);
                } else {
                    document.body.prepend(errorDiv);
                }
            } catch (e) {
                // Last resort - alert
                alert('Ralat semasa memulakan aplikasi. Sila muat semula halaman.');
            }
        }
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
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        if (this.filterInput) {
            this.filterInput.addEventListener('input', () => this.filterResults());
        }
        
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', () => this.sortResults());
        }
        
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => this.exportToCSV());
        }

        // API key buttons
        const changeApiKeyBtn = document.getElementById('changeApiKey');
        if (changeApiKeyBtn) {
            changeApiKeyBtn.addEventListener('click', () => this.changeApiKey());
        }
        
        const clearApiKeyBtn = document.getElementById('clearApiKey');
        if (clearApiKeyBtn) {
            clearApiKeyBtn.addEventListener('click', () => this.clearApiKey());
        }
        
        // Toggle history panel
        const toggleHistoryBtn = document.getElementById('toggleHistory');
        if (toggleHistoryBtn) {
            toggleHistoryBtn.addEventListener('click', () => {
                const historyPanel = document.getElementById('historyPanel');
                if (historyPanel) {
                    const isVisible = historyPanel.classList.toggle('show');
                    toggleHistoryBtn.textContent = isVisible ? 'Sembunyikan Sejarah' : 'Tunjuk Sejarah';
                }
            });
        }
        
        // History file import
        if (this.historyFileInput) {
            this.historyFileInput.addEventListener('change', (e) => this.importHistoryFromFile(e));
        }
        
        // Export history as JSON
        const exportHistoryJsonBtn = document.getElementById('exportHistoryJson');
        if (exportHistoryJsonBtn) {
            exportHistoryJsonBtn.addEventListener('click', () => this.exportHistoryAsJson());
        }
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
        if (this.loader) {
            this.loader.style.display = 'flex';
        }
    }

    hideLoader() {
        if (this.loader) {
            this.loader.style.display = 'none';
        }
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
                // Handle specific error cases with more user-friendly messages
                if (response.error.includes('JSON')) {
                    console.error('JSON parsing error details:', response.error);
                    throw new Error('Ralat semasa menganalisis respons. Sila cuba lagi.');
                } else {
                    throw new Error(response.error || 'Ralat tidak diketahui');
                }
            }
            
            // Save to history
            const historyItem = {
                productService,
                targetMarket,
                contentCount,
                ...response.data,
                timestamp: new Date().toISOString()
            };
            this.searchHistory.push(historyItem);
            this.saveSearchHistory();
            
            // Save history to text file
            this.saveHistoryToTextFile(historyItem);
            
            this.displaySearchHistory();
            this.displayResults(response.data, productService, targetMarket);
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            
            // Show user-friendly error message
            if (error.message.includes('401') || error.message.includes('unauthorized')) {
                alert('Kunci API tidak sah. Sila masukkan kunci API yang betul.');
                this.clearApiKey();
            } else if (error.message.includes('fetch') || error.message.includes('network')) {
                alert('Ralat rangkaian. Sila periksa sambungan internet anda dan cuba lagi.');
            } else if (error.message.includes('timeout') || error.message.includes('masa terlalu lama')) {
                alert('Permintaan mengambil masa terlalu lama. Sila cuba lagi.');
            } else if (error.message.includes('JSON') || error.message.includes('parsing')) {
                alert('Ralat format data. Sila cuba lagi dengan input yang berbeza.');
            } else {
                alert(`Ralat semasa menjana kandungan: ${error.message}`);
            }
        } finally {
            this.hideLoader();
        }
    }

    // Save search history to a text file
    saveHistoryToTextFile(historyItem) {
        try {
            const dateTime = new Date(historyItem.timestamp).toLocaleString('ms-MY');
            
            let textContent = `=== CARIAN PADA ${dateTime} ===\n\n`;
            textContent += `PRODUK/PERKHIDMATAN: ${historyItem.productService}\n`;
            textContent += `PASARAN SASARAN: ${historyItem.targetMarket}\n`;
            textContent += `JUMLAH ISU: ${historyItem.painPoints ? historyItem.painPoints.length : 0}\n\n`;
            
            if (historyItem.summary) {
                textContent += `RINGKASAN:\n${historyItem.summary}\n\n`;
            }
            
            textContent += `ISU-ISU DAN CADANGAN KANDUNGAN:\n`;
            
            if (historyItem.painPoints && historyItem.painPoints.length > 0) {
                historyItem.painPoints.forEach((point, index) => {
                    textContent += `\n${index + 1}. ISU: ${point.painPoint}\n`;
                    textContent += `   CADANGAN KANDUNGAN:\n`;
                    
                    if (Array.isArray(point.contentIdeas)) {
                        point.contentIdeas.forEach((idea, ideaIndex) => {
                            textContent += `   ${String.fromCharCode(97 + ideaIndex)}. ${idea}\n`;
                        });
                    } else {
                        textContent += `   - Tiada cadangan kandungan\n`;
                    }
                });
            }
            
            textContent += `\n=== TAMAT CARIAN ===\n\n`;
            
            // Create blob and download file
            const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            
            // Format date for filename
            const date = new Date().toISOString().slice(0, 10);
            const time = new Date().toISOString().slice(11, 19).replace(/:/g, '-');
            link.download = `sejarah_carian_${date}_${time}.txt`;
            
            // Append to document, click and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (e) {
            console.error('Error saving history to text file:', e);
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
                           
                           PENTING: Sila berikan ${contentCount} isu utama dengan 5 idea kandungan untuk setiap isu.
                           Setiap idea kandungan perlu spesifik dan berkaitan langsung dengan produk/perkhidmatan untuk pasaran sasaran.
                           SANGAT PENTING: Sila pastikan respons anda dalam Bahasa Malaysia, BUKAN Bahasa Indonesia.
                           Gunakan perkataan "Sila" bukan "Silakan", dan "Tidak" bukan "Tidak ada".
                           Gunakan istilah "Pengguna" bukan "Pengguna akhir".`;

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
                // First attempt: direct JSON parsing
                parsedContent = JSON.parse(content);
            } catch (e) {
                console.log('First JSON parse failed, trying to repair JSON...', e.message);
                
                try {
                    // Second attempt: Try to extract and fix JSON
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const potentialJson = jsonMatch[0];
                        // Try to repair malformed JSON
                        const repairedJson = this.repairJSON(potentialJson);
                        parsedContent = JSON.parse(repairedJson);
                    } else {
                        throw new Error('Tidak dapat mengekstrak JSON dari respons');
                    }
                } catch (innerError) {
                    console.error('JSON repair failed:', innerError);
                    
                    try {
                        // Third attempt: Try specifically fixing array issues
                        const fixedArrayJson = this.fixArrayIssues(content);
                        parsedContent = JSON.parse(fixedArrayJson);
                    } catch (arrayError) {
                        console.error('Array fixing failed:', arrayError);
                        
                        // Last attempt: Manual extraction of structured data
                        parsedContent = this.extractStructuredData(content);
                        if (!parsedContent) {
                            throw new Error('Tidak dapat mengurai respons JSON: ' + e.message);
                        }
                    }
                }
            }

            if (!parsedContent.painPoints || !Array.isArray(parsedContent.painPoints)) {
                throw new Error('Format data tidak sah: painPoints tidak ditemui atau bukan array');
            }

            return {
                success: true,
                data: {
                    summary: parsedContent.summary || '',
                    painPoints: parsedContent.painPoints.map(point => ({
                        painPoint: point.issue || 'Isu tidak dinyatakan',
                        contentIdeas: Array.isArray(point.contentIdeas) ? point.contentIdeas : []
                    }))
                }
            };
        } catch (error) {
            console.error('Error parsing AI response:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Helper function to repair common JSON issues
    repairJSON(json) {
        // Replace any invalid control characters
        let repaired = json.replace(/[\u0000-\u001F]+/g, ' ');
        
        // Fix trailing commas in arrays (common issue)
        repaired = repaired.replace(/,\s*]/g, ']');
        repaired = repaired.replace(/,\s*}/g, '}');
        
        // Fix missing quotes around property names
        repaired = repaired.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
        
        // Fix missing quotes around values but be careful not to affect existing quoted strings
        repaired = repaired.replace(/:(\s*)(?!")(true|false|null|undefined|[a-zA-Z0-9_]+)(?!")/g, (match, space, value) => {
            if (value === 'true' || value === 'false' || value === 'null' || value === 'undefined' || !isNaN(value)) {
                return `:${space}${value}`; // Keep booleans, null, undefined, and numbers as-is
            }
            return `:${space}"${value}"`; // Add quotes to strings
        });
        
        // Handle unescaped quotes in strings (more careful approach)
        try {
            // Try parsing - if it works, return the original
            JSON.parse(repaired);
            return repaired;
        } catch (e) {
            // Log the specific error for debugging
            console.log('Still having issues with JSON, error:', e.message);
            
            // If we get here, there may be more complex issues
            // As a last resort, try a more aggressive fix for incorrect commas
            repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
            
            return repaired;
        }
    }

    // Extract structured data if JSON is severely malformed
    extractStructuredData(text) {
        // Fallback manual pattern extraction if all JSON parsing fails
        const summaryMatch = text.match(/summary["\s:]+([^"]+)/i);
        const summary = summaryMatch ? summaryMatch[1].trim() : '';
        
        // Extract issues and content ideas using pattern matching
        const painPoints = [];
        
        // Simple pattern to find issues and their content ideas
        const issuePattern = /issue["\s:]+([^"]+)/gi;
        const contentIdeasPattern = /contentIdeas["\s:]+\[([\s\S]*?)\]/gi;
        
        let issueMatch;
        let contentMatch;
        
        // Get all issues
        const issues = [];
        while ((issueMatch = issuePattern.exec(text)) !== null) {
            issues.push(issueMatch[1].trim());
        }
        
        // Get all content idea arrays
        const contentIdeasSets = [];
        while ((contentMatch = contentIdeasPattern.exec(text)) !== null) {
            // Extract array of content ideas
            const ideasText = contentMatch[1];
            const ideas = ideasText
                .split(/",\s*"/)
                .map(idea => idea.replace(/^"/, '').replace(/"$/, '').trim())
                .filter(idea => idea.length > 0);
                
            contentIdeasSets.push(ideas);
        }
        
        // Match issues with content ideas
        for (let i = 0; i < Math.min(issues.length, contentIdeasSets.length); i++) {
            painPoints.push({
                issue: issues[i],
                contentIdeas: contentIdeasSets[i]
            });
        }
        
        // If we couldn't extract any structured data, return null
        if (painPoints.length === 0) {
            return null;
        }
        
        return {
            summary,
            painPoints
        };
    }

    // Fix common issues with JSON arrays
    fixArrayIssues(json) {
        // Extract the entire JSON string
        const jsonMatch = json.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return json;
        
        let jsonStr = jsonMatch[0];
        
        // Find all array patterns
        const arrayPattern = /"contentIdeas"\s*:\s*\[([\s\S]*?)\]/g;
        
        // Replace each array with a fixed version
        jsonStr = jsonStr.replace(arrayPattern, (match, arrayContent) => {
            // Fix issues within array content
            let fixedArrayContent = arrayContent
                // Remove line breaks and excessive whitespace
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ')
                // Ensure all array elements are properly quoted
                .replace(/([^"])(,|\[)\s*([^"\d{[])/g, '$1$2"$3')
                .replace(/([^"])\s*(,|\])/g, '$1"$2')
                // Fix opening quotes
                .replace(/\[\s*([^"\d{[])/g, '["$1')
                // Remove any trailing commas
                .replace(/,\s*\]/g, ']')
                // Fix double quotes
                .replace(/""/g, '"')
                // Fix backslash issues
                .replace(/\\+"/g, '\\"');
            
            // Return the fixed array
            return '"contentIdeas": [' + fixedArrayContent + ']';
        });
        
        return jsonStr;
    }

    displayResults(data, productService, targetMarket) {
        if (!this.resultsTable || !this.resultsSummary) {
            console.error('Results table or summary element not found');
            return;
        }
        
        const tbody = this.resultsTable.querySelector('tbody');
        if (!tbody) {
            console.error('Table body element not found');
            return;
        }
        
        tbody.innerHTML = '';
        const { summary, painPoints } = data;

        // Display summary
        if (summary && this.resultsSummary) {
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
            // Ensure tbody still exists and is part of the DOM
            if (!tbody || !tbody.isConnected) {
                console.error('Table body no longer in DOM');
                return;
            }
            
            const row = tbody.insertRow();
            if (!row) {
                console.error('Failed to insert row');
                return;
            }
            
            row.classList.add('result-row');
            
            // Only set style properties if row exists
            if (row && row.style) {
                row.style.opacity = '0';
                row.style.transform = 'translateY(20px)';
                row.style.transition = 'opacity 0.5s ease-in, transform 0.5s ease-out';
            }
            
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            
            if (cell1) cell1.className = 'pain-point-cell';
            if (cell2) cell2.className = 'content-ideas-cell';

            if (cell1) cell1.textContent = result.painPoint || 'Tidak dinyatakan';
            
            if (cell2 && Array.isArray(result.contentIdeas)) {
                const ideasContainer = document.createElement('div');
                ideasContainer.className = 'content-ideas-container';
                
                result.contentIdeas.forEach(idea => {
                    const ideaElement = document.createElement('div');
                    ideaElement.className = 'content-idea';
                    ideaElement.textContent = idea;
                    ideasContainer.appendChild(ideaElement);
                });
                
                cell2.appendChild(ideasContainer);
            } else if (cell2) {
                cell2.innerHTML = '<div class="content-idea">Tiada idea kandungan</div>';
            }

            // Staggered animation - with safety check
            setTimeout(() => {
                if (row && row.isConnected && row.style) {
                    row.style.opacity = '1';
                    row.style.transform = 'translateY(0)';
                }
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

    loadSearchHistory() {
        try {
            return JSON.parse(localStorage.getItem('searchHistory')) || [];
        } catch (e) {
            console.error('Error loading search history', e);
            return [];
        }
    }

    saveSearchHistory() {
        try {
            // Keep only the last 20 searches
            if (this.searchHistory.length > 20) {
                this.searchHistory = this.searchHistory.slice(-20);
            }
            localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        } catch (e) {
            console.error('Error saving search history', e);
        }
    }

    clearSearchHistory() {
        if (confirm('Adakah anda pasti mahu memadamkan semua sejarah carian?')) {
            this.searchHistory = [];
            localStorage.removeItem('searchHistory');
            this.displaySearchHistory();
            alert('Sejarah carian telah dipadamkan.');
        }
    }

    displaySearchHistory() {
        if (!this.historyContainer) {
            console.error('History container not found');
            return;
        }
        
        this.historyContainer.innerHTML = '';
        
        if (this.searchHistory.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.className = 'empty-history';
            emptyMsg.textContent = 'Tiada sejarah carian';
            this.historyContainer.appendChild(emptyMsg);
            return;
        }

        // Create history list
        const historyList = document.createElement('ul');
        historyList.className = 'history-list';
        
        // Display most recent searches first
        [...this.searchHistory].reverse().forEach((item, index) => {
            try {
                const historyItem = document.createElement('li');
                historyItem.className = 'history-item';
                
                const dateTime = new Date(item.timestamp).toLocaleString('ms-MY');
                
                historyItem.innerHTML = `
                    <div class="history-content">
                        <div class="history-header">
                            <span class="history-date">${dateTime}</span>
                            <div class="history-buttons">
                                <button class="load-history-btn" data-index="${this.searchHistory.length - 1 - index}">Muat</button>
                                <button class="export-history-btn" data-index="${this.searchHistory.length - 1 - index}">Eksport</button>
                            </div>
                        </div>
                        <div class="history-details">
                            <strong>Produk/Perkhidmatan:</strong> ${item.productService || 'Tidak dinyatakan'}<br>
                            <strong>Pasaran Sasaran:</strong> ${item.targetMarket || 'Tidak dinyatakan'}<br>
                            <strong>Jumlah Isu:</strong> ${item.painPoints && Array.isArray(item.painPoints) ? item.painPoints.length : 0}
                        </div>
                    </div>
                `;
                
                historyList.appendChild(historyItem);
            } catch (e) {
                console.error('Error creating history item:', e);
            }
        });
        
        this.historyContainer.appendChild(historyList);
        
        try {
            // Add buttons container
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'history-actions';
            
            // Add export all button
            const exportAllBtn = document.createElement('button');
            exportAllBtn.id = 'exportAllHistoryBtn';
            exportAllBtn.textContent = 'Eksport Semua Sejarah (Teks)';
            exportAllBtn.className = 'export-all-history-btn';
            buttonContainer.appendChild(exportAllBtn);
            
            // Add export JSON button
            const exportJsonBtn = document.createElement('button');
            exportJsonBtn.id = 'exportHistoryJson';
            exportJsonBtn.textContent = 'Eksport Sejarah (JSON)';
            exportJsonBtn.className = 'export-json-btn';
            buttonContainer.appendChild(exportJsonBtn);
            
            // Add clear button
            const clearBtn = document.createElement('button');
            clearBtn.id = 'clearHistoryBtn';
            clearBtn.textContent = 'Padam Semua Sejarah';
            clearBtn.className = 'clear-history-btn';
            buttonContainer.appendChild(clearBtn);
            
            this.historyContainer.appendChild(buttonContainer);
            
            // Add import section
            const importSection = document.createElement('div');
            importSection.className = 'import-section';
            importSection.innerHTML = `
                <p class="import-label">Import Sejarah:</p>
                <div class="file-input-container">
                    <input type="file" id="historyFileInput" accept=".json" />
                    <label for="historyFileInput" class="file-input-label">Pilih Fail Sejarah JSON</label>
                </div>
            `;
            
            this.historyContainer.appendChild(importSection);
            this.historyFileInput = document.getElementById('historyFileInput');
            
            // Add event listeners
            const loadButtons = document.querySelectorAll('.load-history-btn');
            if (loadButtons) {
                loadButtons.forEach(btn => {
                    btn.addEventListener('click', () => this.loadHistoryItem(parseInt(btn.dataset.index)));
                });
            }
            
            const exportButtons = document.querySelectorAll('.export-history-btn');
            if (exportButtons) {
                exportButtons.forEach(btn => {
                    btn.addEventListener('click', () => this.saveHistoryToTextFile(this.searchHistory[parseInt(btn.dataset.index)]));
                });
            }
            
            if (exportAllBtn) {
                exportAllBtn.addEventListener('click', () => this.exportAllHistoryToTextFile());
            }
            
            const exportJsonButton = document.getElementById('exportHistoryJson');
            if (exportJsonButton) {
                exportJsonButton.addEventListener('click', () => this.exportHistoryAsJson());
            }
            
            if (clearBtn) {
                clearBtn.addEventListener('click', () => this.clearSearchHistory());
            }
            
            if (this.historyFileInput) {
                this.historyFileInput.addEventListener('change', (e) => this.importHistoryFromFile(e));
            }
        } catch (e) {
            console.error('Error setting up history UI:', e);
        }
    }

    loadHistoryItem(index) {
        try {
            if (index < 0 || index >= this.searchHistory.length) {
                console.warn('Invalid history index:', index);
                return;
            }
            
            const item = this.searchHistory[index];
            if (!item) {
                console.warn('History item at index ' + index + ' is undefined');
                return;
            }
            
            // Populate form fields if they exist
            const productServiceInput = document.getElementById('productService');
            if (productServiceInput) {
                productServiceInput.value = item.productService || '';
            }
            
            const targetMarketInput = document.getElementById('targetMarket');
            if (targetMarketInput) {
                targetMarketInput.value = item.targetMarket || '';
            }
            
            // Find the closest option to the original contentCount if the select exists
            const select = document.getElementById('contentCount');
            if (select && select.options && select.options.length > 0) {
                let bestMatch = select.options[0].value;
                for (let i = 0; i < select.options.length; i++) {
                    if (parseInt(select.options[i].value) >= item.contentCount) {
                        bestMatch = select.options[i].value;
                        break;
                    }
                }
                select.value = bestMatch;
            }
            
            // Display results (which now has its own error handling)
            if (item.painPoints) {
                this.displayResults(item, item.productService || '', item.targetMarket || '');
            } else {
                console.warn('History item has no painPoints data');
                
                // Try to display a minimal result
                if (this.resultsSummary) {
                    this.resultsSummary.innerHTML = `
                        <p><strong>Produk/Perkhidmatan:</strong> ${item.productService || 'Tidak dinyatakan'}</p>
                        <p><strong>Pasaran Sasaran:</strong> ${item.targetMarket || 'Tidak dinyatakan'}</p>
                        <p><strong>Ralat:</strong> Tiada data lengkap untuk dipaparkan</p>
                    `;
                }
                
                // Clear the table if it exists
                if (this.resultsTable) {
                    const tbody = this.resultsTable.querySelector('tbody');
                    if (tbody) {
                        tbody.innerHTML = '';
                        const row = tbody.insertRow();
                        if (row) {
                            const cell = row.insertCell(0);
                            if (cell) {
                                cell.colSpan = 2;
                                cell.textContent = 'Tiada data lengkap untuk dipaparkan';
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error loading history item:', error);
            alert('Ralat semasa memuat item sejarah: ' + error.message);
        }
    }

    // Export all search history to a single text file
    exportAllHistoryToTextFile() {
        try {
            if (this.searchHistory.length === 0) {
                alert('Tiada sejarah carian untuk dieksport.');
                return;
            }
            
            let textContent = `=== SEJARAH CARIAN PASARAN SASARAN ===\n`;
            textContent += `Jumlah Carian: ${this.searchHistory.length}\n`;
            textContent += `Dieksport Pada: ${new Date().toLocaleString('ms-MY')}\n\n`;
            
            // Include all search history entries
            this.searchHistory.forEach((historyItem, historyIndex) => {
                const dateTime = new Date(historyItem.timestamp).toLocaleString('ms-MY');
                
                textContent += `=== CARIAN #${historyIndex + 1} - ${dateTime} ===\n\n`;
                textContent += `PRODUK/PERKHIDMATAN: ${historyItem.productService}\n`;
                textContent += `PASARAN SASARAN: ${historyItem.targetMarket}\n`;
                textContent += `JUMLAH ISU: ${historyItem.painPoints ? historyItem.painPoints.length : 0}\n\n`;
                
                if (historyItem.summary) {
                    textContent += `RINGKASAN:\n${historyItem.summary}\n\n`;
                }
                
                textContent += `ISU-ISU DAN CADANGAN KANDUNGAN:\n`;
                
                if (historyItem.painPoints && historyItem.painPoints.length > 0) {
                    historyItem.painPoints.forEach((point, index) => {
                        textContent += `\n${index + 1}. ISU: ${point.painPoint}\n`;
                        textContent += `   CADANGAN KANDUNGAN:\n`;
                        
                        if (Array.isArray(point.contentIdeas)) {
                            point.contentIdeas.forEach((idea, ideaIndex) => {
                                textContent += `   ${String.fromCharCode(97 + ideaIndex)}. ${idea}\n`;
                            });
                        } else {
                            textContent += `   - Tiada cadangan kandungan\n`;
                        }
                    });
                }
                
                textContent += `\n=== TAMAT CARIAN #${historyIndex + 1} ===\n\n`;
                textContent += `--------------------------------------\n\n`;
            });
            
            // Create blob and download file
            const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            
            // Format date for filename
            const date = new Date().toISOString().slice(0, 10);
            link.download = `semua_sejarah_carian_${date}.txt`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (e) {
            console.error('Error exporting all history to text file:', e);
            alert('Ralat semasa mengeksport sejarah: ' + e.message);
        }
    }

    // Export search history as JSON file
    exportHistoryAsJson() {
        try {
            if (this.searchHistory.length === 0) {
                alert('Tiada sejarah carian untuk dieksport.');
                return;
            }
            
            // Create JSON data
            const jsonData = JSON.stringify(this.searchHistory, null, 2);
            
            // Create blob and download file
            const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            
            // Format date for filename
            const date = new Date().toISOString().slice(0, 10);
            link.download = `sejarah_carian_${date}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            alert('Fail sejarah carian JSON telah dieksport. Anda boleh simpan fail ini untuk import semula kemudian.');
            
        } catch (e) {
            console.error('Error exporting history to JSON file:', e);
            alert('Ralat semasa mengeksport sejarah: ' + e.message);
        }
    }
    
    // Import history from JSON file
    importHistoryFromFile(event) {
        try {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const importedHistory = JSON.parse(e.target.result);
                    
                    if (!Array.isArray(importedHistory)) {
                        throw new Error('Format fail tidak sah. Fail mesti mengandungi tatasusunan JSON.');
                    }
                    
                    // Ask user if they want to replace or append
                    const action = confirm('Adakah anda mahu menggantikan sejarah sedia ada atau menambah rekod baharu kepada sejarah sedia ada?\n\nKlik "OK" untuk TAMBAH rekod baharu.\nKlik "Cancel" untuk GANTI sejarah sedia ada sepenuhnya.');
                    
                    if (action) {
                        // Append - Add unique items
                        const existingIds = new Set(this.searchHistory.map(item => item.timestamp));
                        const newItems = importedHistory.filter(item => !existingIds.has(item.timestamp));
                        this.searchHistory = [...this.searchHistory, ...newItems];
                    } else {
                        // Replace
                        this.searchHistory = importedHistory;
                    }
                    
                    // Save to localStorage
                    this.saveSearchHistory();
                    
                    // Update display
                    this.displaySearchHistory();
                    
                    alert(`Sejarah carian telah diimport: ${importedHistory.length} rekod.`);
                    
                    // Reset file input
                    this.historyFileInput.value = '';
                    
                } catch (parseError) {
                    console.error('Error parsing imported history:', parseError);
                    alert('Ralat mengimport sejarah: ' + parseError.message);
                }
            };
            
            reader.onerror = (error) => {
                console.error('Error reading file:', error);
                alert('Ralat membaca fail.');
            };
            
            reader.readAsText(file);
            
        } catch (e) {
            console.error('Error importing history:', e);
            alert('Ralat mengimport sejarah: ' + e.message);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ContentGenerator();
}); 