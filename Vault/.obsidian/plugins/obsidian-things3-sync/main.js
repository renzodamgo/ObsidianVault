/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => Things3Plugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
function getCurrentLine(editor, view) {
  const lineNumber = editor.getCursor().line;
  const lineText = editor.getLine(lineNumber);
  return lineText;
}
var DEFAULT_SETTINGS = {
  authToken: "",
  defaultTags: ""
};
function urlEncode(line) {
  line = encodeURIComponent(line);
  return line;
}
function contructTodo(line, settings, fileName) {
  line = line.trim();
  const tags = extractTags(line, settings.defaultTags);
  line = line.replace(/#([^\s]+)/gs, "");
  const todo = {
    title: extractTitle(line),
    tags,
    date: extractDate(fileName)
  };
  return todo;
}
function extractDate(line) {
  const regex = /^(19|20)\d\d([- /.])(0[1-9]|1[012])\2(0[1-9]|[12][0-9]|3[01])/;
  let date = "";
  const res = line.match(regex);
  if (res) {
    date = res[0];
  }
  return date;
}
function extractTitle(line) {
  const regex = /[^#\s\-\[\]*](.*)/gs;
  const content = line.match(regex);
  let title = "";
  if (content != null) {
    title = content[0];
  }
  return title;
}
function extractTags(line, setting_tags) {
  const regex = /#([^\s]+)/gs;
  const array = [...line.matchAll(regex)];
  const tag_array = array.map((x) => x[1]);
  if (setting_tags.length > 0) {
    tag_array.push(setting_tags);
  }
  line = line.replace(regex, "");
  const tags = tag_array.join(",");
  return tags;
}
function extractTarget(line) {
  const regexId = /id=(\w+)/;
  const id = line.match(regexId);
  let todoId;
  if (id != null) {
    todoId = id[1];
  } else {
    todoId = "";
  }
  const regexStatus = /\[(.)\]/;
  const status = line.match(regexStatus);
  let afterStatus;
  if (status && status[1] == " ") {
    afterStatus = "true";
  } else {
    afterStatus = "false";
  }
  return { todoId, afterStatus };
}
function createTodo(todo, deepLink) {
  const url = `things:///add?title=${todo.title}&notes=${deepLink}&when=${todo.date}&x-success=obsidian://things-sync-id&tags=${todo.tags}`;
  window.open(url);
}
function updateTodo(todoId, completed, authToken) {
  const url = `things:///update?id=${todoId}&completed=${completed}&auth-token=${authToken}`;
  window.open(url);
}
var Things3Plugin = class extends import_obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new Things3SyncSettingTab(this.app, this));
    this.registerObsidianProtocolHandler("things-sync-id", async (id) => {
      const todoID = id["x-things-id"];
      const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
      if (view == null) {
        return;
      } else {
        const editor = view.editor;
        const currentLine = getCurrentLine(editor, view);
        const firstLetterIndex = currentLine.search(/[^\s#\-\[\]*]/);
        const line = currentLine.substring(firstLetterIndex, currentLine.length);
        const editorPosition = view.editor.getCursor();
        const lineLength = view.editor.getLine(editorPosition.line).length;
        const startRange = {
          line: editorPosition.line,
          ch: firstLetterIndex
        };
        const endRange = {
          line: editorPosition.line,
          ch: lineLength
        };
        if (firstLetterIndex > 0) {
          view.editor.replaceRange(`[${line}](things:///show?id=${todoID})`, startRange, endRange);
        } else {
          view.editor.replaceRange(`- [ ] [${line}](things:///show?id=${todoID})`, startRange, endRange);
        }
      }
    });
    this.addCommand({
      id: "create-things-todo",
      name: "Create Things Todo",
      editorCallback: (editor, view) => {
        const workspace = this.app.workspace;
        const fileTitle = workspace.getActiveFile();
        if (fileTitle == null) {
          return;
        } else {
          let fileName = urlEncode(fileTitle.name);
          fileName = fileName.replace(/\.md$/, "");
          const obsidianDeepLink = this.app.getObsidianUrl(fileTitle);
          const encodedLink = urlEncode(obsidianDeepLink);
          const line = getCurrentLine(editor, view);
          const todo = contructTodo(line, this.settings, fileName);
          createTodo(todo, encodedLink);
        }
      }
    });
    this.addCommand({
      id: "toggle-things-todo",
      name: "Toggle Things Todo",
      editorCallback: (editor, view) => {
        const workspace = this.app.workspace;
        const fileTitle = workspace.getActiveFile();
        if (fileTitle == null) {
          return;
        } else {
          const line = getCurrentLine(editor, view);
          const target = extractTarget(line);
          if (target.todoId == "") {
            new import_obsidian.Notice(`This is not a things3 todo`);
          } else {
            view.app.commands.executeCommandById("editor:toggle-checklist-status");
            updateTodo(target.todoId, target.afterStatus, this.settings.authToken);
            new import_obsidian.Notice(`${target.todoId} set completed:${target.afterStatus} on things3`);
          }
        }
      }
    });
  }
  onunload() {
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var Things3SyncSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Settings for Obsidian Things3 Sync." });
    new import_obsidian.Setting(containerEl).setName("Auth Token").setDesc("Require Things3 Auth Token for syncing Todo status; Get Auth Token			via Things3 -> Preferece -> General -> Enable things URL -> Manage.").addText((text) => text.setPlaceholder("Leave Things3 Auth Token here").setValue(this.plugin.settings.authToken).onChange(async (value) => {
      this.plugin.settings.authToken = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Default Tags").setDesc("The default tags for Obsidian Todo; Using comma(,) 			to separate multiple tags; Leave this in blank for no default tags").addText((text) => text.setPlaceholder("Leave your tags here").setValue(this.plugin.settings.defaultTags).onChange(async (value) => {
      this.plugin.settings.defaultTags = value;
      await this.plugin.saveSettings();
    }));
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgQXBwLCBFZGl0b3IsIE1hcmtkb3duVmlldywgRWRpdG9yUG9zaXRpb24sIFBsdWdpbiwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZywgTm90aWNlIH0gZnJvbSAnb2JzaWRpYW4nO1xuXG5mdW5jdGlvbiBnZXRDdXJyZW50TGluZShlZGl0b3I6IEVkaXRvciwgdmlldzogTWFya2Rvd25WaWV3KSB7XG5cdGNvbnN0IGxpbmVOdW1iZXIgPSBlZGl0b3IuZ2V0Q3Vyc29yKCkubGluZVxuXHRjb25zdCBsaW5lVGV4dCA9IGVkaXRvci5nZXRMaW5lKGxpbmVOdW1iZXIpXG5cdHJldHVybiBsaW5lVGV4dFxufVxuXG5pbnRlcmZhY2UgVG9kb0luZm8ge1xuXHR0aXRsZTogc3RyaW5nLFxuXHR0YWdzOiBzdHJpbmcsXG5cdGRhdGU6IHN0cmluZ1xufVxuXG5pbnRlcmZhY2UgUGx1Z2luU2V0dGluZ3Mge1xuXHRhdXRoVG9rZW46IHN0cmluZyxcblx0ZGVmYXVsdFRhZ3M6IHN0cmluZ1xufVxuXG5jb25zdCBERUZBVUxUX1NFVFRJTkdTOiBQbHVnaW5TZXR0aW5ncyA9IHtcblx0YXV0aFRva2VuOiAnJyxcblx0ZGVmYXVsdFRhZ3M6ICcnXG59XG5cbmZ1bmN0aW9uIHVybEVuY29kZShsaW5lOiBzdHJpbmcpIHtcblx0bGluZSA9IGVuY29kZVVSSUNvbXBvbmVudChsaW5lKVxuXHRyZXR1cm4gbGluZVxufVxuXG5mdW5jdGlvbiBjb250cnVjdFRvZG8obGluZTogc3RyaW5nLCBzZXR0aW5nczogUGx1Z2luU2V0dGluZ3MsIGZpbGVOYW1lOiBzdHJpbmcpe1xuXHRsaW5lID0gbGluZS50cmltKCk7XG5cdGNvbnN0IHRhZ3MgPSBleHRyYWN0VGFncyhsaW5lLCBzZXR0aW5ncy5kZWZhdWx0VGFncyk7XG5cblx0bGluZSA9IGxpbmUucmVwbGFjZSgvIyhbXlxcc10rKS9ncywgJycpO1xuXG5cdGNvbnN0IHRvZG86IFRvZG9JbmZvID0ge1xuXHRcdHRpdGxlOiBleHRyYWN0VGl0bGUobGluZSksXG5cdFx0dGFnczogdGFncyxcblx0XHRkYXRlOiBleHRyYWN0RGF0ZShmaWxlTmFtZSlcblx0fVxuXG5cdHJldHVybiB0b2RvO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0RGF0ZShsaW5lOnN0cmluZykge1xuXHRjb25zdCByZWdleCA9IC9eKDE5fDIwKVxcZFxcZChbLSAvLl0pKDBbMS05XXwxWzAxMl0pXFwyKDBbMS05XXxbMTJdWzAtOV18M1swMV0pL1xuXHRsZXQgZGF0ZSA9ICcnO1xuXHRjb25zdCByZXMgPSBsaW5lLm1hdGNoKHJlZ2V4KTtcblx0aWYgKHJlcykge1xuICAgIGRhdGUgPSByZXNbMF07XG4gIH1cblx0cmV0dXJuIGRhdGU7XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RUaXRsZShsaW5lOiBzdHJpbmcpIHtcblx0Y29uc3QgcmVnZXggPSAvW14jXFxzXFwtXFxbXFxdKl0oLiopL2dzXG5cdGNvbnN0IGNvbnRlbnQgPSBsaW5lLm1hdGNoKHJlZ2V4KTtcblx0bGV0IHRpdGxlID0gJyc7XG5cdGlmIChjb250ZW50ICE9IG51bGwpIHtcblx0XHR0aXRsZSA9IGNvbnRlbnRbMF1cblx0fVxuXHRcblx0cmV0dXJuIHRpdGxlO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0VGFncyhsaW5lOiBzdHJpbmcsIHNldHRpbmdfdGFnczogc3RyaW5nKXtcblx0Y29uc3QgcmVnZXggPSAvIyhbXlxcc10rKS9nc1xuXHRjb25zdCBhcnJheSA9IFsuLi5saW5lLm1hdGNoQWxsKHJlZ2V4KV1cblx0Y29uc3QgdGFnX2FycmF5ID0gYXJyYXkubWFwKHggPT4geFsxXSlcblx0aWYgKHNldHRpbmdfdGFncy5sZW5ndGggPiAwKSB7XG5cdFx0dGFnX2FycmF5LnB1c2goc2V0dGluZ190YWdzKTtcblx0fVxuXHRsaW5lID0gbGluZS5yZXBsYWNlKHJlZ2V4LCAnJyk7XG5cdGNvbnN0IHRhZ3MgPSB0YWdfYXJyYXkuam9pbignLCcpXG5cdFxuXHRyZXR1cm4gdGFncztcbn1cblxuZnVuY3Rpb24gZXh0cmFjdFRhcmdldChsaW5lOiBzdHJpbmcpIHtcblx0Y29uc3QgcmVnZXhJZCA9IC9pZD0oXFx3KykvXG5cdGNvbnN0IGlkID0gbGluZS5tYXRjaChyZWdleElkKTtcblx0bGV0IHRvZG9JZDogc3RyaW5nO1xuXHRpZiAoaWQgIT0gbnVsbCkge1xuXHRcdHRvZG9JZCA9IGlkWzFdO1x0XG5cdH0gZWxzZSB7XG5cdFx0dG9kb0lkID0gJydcblx0fVxuXG5cdGNvbnN0IHJlZ2V4U3RhdHVzID0gL1xcWyguKVxcXS9cblx0Y29uc3Qgc3RhdHVzID0gbGluZS5tYXRjaChyZWdleFN0YXR1cylcblx0bGV0IGFmdGVyU3RhdHVzOiBzdHJpbmc7XG5cdGlmIChzdGF0dXMgJiYgc3RhdHVzWzFdID09ICcgJykge1xuXHRcdGFmdGVyU3RhdHVzID0gJ3RydWUnXG5cdH0gZWxzZSB7XG5cdFx0YWZ0ZXJTdGF0dXMgPSAnZmFsc2UnXG5cdH1cblxuXHRyZXR1cm4gIHt0b2RvSWQsIGFmdGVyU3RhdHVzfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVUb2RvKHRvZG86IFRvZG9JbmZvLCBkZWVwTGluazogc3RyaW5nKXtcblx0Y29uc3QgdXJsID0gYHRoaW5nczovLy9hZGQ/dGl0bGU9JHt0b2RvLnRpdGxlfSZub3Rlcz0ke2RlZXBMaW5rfSZ3aGVuPSR7dG9kby5kYXRlfSZ4LXN1Y2Nlc3M9b2JzaWRpYW46Ly90aGluZ3Mtc3luYy1pZCZ0YWdzPSR7dG9kby50YWdzfWA7XG5cdHdpbmRvdy5vcGVuKHVybCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVRvZG8odG9kb0lkOiBzdHJpbmcsIGNvbXBsZXRlZDogc3RyaW5nLCBhdXRoVG9rZW46IHN0cmluZyl7XG5cdGNvbnN0IHVybCA9IGB0aGluZ3M6Ly8vdXBkYXRlP2lkPSR7dG9kb0lkfSZjb21wbGV0ZWQ9JHtjb21wbGV0ZWR9JmF1dGgtdG9rZW49JHthdXRoVG9rZW59YDtcblx0d2luZG93Lm9wZW4odXJsKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGhpbmdzM1BsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG5cdHNldHRpbmdzOiBQbHVnaW5TZXR0aW5ncztcblxuXHRhc3luYyBvbmxvYWQoKSB7XG5cdFx0XG5cdFx0Ly8gU2V0dXAgU2V0dGluZ3MgVGFiXG5cdFx0YXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcblx0XHR0aGlzLmFkZFNldHRpbmdUYWIobmV3IFRoaW5nczNTeW5jU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xuXG5cdFx0Ly8gUmVnaXN0ZXIgUHJvdG9jb2wgSGFuZGxlclxuXHRcdHRoaXMucmVnaXN0ZXJPYnNpZGlhblByb3RvY29sSGFuZGxlcihcInRoaW5ncy1zeW5jLWlkXCIsIGFzeW5jIChpZCkgPT4ge1xuXHRcdFx0Y29uc3QgdG9kb0lEID0gaWRbJ3gtdGhpbmdzLWlkJ107XG5cdFx0XHRjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcblx0XHRcdGlmICh2aWV3ID09IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgZWRpdG9yID0gdmlldy5lZGl0b3Jcblx0XHRcdFx0Y29uc3QgY3VycmVudExpbmUgPSBnZXRDdXJyZW50TGluZShlZGl0b3IsIHZpZXcpXG5cdFx0XHRcdGNvbnN0IGZpcnN0TGV0dGVySW5kZXggPSBjdXJyZW50TGluZS5zZWFyY2goL1teXFxzI1xcLVxcW1xcXSpdLyk7XG5cdFx0XHRcdGNvbnN0IGxpbmUgPSBjdXJyZW50TGluZS5zdWJzdHJpbmcoZmlyc3RMZXR0ZXJJbmRleCwgY3VycmVudExpbmUubGVuZ3RoKVxuXHRcdFx0XHRjb25zdCBlZGl0b3JQb3NpdGlvbiA9IHZpZXcuZWRpdG9yLmdldEN1cnNvcigpXG5cdFx0XHRcdGNvbnN0IGxpbmVMZW5ndGggPSB2aWV3LmVkaXRvci5nZXRMaW5lKGVkaXRvclBvc2l0aW9uLmxpbmUpLmxlbmd0aFxuXHRcdFx0XHRjb25zdCBzdGFydFJhbmdlOiBFZGl0b3JQb3NpdGlvbiA9IHtcblx0XHRcdFx0XHRsaW5lOiBlZGl0b3JQb3NpdGlvbi5saW5lLFxuXHRcdFx0XHRcdGNoOiBmaXJzdExldHRlckluZGV4XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3QgZW5kUmFuZ2U6IEVkaXRvclBvc2l0aW9uID0ge1xuXHRcdFx0XHRcdGxpbmU6IGVkaXRvclBvc2l0aW9uLmxpbmUsXG5cdFx0XHRcdFx0Y2g6IGxpbmVMZW5ndGhcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChmaXJzdExldHRlckluZGV4ID4gMCkge1xuXHRcdFx0XHRcdHZpZXcuZWRpdG9yLnJlcGxhY2VSYW5nZShgWyR7bGluZX1dKHRoaW5nczovLy9zaG93P2lkPSR7dG9kb0lEfSlgLCBzdGFydFJhbmdlLCBlbmRSYW5nZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dmlldy5lZGl0b3IucmVwbGFjZVJhbmdlKGAtIFsgXSBbJHtsaW5lfV0odGhpbmdzOi8vL3Nob3c/aWQ9JHt0b2RvSUR9KWAsIHN0YXJ0UmFuZ2UsIGVuZFJhbmdlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcblx0XHQvLyBDcmVhdGUgVE9ETyBDb21tYW5kXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiAnY3JlYXRlLXRoaW5ncy10b2RvJyxcblx0XHRcdG5hbWU6ICdDcmVhdGUgVGhpbmdzIFRvZG8nLFxuXHRcdFx0ZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3I6IEVkaXRvciwgdmlldzogTWFya2Rvd25WaWV3KSA9PiB7XG5cdFx0XHRcdGNvbnN0IHdvcmtzcGFjZSA9IHRoaXMuYXBwLndvcmtzcGFjZTtcblx0XHRcdFx0Y29uc3QgZmlsZVRpdGxlID0gd29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKVxuXHRcdFx0XHRpZiAoZmlsZVRpdGxlID09IG51bGwpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bGV0IGZpbGVOYW1lID0gdXJsRW5jb2RlKGZpbGVUaXRsZS5uYW1lKVxuXHRcdFx0XHRcdGZpbGVOYW1lID0gZmlsZU5hbWUucmVwbGFjZSgvXFwubWQkLywgJycpXG5cdFx0XHRcdFx0Y29uc3Qgb2JzaWRpYW5EZWVwTGluayA9ICh0aGlzLmFwcCBhcyBhbnkpLmdldE9ic2lkaWFuVXJsKGZpbGVUaXRsZSlcblx0XHRcdFx0XHRjb25zdCBlbmNvZGVkTGluayA9IHVybEVuY29kZShvYnNpZGlhbkRlZXBMaW5rKVxuXHRcdFx0XHRcdGNvbnN0IGxpbmUgPSBnZXRDdXJyZW50TGluZShlZGl0b3IsIHZpZXcpXG5cdFx0XHRcdFx0Y29uc3QgdG9kbyA9IGNvbnRydWN0VG9kbyhsaW5lLCB0aGlzLnNldHRpbmdzLCBmaWxlTmFtZSlcblx0XHRcdFx0XHRjcmVhdGVUb2RvKHRvZG8sIGVuY29kZWRMaW5rKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0XG5cdFx0Ly8gVG9nZ2xlIHRhc2sgc3RhdHVzIGFuZCBzeW5jIHRvIHRoaW5nc1xuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ3RvZ2dsZS10aGluZ3MtdG9kbycsXG5cdFx0XHRuYW1lOiAnVG9nZ2xlIFRoaW5ncyBUb2RvJyxcblx0XHRcdGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yOiBFZGl0b3IsIHZpZXc6IE1hcmtkb3duVmlldykgPT4ge1xuXHRcdFx0XHRjb25zdCB3b3Jrc3BhY2UgPSB0aGlzLmFwcC53b3Jrc3BhY2U7XG5cdFx0XHRcdGNvbnN0IGZpbGVUaXRsZSA9IHdvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKClcblx0XHRcdFx0aWYgKGZpbGVUaXRsZSA9PSBudWxsKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IGxpbmUgPSBnZXRDdXJyZW50TGluZShlZGl0b3IsIHZpZXcpXG5cdFx0XHRcdFx0Y29uc3QgdGFyZ2V0ID0gZXh0cmFjdFRhcmdldChsaW5lKVxuXHRcdFx0XHRcdGlmICh0YXJnZXQudG9kb0lkID09ICcnKSB7XG5cdFx0XHRcdFx0XHRuZXcgTm90aWNlKGBUaGlzIGlzIG5vdCBhIHRoaW5nczMgdG9kb2ApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR2aWV3LmFwcC5jb21tYW5kcy5leGVjdXRlQ29tbWFuZEJ5SWQoXCJlZGl0b3I6dG9nZ2xlLWNoZWNrbGlzdC1zdGF0dXNcIilcblx0XHRcdFx0XHRcdHVwZGF0ZVRvZG8odGFyZ2V0LnRvZG9JZCwgdGFyZ2V0LmFmdGVyU3RhdHVzLCB0aGlzLnNldHRpbmdzLmF1dGhUb2tlbilcblx0XHRcdFx0XHRcdG5ldyBOb3RpY2UoYCR7dGFyZ2V0LnRvZG9JZH0gc2V0IGNvbXBsZXRlZDoke3RhcmdldC5hZnRlclN0YXR1c30gb24gdGhpbmdzM2ApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0b251bmxvYWQoKSB7XG5cdH1cblxuXHRhc3luYyBsb2FkU2V0dGluZ3MoKSB7XG5cdFx0dGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XG5cdH1cblxuXHRhc3luYyBzYXZlU2V0dGluZ3MoKSB7XG5cdFx0YXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcblx0fVxufVxuXG5jbGFzcyBUaGluZ3MzU3luY1NldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcblx0cGx1Z2luOiBUaGluZ3MzUGx1Z2luO1xuXG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IFRoaW5nczNQbHVnaW4pIHtcblx0XHRzdXBlcihhcHAsIHBsdWdpbik7XG5cdFx0dGhpcy5wbHVnaW4gPSBwbHVnaW47XG5cdH1cblxuXHRkaXNwbGF5KCk6IHZvaWQge1xuXHRcdGNvbnN0IHtjb250YWluZXJFbH0gPSB0aGlzO1xuXG5cdFx0Y29udGFpbmVyRWwuZW1wdHkoKTtcblx0XHRjb250YWluZXJFbC5jcmVhdGVFbCgnaDInLCB7dGV4dDogJ1NldHRpbmdzIGZvciBPYnNpZGlhbiBUaGluZ3MzIFN5bmMuJ30pO1xuXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZSgnQXV0aCBUb2tlbicpXG5cdFx0XHQuc2V0RGVzYygnUmVxdWlyZSBUaGluZ3MzIEF1dGggVG9rZW4gZm9yIHN5bmNpbmcgVG9kbyBzdGF0dXM7IEdldCBBdXRoIFRva2VuXFxcblx0XHRcdHZpYSBUaGluZ3MzIC0+IFByZWZlcmVjZSAtPiBHZW5lcmFsIC0+IEVuYWJsZSB0aGluZ3MgVVJMIC0+IE1hbmFnZS4nKVxuXHRcdFx0LmFkZFRleHQodGV4dCA9PiB0ZXh0XG5cdFx0XHRcdC5zZXRQbGFjZWhvbGRlcignTGVhdmUgVGhpbmdzMyBBdXRoIFRva2VuIGhlcmUnKVxuXHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYXV0aFRva2VuKVxuXHRcdFx0XHQub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MuYXV0aFRva2VuID0gdmFsdWU7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHRcdH0pKTtcblxuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuXHRcdFx0LnNldE5hbWUoJ0RlZmF1bHQgVGFncycpXG5cdFx0XHQuc2V0RGVzYygnVGhlIGRlZmF1bHQgdGFncyBmb3IgT2JzaWRpYW4gVG9kbzsgVXNpbmcgY29tbWEoLCkgXFxcblx0XHRcdHRvIHNlcGFyYXRlIG11bHRpcGxlIHRhZ3M7IExlYXZlIHRoaXMgaW4gYmxhbmsgZm9yIG5vIGRlZmF1bHQgdGFncycpXG5cdFx0XHQuYWRkVGV4dCh0ZXh0ID0+IHRleHRcblx0XHRcdFx0LnNldFBsYWNlaG9sZGVyKCdMZWF2ZSB5b3VyIHRhZ3MgaGVyZScpXG5cdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0VGFncylcblx0XHRcdFx0Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLmRlZmF1bHRUYWdzID0gdmFsdWU7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHRcdH0pKTtcblx0fVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHNCQUFxRztBQUVyRyx3QkFBd0IsUUFBZ0IsTUFBb0I7QUFDM0QsUUFBTSxhQUFhLE9BQU8sVUFBVSxFQUFFO0FBQ3RDLFFBQU0sV0FBVyxPQUFPLFFBQVEsVUFBVTtBQUMxQyxTQUFPO0FBQ1I7QUFhQSxJQUFNLG1CQUFtQztBQUFBLEVBQ3hDLFdBQVc7QUFBQSxFQUNYLGFBQWE7QUFDZDtBQUVBLG1CQUFtQixNQUFjO0FBQ2hDLFNBQU8sbUJBQW1CLElBQUk7QUFDOUIsU0FBTztBQUNSO0FBRUEsc0JBQXNCLE1BQWMsVUFBMEIsVUFBaUI7QUFDOUUsU0FBTyxLQUFLLEtBQUs7QUFDakIsUUFBTSxPQUFPLFlBQVksTUFBTSxTQUFTLFdBQVc7QUFFbkQsU0FBTyxLQUFLLFFBQVEsZUFBZSxFQUFFO0FBRXJDLFFBQU0sT0FBaUI7QUFBQSxJQUN0QixPQUFPLGFBQWEsSUFBSTtBQUFBLElBQ3hCO0FBQUEsSUFDQSxNQUFNLFlBQVksUUFBUTtBQUFBLEVBQzNCO0FBRUEsU0FBTztBQUNSO0FBRUEscUJBQXFCLE1BQWE7QUFDakMsUUFBTSxRQUFRO0FBQ2QsTUFBSSxPQUFPO0FBQ1gsUUFBTSxNQUFNLEtBQUssTUFBTSxLQUFLO0FBQzVCLE1BQUksS0FBSztBQUNOLFdBQU8sSUFBSTtBQUFBLEVBQ2I7QUFDRCxT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
