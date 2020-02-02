"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const dotenv = dotenv_1.config({
    // debug   : false,
    encoding: 'utf8'
});
exports.env = dotenv.parsed;
//# sourceMappingURL=env.js.map