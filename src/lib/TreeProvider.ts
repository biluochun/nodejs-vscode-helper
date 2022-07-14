import * as vscode from 'vscode';
import * as path from 'path';
import { PackageJsonObject } from './NodeJsHelper';
import { Constants } from '../constants';

class ScriptItem extends vscode.TreeItem {
  item: ItemDir;
  constructor(item: ItemDir) {
    const collapsibleState = item.script ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded;
    super(item.name, collapsibleState);
    this.item = item;
    // this.label = item.name;
    // this.collapsibleState = collapsibleState;
    if (item.script) {
      this.tooltip = item.script;
      this.command = {
        title: item.name,
        command: Constants.CallScriptCmd,
        arguments: [item],
      };
    }
    this.contextValue = '';
    if (item.icon) {
      const dark = path.join(__dirname, '..', 'img', item.icon + '.png');
      const light = path.join(__dirname, '..', 'img', item.icon + '.png');
      this.iconPath = { dark, light };
    }
  }
}

export interface ItemDir {
  /**
   * 显示名称
   */
  name: string;

  /**
   * 唯一标志
   */
  key: string;

  /**
   * 包含的子目录
   */
  data: ItemDir[];

  icon?: number;
  script?: string;
}

export class TreeProvider implements vscode.TreeDataProvider<ScriptItem> {
  data: PackageJsonObject;
  workspaceRoot: string;
  context: vscode.ExtensionContext;
  private _onDidChangeTreeData: vscode.EventEmitter<any>;
  isRefresh = false;
  constructor(workspace: string, data: PackageJsonObject, context: vscode.ExtensionContext) {
    this.data = data;
    this.workspaceRoot = workspace;
    this.context = context;
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.isRefresh = false;
  }

  refresh() {
    this.isRefresh = true;
    this._onDidChangeTreeData.fire(null);
  }

  getTreeItem(element: ScriptItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ScriptItem): Thenable<ScriptItem[]> {
    if (element) {
      return Promise.resolve(element.item.data.map((item) => new ScriptItem(item)));
    }
    // 按目录
    const scripts: ItemDir = {
      name: this.data.name,
      key: this.data.name,
      data: [],
    };
    const scriptMap: Record<string, ItemDir> = {};
    let iconIndex = 0;
    Object.keys(this.data.scripts).forEach((name) => {
      const names = name.split(':');
      // 从后向前遍历
      names.reduce((previousValue, currentValue, currentIndex) => {
        const key = names.slice(0, currentIndex + 1).join(':');
        if (!scriptMap[key]) {
          scriptMap[key] = {
            name: currentValue,
            key: key,
            data: [],
          };
          previousValue.data.push(scriptMap[key]);

          // 为目录添加icon
          // if (previousValue.data.length === 1) {
          //   previousValue.icon = (iconIndex++ % 24) + 1;
          // }
        }

        // 如果是最后一层，将指令记录下来
        if (currentIndex === names.length - 1) {
          scriptMap[key].script = this.data.scripts[name];
          // 为cmd添加图标
          scriptMap[key].icon = (iconIndex++ % 24) + 1;
        }
        return scriptMap[key];
      }, scripts);
    });

    return Promise.resolve(scripts.data.map((item) => new ScriptItem(item)));
  }
}
