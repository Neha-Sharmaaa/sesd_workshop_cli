# Cosmic CLI (SESD Workshop)

A simple Node.js CLI built with TypeScript, Commander, Axios, and Chalk. Based on [custom_cli](https://github.com/mrsandy1965/custom_cli).

**Structure:** Everything is in a single file — `cosmic.ts` — matching the reference repo.

## Features

- Colored terminal output via `chalk`
- Input validation with helpful error messages
- **Feature A: Interactive Prompts**: If you forget to provide required arguments (such as numbers to add, or a username to fetch), the CLI will interactively ask you for them using `inquirer`.
- **Feature B: Configuration File**: You can set global defaults (like your default GitHub username or your own name) so you don't have to type them every time. Saved in `~/.sesd_cli.json`.
- `--version` / `-v` flag support
- 11 commands spanning math, APIs, and utilities

## Requirements

- Node.js `20.x` (LTS recommended)
- npm

## Installation

```bash
npm install
```

## Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

Output is generated in `dist/`.

## Run Locally

After building:

```bash
node dist/cosmic.js <command>
# or
npm start -- <command>
```

## Install as a Global CLI

```bash
npm run build
npm link
```

Then run commands directly:

```bash
cosmic <command>
```

## Available Commands

| Command                  | Description                                |
| ------------------------ | ------------------------------------------ |
| config [action] [key] [val] | Set, get, or list default configurations |
| greet [name]             | Greet a user by name                       |
| add [num1] [num2]        | Add two numbers                            |
| subtract [num1] [num2]   | Subtract second number from first          |
| multiply [num1] [num2]   | Multiply two numbers                       |
| divide [num1] [num2]     | Divide first number by second              |
| hasao                    | Fetch a random joke from the internet      |
| github [username]        | Fetch GitHub user info                     |
| quote                    | Fetch a random inspirational quote         |
| coinflip                 | Flip a coin — heads or tails?              |
| roll [sides]             | Roll a dice (default: 6 sides)             |
| fileinfo [filename]      | Show file size, path, and extension        |

## Example Usage

```bash
# Set a default name
cosmic config set name Sandesh

# Fetch github info (will prompt if not provided and not in config!)
cosmic github
```
cosmic greet Sandesh
cosmic add 10 5
cosmic divide 20 4
cosmic hasao
cosmic github octocat
cosmic quote
cosmic coinflip
cosmic roll 20
cosmic fileinfo package.json
```

## Notes

- `divide` handles division by zero and prints an error message.
- `hasao`, `github`, and `quote` depend on internet connectivity.
- `roll` defaults to a 6-sided die if no argument is given.
