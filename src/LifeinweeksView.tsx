import { Menu, TFile, TextFileView, WorkspaceLeaf, debounce } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import CustomViewContent from './components/CustomViewContent';
import { FRONTMATTER_KEY, LIFEINWEEKS_ICON } from "./constants";
import { LifeEntries, LifeinweeksConfig, parseLifeInWeeksMarkdown } from "./utils/markdownParser";
import LifeinweeksPlugin from "./main";
import { ConfigurationModal } from "./ConfigurationModal";
import { t } from "./lang/helpers";

export const VIEW_TYPE_LIFEINWEEKS = "lifeinweeks";

export const DEFAULT_DATA = `---
${FRONTMATTER_KEY}: true
---

## ${window.moment().format('YYYY-MM-DD')}: ${t('I discover the Life in Weeks plugin.')}
${t('It was an *interesting* find.')}

%% lifeinweeks:settings
\`\`\`
{
    "startDate": "2000-01-01",
    "endYear": 2100,
    "birthday": {
        "show": true,
        "date": "01-01",
        "text": "🎂 %s"
    },
    "decades": {
        "0": "${t('Early Years')}",
        "1": "${t('Teens')}"
    }
}
\`\`\`
%%
`;

export class LifeinweeksView extends TextFileView {
    constructor(leaf: WorkspaceLeaf, plugin: LifeinweeksPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    lifeEntries: LifeEntries;
    config: LifeinweeksConfig;
    path: string;

    plugin: LifeinweeksPlugin;

    root: Root;

    data: string = DEFAULT_DATA;

    declare file: TFile;
    
    icon = LIFEINWEEKS_ICON;

    timer: NodeJS.Timeout | null;

    debounceSave = () => {
        this.timer && clearTimeout(this.timer);

        this.timer = setTimeout(() => {
            this.timer && clearTimeout(this.timer);
            this.timer = null;
            this.save();
        }, 200);
    }

    getViewType() {
        return VIEW_TYPE_LIFEINWEEKS;
    }

    async onLoadFile(file: TFile): Promise<void> {
        this.file = file;

        const fileData = await this.app.vault.cachedRead(file);

        this.setViewData(fileData);

        const position = this.app.metadataCache.getFileCache(file)?.frontmatterPosition || { end: { line: -1 } },
              end = position.end.line + 1, // account for ending ---
              body = fileData.split("\n").slice(end).join("\n"),
              { lifeEntries, config } = parseLifeInWeeksMarkdown(body);

        this.config = config;
        this.lifeEntries = lifeEntries;
        this.path = file.path;

        this.render();

        this.initHeaderButtons();
    }

    async onUnloadFile(file: TFile): Promise<void> {
        this.clear();
    }

    onunload() {
        this.clear();

        this.root?.unmount();
    }

    async onClose() {
        this.root?.unmount();
    }

    getViewData(): string {
        return this.data;
    }

    setViewData(data: string = DEFAULT_DATA, clear = false): void {
        this.data = data;

        if (clear) {
            this.clear();
        }
    }

    async save(clear = false) {
        try {
            this.app.vault.modify(this.file, this.data);

            if (clear) {
                this.clear();
            }
        } catch (err) {
            console.error('Save failed:', err);
        }
    }

    async render() {
        this.root = this.root || createRoot(this.containerEl.children[1]);

        this.root?.render(
            <CustomViewContent title={this.file.basename} lifeEntries={this.lifeEntries} config={this.config} app={this.app} view={this} path={this.path} />
        );
    }

    onPaneMenu(menu: Menu, source: "more-options" | "tab-header" | string, callSuper = true): void {
        if (source !== 'more-options') {
            super.onPaneMenu(menu, source);
            return;
        }

        menu
            .addItem((item) => {
                item
                    .setTitle(t('Open as markdown'))
                    .setIcon("pencil-line")
                    .setSection('pane')
                    .onClick(() => {
                        this.plugin.lifeinweeksFileModes[this.file.path] = "markdown";
                        this.plugin.setMarkdownView(this.leaf);
                    });
            })
            .addItem((item) => {
                item
                    .setTitle(t('Open configuration'))
                    .setIcon('gear')
                    .setSection('pane')
                    .onClick(() => {
                        this.openConfiguration();
                    });
            });

        if (callSuper) {
            super.onPaneMenu(menu, source);
        }
    }

    initHeaderButtons = debounce(() => this._initHeaderButtons(), 10, true);

    _initHeaderButtons = async () => {
        if (this.plugin.settings.showConfigurationBtn) {
            this.addAction(
                'gear',
                t('Open configuration'),
                () => {
                    this.openConfiguration();
                }
            );
        }

        if (this.plugin.settings.showOpenInMarkdownBtn) {
            this.addAction(
                'pencil-line',
                t('Open as markdown'),
                () => {
                    this.plugin.lifeinweeksFileModes[this.file.path] = "markdown";
                    this.plugin.setMarkdownView(this.leaf);
                }
            );
        }
    }

    openConfiguration() {
        new ConfigurationModal(this.app, this.file.basename, this.config, (result: LifeinweeksConfig) => {
            this.config = result;

            let content = this.getViewData();

            // Extract config from Obsidian comments at the end
            const configMatch = content.match(/%% lifeinweeks:settings\s*```\s*({[\s\S]*?})\s*```\s*%%/);
            if (configMatch) {
                // Remove config section from content
                content = content.replace(/%% lifeinweeks:settings\s*```[\s\S]*?```\s*%%/, '').trim();
            }
            content += `\n\n%% lifeinweeks:settings\n\`\`\`\n${JSON.stringify(result, null, 2)}\n\`\`\`\n%%`;

            this.setViewData(content);
            this.debounceSave();
            this.render();
        }).open();
    }

    clear(): void {
        this.timer && clearTimeout(this.timer);
        this.timer = null;

        this.setViewData(DEFAULT_DATA);
        this.root?.render(null);
    }

}