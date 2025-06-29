// Sumlify Extension - Popup Script
// Handles all UI interactions and API communication

class SumlifyPopup {
    constructor() {
        this.apiKey = null;
        this.currentTabInfo = null;
        this.isProcessing = false;
        this.isDarkMode = false;
        
        this.init();
    }

    /**
     * Initialize the popup application
     */
    async init() {
        try {
            await this.loadApiKey();
            await this.loadThemePreference();
            await this.getCurrentTabInfo();
            this.setupEventListeners();
            this.showAppropriateScreen();
        } catch (error) {
            console.error('Failed to initialize popup:', error);
            this.showError('Failed to initialize application');
        }
    }

    /**
     * Load stored API key from Chrome storage
     */
    async loadApiKey() {
        try {
            const result = await chrome.storage.local.get(['geminiApiKey']);
            this.apiKey = result.geminiApiKey || null;
        } catch (error) {
            console.error('Failed to load API key:', error);
            this.apiKey = null;
        }
    }

    /**
     * Load theme preference from storage
     */
    async loadThemePreference() {
        try {
            const result = await chrome.storage.local.get(['darkMode']);
            this.isDarkMode = result.darkMode || false;
            this.applyTheme(this.isDarkMode);
        } catch (error) {
            console.error('Failed to load theme preference:', error);
            this.isDarkMode = false;
        }
    }

    /**
     * Apply theme to the document
     */
    applyTheme(isDarkMode) {
        if (isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    /**
     * Handle theme toggle
     */
    async handleThemeToggle(event) {
        const isDarkMode = event.target.checked;
        
        try {
            await chrome.storage.local.set({ darkMode: isDarkMode });
            this.isDarkMode = isDarkMode;
            this.applyTheme(isDarkMode);
            
            // Show success message
            this.showSuccess(isDarkMode ? 'Dark mode enabled' : 'Light mode enabled');
        } catch (error) {
            console.error('Failed to save theme preference:', error);
            this.showError('Failed to save theme preference');
            // Revert toggle
            event.target.checked = !isDarkMode;
        }
    }

    /**
     * Get current tab information
     */
    async getCurrentTabInfo() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            this.currentTabInfo = {
                id: tab.id,
                url: tab.url,
                title: tab.title,
                domain: new URL(tab.url).hostname
            };
            
            // Debug cache key after getting tab info
            this.debugCacheKey();
        } catch (error) {
            console.error('Failed to get current tab info:', error);
            this.currentTabInfo = null;
        }
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // API Key Screen Events
        document.getElementById('save-api-key').addEventListener('click', () => this.saveApiKey());
        document.getElementById('get-api-key').addEventListener('click', () => this.openApiKeyPage());
        document.getElementById('toggle-key-visibility').addEventListener('click', () => this.toggleKeyVisibility());
        document.getElementById('api-key-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveApiKey();
        });

        // Main Screen Events
        document.getElementById('summarize-btn').addEventListener('click', () => this.summarizePage());
        document.getElementById('refresh-summary-btn').addEventListener('click', () => this.refreshSummary());
        document.getElementById('copy-summary').addEventListener('click', () => this.copySummary());
        document.getElementById('clear-cache').addEventListener('click', () => this.clearPageCache());
        document.getElementById('settings-btn').addEventListener('click', () => this.showSettings());

        // Settings Screen Events
        document.getElementById('back-to-main').addEventListener('click', () => this.showMainScreen());
        document.getElementById('edit-api-key').addEventListener('click', () => this.editApiKey());
        document.getElementById('clear-all-cache').addEventListener('click', () => this.clearAllCache());
        document.getElementById('theme-switch').addEventListener('change', (e) => this.handleThemeToggle(e));

        // Message Events
        document.getElementById('dismiss-error').addEventListener('click', () => this.hideError());
    }

    /**
     * Show the appropriate screen based on app state
     */
    showAppropriateScreen() {
        if (!this.apiKey) {
            this.showApiKeyScreen();
        } else {
            this.showMainScreen();
        }
    }

    /**
     * Show API key setup screen
     */
    showApiKeyScreen() {
        this.hideAllScreens();
        document.getElementById('api-key-screen').classList.remove('hidden');
        document.getElementById('api-key-input').focus();
    }

    /**
     * Show main application screen
     */
    async showMainScreen() {
        this.hideAllScreens();
        document.getElementById('main-screen').classList.remove('hidden');
        
        // Update website info
        if (this.currentTabInfo) {
            document.getElementById('website-title').textContent = this.currentTabInfo.title;
            document.getElementById('website-url').textContent = this.currentTabInfo.url;
        }

        // Check if we have cached summary
        await this.checkCachedSummary();
    }

    /**
     * Show settings screen
     */
    async showSettings() {
        this.hideAllScreens();
        document.getElementById('settings-screen').classList.remove('hidden');
        
        // Show masked API key
        const maskedKey = this.apiKey ? this.apiKey.substring(0, 8) + '...' + this.apiKey.slice(-4) : '';
        document.getElementById('settings-api-key').value = maskedKey;
        
        // Update theme switch to reflect current state
        document.getElementById('theme-switch').checked = this.isDarkMode;
    }

    /**
     * Hide all screens
     */
    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
    }

    /**
     * Save API key to storage
     */
    async saveApiKey() {
        const apiKeyInput = document.getElementById('api-key-input');
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            this.showError('Please enter a valid API key');
            return;
        }

        if (!this.validateApiKey(apiKey)) {
            this.showError('Invalid API key format. Please check your key.');
            return;
        }

        try {
            await chrome.storage.local.set({ geminiApiKey: apiKey });
            this.apiKey = apiKey;
            this.showSuccess('API key saved successfully!');
            
            // Clear input and switch to main screen
            apiKeyInput.value = '';
            setTimeout(() => this.showMainScreen(), 1500);
        } catch (error) {
            console.error('Failed to save API key:', error);
            this.showError('Failed to save API key');
        }
    }

    /**
     * Validate API key format
     */
    validateApiKey(key) {
        return key.length > 20 && key.includes('AIza');
    }

    /**
     * Toggle API key visibility
     */
    toggleKeyVisibility() {
        const input = document.getElementById('api-key-input');
        const button = document.getElementById('toggle-key-visibility');
        
        if (input.type === 'password') {
            input.type = 'text';
            button.textContent = '🙈';
        } else {
            input.type = 'password';
            button.textContent = '👁️';
        }
    }

    /**
     * Open Google AI Studio API key page
     */
    openApiKeyPage() {
        chrome.tabs.create({ url: 'https://aistudio.google.com/apikey' });
    }

    /**
     * Check if we have a cached summary for current domain
     */
    async checkCachedSummary() {
        if (!this.currentTabInfo) return;

        try {
            const cacheKey = this.generateCacheKey();
            if (!cacheKey) return;
            
            console.log('Checking cache with key:', cacheKey);
            
            const result = await chrome.storage.local.get([cacheKey]);
            const cachedData = result[cacheKey];

            if (cachedData && cachedData.timestamp > Date.now() - (24 * 60 * 60 * 1000)) {
                // Show cached summary (valid for 24 hours)
                console.log('Found cached summary for:', cacheKey);
                this.displaySummary(cachedData.summary, cachedData.timestamp, true);
                document.getElementById('refresh-summary-btn').classList.remove('hidden');
            } else {
                // No valid cache, show summarize button
                console.log('No valid cache found for:', cacheKey);
                this.hideSummary();
            }
        } catch (error) {
            console.error('Failed to check cache:', error);
        }
    }

    /**
     * Extract and summarize current page content
     */
    async summarizePage() {
        if (this.isProcessing) return;

        try {
            this.isProcessing = true;
            this.showLoading('Extracting page content...');

            // Extract content from current page
            const content = await this.extractPageContent();
            
            if (!content || content.length < 100) {
                this.hideLoading();
                this.showError('This page has insufficient text content to summarize');
                return;
            }

            // Get page language information
            let detectedLanguage = 'English';
            try {
                const metadata = await chrome.tabs.sendMessage(this.currentTabInfo.id, { action: 'getMetadata' });
                if (metadata && metadata.success && metadata.metadata && metadata.metadata.language) {
                    detectedLanguage = this.getLanguageName(metadata.metadata.language);
                }
            } catch (error) {
                console.warn('Could not get language metadata:', error);
            }

            this.updateLoadingText(`Detected language: ${detectedLanguage}. Sending to Gemini AI...`);

            // Send to Gemini API
            const summary = await this.callGeminiAPI(content);
            
            this.hideLoading();
            
            // Cache the summary
            await this.cacheSummary(summary);
            
            // Display the summary
            this.displaySummary(summary, Date.now(), false);
            
            this.showSuccess(`Page summarized successfully in ${detectedLanguage}!`);
            
        } catch (error) {
            console.error('Summarization failed:', error);
            this.hideLoading();
            this.showError(error.message || 'Failed to summarize page');
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Extract text content from the current page
     */
    async extractPageContent() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Try to use content script first for better extraction
            try {
                const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractContent' });
                if (response && response.success && response.content) {
                    return response.content;
                }
            } catch (contentScriptError) {
                console.log('Content script not available, using fallback extraction');
            }
            
            // Fallback to direct script injection
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    // Enhanced content extraction function
                    const unwantedSelectors = [
                        'script', 'style', 'nav', 'header', 'footer', 'aside',
                        '.advertisement', '.ads', '.popup', '.sidebar',
                        '[class*="ad-"]', '[id*="ad-"]', '[class*="sidebar"]',
                        '.comments', '.comment-section', '.social-media'
                    ];

                    // Remove unwanted elements (create a copy to avoid modifying the page)
                    const bodyClone = document.body.cloneNode(true);
                    unwantedSelectors.forEach(selector => {
                        const elements = bodyClone.querySelectorAll(selector);
                        elements.forEach(el => el.remove());
                    });

                    // Try to find main content
                    const contentSelectors = [
                        'main', 'article', '[role="main"]', '.main-content', 
                        '.content', '.post-content', '.entry-content', '.article-content'
                    ];

                    let content = '';
                    for (const selector of contentSelectors) {
                        const element = bodyClone.querySelector(selector);
                        if (element) {
                            content = element.innerText || element.textContent || '';
                            if (content.length > 200) break;
                        }
                    }

                    // Fallback to full body content
                    if (!content || content.length < 200) {
                        content = bodyClone.innerText || bodyClone.textContent || '';
                    }

                    // Clean up content
                    return content.replace(/\s+/g, ' ').replace(/\n\s*\n/g, '\n').trim();
                }
            });

            return results[0]?.result || '';
        } catch (error) {
            console.error('Content extraction failed:', error);
            throw new Error('Failed to extract page content. Please make sure the page is fully loaded.');
        }
    }

    /**
     * Call Google Gemini API to generate summary
     */
    async callGeminiAPI(content) {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
        
        // Get page language information for better localization
        let pageLanguage = 'English';
        let languageCode = 'en';
        
        try {
            const metadata = await chrome.tabs.sendMessage(this.currentTabInfo.id, { action: 'getMetadata' });
            if (metadata && metadata.success && metadata.metadata && metadata.metadata.language) {
                languageCode = metadata.metadata.language;
                pageLanguage = this.getLanguageName(languageCode);
            }
        } catch (error) {
            // Use document language as fallback
            languageCode = document.documentElement.lang ? document.documentElement.lang.split('-')[0] : 'en';
            pageLanguage = this.getLanguageName(languageCode);
        }
        
        // Create language-specific prompts
        let prompt;
        const langCode = languageCode.split('-')[0].toLowerCase();
        
        switch (langCode) {
            case 'tr':
                prompt = `Aşağıdaki web sayfası içeriğini analiz edin ve özetleyin. İçerik Türkçe görünüyor.

ÖNEMLİ: Lütfen yanıtınızı Türkçe olarak verin.

Lütfen şunları sağlayın:
1. Temel bilgileri vurgulayan üç kısa madde işareti
2. Genel içeriği özetleyen kısa bir paragraf (2-3 cümle)

Yanıtınızı markdown formatında, açık başlıklarla biçimlendirin. Kısa ve bilgilendirici tutun.

Özetlenecek içerik:
${content.substring(0, 8000)}`;
                break;
                
            case 'es':
                prompt = `Por favor, analiza y resume el siguiente contenido de la página web. El contenido parece estar en español.

IMPORTANTE: Por favor responde en español.

Proporciona:
1. Tres puntos concisos que destaquen la información clave
2. Un párrafo corto (2-3 oraciones) que resuma el contenido general

Formatea tu respuesta en markdown con encabezados claros. Manténlo conciso e informativo.

Contenido a resumir:
${content.substring(0, 8000)}`;
                break;
                
            case 'fr':
                prompt = `Veuillez analyser et résumer le contenu de la page web suivante. Le contenu semble être en français.

IMPORTANT: Veuillez répondre en français.

Fournissez:
1. Trois points concis mettant en évidence les informations clés
2. Un court paragraphe (2-3 phrases) résumant le contenu général

Formatez votre réponse en markdown avec des titres clairs. Restez concis et informatif.

Contenu à résumer:
${content.substring(0, 8000)}`;
                break;
                
            case 'de':
                prompt = `Bitte analysieren und fassen Sie den folgenden Webseiteninhalt zusammen. Der Inhalt scheint auf Deutsch zu sein.

WICHTIG: Bitte antworten Sie auf Deutsch.

Stellen Sie bereit:
1. Drei prägnante Stichpunkte, die die Schlüsselinformationen hervorheben
2. Einen kurzen Absatz (2-3 Sätze), der den Gesamtinhalt zusammenfasst

Formatieren Sie Ihre Antwort in Markdown mit klaren Überschriften. Halten Sie es präzise und informativ.

Zusammenzufassender Inhalt:
${content.substring(0, 8000)}`;
                break;
                
            case 'it':
                prompt = `Si prega di analizzare e riassumere il seguente contenuto della pagina web. Il contenuto sembra essere in italiano.

IMPORTANTE: Si prega di rispondere in italiano.

Fornire:
1. Tre punti concisi che evidenziano le informazioni chiave
2. Un breve paragrafo (2-3 frasi) che riassume il contenuto generale

Formattare la risposta in markdown con intestazioni chiare. Mantenerla concisa e informativa.

Contenuto da riassumere:
${content.substring(0, 8000)}`;
                break;
                
            case 'pt':
                prompt = `Por favor, analise e resuma o seguinte conteúdo da página web. O conteúdo parece estar em português.

IMPORTANTE: Por favor responda em português.

Forneça:
1. Três pontos concisos destacando as informações principais
2. Um parágrafo curto (2-3 frases) resumindo o conteúdo geral

Formate sua resposta em markdown com cabeçalhos claros. Mantenha conciso e informativo.

Conteúdo para resumir:
${content.substring(0, 8000)}`;
                break;
                
            case 'ru':
                prompt = `Пожалуйста, проанализируйте и обобщите следующий контент веб-страницы. Контент, похоже, на русском языке.

ВАЖНО: Пожалуйста, отвечайте на русском языке.

Предоставьте:
1. Три краткие маркированные пункта, выделяющие ключевую информацию
2. Один короткий абзац (2-3 предложения), обобщающий общий контент

Отформатируйте ваш ответ в markdown с четкими заголовками. Сделайте его кратким и информативным.

Контент для обобщения:
${content.substring(0, 8000)}`;
                break;
                
            default:
                prompt = `Please analyze and summarize the following web page content. The content appears to be in ${pageLanguage}.

IMPORTANT: Please respond in the same language as the detected content (${pageLanguage}). If the content is in a language other than English, provide the summary in that detected language.

Provide:
1. Three concise bullet points highlighting the key information
2. One short paragraph (2-3 sentences) summarizing the overall content

Format your response in markdown with clear headings. Keep it concise and informative.

Content to summarize:
${content.substring(0, 8000)}`;
                break;
        }

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.3,
                topK: 32,
                topP: 1,
                maxOutputTokens: 1024,
            }
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!summary) {
                throw new Error('No summary received from API');
            }

            return summary;
        } catch (error) {
            console.error('Gemini API call failed:', error);
            throw new Error('Failed to generate summary. Please check your API key and try again.');
        }
    }

    /**
     * Generate cache key for current page
     */
    generateCacheKey() {
        if (!this.currentTabInfo) return null;
        
        try {
            const url = new URL(this.currentTabInfo.url);
            const domain = url.hostname;
            const pathname = url.pathname;
            const search = url.search; // Include query parameters
            const hash = url.hash; // Include hash/fragment
            
            // Create a more specific cache key using domain + pathname + search + hash
            // Clean up the path and parameters
            const cleanPath = pathname === '/' ? '' : pathname.replace(/\/$/, '');
            const fullPath = cleanPath + search + hash;
            
            // Create cache key - if too long, use hash
            if (fullPath.length > 50) {
                const pathHash = this.hashString(fullPath);
                return `summary_${domain}_${pathHash}`;
            } else {
                // Clean special characters for shorter paths
                const cleanFullPath = fullPath.replace(/[^a-zA-Z0-9\-_\/\?=&#]/g, '_');
                return `summary_${domain}${cleanFullPath}`;
            }
        } catch (error) {
            console.error('Failed to generate cache key:', error);
            return `summary_${this.currentTabInfo.domain || 'unknown'}_${Date.now()}`;
        }
    }

    /**
     * Generate a simple hash for long URLs
     */
    hashString(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Get language name from language code
     */
    getLanguageName(langCode) {
        const languageMap = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese',
            'zh-cn': 'Chinese (Simplified)',
            'zh-tw': 'Chinese (Traditional)',
            'ar': 'Arabic',
            'hi': 'Hindi',
            'th': 'Thai',
            'vi': 'Vietnamese',
            'tr': 'Turkish',
            'pl': 'Polish',
            'nl': 'Dutch',
            'sv': 'Swedish',
            'no': 'Norwegian',
            'da': 'Danish',
            'fi': 'Finnish',
            'he': 'Hebrew',
            'cs': 'Czech',
            'sk': 'Slovak',
            'hu': 'Hungarian',
            'ro': 'Romanian',
            'bg': 'Bulgarian',
            'hr': 'Croatian',
            'sr': 'Serbian',
            'sl': 'Slovenian',
            'et': 'Estonian',
            'lv': 'Latvian',
            'lt': 'Lithuanian',
            'uk': 'Ukrainian',
            'el': 'Greek',
            'ca': 'Catalan',
            'eu': 'Basque',
            'gl': 'Galician',
            'mt': 'Maltese',
            'cy': 'Welsh',
            'ga': 'Irish',
            'is': 'Icelandic',
            'mk': 'Macedonian',
            'sq': 'Albanian',
            'be': 'Belarusian',
            'ka': 'Georgian',
            'hy': 'Armenian',
            'az': 'Azerbaijani',
            'kk': 'Kazakh',
            'ky': 'Kyrgyz',
            'uz': 'Uzbek',
            'tg': 'Tajik',
            'mn': 'Mongolian',
            'ne': 'Nepali',
            'si': 'Sinhala',
            'ta': 'Tamil',
            'te': 'Telugu',
            'ml': 'Malayalam',
            'kn': 'Kannada',
            'bn': 'Bengali',
            'gu': 'Gujarati',
            'pa': 'Punjabi',
            'ur': 'Urdu',
            'fa': 'Persian',
            'ps': 'Pashto',
            'ku': 'Kurdish',
            'sd': 'Sindhi',
            'my': 'Myanmar',
            'km': 'Khmer',
            'lo': 'Lao',
            'am': 'Amharic',
            'ti': 'Tigrinya',
            'or': 'Oriya',
            'as': 'Assamese',
            'mr': 'Marathi',
            'sa': 'Sanskrit',
            'sw': 'Swahili',
            'zu': 'Zulu',
            'af': 'Afrikaans',
            'xh': 'Xhosa',
            'st': 'Sesotho',
            'tn': 'Setswana',
            've': 'Venda',
            'ts': 'Tsonga',
            'ss': 'Siswati',
            'nr': 'Ndebele',
            'nso': 'Northern Sotho',
            'ig': 'Igbo',
            'yo': 'Yoruba',
            'ha': 'Hausa',
            'ff': 'Fulah'
        };
        
        const normalizedCode = langCode.toLowerCase().split('-')[0];
        return languageMap[normalizedCode] || languageMap[langCode.toLowerCase()] || 'English';
    }

    /**
     * Cache summary data
     */
    async cacheSummary(summary) {
        if (!this.currentTabInfo) return;

        try {
            const cacheKey = this.generateCacheKey();
            if (!cacheKey) return;
            
            console.log('Caching summary with key:', cacheKey);
            
            const cacheData = {
                summary: summary,
                timestamp: Date.now(),
                url: this.currentTabInfo.url,
                title: this.currentTabInfo.title,
                domain: this.currentTabInfo.domain
            };

            await chrome.storage.local.set({ [cacheKey]: cacheData });
            console.log('Summary cached successfully for:', cacheKey);
        } catch (error) {
            console.error('Failed to cache summary:', error);
        }
    }

    /**
     * Display summary in the UI
     */
    displaySummary(summary, timestamp, isCached) {
        const summarySection = document.getElementById('summary-section');
        const summaryContent = document.getElementById('summary-content');
        const summaryTimestamp = document.getElementById('summary-timestamp');

        // Convert markdown to HTML
        const htmlContent = this.markdownToHtml(summary);
        summaryContent.innerHTML = htmlContent + (isCached ? '<p class="cache-notice">📦 <em>Cached summary</em></p>' : '');

        // Update timestamp
        const date = new Date(timestamp);
        summaryTimestamp.textContent = date.toLocaleString();

        // Show summary section
        summarySection.classList.remove('hidden');
        
        // Update buttons
        document.getElementById('refresh-summary-btn').classList.remove('hidden');
        this.updateStatus('Summary ready', '✅');
    }

    /**
     * Hide summary section
     */
    hideSummary() {
        document.getElementById('summary-section').classList.add('hidden');
        document.getElementById('refresh-summary-btn').classList.add('hidden');
        this.updateStatus('Ready to summarize', '🚀');
    }

    /**
     * Convert simple markdown to HTML
     */
    markdownToHtml(markdown) {
        return markdown
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^### (.*$)/gm, '<h4>$1</h4>')
            .replace(/^## (.*$)/gm, '<h4>$1</h4>')
            .replace(/^# (.*$)/gm, '<h4>$1</h4>')
            .replace(/^\* (.*$)/gm, '<li>$1</li>')
            .replace(/^- (.*$)/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(?!<[uh])/gm, '<p>')
            .replace(/(?<![>])$/gm, '</p>')
            .replace(/<p><\/p>/g, '')
            .replace(/<p><([uh])/g, '<$1')
            .replace(/<\/([uh][^>]*)><\/p>/g, '</$1>');
    }

    /**
     * Refresh summary (generate new one)
     */
    refreshSummary() {
        this.hideSummary();
        this.summarizePage();
    }

    /**
     * Copy summary to clipboard
     */
    async copySummary() {
        try {
            const summaryContent = document.getElementById('summary-content');
            const textContent = summaryContent.textContent || summaryContent.innerText;
            
            await navigator.clipboard.writeText(textContent);
            this.showSuccess('Summary copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy summary:', error);
            this.showError('Failed to copy summary');
        }
    }

    /**
     * Clear cached summary for current page
     */
    async clearPageCache() {
        if (!this.currentTabInfo) return;

        try {
            const cacheKey = this.generateCacheKey();
            if (!cacheKey) return;
            
            console.log('Clearing cache for key:', cacheKey);
            await chrome.storage.local.remove([cacheKey]);
            this.hideSummary();
            this.showSuccess('Page cache cleared successfully!');
        } catch (error) {
            console.error('Failed to clear cache:', error);
            this.showError('Failed to clear cache');
        }
    }

    /**
     * Clear all cached summaries
     */
    async clearAllCache() {
        try {
            const allData = await chrome.storage.local.get();
            const cacheKeys = Object.keys(allData).filter(key => key.startsWith('summary_'));
            
            if (cacheKeys.length === 0) {
                this.showSuccess('No cached summaries to clear');
                return;
            }

            await chrome.storage.local.remove(cacheKeys);
            this.hideSummary();
            this.showSuccess(`Cleared ${cacheKeys.length} cached summaries`);
        } catch (error) {
            console.error('Failed to clear all cache:', error);
            this.showError('Failed to clear cache');
        }
    }

    /**
     * Edit API key
     */
    editApiKey() {
        this.showApiKeyScreen();
        document.getElementById('api-key-input').value = this.apiKey;
        document.getElementById('api-key-input').select();
    }

    /**
     * Update status display
     */
    updateStatus(text, icon) {
        document.getElementById('status-text').textContent = text;
        document.getElementById('status-icon').textContent = icon;
    }

    /**
     * Show loading overlay
     */
    showLoading(text) {
        document.getElementById('loading-text').textContent = text;
        document.getElementById('loading-overlay').classList.remove('hidden');
    }

    /**
     * Update loading text
     */
    updateLoadingText(text) {
        document.getElementById('loading-text').textContent = text;
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        document.getElementById('loading-overlay').classList.add('hidden');
    }

    /**
     * Show error message
     */
    showError(message) {
        document.getElementById('error-text').textContent = message;
        document.getElementById('error-message').classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => this.hideError(), 5000);
    }

    /**
     * Hide error message
     */
    hideError() {
        document.getElementById('error-message').classList.add('hidden');
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        document.getElementById('success-text').textContent = message;
        document.getElementById('success-message').classList.remove('hidden');
        
        // Auto-hide after 3 seconds
        setTimeout(() => this.hideSuccess(), 3000);
    }

    /**
     * Hide success message
     */
    hideSuccess() {
        document.getElementById('success-message').classList.add('hidden');
    }

    /**
     * Debug method to show current cache key
     */
    debugCacheKey() {
        if (!this.currentTabInfo) {
            console.log('Debug: No currentTabInfo available');
            return;
        }
        
        const cacheKey = this.generateCacheKey();
        console.log('Debug Cache Key Info:', {
            url: this.currentTabInfo.url,
            domain: this.currentTabInfo.domain,
            title: this.currentTabInfo.title,
            generatedKey: cacheKey
        });
        
        // Also show in UI for debugging
        this.updateStatus(`Cache Key: ${cacheKey}`, '🔍');
    }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SumlifyPopup();
});
