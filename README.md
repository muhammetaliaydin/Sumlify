# Sumlify - AI Web Summarizer Chrome Extension

![Sumlify Logo](icons/icon128.png)

**Sumlify** is a modern Chrome extension that uses Google's Gemini AI to intelligently summarize web page content. With a clean, user-friendly interface, it helps you quickly understand the key points of any article, blog post, or web page.

## ✨ Features

- **🤖 AI-Powered Summarization**: Uses Google Gemini 2.0 Flash for accurate, contextual summaries
- **🌍 Multi-Language Support**: Automatic language detection with summaries in the detected language (50+ languages supported)
- **📝 Structured Output**: Get 3 key bullet points plus a concise paragraph summary
- **💾 Smart Caching**: Stores summaries by domain to avoid repeated API calls
- **🚀 Fast Performance**: Optimized content extraction and processing
- **🎨 Modern UI**: Clean, responsive design with dark/light theme support
- **🔒 Privacy-Focused**: API key stored locally, no data sent to third parties
- **📱 Responsive Design**: Works perfectly on all screen sizes

## 🚀 Quick Start

### Installation

1. **Download the Extension**
   - Clone this repository or download the ZIP file
   - Extract to a local folder

2. **Load into Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked" and select the extension folder

3. **Get Your API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/apikey)
   - Create a new API key for Gemini
   - Copy the generated key

4. **Setup the Extension**
   - Click the Sumlify icon in your Chrome toolbar
   - Enter your Gemini API key when prompted
   - You're ready to start summarizing!

### Usage

1. **Navigate to any webpage** with substantial text content
2. **Click the Sumlify extension icon** in your Chrome toolbar
3. **Click "Summarize Page"** to generate an AI summary
4. **View the results** with key points and overview
5. **Copy, cache, or regenerate** summaries as needed

## 🛠️ Technical Details

### Architecture

- **Manifest V3**: Modern Chrome extension architecture
- **Content Scripts**: Smart content extraction from web pages
- **Background Service Worker**: Handles caching and background tasks
- **Popup Interface**: Main user interface for interaction

### Files Structure

```
Sumlify/
├── manifest.json          # Extension configuration
├── popup.html            # Main popup interface
├── popup.js              # Popup logic and API integration
├── styles.css            # Modern CSS styling
├── content.js            # Content extraction script
├── background.js         # Background service worker
├── icons/               # Extension icons
├── README.md            # This file
└── LICENSE              # Apache 2.0 License
```

### API Integration

- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- **Authentication**: API key-based authentication
- **Content Limit**: 8,000 characters per request (automatically truncated)
- **Response Format**: Structured markdown with bullet points and summary

## 🎯 Core Features

### Smart Content Extraction

The extension intelligently extracts meaningful content from web pages by:

- Identifying main content areas (`<main>`, `<article>`, etc.)
- Removing navigation, advertisements, and sidebar content
- Filtering out scripts, styles, and other non-textual elements
- Preserving the core article or page content

### Intelligent Summarization

Summaries are generated with:

- **3 Key Bullet Points**: Most important information
- **Overview Paragraph**: 2-3 sentence summary
- **Multi-Language Support**: Automatically detects page language and responds accordingly
- **Language-Specific Prompts**: Optimized prompts for Turkish, Spanish, French, German, Italian, Portuguese, Russian, and other languages
- **Markdown Formatting**: Clean, readable output
- **Context Awareness**: Understands content type and adjusts accordingly

### Caching System

- **Domain-Based Caching**: Summaries cached by website domain
- **24-Hour Expiry**: Automatic cache invalidation
- **Manual Refresh**: Option to generate fresh summaries
- **Storage Management**: Automatic cleanup of expired cache

## 🔧 Configuration

### Settings

Access settings through the extension popup:

- **API Key Management**: View, edit, or replace your Gemini API key
- **Cache Control**: Clear individual or all cached summaries
- **Status Monitoring**: View current operation status

### Storage

The extension stores:

- **API Key**: Securely stored in Chrome's local storage
- **Cached Summaries**: Domain-based summary cache
- **Usage Statistics**: Summary count and usage metrics
- **Settings**: User preferences and configuration

## 🔧 Recent Improvements

### Cache System Enhancement
- **Fixed Cache Key Generation**: Now includes URL parameters and hash fragments for unique page identification
- **Per-Page Caching**: Different pages on the same domain now have separate cache entries
- **Debug Logging**: Added comprehensive logging for cache operations (visible in browser console)
- **Improved Cache Management**: Better cache key generation and cleanup

### Multi-Language Support
- **Automatic Language Detection**: Detects webpage language and provides summaries in the same language
- **50+ Languages Supported**: Including Turkish, Spanish, French, German, Italian, Portuguese, Russian, and many more
- **Localized UI**: Status messages and interface elements adapt to detected language

### Dark Mode Support
- **Theme Toggle**: Easy switching between light and dark themes
- **Persistent Settings**: Theme preference is saved and restored
- **Modern Design**: Clean, accessible dark mode implementation

## 🎨 UI/UX Features

### Modern Design

- **Clean Interface**: Minimalist, professional design
- **Responsive Layout**: Adapts to different screen sizes
- **Smooth Animations**: Subtle transitions and loading states
- **Visual Feedback**: Clear status indicators and progress updates

### User Experience

- **Intuitive Flow**: Step-by-step guided setup
- **Error Handling**: Graceful error messages and recovery
- **Loading States**: Clear progress indication
- **Success Feedback**: Confirmation of completed actions

### Accessibility

- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and semantics
- **High Contrast**: Readable color combinations
- **Focus Management**: Clear focus indicators

## 🔒 Privacy & Security

### Data Handling

- **Local Storage Only**: API keys stored locally in Chrome
- **No Telemetry**: No usage data sent to external servers
- **Direct API Calls**: Content sent directly to Google Gemini
- **No Tracking**: No user behavior tracking or analytics

### API Security

- **Key Protection**: API keys encrypted in local storage
- **HTTPS Only**: All API communications over secure connections
- **Rate Limiting**: Built-in request throttling
- **Error Handling**: Secure error message handling

## 🚀 Performance

### Optimization Features

- **Content Filtering**: Removes unnecessary elements before processing
- **Request Throttling**: Prevents API abuse and quota exhaustion
- **Efficient Caching**: Reduces redundant API calls
- **Background Processing**: Non-blocking operations

### Resource Usage

- **Minimal Memory**: Lightweight content scripts
- **Fast Startup**: Quick initialization and loading
- **Efficient Storage**: Compressed cache storage
- **Battery Friendly**: Optimized for mobile devices

## 🛠️ Development

### Prerequisites

- Chrome browser (version 88+)
- Google Gemini API key
- Basic understanding of web development

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/sumlify.git
   cd sumlify
   ```

2. **Load the extension**:
   - Open `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the project folder

3. **Test the extension**:
   - Navigate to any webpage
   - Click the extension icon
   - Test the summarization features

### Code Structure

- **popup.js**: Main application logic, API integration, UI management
- **content.js**: Content extraction, page analysis, monitoring
- **background.js**: Service worker, caching, background tasks
- **styles.css**: Modern CSS with variables, responsive design

## 📋 Browser Compatibility

### Supported Browsers

- ✅ **Chrome 88+**: Full support (primary target)
- ✅ **Edge 88+**: Full support (Chromium-based)
- ✅ **Opera 74+**: Full support (Chromium-based)
- ❌ **Firefox**: Not supported (different extension architecture)
- ❌ **Safari**: Not supported (different extension architecture)

### Required Permissions

- `activeTab`: Access to current tab content
- `storage`: Local storage for API keys and cache
- `scripting`: Content script injection
- `https://generativelanguage.googleapis.com/*`: Gemini API access

## 🤝 Contributing

We welcome contributions! Please see our [contributing guidelines](CONTRIBUTING.md) for details.

### Areas for Contribution

- **UI/UX Improvements**: Enhanced design and user experience
- **Feature Additions**: New summarization options, export features
- **Performance Optimization**: Faster content extraction, better caching
- **Bug Fixes**: Issue resolution and stability improvements
- **Documentation**: Improved docs, tutorials, examples

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini**: For providing the AI summarization API
- **Chrome Team**: For the excellent extension platform
- **Open Source Community**: For inspiration and best practices

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/sumlify/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/sumlify/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/sumlify/discussions)

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Google Gemini integration
- Modern UI design
- Caching system
- Content extraction
- Background service worker

---

**Made with ❤️ for better web browsing**
