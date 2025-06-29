# Sumlify - Installation & Development Guide

## 🚀 Quick Installation

### For End Users

1. **Download the Extension**
   ```bash
   git clone https://github.com/muhammetaliaydin/sumlify.git
   # OR download ZIP from GitHub and extract
   ```

2. **Install in Chrome**
   - Open Chrome browser
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `Sumlify` folder
   - The extension icon should appear in your toolbar

3. **Get Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated key

4. **Setup Extension**
   - Click the Sumlify icon in Chrome toolbar
   - Paste your API key in the input field
   - Click "Save API Key"
   - You're ready to summarize web pages!

## 🛠️ Development Setup

### Prerequisites
- Chrome browser (version 88 or higher)
- Google Gemini API key
- Text editor (VS Code recommended)
- Basic knowledge of JavaScript, HTML, CSS

### Development Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/muhammetaliaydin/sumlify.git
   cd sumlify
   ```

2. **Install Dependencies** (optional)
   ```bash
   npm install
   ```

3. **Load Development Extension**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the project directory
   - Extension will load with development features

### File Structure Overview

```
Sumlify/
├── manifest.json      # Extension configuration
├── popup.html         # Main UI interface
├── popup.js          # Core application logic
├── styles.css        # Modern styling
├── content.js        # Page content extraction
├── background.js     # Background service worker
├── icons/            # Extension icons
├── README.md         # Documentation
├── package.json      # Project configuration
└── LICENSE          # Apache 2.0 License
```

### Key Development Commands

```bash
# Validate manifest
npm run validate

# Build and lint
npm run build

# Package for distribution
npm run package

# Development mode info
npm run dev
```

## 🔧 Configuration Options

### API Configuration
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- **Authentication**: API Key in header
- **Rate Limits**: Managed automatically
- **Content Limit**: 8,000 characters per request

### Storage Configuration
- **API Key**: Stored in `chrome.storage.local`
- **Cache**: Domain-based summary storage
- **Expiry**: 24-hour automatic cleanup
- **Settings**: User preferences and statistics

## 🧪 Testing

### Manual Testing
1. **Basic Functionality**
   - Install extension
   - Configure API key
   - Test on different websites
   - Verify summary quality

2. **Edge Cases**
   - Pages with minimal content
   - JavaScript-heavy sites
   - Different content types
   - Network error scenarios

3. **UI/UX Testing**
   - Responsive design
   - Error handling
   - Loading states
   - Accessibility features

### Test Websites
- **News Articles**: CNN, BBC, Reuters
- **Blog Posts**: Medium, WordPress blogs
- **Documentation**: GitHub READMEs, technical docs
- **E-commerce**: Product pages with descriptions
- **Academic**: Research papers, educational content

## 🚨 Troubleshooting

### Common Issues

1. **Extension Not Loading**
   - Check Chrome version (88+)
   - Verify Developer mode is enabled
   - Check console for manifest errors
   - Ensure all required files are present

2. **API Key Issues**
   - Verify key is valid and active
   - Check Google AI Studio for quota limits
   - Ensure proper key format (starts with 'AIza')
   - Test key directly in API playground

3. **Content Extraction Problems**
   - Check if site blocks content scripts
   - Verify page has sufficient text content
   - Test on different types of websites
   - Check browser console for errors

4. **Summary Quality Issues**
   - Content may be too short or fragmented
   - Page might have non-standard structure
   - Try refreshing the summary
   - Check if content is in supported language

### Debug Mode

Enable debug logging by:
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Look for "Sumlify:" prefixed messages
4. Check both popup and background script logs

### Performance Issues

If the extension is slow:
- Clear cached summaries
- Check internet connection
- Verify API quota hasn't been exceeded
- Try on simpler web pages first

## 📦 Building for Production

### Package Creation
```bash
# Create production build
npm run build

# Create ZIP file for Chrome Web Store
# (Manual process - zip the entire directory excluding dev files)
```

### Files to Include in Package
- `manifest.json`
- `popup.html`
- `popup.js`
- `styles.css`
- `content.js`
- `background.js`
- `icons/` (with proper icon files)
- `LICENSE`

### Files to Exclude
- `package.json`
- `README.md`
- `.gitignore`
- `.git/`
- `node_modules/`
- Development/test files

## 🔒 Security Considerations

### API Key Security
- Keys stored locally only
- No transmission to third parties
- Encrypted storage in Chrome
- User-controlled key management

### Content Privacy
- Content sent only to Google Gemini
- No logging or storage of content
- Direct API communication
- No third-party analytics

### Permission Management
- Minimal required permissions
- Clear permission explanations
- No background data collection
- User-controlled activation

## 🚀 Deployment

### Chrome Web Store
1. Create developer account
2. Package extension
3. Upload to Chrome Web Store
4. Fill out listing information
5. Submit for review

### Self-Distribution
1. Package as `.crx` file
2. Host on your website
3. Provide installation instructions
4. Handle updates manually

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### Code Standards
- Use modern JavaScript (ES6+)
- Follow Chrome extension best practices
- Maintain consistent code style
- Add comments for complex logic
- Test on multiple websites

### Areas for Contribution
- UI/UX improvements
- Performance optimization
- Additional AI model support
- Feature enhancements
- Bug fixes and stability

---

**Happy coding! 🎉**
