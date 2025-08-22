import { App, Modal, Setting } from 'obsidian';
import { LifeinweeksConfig } from './utils/markdownParser';

export class ConfigurationModal extends Modal {
    constructor(app: App, title: string, config: LifeinweeksConfig, onSubmit: (result: LifeinweeksConfig) => void) {
        super(app);

        const result = {
            startDate: config.startDate,
            endYear: config.endYear?.toString(),
            birthday: {
                show: config.birthday?.show,
                date: config.birthday?.date,
                text: config.birthday?.text
            },
            decades: config.decades,
        }

        this.setTitle(title);

        new Setting(this.contentEl)
            .setName('Starting date')
            .addText((text) =>
                text
                    .setPlaceholder('YYYY-MM-DD')
                    .setValue(config.startDate ?? "")
                    .onChange((value) => {
                        result.startDate = value;
                    })
            );

        new Setting(this.contentEl)
            .setName('Ending year')
            .addText((text) =>
                text
                    .setPlaceholder('YYYY')
                    .setValue(config.endYear?.toString() ?? "")
                    .onChange((value) => {
                        result.endYear = value;
                    })
            );

        new Setting(this.contentEl)
            .setName('Show birthday')
            .addToggle(toggle => toggle
                .setValue(config.birthday?.show ?? true)
                .onChange(value => {
                    result.birthday.show = value;
                })
            );

        new Setting(this.contentEl)
            .setName('Birthday')
            .addText((text) =>
                text
                    .setPlaceholder('MM-DD')
                    .setValue(config.birthday?.date ?? "")
                    .onChange((value) => {
                        result.birthday.date = value;
                    })
            );

        new Setting(this.contentEl)
            .setName('Birthday display text')
            .setDesc('Use %s for the age placeholder')
            .addText((text) =>
                text
                    .setPlaceholder('🎂 %s')
                    .setValue(config.birthday?.text ?? "")
                    .onChange((value) => {
                        result.birthday.text = value;
                    })
            );

        new Setting(this.contentEl).setName("Decades text").setHeading();

        const startYear = config.startDate ? parseInt(config.startDate.substring(0, 4), 10) : undefined;
        const decades = (config.endYear && startYear)
            ? Math.floor((config.endYear - startYear) / 10) + 1
            : 10;
        for (let i = 0 ; i < decades ; i++) {
            new Setting(this.contentEl)
                .setName(`Decade ${i}`)
                .addText((text) =>
                    text
                        .setPlaceholder(i + '0s')
                        .setValue(config.decades?.[i] ?? "")
                        .onChange((newValue) => {
                            if (!result.decades) result.decades = {};
                            result.decades[i] = newValue;
                        })
                );
        }

        const errorsContainer = this.contentEl.createEl("p");
        errorsContainer.classList.add("liwModal__errors");

        new Setting(this.contentEl)
          .addButton((btn) =>
            btn
              .setButtonText('Submit')
              .setCta()
              .onClick(() => {
                const errors = [];
                if (result.startDate && !/^\d{4}-\d{2}-\d{2}$/.test(result.startDate)) {
                    errors.push("Start date must be in YYYY-MM-DD format.");
                }
                if (result.endYear && !/^\d{4}$/.test(result.endYear) && !parseInt(result.endYear)) {
                    errors.push("End year must be a valid year.");
                }
                if (result.birthday.date && !/^\d{2}-\d{2}$/.test(result.birthday.date)) {
                    errors.push("Birthday must be in MM-DD format.");
                }
                if (errors.length > 0) {
                    errorsContainer.setText("Submit failed:\n" + errors.join("\n"));
                    return;
                }

                this.close();
                onSubmit({
                    startDate: result.startDate,
                    endYear: result.endYear ? parseInt(result.endYear) : undefined,
                    birthday: {
                        show: result.birthday.show,
                        date: result.birthday.date,
                        text: result.birthday.text
                    },
                    decades: result.decades
                });
              }));
    }
}