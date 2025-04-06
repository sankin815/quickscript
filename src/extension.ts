import * as vscode from "vscode";
import fs from "fs";
import path from "path";

// 递归查找最近的 package.json
function findNearestPackageJson(startPath: string) {
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
function runNpmScript(
  scriptName: string,
  packageJsonPath: string,
  packageJsonName: string
) {
  const projectDir = path.dirname(packageJsonPath);
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

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "quick-script",
    async (uri: vscode.Uri) => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage("没有找到工作区");
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
        vscode.window.showErrorMessage("在项目中找不到 package.json");
        return;
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
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
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
