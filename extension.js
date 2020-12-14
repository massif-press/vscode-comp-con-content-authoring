'use strict';
const vscode = require('vscode');
const os = require('os')
const path = require('path')

const { exists } = require('fs');
const { promisify } = require('util');

const existsPromise = promisify(exists);

const files = [
	"lcp_manifest.json",
	"manufacturers.json",
	"core_bonus.json",
	"environments.json",
	"frames.json",
	"weapons.json",
	"systems.json",
	"mods.json",
	"pilot_gear.json",
	"reserves.json",
	"sitreps.json",
	"skills.json",
	"statuses.json",
	"talents.json",
	"tags.json",
	"npc_classes.json",
	"npc_features.json",
	"npc_templates.json",
]

function activate() {

	var type = "compconTaskProvider";
	vscode.tasks.registerTaskProvider(type, {
		async provideTasks() {

			const root = vscode.workspace.workspaceFolders[0].uri.fsPath

			const manifestExists = await existsPromise(root + '/lcp_manifest.json')

			if (!manifestExists) return []

			const textDoc = await vscode.workspace.openTextDocument(root + '/lcp_manifest.json')



			const existingFiles = (await Promise.all(files.map(async (filename) => {
				const doesExist = await existsPromise(path.resolve(root, filename))
				return doesExist ? filename : null
			}))).filter(x => x)


			const manifest = JSON.parse(textDoc.getText())
			const { name, version } = manifest

			const cmd = os.platform() === 'win32' ? '7z a -tzip' : 'zip'
			const packageName = `${name}-${version}.lcp`
			const filesStr = existingFiles.join(' ')

			const task = new vscode.Task({ type }, 'Build .LCP package', 'compcon',
				new vscode.ShellExecution(
					`${cmd} "${packageName.replace('\"', '\\\"')}" ${filesStr}`
				), []);

			task.group = vscode.TaskGroup.Build

			return [task]
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