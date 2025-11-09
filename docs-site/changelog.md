# Changelog

All notable changes to Kachina-MD will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.5] - 2025-11-09

### Added
- 📚 **VitePress Documentation Site** - Complete documentation website with modern UI
- 👁️ **View Once Reader** - `readViewOnce()` and `sendViewOnce()` methods for reading view once messages
- 🔐 **Enhanced Pairing Mode** - Improved pairing code authentication with better error handling
- 🎨 **Sticker Integration** - Sticker helper functions integrated into Client class
- 📖 **Comprehensive Guides** - Full documentation for authentication, features, and deployment
- 🚀 **GitHub Actions** - Automated docs deployment to GitHub Pages

### Fixed
- Pairing code not displaying properly in console
- Phone number validation for pairing method
- View once message detection logic

### Changed
- Improved error messages for pairing authentication
- Better console output formatting for pairing codes
- Enhanced type definitions for sticker methods

## [2.0.4] - 2025-11-09

### Added
- 🔐 **Pairing Code Authentication** - Alternative login method without QR code
- 📝 **Documentation** - Comprehensive pairing mode documentation
- 🎨 **Sticker Support** - Complete sticker creation functionality
- 🔄 **Auto Reconnect** - Improved reconnection handling
- 📊 **GitHub Actions** - CI/CD pipeline for npm publishing

### Changed
- Updated Client constructor to support pairing method
- Improved event handling system
- Better session management

## [2.0.3] - 2025-11-08

### Added
- Plugin system improvements
- Better error handling
- Enhanced message serialization

### Fixed
- Connection stability issues
- Message handling bugs
- Group management edge cases

## [2.0.2] - 2025-11-07

### Added
- Complete message handling API
- Group management features
- Media message support
- Polls and reactions

### Changed
- Improved Client API
- Better TypeScript support
- Enhanced examples

## [2.0.1] - 2025-11-06

### Fixed
- Build process improvements
- Dependency updates
- Documentation fixes

## [2.0.0] - 2025-11-05

### Added
- 🎉 **Initial Release** - Complete rewrite with modern architecture
- Client-based API
- Event-driven architecture
- Plugin system
- Comprehensive examples
- Full TypeScript support

### Breaking Changes
- Complete API redesign
- New event system
- Different configuration format

## [1.x] - Legacy

Previous versions used a different architecture and are no longer maintained.

---

## Release Notes Format

- 🎉 New features
- ✨ Enhancements
- 🐛 Bug fixes
- 🔒 Security updates
- ⚡ Performance improvements
- 📚 Documentation
- 🔧 Configuration changes
- 💥 Breaking changes

## Links

- [NPM Package](https://www.npmjs.com/package/@roidev/kachina-md)
- [GitHub Repository](https://github.com/idlanyor/kachina-core)
- [Documentation](https://idlanyor.github.io/kachina-core/)
