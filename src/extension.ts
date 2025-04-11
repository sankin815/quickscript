import * as vscode from "vscode";
import fs from "fs";
import path from "path";

const { showErrorMessage, showQuickPick, showInformationMessage } =
  vscode.window;

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
async function runNpmScript({
  scriptName,
  packageJsonPath,
  packageJsonName,
}: {
  scriptName: string;
  packageJsonPath: string;
  packageJsonName: string;
}) {
  const projectDir = path.dirname(packageJsonPath);
  const terminalName = packageJsonName + "/" + scriptName;
  const scriptCode =
    scriptName === "codegen" ? `yarn ${scriptName}` : `npm run ${scriptName}`;

  const task = new vscode.Task(
    { type: "shell" }, // 类型
    vscode.TaskScope.Workspace, // 任务作用域
    terminalName, // 任务名
    "custom", // 自定义来源名
    new vscode.ShellExecution(scriptCode, [], {
      cwd: projectDir,
    })
  );

  task.presentationOptions = {
    // 只有出现错误时才自动打开终端
    reveal: vscode.TaskRevealKind.Silent,
    // 控制显示任务输出的面板是否获得焦点。
    focus: true, // 将焦点切换到当前终端
    echo: false, // 不显示命令输出
    close: true, // 执行成功后自动关闭
    panel: vscode.TaskPanelKind.Dedicated,
  };

  vscode.tasks.executeTask(task);
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "quick-script",
    async (uri: vscode.Uri) => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        showErrorMessage("没有找到工作区");
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
        showErrorMessage("在项目中找不到 package.json");
        return;
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      const scripts = packageJson.scripts;
      const packageJsonName = packageJson.name;
      if (!scripts) {
        showErrorMessage("在 package.json 中找不到脚本");
        return;
      }

      const scriptKeys = Object.keys(scripts);
      const selectedScript = await showQuickPick(scriptKeys, {
        placeHolder: "选择一条指令执行",
      });

      if (!selectedScript) {
        return;
      }

      await runNpmScript({
        scriptName: selectedScript,
        packageJsonPath,
        packageJsonName,
      });
    }
  );

  const taskEnd = vscode.tasks.onDidEndTaskProcess((e) => {
    const taskName = e.execution.task.name;
    const exitCode = e.exitCode;

    if (exitCode === 0) {
      showInformationMessage(`✅ 任务 "${taskName}" 已成功完成`);
    }
  });

  context.subscriptions.push(taskEnd);

  context.subscriptions.push(disposable);
}

export function deactivate() {}
