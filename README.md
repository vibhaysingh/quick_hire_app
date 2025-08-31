# QuickHire - AI-Powered Candidate Management System

QuickHire is a modern, React-based candidate management and hiring dashboard that streamlines the recruitment process with AI-powered filtering and intelligent candidate matching.

## ✨ Features

- **AI-Powered Search**: Natural language candidate filtering using Google Gemini API
- **Smart Filtering**: Advanced multi-criteria filtering (skills, experience, location, salary, etc.)
- **Candidate Management**: View, shortlist, select, or reject candidates
- **Diversity Analytics**: Track diversity metrics across your candidate pool
- **Dark Mode Interface**: Clean, modern dark theme optimized for professional use
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Real-time Search**: Instant search and filtering with autocomplete
- **Modal Views**: Detailed candidate information in elegant modal overlays

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v22.16.0 or higher)
- **npm** or **yarn**
- **Google Gemini API Key** (for AI features)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd quick-hire
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
quick-hire/
├── public/
│   └── quick-hire.svg           # App logo
├── src/
│   ├── components/              # React components
│   │   ├── BrowseCandidates.jsx # Main candidate browsing interface
│   │   ├── CandidateCard.jsx    # Individual candidate display card
│   │   ├── CandidateModal.jsx   # Detailed candidate view modal
│   │   ├── ChipInput.jsx        # Multi-select input component
│   │   ├── Dashboard.jsx        # Main dashboard with stats
│   │   ├── DiversityAnalytics.jsx # Diversity metrics display
│   │   ├── FinalSelection.jsx   # Final candidate selection view
│   │   ├── Header.jsx           # Application header/navigation
│   │   ├── Pagination.jsx       # Pagination controls
│   │   ├── RejectedView.jsx     # Rejected candidates view
│   │   └── ShortlistView.jsx    # Shortlisted candidates view
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAIFiltering.js    # AI-powered filtering logic
│   │   ├── useCandidates.js     # Candidate data management
│   │   └── useFilteredCandidates.js # Filtering and search logic
│   ├── container/
│   │   └── QuickHireAppContainer.jsx # Main app container
│   ├── constants/
│   │   └── index.js             # App constants and enums
│   ├── data/
│   │   ├── candidates.json      # Sample candidate data
│   │   ├── quick-hire-logo-dark.svg
│   │   └── quick-hire-logo.svg
│   ├── utils/
│   │   └── helpers.js           # Utility functions
│   ├── index.css                # Global styles (dark theme)
│   └── main.jsx                 # React app entry point
├── .gitignore
├── eslint.config.js             # ESLint configuration
├── index.html                   # HTML template
├── package.json                 # Dependencies and scripts
├── vite.config.js               # Vite configuration
└── README.md                    # This file
```

## 🛠️ Available Scripts

- **`npm run dev`** - Start development server with hot reload
- **`npm run build`** - Build production bundle
- **`npm run preview`** - Preview production build locally
- **`npm run lint`** - Run ESLint for code quality checks

## 🧩 Key Components

### AI-Powered Filtering

The application features intelligent candidate filtering using Google Gemini API:

- Natural language queries like "Find React developers with 3+ years experience in San Francisco"
- Automatic extraction of filter criteria from conversational input
- Fallback to traditional filtering if AI processing fails

### Custom Hooks Architecture

- **`useCandidates`**: Manages candidate data loading and state
- **`useFilteredCandidates`**: Handles filtering logic and search
- **`useAIFiltering`**: Processes AI-powered search queries

### Component Structure

- **Container Pattern**: `QuickHireAppContainer` orchestrates all functionality
- **Presentation Components**: Clean, focused components for UI elements
- **Modal System**: Elegant overlay system for detailed views

## 🎨 Design System

The application uses a comprehensive dark-mode design system with:

- **CSS Custom Properties**: Consistent theming and easy customization
- **Responsive Grid System**: Flexible layouts for all screen sizes
- **Accessibility**: Focus management and screen reader support
- **Smooth Animations**: Polished user interactions

## 🔧 Configuration

### Environment Variables

```bash
# Optional - API endpoints if using external data
VITE_API_BASE_URL=https://your-api-endpoint.com
```

### Customization

- **Colors**: Modify CSS custom properties in `src/index.css`
- **Candidate Data**: Update `src/data/candidates.json` for different data
- **AI Model**: Configure model settings in `src/hooks/useAIFiltering.js`

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow React best practices and hooks patterns
- Maintain consistent code style with ESLint
- Write descriptive commit messages
- Update documentation for new features

## 📋 API Integration

To integrate with your own candidate API:

1. **Update data source** in `src/hooks/useCandidates.js`
2. **Modify data structure** to match your API response
3. **Configure endpoints** in environment variables
4. **Update filtering logic** if candidate schema differs

Example API integration:

```javascript
// In useCandidates.js
const fetchCandidates = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/candidates`
  );
  return response.json();
};
```

## 🔐 Security Notes

- **API Keys**: Never commit API keys to version control
- **Environment Variables**: Use `.env` files for sensitive configuration
- **Local Storage**: API keys are stored in browser's local storage for convenience during development
- **CORS**: Configure proper CORS settings for production deployments

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
# Deploy dist/ folder to Vercel
```

### Netlify

```bash
npm run build
# Deploy dist/ folder to Netlify
```

## 📞 Support

For questions or issues:

- Create an issue in the repository
- Check existing documentation
- Review the component examples in the code

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ by Vibhay Sing**
