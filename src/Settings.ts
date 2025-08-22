import { App, PluginSettingTab, Setting } from "obsidian";
import LifeinweeksPlugin from "./main";

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

        new Setting(containerEl).setName("Document Header Buttons").setHeading();

        new Setting(containerEl)  
          .setName('Show Open Configuration')  
          .addToggle(toggle => toggle  
             .setValue(this.plugin.settings.showConfigurationBtn)  
             .onChange(async (value) => {  
                this.plugin.settings.showConfigurationBtn = value;  
                await this.plugin.saveSettings();  
                this.display();  
             })  
          );

          new Setting(containerEl)
            .setName('Show Open in Markdown')
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
