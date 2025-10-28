# UPZ0.3 - Universal AI Project Zipper

<div align="center">
  <p><strong>Your AI-powered software architect.</strong></p>
  <p>Scaffold, refactor, and document entire projects from a simple idea, GitHub repo, local files, or an interactive chat.</p>
</div>

---

**UPZ0.3** is a versatile web-based tool designed to supercharge your software development lifecycle. It leverages multiple AI providers (like Google Gemini, Groq, and more) to help you scaffold entire projects from scratch, refactor existing code, generate comprehensive documentation, write tests, and much more—all within a full-featured, highly customizable development environment.

## ✨ Key Features

- **Flexible Input Methods**: Start a project from:
  - 📝 **A Simple Idea**: Let the AI expand your concept into a complete, ready-to-use file structure.
  - 📂 **Local Files/Folders**: Upload your existing project to refactor, document, or enhance it.
  - 🐙 **A GitHub Repository**: Just paste a public URL to clone and start working.
  - 💬 **Interactive Architect Chat**: Converse with an AI architect to define your project requirements from the ground up.
  - 📄 **Gemini Chat Import**: Import an entire conversation from Gemini via a **share link** or an exported `.txt`/`.md` file to turn your brainstorming session into code.
- **Powerful & Customizable AI Engine**:
  - 🔧 **Multi-Provider Support**: Choose different AI providers (Google, Groq, OpenRouter, etc.) and models for different tasks. Optimize for speed, cost, or code quality.
  - ⚙️ **Editable Prompts**: Fine-tune every built-in AI prompt to match your specific needs and coding style.
  - 🚀 **On-Demand AI Actions**: Refactor code, add docstrings, generate unit tests, improve your README, create a project wiki, and more with a single click.
- **Integrated Code Editor**:
  - 🌳 **File Tree Navigation**: Easily browse and manage your project files.
  - ↔️ **Diff Viewer**: Visually review all AI-generated changes before accepting them.
  - 💾 **Full Manual Control**: Add, delete, and modify files directly in the editor.
- **Seamless GitHub Integration**:
  - 🔐 **Secure Authentication**: Add your GitHub Personal Access Token in the settings.
  - ✨ **Direct Export**: Push your entire project to a **new or existing** GitHub repository directly from the app.
- **Zero Installation**: Runs entirely in your browser. Your API keys are stored locally and never leave your machine.
- **Multiple Export Options**:
    - 📦 Download your complete project as a ZIP file.
    - 🚀 Export directly to a GitHub repository.

For detailed instructions on all features, check out the integrated **User Guide** (click the '?' icon in the app) or read the [file directly](./docs/USER_GUIDE.md).

## 🚀 Deployment

This project has been prepared for streamlined deployment. In our [**Deployment Guide**](./docs/ARCHITECTURE.md#esempi-di-deployment) you will find copy-and-paste configuration examples for Netlify, Vercel, and Docker.

## 🛠️ Development Setup

Interested in contributing to UPZ0.3? That's great! Here's how to get started:

1.  **Fork the repository**.
2.  **Clone your fork**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/upz-project.git
    cd upz-project
    ```
3.  **Serve the files**:
    - This is a zero-build project. You just need a local web server.
    - An easy way is to use the `Live Server` extension in VS Code.
    - Alternatively, use Python's built-in server:
      ```bash
      python -m http.server
      ```
4.  **Open your browser** to the address provided by your local server.
5.  **Configure Settings**: Click the gear icon in the app to add your API keys for the AI providers you wish to use. The Google Gemini API key must be set as an environment variable (a `.env` file is a good way to manage this locally).

## 🤝 Contributing

Contributions are welcome! Please read our [**Contribution Guidelines**](CONTRIBUTING.md) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes.

All contributors are expected to uphold our [**Code of Conduct**](CODE_OF_CONDUCT.md).

## 📄 License

This project is licensed under the MIT License. See the [**LICENSE**](LICENSE) file for details.