// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Constants } from './constants';
import { NodeJsHelper } from './lib/NodeJsHelper';
import { ItemDir } from './lib/TreeProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(Constants.CallScriptCmd, (item: ItemDir) => {
      const terminal = vscode.window.createTerminal({
        name: item.key,
      });
      terminal.show(true);
      terminal.sendText(item.script!);
    })
  );
  console.log('nodejs-helper" is now active!');

  new NodeJsHelper(context);
}

// this method is called when your extension is deactivated
export function deactivate() {}
