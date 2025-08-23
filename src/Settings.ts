import { App, PluginSettingTab, Setting } from "obsidian";
import LifeinweeksPlugin from "./main";
import { t } from "./lang/helpers";

export interface LifeinweeksSettings {
    showConfigurationBtn: boolean;
    showOpenInMarkdownBtn: boolean;
}

export const DEFAULT_SETTINGS: Partial<LifeinweeksSettings> = {
    showConfigurationBtn: true,
    showOpenInMarkdownBtn: true,
};

export class LifeinweeksSettingTab extends PluginSettingTab {
    plugin: LifeinweeksPlugin;
  
    constructor(app: App, plugin: LifeinweeksPlugin) {
      super(app, plugin);
      this.plugin = plugin;
    }
  
    display(): void {
        const { containerEl } = this;
        
        containerEl.empty();

        // can't add a header because of guidelines
        // new Setting(containerEl).setName("Document Header Buttons").setHeading();

        new Setting(containerEl)  
          .setName(t('Show') + ' ' + t('Open configuration'))
          .setDesc(t('As a button in the document header'))
          .addToggle(toggle => toggle  
             .setValue(this.plugin.settings.showConfigurationBtn)  
             .onChange(async (value) => {  
                this.plugin.settings.showConfigurationBtn = value;  
                await this.plugin.saveSettings();  
                this.display();  
             })  
          );

          new Setting(containerEl)
            .setName(t('Show') + ' ' + t('Open as markdown'))
            .setDesc(t('As a button in the document header'))
            .addToggle(toggle => toggle
              .setValue(this.plugin.settings.showOpenInMarkdownBtn)
              .onChange(async (value) => {
                this.plugin.settings.showOpenInMarkdownBtn = value;
                await this.plugin.saveSettings();
                this.display();
              })
            );
    }
}
