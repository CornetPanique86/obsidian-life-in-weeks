# Life in Weeks for Obsidian

Create a Life in Weeks note that displays a grid of weeks, and add events to those weeks!

Inspired by [Buster Benson's Life in Weeks](https://busterbenson.com/life-in-weeks), and the idea is from [Wait But Why](https://waitbutwhy.com/2014/05/life-weeks.html).

<img width="1576" height="1032" alt="life-in-weeks-demo" src="https://github.com/user-attachments/assets/94e158c8-bc7a-469f-8315-ef3b0afa4af5" />

## Usage

**Use the generator using the ribbon icon 'Create new Life in Weeks note'.** If not, format your note this way:

1. Add the property `lifeinweeks-plugin: true` in your frontmatter.
2. At the end of your Markdown file, add the (empty) configuration (you can then use the 'Open configuration' button to set the values):

```
%% lifeinweeks:settings
\`\`\`
{
}
\`\`\`
%%
```

### Supported languages

English, French, Russian

## Manual Installation

1. Download the BRAT from the Obsidian Community plugins, and add this plugin from by copying this repository's link (In BRAT: Options -> Add Beta plugin -> Paste repo's URL).
2. Enable the plugin in Settings → Community Plugins

## Dev Installation

Clone this repository into your vault's plugins folder, then

```bash
# Install dependencies
npm install

# Start dev build (watches for changes)
npm run dev

# Build for production
npm run build
```

And enable the plugin in Obsidian

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue if you find any bugs or have feature requests.

## Credits

`src/components/FadeInOut.tsx`: https://codesandbox.io/p/sandbox/react-fadein-out-transition-component-eww6j

`src/hooks/useMarkdownRenderer.ts`: https://github.com/Quorafind/Obsidian-Card-Library/blob/main/src/hooks/useMarkdownRenderer.ts

`src/LifeinweeksView.tsx`: https://github.com/korbinjoe/obsidian-textfileview-plugin-sample
