#!/usr/bin/env node
import { Command } from "commander";
import axios from "axios";
import chalk from "chalk";
import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import os from "os";


const CONFIG_FILE = path.join(os.homedir(), ".sesd_cli.json");

function loadConfig(): Record<string, any> {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      console.warn(chalk.yellow("Warning: Could not parse config file. Using defaults."));
    }
  }
  return {};
}

function saveConfig(config: Record<string, any>) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
    console.log(chalk.green("Configuration saved successfully."));
  } catch (err) {
    console.error(chalk.red("Failed to save configuration."));
  }
}


const userConfig = loadConfig();

interface ICommand {
  execute(...args: any[]): void | Promise<void>;
}


async function promptForMissingArgument(message: string, type: "input" | "number" = "input"): Promise<string> {
  const { answer } = await inquirer.prompt([
    {
      type: "input",
      name: "answer",
      message: message,
      validate: (input) => {
        if (type === "number" && isNaN(parseFloat(input))) {
          return "Please enter a valid number.";
        }
        return input ? true : "This field is required.";
      },
    },
  ]);
  return answer;
}

class ConfigCommand implements ICommand {
  async execute(action?: string, key?: string, value?: string) {
    if (!action) action = await promptForMissingArgument("Enter config action (set/get/list):");

    if (action === "set") {
      if (!key) key = await promptForMissingArgument("Enter config key to set:");
      if (!value) value = await promptForMissingArgument(`Enter value for ${key}:`);
      userConfig[key] = value;
      saveConfig(userConfig);
    } else if (action === "get") {
      if (!key) key = await promptForMissingArgument("Enter config key to get:");
      console.log(chalk.cyan(`${key}: ${userConfig[key] ?? "Not set"}`));
    } else if (action === "list") {
      console.log(chalk.green("\nCurrent Configuration:"));
      console.dir(userConfig, { colors: true });
    } else {
      console.log(chalk.red("Invalid config action. Use set, get, or list."));
    }
  }
}

class GreetCommand implements ICommand {
  async execute(name?: string) {
    if (!name && !userConfig.name) {
      name = await promptForMissingArgument("What is your name?");
    }
    const finalName = name || userConfig.name || "user";
    console.log(chalk.green(`Hello, ${finalName}! Welcome to Cosmic CLI!`));
  }
}

class AddCommand implements ICommand {
  async execute(num1?: string, num2?: string) {
    if (!num1) num1 = await promptForMissingArgument("Enter first number to add:", "number");
    if (!num2) num2 = await promptForMissingArgument("Enter second number to add:", "number");

    const a = parseFloat(num1), b = parseFloat(num2);
    if (isNaN(a) || isNaN(b)) return console.log(chalk.red("Both arguments must be numbers."));
    console.log(chalk.yellow(`The sum is ${a + b}`));
  }
}

class SubtractCommand implements ICommand {
  async execute(num1?: string, num2?: string) {
    if (!num1) num1 = await promptForMissingArgument("Enter first number:", "number");
    if (!num2) num2 = await promptForMissingArgument("Enter second number to subtract:", "number");

    const a = parseFloat(num1), b = parseFloat(num2);
    if (isNaN(a) || isNaN(b)) return console.log(chalk.red("Both arguments must be numbers."));
    console.log(chalk.yellow(`The difference is ${a - b}`));
  }
}

class MultiplyCommand implements ICommand {
  async execute(num1?: string, num2?: string) {
    if (!num1) num1 = await promptForMissingArgument("Enter first number:", "number");
    if (!num2) num2 = await promptForMissingArgument("Enter second number to multiply:", "number");

    const a = parseFloat(num1), b = parseFloat(num2);
    if (isNaN(a) || isNaN(b)) return console.log(chalk.red("Both arguments must be numbers."));
    console.log(chalk.yellow(`The product is ${a * b}`));
  }
}

class DivideCommand implements ICommand {
  async execute(num1?: string, num2?: string) {
    if (!num1) num1 = await promptForMissingArgument("Enter numerator:", "number");
    if (!num2) num2 = await promptForMissingArgument("Enter denominator:", "number");

    const a = parseFloat(num1), b = parseFloat(num2);
    if (isNaN(a) || isNaN(b)) return console.log(chalk.red("Both arguments must be numbers."));
    if (b === 0) return console.log(chalk.red("Division by zero is not allowed."));
    console.log(chalk.yellow(`The quotient is ${a / b}`));
  }
}

class JokeCommand implements ICommand {
  async execute() {
    try {
      const { data } = await axios.get("https://official-joke-api.appspot.com/random_joke");
      console.log(chalk.magenta(`${data.setup}`));
      console.log(chalk.cyan(`   ${data.punchline}`));
    } catch (err) {
      console.log(chalk.red("Could not fetch a joke. Check your internet."));
    }
  }
}

class GitHubCommand implements ICommand {
  async execute(username?: string) {
    if (!username && !userConfig.github) {
      username = await promptForMissingArgument("Enter a GitHub username:");
    }
    const finalUsername = username || userConfig.github;

    try {
      const { data } = await axios.get(`https://api.github.com/users/${encodeURIComponent(finalUsername)}`);
      console.log(chalk.green(`\nGitHub User: ${data.login}`));
      console.log(`   Name        : ${data.name ?? "N/A"}`);
      console.log(`   Bio         : ${data.bio ?? "N/A"}`);
      console.log(`   Public Repos: ${data.public_repos}`);
      console.log(`   Followers   : ${data.followers}`);
      console.log(`   Following   : ${data.following}`);
      console.log(chalk.cyan(`   Profile     : ${data.html_url}\n`));
    } catch (err) {
      console.log(chalk.red(`GitHub user "${finalUsername}" not found or API limits exceeded.`));
    }
  }
}

class QuoteCommand implements ICommand {
  async execute() {
    try {
      const { data } = await axios.get("https://dummyjson.com/quotes/random");
      console.log(chalk.cyan(`\n"${data.quote}"`));
      console.log(chalk.gray(`           — ${data.author}\n`));
    } catch (err) {
      console.log(chalk.red("Could not fetch a quote. Check your internet."));
    }
  }
}

class CoinFlipCommand implements ICommand {
  execute() {
    const result = Math.random() < 0.5 ? "Heads" : "Tails";
    console.log(chalk.yellow(`The coin landed on: ${chalk.bold(result)}`));
  }
}

class RollDiceCommand implements ICommand {
  execute(sides?: string) {
    const s = sides ? parseInt(sides, 10) : 6;
    const maxSides = isNaN(s) || s < 2 ? 6 : s;
    const roll = Math.floor(Math.random() * maxSides) + 1;
    console.log(
      chalk.yellow(
        `You rolled a ${chalk.bold(roll)}${maxSides !== 6 ? ` (${maxSides}-sided die)` : ""}`
      )
    );
  }
}

class FileInfoCommand implements ICommand {
  async execute(filename?: string) {
    if (!filename) filename = await promptForMissingArgument("Enter the filename or path to inspect:");

    const fullPath = path.resolve(filename);
    if (!fs.existsSync(fullPath)) return console.log(chalk.red(`File not found: ${fullPath}`));
    const stats = fs.statSync(fullPath);
    console.log(chalk.green(`\nFile Info: ${path.basename(fullPath)}`));
    console.log(`   Full Path : ${fullPath}`);
    console.log(`   Extension : ${path.extname(fullPath) || "none"}`);
    console.log(`   Size      : ${stats.size} bytes`);
    console.log(`   Modified  : ${stats.mtime.toLocaleString()}\n`);
  }
}


export const program = new Command();
program.version("1.0.0", "-v, --version", "Output the current version");

program
  .command("config [action] [key] [value]")
  .description("Manage configuration settings. Actions: set, get, list. (e.g. config set github myusername)")
  .action(async (action?: string, key?: string, value?: string) => {
    await new ConfigCommand().execute(action, key, value);
  });

program
  .command("greet [name]")
  .description("Greet a user by name")
  .action((name?: string) => new GreetCommand().execute(name));

program
  .command("add [num1] [num2]")
  .description("Add two numbers")
  .action((num1?: string, num2?: string) => new AddCommand().execute(num1, num2));

program
  .command("subtract [num1] [num2]")
  .description("Subtract the second number from the first")
  .action((num1?: string, num2?: string) => new SubtractCommand().execute(num1, num2));

program
  .command("multiply [num1] [num2]")
  .description("Multiply two numbers")
  .action((num1?: string, num2?: string) => new MultiplyCommand().execute(num1, num2));

program
  .command("divide [num1] [num2]")
  .description("Divide the first number by the second")
  .action((num1?: string, num2?: string) => new DivideCommand().execute(num1, num2));

program
  .command("hasao")
  .description("Fetch a random joke from the internet")
  .action(() => new JokeCommand().execute());

program
  .command("github [username]")
  .description("Fetch GitHub user info")
  .action((username?: string) => new GitHubCommand().execute(username));

program
  .command("quote")
  .description("Fetch a random inspirational quote")
  .action(() => new QuoteCommand().execute());

program
  .command("coinflip")
  .description("Flip a coin — heads or tails?")
  .action(() => new CoinFlipCommand().execute());

program
  .command("roll [sides]")
  .description("Roll a dice (default: 6 sides)")
  .action((sides?: string) => new RollDiceCommand().execute(sides));

program
  .command("fileinfo [filename]")
  .description("Show basic info about a file (size, path, extension)")
  .action((filename?: string) => new FileInfoCommand().execute(filename));


program.parse(process.argv);
