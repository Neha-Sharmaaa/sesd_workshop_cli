"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cosmic_js_1 = require("../cosmic.js");
beforeEach(() => {
    // Capture console.log output so we can inspect it without printing to the real terminal
    jest.spyOn(console, "log").mockImplementation(() => { });
});
afterEach(() => {
    jest.restoreAllMocks();
});
describe("Math Commands", () => {
    test("add command should sum two numbers", async () => {
        await cosmic_js_1.program.parseAsync(["node", "cosmic", "add", "5", "10"]);
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining("The sum is 15"));
    });
    test("subtract command should subtract two numbers", async () => {
        await cosmic_js_1.program.parseAsync(["node", "cosmic", "subtract", "10", "4"]);
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining("The difference is 6"));
    });
    test("multiply command should multiply two numbers", async () => {
        await cosmic_js_1.program.parseAsync(["node", "cosmic", "multiply", "3", "7"]);
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining("The product is 21"));
    });
    test("divide command should divide two numbers", async () => {
        await cosmic_js_1.program.parseAsync(["node", "cosmic", "divide", "20", "4"]);
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining("The quotient is 5"));
    });
    test("divide command should prevent division by zero", async () => {
        await cosmic_js_1.program.parseAsync(["node", "cosmic", "divide", "10", "0"]);
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Division by zero is not allowed"));
    });
});
