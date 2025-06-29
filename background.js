// Sumlify Extension - Background Service Worker
// Handles background tasks and communication between components

class SumlifyBackground {
    constructor() {
        this.init();
    }

    /**
     * Initialize background service worker
     */
    init() {
        this.setupEventListeners();
        this.setupInstallHandler();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Handle extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            this.handleInstall(details);
        });

        // Handle messages from content scripts and popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });

        // Handle tab updates
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            this.handleTabUpdate(tabId, changeInfo, tab);
        });

        // Handle tab activation
        chrome.tabs.onActivated.addListener((activeInfo) => {
            this.handleTabActivation(activeInfo);
        });
    }

    /**
     * Handle extension installation
     */
    handleInstall(details) {
        console.log('Sumlify extension installed:', details.reason);
        
        if (details.reason === 'install') {
            // First time installation
            this.setDefaultSettings();
            this.showWelcomeNotification();
        } else if (details.reason === 'update') {
            // Extension updated
            this.handleUpdate(details.previousVersion);
        }
    }

    /**
     * Set default settings on first install
     */
    async setDefaultSettings() {
        try {
            const defaultSettings = {
                sumlifyVersion: chrome.runtime.getManifest().version,
                installDate: Date.now(),
                summaryCount: 0,
                cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
                autoCache: true,
                notifications: true
            };

            await chrome.storage.local.set(defaultSettings);
            console.log('Default settings saved');
        } catch (error) {
            console.error('Failed to set default settings:', error);
        }
    }

    /**
     * Show welcome notification
     */
    showWelcomeNotification() {
        // Check if chrome.notifications is available
        if (chrome.notifications && chrome.notifications.create) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'Welcome to Sumlify!',
                message: 'Click the extension icon to start summarizing web pages with AI.'
            });
        } else {
            console.log('Welcome to Sumlify! Click the extension icon to start summarizing web pages with AI.');
        }
    }

    /**
     * Handle extension updates
     */
    async handleUpdate(previousVersion) {
        console.log(`Sumlify updated from ${previousVersion} to ${chrome.runtime.getManifest().version}`);
        
        try {
            // Update version in storage
            await chrome.storage.local.set({
                sumlifyVersion: chrome.runtime.getManifest().version,
                lastUpdateDate: Date.now()
            });

            // Perform any necessary migrations based on version
            await this.performMigrations(previousVersion);
        } catch (error) {
            console.error('Failed to handle update:', error);
        }
    }

    /**
     * Perform data migrations for version updates
     */
    async performMigrations(previousVersion) {
        try {
            // Add migration logic here if needed in future versions
            console.log('Migration completed successfully');
        } catch (error) {
            console.error('Migration failed:', error);
        }
    }

    /**
     * Handle messages from content scripts and popup
     */
    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'contentChanged':
                    await this.handleContentChange(request, sender);
                    sendResponse({ success: true });
                    break;

                case 'incrementSummaryCount':
                    await this.incrementSummaryCount();
                    sendResponse({ success: true });
                    break;

                case 'getStats':
                    const stats = await this.getExtensionStats();
                    sendResponse({ success: true, stats: stats });
                    break;

                case 'cleanupOldCache':
                    await this.cleanupOldCache();
                    sendResponse({ success: true });
                    break;

                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Message handling error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    /**
     * Generate cache key for a given URL
     */
    generateCacheKey(url) {
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            const pathname = urlObj.pathname;
            
            // Create a more specific cache key using domain + pathname
            // Remove trailing slash and clean up special characters
            const cleanPath = pathname === '/' ? '' : pathname.replace(/\/$/, '').replace(/[^a-zA-Z0-9\-_\/]/g, '_');
            const cacheKey = `summary_${domain}${cleanPath}`;
            
            // Limit cache key length to avoid storage issues
            return cacheKey.length > 100 ? `summary_${domain}_${this.hashString(pathname)}` : cacheKey;
        } catch (error) {
            console.error('Failed to generate cache key:', error);
            return `summary_${new URL(url).hostname || 'unknown'}`;
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
     * Handle content change notifications from content scripts
     */
    async handleContentChange(request, sender) {
        try {
            const tabId = sender.tab?.id;
            if (!tabId) return;

            // Invalidate cache for this specific page if content changed significantly
            const cacheKey = this.generateCacheKey(request.url);
            
            // Check if we have a cached summary for this specific page
            const result = await chrome.storage.local.get([cacheKey]);
            if (result[cacheKey]) {
                const url = new URL(request.url);
                console.log(`Content changed for ${url.hostname}${url.pathname}, invalidating cache`);
                await chrome.storage.local.remove([cacheKey]);
            }
        } catch (error) {
            console.error('Failed to handle content change:', error);
        }
    }

    /**
     * Increment summary count
     */
    async incrementSummaryCount() {
        try {
            const result = await chrome.storage.local.get(['summaryCount']);
            const currentCount = result.summaryCount || 0;
            await chrome.storage.local.set({ summaryCount: currentCount + 1 });
        } catch (error) {
            console.error('Failed to increment summary count:', error);
        }
    }

    /**
     * Get extension statistics
     */
    async getExtensionStats() {
        try {
            const data = await chrome.storage.local.get();
            const cacheKeys = Object.keys(data).filter(key => key.startsWith('summary_'));
            
            return {
                summaryCount: data.summaryCount || 0,
                cachedSummaries: cacheKeys.length,
                installDate: data.installDate || Date.now(),
                version: data.sumlifyVersion || chrome.runtime.getManifest().version
            };
        } catch (error) {
            console.error('Failed to get stats:', error);
            return {};
        }
    }

    /**
     * Handle tab updates
     */
    handleTabUpdate(tabId, changeInfo, tab) {
        // Update badge or perform other actions when tab content changes
        if (changeInfo.status === 'complete' && tab.url) {
            this.updateActionBadge(tab);
        }
    }

    /**
     * Handle tab activation
     */
    handleTabActivation(activeInfo) {
        // Update extension state when switching tabs
        chrome.tabs.get(activeInfo.tabId, (tab) => {
            if (chrome.runtime.lastError) {
                console.error('Failed to get tab info:', chrome.runtime.lastError);
                return;
            }
            this.updateActionBadge(tab);
        });
    }

    /**
     * Update extension action badge based on tab state
     */
    async updateActionBadge(tab) {
        try {
            if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                // Disable extension on chrome internal pages
                chrome.action.setBadgeText({ text: '', tabId: tab.id });
                chrome.action.setTitle({ title: 'Sumlify - Not available on this page', tabId: tab.id });
                return;
            }

            const domain = new URL(tab.url).hostname;
            const cacheKey = `summary_${domain}`;
            const result = await chrome.storage.local.get([cacheKey]);
            
            if (result[cacheKey] && result[cacheKey].timestamp > Date.now() - (24 * 60 * 60 * 1000)) {
                // Has cached summary
                chrome.action.setBadgeText({ text: '●', tabId: tab.id });
                chrome.action.setBadgeBackgroundColor({ color: '#10b981', tabId: tab.id });
                chrome.action.setTitle({ title: 'Sumlify - Cached summary available', tabId: tab.id });
            } else {
                // No cached summary
                chrome.action.setBadgeText({ text: '', tabId: tab.id });
                chrome.action.setTitle({ title: 'Sumlify - Click to summarize this page', tabId: tab.id });
            }
        } catch (error) {
            console.error('Failed to update badge:', error);
        }
    }

    /**
     * Setup periodic cleanup of old cached data
     */
    setupInstallHandler() {
        // Clean up old cache every hour
        setInterval(() => {
            this.cleanupOldCache();
        }, 60 * 60 * 1000); // 1 hour

        // Initial cleanup
        setTimeout(() => {
            this.cleanupOldCache();
        }, 5000); // 5 seconds after startup
    }

    /**
     * Clean up old cached summaries
     */
    async cleanupOldCache() {
        try {
            const data = await chrome.storage.local.get();
            const cacheKeys = Object.keys(data).filter(key => key.startsWith('summary_'));
            const expiredKeys = [];
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours

            cacheKeys.forEach(key => {
                const cacheData = data[key];
                if (cacheData && cacheData.timestamp) {
                    if (Date.now() - cacheData.timestamp > maxAge) {
                        expiredKeys.push(key);
                    }
                }
            });

            if (expiredKeys.length > 0) {
                await chrome.storage.local.remove(expiredKeys);
                console.log(`Cleaned up ${expiredKeys.length} expired cache entries`);
            }
        } catch (error) {
            console.error('Cache cleanup failed:', error);
        }
    }

    /**
     * Handle alarm events (if needed for scheduling)
     */
    setupAlarms() {
        chrome.alarms.onAlarm.addListener((alarm) => {
            switch (alarm.name) {
                case 'cleanup':
                    this.cleanupOldCache();
                    break;
                default:
                    console.log('Unknown alarm:', alarm.name);
            }
        });

        // Create cleanup alarm
        chrome.alarms.create('cleanup', { periodInMinutes: 60 });
    }
}

// Initialize background service worker
new SumlifyBackground();
