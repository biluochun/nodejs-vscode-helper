import * as vscode from 'vscode';
import * as fse from 'fs-extra';
import { TreeProvider } from './TreeProvider';
import * as os from 'os';

export interface ScriptItem {
  label: string;
  cmd: string;
  icon: string;
  extension: string;
}

/**
 * 简易的 package.json 数据类型声明
 */
export interface PackageJsonObject {
  name: string;
  scripts: Record<string, string>;
}

export class NodeJsHelper {
  context: vscode.ExtensionContext;
  packageObj: PackageJsonObject;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.packageObj = {
      name: '',
      scripts: {},
    };
    this.init();
  }

  /**
   * 初始化 获取package.json的数据
   */
  async init() {
    const pathFlag = os.platform() === 'win32' ? '\\' : '/';
    const packagePath = `${vscode.workspace.rootPath}${pathFlag}package.json`;
    const packageObj = await fse.readJson(packagePath);
    this.packageObj = packageObj;
    this.updateActivityBar();
  }

  /*
   * 更新 ActivityBar
   */
  updateActivityBar() {
    const packageScriptProvider = new TreeProvider(vscode.workspace.rootPath!, this.packageObj, this.context);
    vscode.window.registerTreeDataProvider('npm-scripts', packageScriptProvider);
  }

  /**
   * 获取脚本
   */
  // getScriptsData(): ScriptItem[] {
  //   const data: Record<string, string> = this.packageObj.scripts;
  //   return Object.keys(data).map((item, index) => {
  //     const iconNum = index > 30 ? index - 31 : index;
  //     return {
  //       label: `${item}`,
  //       cmd: `npm run ${item}`,
  //       icon: `${iconNum}.png`,
  //       extension: 'nodejs-helper.cmd',
  //     };
  //   });
  // }
}
