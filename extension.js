'use strict';
import { tasks, workspace, Task, TaskScope, ShellExecution, TaskGroup } from 'vscode';
import { platform } from 'os';
import { resolve } from 'path';

import { exists } from 'fs';
import { promisify } from 'util';

const existsPromise = promisify(exists);

const files = [
  'lcp_manifest.json',
  'manufacturers.json',
  'core_bonuses.json',
  'environments.json',
  'frames.json',
  'weapons.json',
  'systems.json',
  'mods.json',
  'pilot_gear.json',
  'reserves.json',
  'sitreps.json',
  'skills.json',
  'statuses.json',
  'talents.json',
  'tags.json',
  'npc_classes.json',
  'npc_features.json',
  'npc_templates.json',
  'lists.json',
  'tables.json'
];

function activate() {
  var type = 'compconTaskProvider';
  tasks.registerTaskProvider(type, {
    async provideTasks() {
      const root = 
        workspace.workspaceFolders
        ? workspace.workspaceFolders[0].uri.fsPath
        : null;

      if (!root) return [];

      const manifestExists = await existsPromise(root + '/lcp_manifest.json');

      if (!manifestExists) return [];

      const textDoc = await workspace.openTextDocument(root + '/lcp_manifest.json');

      const existingFiles = (
        await Promise.all(
          files.map(async (filename) => {
            const doesExist = await existsPromise(resolve(root, filename));
            return doesExist ? filename : null;
          })
        )
      ).filter((x) => x);

      const manifest = JSON.parse(textDoc.getText());
      const { name, version } = manifest;

      const cmd = platform() === 'win32' ? '7z a -tzip' : 'zip';
      const packageName = `${name}-${version}.lcp`;
      const filesStr = existingFiles.join(' ');

      const task = new Task(
        { type },
        TaskScope.Workspace,
        'Build .LCP package',
        'compcon',
        new ShellExecution(`${cmd} "${packageName.replace('"', '\\"')}" ${filesStr}`),
        []
      );

      task.group = TaskGroup.Build;

      return [task];
    },
    resolveTask(task) {
      return task;
    },
  });
}

// this method is called when your extension is deactivated
function deactivate() {}

export default {
  activate,
  deactivate,
};
