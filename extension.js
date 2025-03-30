const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

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
  return new Promise((resolve, reject) => {
    const projectDir = path.dirname(packageJsonPath);
    const child = spawn("npm", ["run", scriptName], {
      cwd: projectDir,
      shell: true, // 兼容 Windows
    });

    let errorOutput = "";

    child.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        vscode.window.showInformationMessage(
          `✅ Script "${scriptName}" executed successfully!`,
          { modal: false }
        );
        setTimeout(
          () =>
            vscode.commands.executeCommand("workbench.action.closeMessages"),
          2000
        ); // 2s 后自动关闭
        resolve();
      } else {
        vscode.window.showErrorMessage(
          `❌ Script "${scriptName}" failed!\nError: ${errorOutput}`
        );
        reject();
      }
    });

    child.on("error", (err) => {
      vscode.window.showErrorMessage(
        `❌ Failed to run script "${scriptName}": ${err.message}`
      );
      reject();
    });
  });
}

function activate(context) {
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
        placeHolder: "Select a script to run",
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
