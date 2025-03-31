const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

// 递归查找最近的 package.json
function findNearestPackageJson(startPath) {
  let dir = startPath;
  while (dir !== path.parse(dir).root) {
    const packageJsonPath = path.join(dir, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      return packageJsonPath;
    }
    dir = path.dirname(dir);
  }
  return null;
}

// 执行 npm run 脚本
function runNpmScript(scriptName, packageJsonPath) {
  const projectDir = path.dirname(packageJsonPath);
  const terminalName = scriptName;
  let terminal = vscode.window.terminals.find((t) => t.name === terminalName);

  if (!terminal) {
    // 如果没有找到合适的终端，则创建一个新的
    terminal = vscode.window.createTerminal({
      name: terminalName,
      cwd: projectDir,
    });
  }

  terminal.show();
  scriptName === "codegen"
    ? terminal.sendText(`yarn ${scriptName}`)
    : terminal.sendText(`npm run ${scriptName}`);
}

function activate(context) {
  // 创建一个状态栏按钮
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.text = "$(play)";
  statusBarItem.tooltip = "选择并运行 package.json 中的脚本";
  statusBarItem.command = "package-scripts.runScript";
  statusBarItem.show();

  context.subscriptions.push(statusBarItem);

  let disposable = vscode.commands.registerCommand(
    "package-scripts.runScript",
    async (uri) => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage("No workspace folder found.");
        return;
      }

      const currentFilePath = uri
        ? uri.fsPath
        : vscode.window.activeTextEditor?.document.uri.fsPath;
      const searchStartPath = currentFilePath
        ? path.dirname(currentFilePath)
        : workspaceFolders[0].uri.fsPath;

      const packageJsonPath = findNearestPackageJson(searchStartPath);
      if (!packageJsonPath) {
        vscode.window.showErrorMessage("No package.json found in project.");
        return;
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      const scripts = packageJson.scripts;
      if (!scripts) {
        vscode.window.showErrorMessage("No scripts found in package.json.");
        return;
      }

      const scriptKeys = Object.keys(scripts);
      const selectedScript = await vscode.window.showQuickPick(scriptKeys, {
        placeHolder: "选择一条指令执行",
      });

      if (!selectedScript) return;

      await runNpmScript(selectedScript, packageJsonPath);
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
