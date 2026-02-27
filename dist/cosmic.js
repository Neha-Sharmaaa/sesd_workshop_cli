#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.program = void 0;
const commander_1 = require("commander");
const axios_1 = __importDefault(require("axios"));
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const CONFIG_FILE = path_1.default.join(os_1.default.homedir(), ".sesd_cli.json");
function loadConfig() {
    if (fs_1.default.existsSync(CONFIG_FILE)) {
        try {
            const data = fs_1.default.readFileSync(CONFIG_FILE, "utf-8");
            return JSON.parse(data);
        }
        catch (err) {
            console.warn(chalk_1.default.yellow("Warning: Could not parse config file. Using defaults."));
        }
    }
    return {};
}
function saveConfig(config) {
    try {
        fs_1.default.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
        console.log(chalk_1.default.green("Configuration saved successfully."));
    }
    catch (err) {
        console.error(chalk_1.default.red("Failed to save configuration."));
    }
}
const userConfig = loadConfig();
async function promptForMissingArgument(message, type = "input") {
    const { answer } = await inquirer_1.default.prompt([
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
class ConfigCommand {
    async execute(action, key, value) {
        if (!action)
            action = await promptForMissingArgument("Enter config action (set/get/list):");
        if (action === "set") {
            if (!key)
                key = await promptForMissingArgument("Enter config key to set:");
            if (!value)
                value = await promptForMissingArgument(`Enter value for ${key}:`);
            userConfig[key] = value;
            saveConfig(userConfig);
        }
        else if (action === "get") {
            if (!key)
                key = await promptForMissingArgument("Enter config key to get:");
            console.log(chalk_1.default.cyan(`${key}: ${userConfig[key] ?? "Not set"}`));
        }
        else if (action === "list") {
            console.log(chalk_1.default.green("\nCurrent Configuration:"));
            console.dir(userConfig, { colors: true });
        }
        else {
            console.log(chalk_1.default.red("Invalid config action. Use set, get, or list."));
        }
    }
}
class GreetCommand {
    async execute(name) {
        if (!name && !userConfig.name) {
            name = await promptForMissingArgument("What is your name?");
        }
        const finalName = name || userConfig.name || "user";
        console.log(chalk_1.default.green(`Hello, ${finalName}! Welcome to Cosmic CLI!`));
    }
}
class AddCommand {
    async execute(num1, num2) {
        if (!num1)
            num1 = await promptForMissingArgument("Enter first number to add:", "number");
        if (!num2)
            num2 = await promptForMissingArgument("Enter second number to add:", "number");
        const a = parseFloat(num1), b = parseFloat(num2);
        if (isNaN(a) || isNaN(b))
            return console.log(chalk_1.default.red("Both arguments must be numbers."));
        console.log(chalk_1.default.yellow(`The sum is ${a + b}`));
    }
}
class SubtractCommand {
    async execute(num1, num2) {
        if (!num1)
            num1 = await promptForMissingArgument("Enter first number:", "number");
        if (!num2)
            num2 = await promptForMissingArgument("Enter second number to subtract:", "number");
        const a = parseFloat(num1), b = parseFloat(num2);
        if (isNaN(a) || isNaN(b))
            return console.log(chalk_1.default.red("Both arguments must be numbers."));
        console.log(chalk_1.default.yellow(`The difference is ${a - b}`));
    }
}
class MultiplyCommand {
    async execute(num1, num2) {
        if (!num1)
            num1 = await promptForMissingArgument("Enter first number:", "number");
        if (!num2)
            num2 = await promptForMissingArgument("Enter second number to multiply:", "number");
        const a = parseFloat(num1), b = parseFloat(num2);
        if (isNaN(a) || isNaN(b))
            return console.log(chalk_1.default.red("Both arguments must be numbers."));
        console.log(chalk_1.default.yellow(`The product is ${a * b}`));
    }
}
class DivideCommand {
    async execute(num1, num2) {
        if (!num1)
            num1 = await promptForMissingArgument("Enter numerator:", "number");
        if (!num2)
            num2 = await promptForMissingArgument("Enter denominator:", "number");
        const a = parseFloat(num1), b = parseFloat(num2);
        if (isNaN(a) || isNaN(b))
            return console.log(chalk_1.default.red("Both arguments must be numbers."));
        if (b === 0)
            return console.log(chalk_1.default.red("Division by zero is not allowed."));
        console.log(chalk_1.default.yellow(`The quotient is ${a / b}`));
    }
}
class JokeCommand {
    async execute() {
        try {
            const { data } = await axios_1.default.get("https://official-joke-api.appspot.com/random_joke");
            console.log(chalk_1.default.magenta(`${data.setup}`));
            console.log(chalk_1.default.cyan(`   ${data.punchline}`));
        }
        catch (err) {
            console.log(chalk_1.default.red("Could not fetch a joke. Check your internet."));
        }
    }
}
class GitHubCommand {
    async execute(username) {
        if (!username && !userConfig.github) {
            username = await promptForMissingArgument("Enter a GitHub username:");
        }
        const finalUsername = username || userConfig.github;
        try {
            const { data } = await axios_1.default.get(`https://api.github.com/users/${encodeURIComponent(finalUsername)}`);
            console.log(chalk_1.default.green(`\nGitHub User: ${data.login}`));
            console.log(`   Name        : ${data.name ?? "N/A"}`);
            console.log(`   Bio         : ${data.bio ?? "N/A"}`);
            console.log(`   Public Repos: ${data.public_repos}`);
            console.log(`   Followers   : ${data.followers}`);
            console.log(`   Following   : ${data.following}`);
            console.log(chalk_1.default.cyan(`   Profile     : ${data.html_url}\n`));
        }
        catch (err) {
            console.log(chalk_1.default.red(`GitHub user "${finalUsername}" not found or API limits exceeded.`));
        }
    }
}
class QuoteCommand {
    async execute() {
        try {
            const { data } = await axios_1.default.get("https://dummyjson.com/quotes/random");
            console.log(chalk_1.default.cyan(`\n"${data.quote}"`));
            console.log(chalk_1.default.gray(`           — ${data.author}\n`));
        }
        catch (err) {
            console.log(chalk_1.default.red("Could not fetch a quote. Check your internet."));
        }
    }
}
class CoinFlipCommand {
    execute() {
        const result = Math.random() < 0.5 ? "Heads" : "Tails";
        console.log(chalk_1.default.yellow(`The coin landed on: ${chalk_1.default.bold(result)}`));
    }
}
class RollDiceCommand {
    execute(sides) {
        const s = sides ? parseInt(sides, 10) : 6;
        const maxSides = isNaN(s) || s < 2 ? 6 : s;
        const roll = Math.floor(Math.random() * maxSides) + 1;
        console.log(chalk_1.default.yellow(`You rolled a ${chalk_1.default.bold(roll)}${maxSides !== 6 ? ` (${maxSides}-sided die)` : ""}`));
    }
}
class FileInfoCommand {
    async execute(filename) {
        if (!filename)
            filename = await promptForMissingArgument("Enter the filename or path to inspect:");
        const fullPath = path_1.default.resolve(filename);
        if (!fs_1.default.existsSync(fullPath))
            return console.log(chalk_1.default.red(`File not found: ${fullPath}`));
        const stats = fs_1.default.statSync(fullPath);
        console.log(chalk_1.default.green(`\nFile Info: ${path_1.default.basename(fullPath)}`));
        console.log(`   Full Path : ${fullPath}`);
        console.log(`   Extension : ${path_1.default.extname(fullPath) || "none"}`);
        console.log(`   Size      : ${stats.size} bytes`);
        console.log(`   Modified  : ${stats.mtime.toLocaleString()}\n`);
    }
}
exports.program = new commander_1.Command();
exports.program.version("1.0.0", "-v, --version", "Output the current version");
exports.program
    .command("config [action] [key] [value]")
    .description("Manage configuration settings. Actions: set, get, list. (e.g. config set github myusername)")
    .action(async (action, key, value) => {
    await new ConfigCommand().execute(action, key, value);
});
exports.program
    .command("greet [name]")
    .description("Greet a user by name")
    .action((name) => new GreetCommand().execute(name));
exports.program
    .command("add [num1] [num2]")
    .description("Add two numbers")
    .action((num1, num2) => new AddCommand().execute(num1, num2));
exports.program
    .command("subtract [num1] [num2]")
    .description("Subtract the second number from the first")
    .action((num1, num2) => new SubtractCommand().execute(num1, num2));
exports.program
    .command("multiply [num1] [num2]")
    .description("Multiply two numbers")
    .action((num1, num2) => new MultiplyCommand().execute(num1, num2));
exports.program
    .command("divide [num1] [num2]")
    .description("Divide the first number by the second")
    .action((num1, num2) => new DivideCommand().execute(num1, num2));
exports.program
    .command("hasao")
    .description("Fetch a random joke from the internet")
    .action(() => new JokeCommand().execute());
exports.program
    .command("github [username]")
    .description("Fetch GitHub user info")
    .action((username) => new GitHubCommand().execute(username));
exports.program
    .command("quote")
    .description("Fetch a random inspirational quote")
    .action(() => new QuoteCommand().execute());
exports.program
    .command("coinflip")
    .description("Flip a coin — heads or tails?")
    .action(() => new CoinFlipCommand().execute());
exports.program
    .command("roll [sides]")
    .description("Roll a dice (default: 6 sides)")
    .action((sides) => new RollDiceCommand().execute(sides));
exports.program
    .command("fileinfo [filename]")
    .description("Show basic info about a file (size, path, extension)")
    .action((filename) => new FileInfoCommand().execute(filename));
exports.program.parse(process.argv);
