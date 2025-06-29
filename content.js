// Sumlify Extension - Content Script
// This script runs on every webpage to help extract content

(function() {
    'use strict';

    /**
     * Enhanced content extraction function
     * This function is called by the popup to extract meaningful content from the page
     */
    function extractMainContent() {
        try {
            // Remove unwanted elements
            const unwantedSelectors = [
                'script', 'style', 'nav', 'header', 'footer', 'aside',
                '.advertisement', '.ads', '.popup', '.sidebar',
                '[class*="ad-"]', '[id*="ad-"]', '[class*="sidebar"]',
                '.comments', '.comment-section', '.social-media',
                '.cookie-banner', '.newsletter-signup'
            ];

            // Create a clone of the document to avoid modifying the original
            const documentClone = document.cloneNode(true);
            
            unwantedSelectors.forEach(selector => {
                const elements = documentClone.querySelectorAll(selector);
                elements.forEach(el => el.remove());
            });

            // Try to find the main content area
            let mainContent = '';
            
            // Priority order for content selection
            const contentSelectors = [
                'main',
                'article',
                '[role="main"]',
                '.main-content',
                '.content',
                '.post-content',
                '.entry-content',
                '.article-content',
                'body'
            ];

            for (const selector of contentSelectors) {
                const element = documentClone.querySelector(selector);
                if (element) {
                    mainContent = element.innerText || element.textContent || '';
                    if (mainContent.length > 200) {  // Minimum content threshold
                        break;
                    }
                }
            }

            // Fallback to body content if no main content found
            if (!mainContent || mainContent.length < 200) {
                mainContent = documentClone.body.innerText || documentClone.body.textContent || '';
            }

            // Clean up the content
            mainContent = mainContent
                .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
                .replace(/\n\s*\n/g, '\n')  // Remove empty lines
                .trim();

            return mainContent;

        } catch (error) {
            console.error('Sumlify: Content extraction failed:', error);
            
            // Fallback to simple body text extraction
            try {
                return document.body.innerText || document.body.textContent || '';
            } catch (fallbackError) {
                console.error('Sumlify: Fallback extraction failed:', fallbackError);
                return '';
            }
        }
    }

    /**
     * Get page metadata
     */
    function getPageMetadata() {
        // Enhanced language detection
        let detectedLanguage = 'en';
        
        // Priority order for language detection
        // 1. HTML lang attribute
        if (document.documentElement.lang) {
            detectedLanguage = document.documentElement.lang;
        }
        // 2. Meta language tag
        else if (getMetaContent('language')) {
            detectedLanguage = getMetaContent('language');
        }
        // 3. Content-Language meta tag
        else if (getMetaContent('content-language')) {
            detectedLanguage = getMetaContent('content-language');
        }
        // 4. Try to detect from URL (e.g., tr.wikipedia.org)
        else {
            const hostname = window.location.hostname;
            const subdomain = hostname.split('.')[0];
            // Common language subdomains
            const langSubdomains = {
                'tr': 'tr', 'en': 'en', 'de': 'de', 'fr': 'fr', 'es': 'es',
                'it': 'it', 'pt': 'pt', 'ru': 'ru', 'ja': 'ja', 'ko': 'ko',
                'zh': 'zh', 'ar': 'ar', 'hi': 'hi', 'th': 'th', 'vi': 'vi'
            };
            if (langSubdomains[subdomain]) {
                detectedLanguage = langSubdomains[subdomain];
            }
        }

        return {
            title: document.title || '',
            url: window.location.href,
            domain: window.location.hostname,
            description: getMetaContent('description') || '',
            author: getMetaContent('author') || '',
            publishDate: getMetaContent('article:published_time') || getMetaContent('date') || '',
            wordCount: (document.body.innerText || '').split(/\s+/).length,
            language: detectedLanguage
        };
    }

    /**
     * Get meta tag content by name or property
     */
    function getMetaContent(name) {
        const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        return meta ? meta.getAttribute('content') : '';
    }

    /**
     * Check if page has sufficient content for summarization
     */
    function hasValidContent() {
        const content = extractMainContent();
        const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
        
        return {
            hasContent: wordCount >= 50,
            wordCount: wordCount,
            contentLength: content.length,
            isValid: wordCount >= 50 && content.length >= 200
        };
    }

    /**
     * Listen for messages from the popup
     */
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        try {
            switch (request.action) {
                case 'extractContent':
                    const content = extractMainContent();
                    sendResponse({ success: true, content: content });
                    break;
                    
                case 'getMetadata':
                    const metadata = getPageMetadata();
                    sendResponse({ success: true, metadata: metadata });
                    break;
                    
                case 'checkContent':
                    const contentStatus = hasValidContent();
                    sendResponse({ success: true, status: contentStatus });
                    break;
                    
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Sumlify: Message handler error:', error);
            sendResponse({ success: false, error: error.message });
        }
        
        return true; // Keep message channel open for async response
    });

    /**
     * Notify popup when page content changes significantly
     */
    let lastContentHash = '';
    let contentCheckInterval;

    function checkContentChanges() {
        try {
            const currentContent = extractMainContent();
            const currentHash = hashCode(currentContent.substring(0, 1000)); // Hash first 1000 chars
            
            if (lastContentHash && lastContentHash !== currentHash) {
                // Content has changed significantly, notify popup if it's open
                chrome.runtime.sendMessage({
                    action: 'contentChanged',
                    url: window.location.href
                }).catch(() => {
                    // Popup might not be open, ignore error
                });
            }
            
            lastContentHash = currentHash;
        } catch (error) {
            // Silently handle errors in content change detection
        }
    }

    /**
     * Simple hash function for strings
     */
    function hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    /**
     * Initialize content monitoring
     */
    function initContentMonitoring() {
        // Initial content hash
        const initialContent = extractMainContent();
        lastContentHash = hashCode(initialContent.substring(0, 1000));
        
        // Check for content changes every 5 seconds
        contentCheckInterval = setInterval(checkContentChanges, 5000);
        
        // Also check when DOM is modified significantly
        if (window.MutationObserver) {
            const observer = new MutationObserver((mutations) => {
                let significantChange = false;
                
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        for (const node of mutation.addedNodes) {
                            if (node.nodeType === Node.ELEMENT_NODE && 
                                (node.tagName === 'ARTICLE' || 
                                 node.tagName === 'MAIN' || 
                                 node.className.includes('content'))) {
                                significantChange = true;
                                break;
                            }
                        }
                    }
                });
                
                if (significantChange) {
                    // Debounce the check
                    clearTimeout(window.sumlifyContentChangeTimeout);
                    window.sumlifyContentChangeTimeout = setTimeout(checkContentChanges, 1000);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    /**
     * Clean up when page is unloaded
     */
    window.addEventListener('beforeunload', () => {
        if (contentCheckInterval) {
            clearInterval(contentCheckInterval);
        }
        if (window.sumlifyContentChangeTimeout) {
            clearTimeout(window.sumlifyContentChangeTimeout);
        }
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContentMonitoring);
    } else {
        initContentMonitoring();
    }

    // Signal that Sumlify content script is loaded
    document.documentElement.setAttribute('data-sumlify-loaded', 'true');

})();
