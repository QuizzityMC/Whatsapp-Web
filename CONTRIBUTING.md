# Contributing to WhatsApp Web Client

Thank you for your interest in contributing to the WhatsApp Web Client! This document provides guidelines and information for contributors.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
1. A clear, descriptive title
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Screenshots if applicable
6. Your environment (OS, Node.js version, browser)

### Suggesting Features

Feature suggestions are welcome! Please:
1. Check if the feature has already been suggested
2. Provide a clear use case
3. Explain why this feature would be useful
4. Consider if it aligns with the project's goal of simplicity

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Write clear, readable code
   - Follow the existing code style
   - Add comments where necessary
   - Test your changes thoroughly
4. **Commit your changes**
   ```bash
   git commit -m "Add: brief description of changes"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request**
   - Provide a clear description of the changes
   - Reference any related issues
   - Include screenshots for UI changes

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/QuizzityMC/Whatsapp-Web.git
   cd Whatsapp-Web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Code Style Guidelines

### JavaScript
- Use `const` for variables that don't change
- Use `let` for variables that do change
- Avoid `var`
- Use meaningful variable names
- Add comments for complex logic
- Handle errors properly

### HTML
- Use semantic HTML5 elements
- Keep structure clean and organized
- Use proper indentation (2 spaces)

### CSS
- Use meaningful class names
- Group related styles together
- Keep selectors simple
- Comment major sections

## Testing

Before submitting a PR:
1. Test all functionality manually
2. Ensure no console errors
3. Test on different browsers if possible
4. Verify Docker build works (if applicable)

## Project Structure

```
Whatsapp-Web/
├── server.js           # Main server file
├── package.json        # Dependencies
├── Dockerfile          # Docker config
├── docker-compose.yml  # Docker Compose config
├── .gitignore         # Git ignore rules
├── public/            # Frontend files
│   ├── index.html     # Main HTML
│   ├── styles.css     # Styles
│   └── app.js         # Frontend JS
├── README.md          # Main documentation
├── QUICKSTART.md      # Quick start guide
├── FEATURES.md        # Feature list
└── CONTRIBUTING.md    # This file
```

## What We're Looking For

Good contributions:
- ✅ Bug fixes
- ✅ Performance improvements
- ✅ Code quality improvements
- ✅ Documentation improvements
- ✅ UI/UX enhancements
- ✅ Security improvements
- ✅ Accessibility improvements

Please avoid:
- ❌ Adding heavy dependencies
- ❌ Breaking existing functionality
- ❌ Major architectural changes without discussion
- ❌ Features that complicate the setup process

## Security

If you discover a security vulnerability:
1. **DO NOT** create a public issue
2. Email the maintainers privately
3. Provide details about the vulnerability
4. Allow time for a fix before public disclosure

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue for questions or join discussions in existing issues.

Thank you for contributing! 🎉
