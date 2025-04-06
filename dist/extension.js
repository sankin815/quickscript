/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(__webpack_require__(1));
const fs_1 = __importDefault(__webpack_require__(2));
const path_1 = __importDefault(__webpack_require__(3));
// 递归查找最近的 package.json
function findNearestPackageJson(startPath) {
    let dir = startPath;
    while (dir !== path_1.default.parse(dir).root) {
        const packageJsonPath = path_1.default.join(dir, "package.json");
        if (fs_1.default.existsSync(packageJsonPath)) {
            return packageJsonPath;
        }
        dir = path_1.default.dirname(dir);
    }
    return null;
}
// 执行 npm run 脚本
function runNpmScript(scriptName, packageJsonPath, packageJsonName) {
    const projectDir = path_1.default.dirname(packageJsonPath);
    const terminalName = packageJsonName + "/" + scriptName;
    let terminal = vscode.window.terminals.find((t) => t.name === terminalName);
    if (terminal) {
        // 如果找到终端直接关闭，
        terminal.dispose();
    }
    // 创建终端
    terminal = vscode.window.createTerminal({
        name: terminalName,
        cwd: projectDir,
    });
    terminal.show();
    scriptName === "codegen"
        ? terminal.sendText(`yarn ${scriptName}`)
        : terminal.sendText(`npm run ${scriptName}`);
}
function activate(context) {
    let disposable = vscode.commands.registerCommand("quick-script", async (uri) => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage("没有找到工作区");
            return;
        }
        const currentFilePath = uri
            ? uri.fsPath
            : vscode.window.activeTextEditor?.document.uri.fsPath;
        const searchStartPath = currentFilePath
            ? path_1.default.dirname(currentFilePath)
            : workspaceFolders[0].uri.fsPath;
        const packageJsonPath = findNearestPackageJson(searchStartPath);
        if (!packageJsonPath) {
            vscode.window.showErrorMessage("在项目中找不到 package.json");
            return;
        }
        const packageJson = JSON.parse(fs_1.default.readFileSync(packageJsonPath, "utf8"));
        const scripts = packageJson.scripts;
        const packageJsonName = packageJson.name;
        if (!scripts) {
            vscode.window.showErrorMessage("在 package.json 中找不到脚本");
            return;
        }
        const scriptKeys = Object.keys(scripts);
        const selectedScript = await vscode.window.showQuickPick(scriptKeys, {
            placeHolder: "选择一条指令执行",
        });
        if (!selectedScript) {
            return;
        }
        await runNpmScript(selectedScript, packageJsonPath, packageJsonName);
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("path");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map