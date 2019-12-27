'use strict';
const vscode = require('vscode');
const os = require('os')

const files = [
	"lcp_manifest.json",
	"manufacturers.json",
	"core_bonus.json",
	"frames.json",
	"weapons.json",
	"systems.json",
	"mods.json",
	"talents.json",
	"tags.json"
]

/**
 * @param {vscode.ExtensionContext} context
 */
function activate() {

	var type = "compconTaskProvider";
	vscode.tasks.registerTaskProvider(type, {
		provideTasks() {

			return Promise.all([
				vscode.workspace.openTextDocument(vscode.workspace.workspaceFolders[0].uri.fsPath + '/lcp_manifest.json').then((textDoc) => {
					const manifest = JSON.parse(textDoc.getText())
					const { name, version } = manifest

					const cmd = os.platform() === 'win32' ? '7z a -tzip' : 'zip'
					const packageName = `${name}-${version}.lcp`
					const filesStr = files.join(' ')

					const task = new vscode.Task({ type }, 'Build .LCP package', 'compcon',
						new vscode.ShellExecution(
							`${cmd} '${packageName.replace('\'', '\\\'')}' ${filesStr}`
						), []);

					task.group = vscode.TaskGroup.Build

					return task;
				})
			]);
		},
		resolveTask(task) {
			return task;
		}
	});
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}