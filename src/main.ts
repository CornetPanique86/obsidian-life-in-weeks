import { WorkspaceLeaf, Plugin, ViewState, MarkdownView, TFile } from 'obsidian';
import { DEFAULT_DATA, LifeinweeksView, VIEW_TYPE_LIFEINWEEKS } from './LifeinweeksView';
import { FRONTMATTER_KEY, LIFEINWEEKS_ICON } from './constants';
import { DEFAULT_SETTINGS, LifeinweeksSettings, LifeinweeksSettingTab } from './Settings';
import { t } from './lang/helpers';

export default class LifeinweeksPlugin extends Plugin {
	settings: LifeinweeksSettings;

	// Map of files and their view mode
	lifeinweeksFileModes: Record<string, string> = {};

	timer: NodeJS.Timeout | null;

	debounceView = (leaf: WorkspaceLeaf) => {
		this.timer && clearTimeout(this.timer);

		this.timer = setTimeout(() => {
			this.timer && clearTimeout(this.timer);
			this.timer = null;
			this.setLifeinweeksView(leaf);
		}, 200);
	}

	clear(): void {
        this.timer && clearTimeout(this.timer);
        this.timer = null;
    }

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new LifeinweeksSettingTab(this.app, this));

		this.registerView(
			VIEW_TYPE_LIFEINWEEKS,
			(leaf) => new LifeinweeksView(leaf, this)
		);

		this.addCommand({
			id: 'toggle-lifeinweeks-view',
			name: t('Toggle Life in Weeks View'),
			checkCallback: (checking: boolean) => {
				const activeFile = this.app.workspace.getActiveFile();

				if (!activeFile) return false;
		
				const fileIsLifeinweeks = this.isLifeinweeksFile(activeFile);
		
				if (checking) {
					return fileIsLifeinweeks;
				}
		
				const activeView = this.app.workspace.getActiveViewOfType(LifeinweeksView);
		
				// Toggle to markdown view
				if (activeView) {
					this.lifeinweeksFileModes[activeFile.path] = "markdown";
					this.setMarkdownView(activeView.leaf);
				} else if (fileIsLifeinweeks) { // Toggle to Life in Weeks view
					const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);

					if (activeView) {
						this.lifeinweeksFileModes[activeFile.path] = VIEW_TYPE_LIFEINWEEKS;
						this.setLifeinweeksView(activeView.leaf);
					}
				}
			}
		});

		this.addCommand({
			id: 'open-configuration',
			name: t('Open configuration'),
			checkCallback: (checking: boolean) => {
				const activeFile = this.app.workspace.getActiveFile();

				if (!activeFile) return false;
		
				const fileIsLifeinweeks = this.isLifeinweeksFile(activeFile);
		
				if (checking) {
					return fileIsLifeinweeks;
				}
		
				const activeView = this.app.workspace.getActiveViewOfType(LifeinweeksView);
				if (!activeView) return;

				activeView.openConfiguration();
			}
		});

		this.registerEvent(this.app.workspace.on('active-leaf-change', leaf => {
			if (!leaf) return;
			const file = this.app.workspace.getActiveFile();
			if (!file || !this.isLifeinweeksFile(file) || this.lifeinweeksFileModes[file.path] === "markdown") return;

			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!activeView) return;
			this.debounceView(activeView.leaf);
		}));

		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file, source, leaf) => {
				if (!['more-options', 'pane-more-options', 'tab-header'].includes(source)) return;
				if (!(file instanceof TFile) || !(leaf?.view instanceof MarkdownView)) return;
				if (!this.isLifeinweeksFile(file)) return;

				menu.addItem((item) => {
					item
						.setTitle(t('Enable Life in Weeks view'))
						.setIcon(LIFEINWEEKS_ICON)
						.setSection('pane')
						.onClick(() => {
							this.lifeinweeksFileModes[file.path] = VIEW_TYPE_LIFEINWEEKS;
							this.setLifeinweeksView(leaf);
						});
				});
			})
		);

		this.addRibbonIcon(LIFEINWEEKS_ICON, t('Create new Life in Weeks note'), () => {
			this.createAndOpenDrawing();
		});
	}

	async onunload() {
		this.lifeinweeksFileModes = {};
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async createAndOpenDrawing(): Promise<string> {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_LIFEINWEEKS);

		const file = await this.app.vault.create(`${t('Life in Weeks')}.md`, DEFAULT_DATA);

		const leaf = this.app.workspace.getLeaf('tab');

		await leaf.openFile(file, { active: true });

		leaf.setViewState({
			type: VIEW_TYPE_LIFEINWEEKS,
			state: leaf.view.getState(),
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(VIEW_TYPE_LIFEINWEEKS)[0]
		);

		return file.path;

	}

	isLifeinweeksFile(file: TFile): boolean {
		const fileCache = this.app.metadataCache.getFileCache(file);
		return !!fileCache?.frontmatter && !!fileCache.frontmatter[FRONTMATTER_KEY];
	}

	async setMarkdownView(leaf: WorkspaceLeaf, focus = true) {
		await leaf.setViewState(
			{
				type: 'markdown',
				state: leaf.view.getState(),
				popstate: true,
			} as ViewState,
			{ focus }
		);
	}

	async setLifeinweeksView(leaf: WorkspaceLeaf) {
		await leaf.setViewState({
			type: VIEW_TYPE_LIFEINWEEKS,
			state: leaf.view.getState(),
			popstate: true,
		} as ViewState);
	}
}

