[join discord server](https://discord.gg/NTKHD9pW) 

### current priority 
- chromium extension 


# Klariti OS

## 🎯 NEW: Challenges Dashboard Feature

**Now Live!** Full-featured productivity challenges management system integrated into the klariti.so dashboard.

### Quick Links:
- 📖 [Challenges Feature Guide](./CHALLENGES_FEATURE.md) - Complete user documentation
- 🏗️ [Implementation Details](./CHALLENGES_IMPLEMENTATION.md) - Technical overview
- 🚀 [Quick Start Guide](./CHALLENGES_QUICKSTART.md) - Setup & testing
- 🔧 [Architecture Diagram](./CHALLENGES_ARCHITECTURE.md) - Component structure

### What You Can Do:
- ✅ **Create Challenges** - Time-based or toggle challenges with custom settings
- ✅ **Browse Challenges** - Discover challenges from the community
- ✅ **Join Challenges** - Participate in any challenge
- ✅ **Track Progress** - View your challenge statistics
- ✅ **Manage Challenges** - Update and toggle your created challenges
- ✅ **Block Websites** - Configure distracting websites to block

### Access:
- 🌐 **Main Page**: `/challenges` - Dedicated challenges interface
- 🎮 **Dashboard**: `/playground` - Integrated with other tools

---

## [Manifesto] : Project anti zuckerberg


> We believe that technology should serve people, not exploit them. We reject addictive designs and data commodification. We hence prioritize transparency, privacy, and digital well-being. Our tools empower users to reclaim their time, align technology with human values, and live balanced, productive lives.


### We are developing a system to address the growing issue of digital addiction and its associated impacts. This initiative includes creating a web application, a Chrome extension, and a mobile app. The project will involve conducting research on brain activity linked to interactions with specific digital platforms, such as Instagram. Insights from this research will guide the design of effective solutions to counteract highly addictive algorithms.


---

# [suggested] Repository Structure (there will be some changes)
 
```graphql
klariti-OS/
│
├── extensions/
│   ├── chromium/        # Chromium-based browser extension
│   ├── firefox/         # Firefox-specific implementation or adaptations
│   ├── safari/          # Safari-specific implementation or adaptations
│   └── shared/          # Shared code or assets used across all extensions
│
├── mobile/
│   ├── android/         # Android-specific code
│   ├── ios/             # iOS-specific code
│   └── shared/          # Shared code (if using a cross-platform framework like Flutter or React Native)
│
├── desktop/
│   ├── electron/        # If using Electron or similar frameworks
│   ├── macos/           # macOS-specific implementation (if native)
│   ├── windows/         # Windows-specific implementation (if native)
│   ├── linux/           # Linux-specific implementation (if native)
│   └── shared/          # Shared code for the desktop apps
│
├── backend/             # Backend services for sync, data storage, or APIs
│   ├── api/             # API implementation
│   ├── database/        # Database migrations or setup
│   └── auth/            # Authentication logic
│
├── common/              # Shared utilities, constants, or libraries across all platforms
│   ├── utils/
│   ├── config/
│   └── assets/          # Common assets like icons, images, etc.
│
├── docs/                # Documentation for the project
│   ├── api/             # API documentation
│   ├── development/     # Development guidelines and setup instructions
│   └── user/            # User-facing documentation (e.g., README, FAQ)
│
├── tests/               # Centralized test cases (unit, integration, E2E)
│   ├── extensions/
│   ├── mobile/
│   ├── desktop/
│   ├── backend/
│   └── common/
│
├── scripts/             # Helper scripts for building, testing, or deployment
│   ├── build/           # Build scripts
│   ├── deploy/          # Deployment scripts
│   └── setup/           # Environment setup scripts
│
├── .github/             # GitHub-specific configuration
│   ├── workflows/       # CI/CD pipeline configurations
│   └── ISSUE_TEMPLATE/  # Issue templates for contributors
│
├── package.json         # Dependencies (if using Node.js for parts of the project)
├── README.md            # Main project README
└── LICENSE              # Project license
```

---

## Development

### Prerequisites
- **Node.js** (for extensions and some shared utilities)
- **Android Studio** and/or **Xcode** (for mobile apps)
- **Electron** (for desktop apps)
- **Docker** (for backend services)
- **Git** (for version control)

### Getting Started
1. Clone the repository:
   ```bash
   git clone https://github.com/snwtr/klariti-os.git
   cd <repo-name>
   ```

2. Install dependencies for the component you want to work on. For example:
   ```bash
   # For extensions
   cd extensions/chromium
   npm install
   ```

3. Start the development environment:
   ```bash
   npm start
   ```

---

## Contributing
We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your feature description here"
   ```
4. Push to your fork and submit a pull request.

Refer to the `CONTRIBUTING.md` file in the `docs/development/` directory for more details.

---

## Testing
Tests are organized by component under the `tests/` directory. Run tests using:

```bash
npm test
```

Refer to individual component directories for specific testing instructions.

---

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Contact
For inquiries or support, contact [klariti@googlegroups.com](mailto:klariti@googlegroups.com).


![sample image](common/assets/snwtr.png)
