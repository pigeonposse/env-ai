
# env-ai - AI Assistant for Your Local Environment

[![Web](https://img.shields.io/badge/Web-grey?style=for-the-badge&logoColor=white)](https://pigeonposse.com)
[![About Us](https://img.shields.io/badge/About%20Us-grey?style=for-the-badge&logoColor=white)](https://pigeonposse.com?popup=about)
[![Donate](https://img.shields.io/badge/Donate-pink?style=for-the-badge&logoColor=white)](https://pigeonposse.com/?popup=donate)
[![Github](https://img.shields.io/badge/Github-black?style=for-the-badge&logo=github&logoColor=white)](https://github.com/pigeonposse)
[![Twitter](https://img.shields.io/badge/Twitter-black?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/pigeonposse_)
[![Instagram](https://img.shields.io/badge/Instagram-black?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/pigeon.posse/)
[![Medium](https://img.shields.io/badge/Medium-black?style=for-the-badge&logo=medium&logoColor=white)](https://medium.com/@pigeonposse)

[![License](https://img.shields.io/github/license/pigeonposse/env-ai?color=green&style=for-the-badge&logoColor=white)](/LICENSE)
[![Core](https://img.shields.io/npm/v/env-ai?color=blue&style=for-the-badge&logoColor=white)](https://www.npmjs.com/package/env-ai)


**env-ai** is an intelligent assistant tool for your terminal, designed to help you with tasks like documentation, performance optimization, refactoring, and more, using custom commands. 

> [!IMPORTANT]  
> **env-ai** needs the **[Ollama](https://ollama.com)** technology to work. Make sure you have it installed before using this CLI.


## 📑 Index

- [🌟 Features](#-features)
- [📦 Installation](#-installation)
- [📖 Using the CLI](#-using-the-cli)
   - [Main Commands](#main-commands)
   - [Options](#options)
   - [Usage Example](#usage-example)
- [📚 Using the Library](#-using-the-library)
   - [Import Example](#import-example)
   - [Defined Configuration](#defined-configuration)
- [🔍 Examples](#-examples)
- [👨‍💻 Development](#-development)
- [☕ Donate](#-donate)
- [📜 License](#-license)
- [🐦 About Us](#-about-us)

## 🌟 Features

- 💬 **Real-Time Chat**: Interact with the AI assistant directly from your terminal.
- 🗃️ **Robust context**: Accepts URL and local file inputs so the wizard has more precise context of what to do.
- 🎨 **Extensive Customization**: Configure themes, inputs and outputs to your liking.
- 📄 **Configuration File Support**: Make your chat systems portable. Compatible with multiple formats, including `.mjs`, `.js`, `.json`, `.yml`, `.yaml`, `.toml`, and `.tml`.
- ✈️ **Portable**: Create a chat system, save it in a configuration file and use it for other projects.
- 🌐 **Multiple Environments**:
  - 📦 **JavaScript Library**: Easily integrable into your projects.
  - 💻 **Command Line Interface (CLI)**: Works in:
    - 🟢 **Node.js**
    - 🦕 **Deno**
    - 🍞 **Bun**
  - 🚀 **Binary**: Available for all operating systems and architectures via [GitHub Releases](https://github.com/pigeonposse/env-ai/releases).

## 📦 Installation

Install the CLI or add it as a dependency to your project:

```bash
## npm
npm install env-ai
## pnpm
pnpm add env-ai
## yarn
yarn add env-ai
# bun
bun add env-ai
# deno
deno add env-ai
```

### global Installation

```bash
## npm
npm install -g env-ai
## pnpm
pnpm add -g env-ai
## yarn
yarn global add env-ai
```

### without Installation

```bash
## npm
npx env-ai
## pnpm
pnpx env-ai
```

## 📖 Using the CLI

The **env-ai** CLI allows you to easily interact with the AI assistant. Here are some useful commands and options:

### Main Commands

```bash
# Start a chat with the AI assistant
env-ai chat
```

### Options

- `-i, --input` - Path patterns or URLs to be processed. *(array)*
- `-m, --model` - Name of the Ollama model to use. *(string)*
- `-p, --prompt` -  Fist prompt to generate a response (text, path or url). *(string)*
- `-s, --system` - Custom system text or path. *(string)*
- `-t, --theme` - Topic of conversation (`custom`, `explain`, `docs`, `fix`, `performance`, `refactor`, `tests`). *(string)*
- `-o, --output` - Output path for the generated response. *(string)*
- `--overwrite` - Behavior control if the output file exists (`always`, `ask`, `last`). *(boolean)*
- `--single` - Get only one response. *(boolean)*
- `-c, --config` - Path to config file. Files supported: [.mjs|.js|.json|.yml|.yaml|.toml|.tml]. *(string)*
- `--debug` - Debug mode. *(boolean)*
- `-h, --help` - Show help. *(boolean)*
- `-v, --version` - Show version number. *(boolean)*


## 📚 Using the Library

**env-ai** can also be integrated as a library into your `JavaScript` or `TypeScript` project.
### Import Example

```javascript
import { run } from 'env-ai';

run({
    input: ['./src/**', 'https://example.com'],
    theme: 'docs',
    output: 'README.md',
});
```

### Defined Configuration

Use `defineConfig` to define a reusable configuration:

```javascript
import { defineConfig } from 'env-ai';

export default defineConfig({
    input: ['./src/**', 'https://example.com'],
    theme: 'docs',
    output: 'README.md',
});
```

## 🔍 Examples

You can see more examples [here](./examples).


### CLI

```bash
env-ai chat -i "./src/**" -t "docs" -o "output.md"
```

### Library

```javascript
import { run } from 'env-ai';

run({
    input: ['./src/**', 'https://example.com'],
    theme: 'docs',
    output: 'README.md',
});
```

### CLI With `js` config file 

```bash
env-ai chat --config dovenv.config.js
```
```js
import { defineConfig } from 'env-ai';

export default defineConfig({
    model: 'llama3.2:latest',
    input: ['./src/**', 'https://example.com'],
    theme: 'docs',
    output: 'README.md',
});
```

### CLI With `json` config file 

```bash
env-ai chat --config dovenv.config.json
```

```json
{
    "theme": "custom",
    "system": "./your-system-content.txt"
}
```

### CLI With `toml` config file 

```bash
env-ai chat --config documentation-context.toml
```

```toml
theme = "docs"
input = ["./docs", "./src"]
system = """
You are a helpful assistant explaining how to use the provided code library and provide detailed documentation.
The content for the following code library:

{{content}}
"""
```

### CLI With `yaml` config file 

```bash
env-ai chat --config dovenv.config.yaml
```

```yaml
theme: custom
system: ./your-system-content.md
```
### CLI - Input with excluded files

It includes all SRC files that are at the upper level.

```bash
env-ai chat -i 'src/*' '!src/../*' -t 'docs' -o 'output.md'
```

## 👨‍💻 Development

**env-ai** is an open-source project and its development is open to anyone who wants to participate.

[![TODO](https://img.shields.io/badge/TODO-grey?style=for-the-badge)](./docs/todo/)
[![Issues](https://img.shields.io/badge/Issues-grey?style=for-the-badge)](https://github.com/pigeonposse/env-ai/issues)
[![Pull requests](https://img.shields.io/badge/Pulls-grey?style=for-the-badge)](https://github.com/pigeonposse/env-ai/pulls)
[![Read more](https://img.shields.io/badge/Read%20more-grey?style=for-the-badge)](https://env-ai.pigeonposse.com/)

## ☕ Donate

Help us to develop more interesting things.

[![Donate](https://img.shields.io/badge/Donate-grey?style=for-the-badge)](https://pigeonposse.com/?popup=donate)

## 📜 License

This software is licensed with **[GPL-3.0](/LICENSE)**.

[![Read more](https://img.shields.io/badge/Read-more-grey?style=for-the-badge)](/LICENSE)

## 🐦 About us

_PigeonPosse_ is a ✨ **code development collective** ✨ focused on creating practical and interesting tools that help developers and users enjoy a more agile and comfortable experience. Our projects cover various programming sectors and we do not have a thematic limitation in terms of projects.

[![More](https://img.shields.io/badge/Read-more-grey?style=for-the-badge)](https://github.com/pigeonposse)

### Collaborators

|                                                                                    | Name        | Role         | GitHub                                         |
| ---------------------------------------------------------------------------------- | ----------- | ------------ | ---------------------------------------------- |
| <img src="https://github.com/angelespejo.png?size=72" alt="Angelo" style="border-radius:100%"/> | Angelo |   Idea & Development & UI Design   | [@angelespejo](https://github.com/angelespejo) |
| <img src="https://github.com/PigeonPosse.png?size=72" alt="PigeonPosse" style="border-radius:100%"/> | PigeonPosse | Collective | [@PigeonPosse](https://github.com/PigeonPosse) |

<br>
<p align="center">

[![Web](https://img.shields.io/badge/Web-grey?style=for-the-badge&logoColor=white)](https://pigeonposse.com)
[![About Us](https://img.shields.io/badge/About%20Us-grey?style=for-the-badge&logoColor=white)](https://pigeonposse.com?popup=about)
[![Donate](https://img.shields.io/badge/Donate-pink?style=for-the-badge&logoColor=white)](https://pigeonposse.com/?popup=donate)
[![Github](https://img.shields.io/badge/Github-black?style=for-the-badge&logo=github&logoColor=white)](https://github.com/pigeonposse)
[![Twitter](https://img.shields.io/badge/Twitter-black?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/pigeonposse_)
[![Instagram](https://img.shields.io/badge/Instagram-black?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/pigeon.posse/)
[![Medium](https://img.shields.io/badge/Medium-black?style=for-the-badge&logo=medium&logoColor=white)](https://medium.com/@pigeonposse)

</p>
