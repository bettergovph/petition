# Petitions by BetterGov.ph

A modern, community-driven petition platform empowering Filipino citizens to create meaningful change. Built for transparency, accessibility, and impact.

## 🇵🇭 About

**Petitions by BetterGov.ph** is a free, open-source platform that enables Filipino citizens to:

- Create and share petitions for local and national issues
- Gather support from communities across the Philippines
- Track petition progress and engagement
- Connect with like-minded advocates for change

This platform is part of the [BetterGov.ph](https://bettergov.ph) initiative to improve governance and civic engagement in the Philippines.

## ✨ Features

- 📝 **Create Petitions** - Rich text editor with image support
- 🗳️ **Sign & Support** - Anonymous or public signatures with comments
- 🏛️ **Local & National** - Target specific regions or the entire country
- 📊 **Real-time Progress** - Live signature counts and progress tracking
- 🏷️ **Categorized** - Environment, Education, Healthcare, Social Justice, and more
- 📱 **Mobile-Friendly** - Works seamlessly on all devices
- 🔒 **Privacy-First** - Anonymous signing options and data protection

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- [Cloudflare CLI (Wrangler)](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/bettergovph/petition.git
   cd petition
   npm install
   ```

2. **Set up the database**

   ```bash
   npm run db:setup
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**

   Visit `http://localhost:5173` to see the platform in action!

> For detailed setup instructions and technical documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🤝 Contributing

We welcome contributions from developers, designers, and advocates who want to help improve civic engagement in the Philippines!

### How to Contribute

1. **Fork the repository** on GitHub
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** and test them locally
4. **Commit your changes** (`git commit -m 'Add amazing feature'`)
5. **Push to your branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request** with a clear description of your changes

### Development Guidelines

- Follow the existing code style and conventions
- Add tests for new features when applicable
- Update documentation for significant changes
- Keep commits focused and write clear commit messages

### Ways to Contribute

- 🐛 **Report bugs** - Help us identify and fix issues
- 💡 **Suggest features** - Share ideas for platform improvements
- 🔧 **Code contributions** - Fix bugs, add features, improve performance
- 📖 **Documentation** - Help improve setup guides and user documentation
- 🎨 **Design** - Contribute to UI/UX improvements
- 🌐 **Translation** - Help translate the platform to other Filipino languages

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test:e2e     # Run end-to-end tests
npm run lint         # Check code quality
npm run format       # Format code with Prettier
```

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Cloudflare Workers/Pages Functions
- **Database**: Cloudflare D1 (SQLite)
- **Deployment**: Cloudflare Pages
- **Testing**: Playwright E2E tests

## 📞 Support & Community

- **Issues**: [GitHub Issues](https://github.com/bettergovph/petition/issues)
- **Discussions**: [GitHub Discussions](https://github.com/bettergovph/petition/discussions)
- **Website**: [BetterGov.ph](https://bettergov.ph)
- **Email**: [hello@bettergov.ph](mailto:hello@bettergov.ph)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Built by the [BetterGov.ph](https://bettergov.ph) community
- Powered by [Cloudflare](https://cloudflare.com) infrastructure
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)

---

**Made with ❤️ for the Philippines** 🇵🇭

_Empowering citizens to create meaningful change through technology and community._
