import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 — Knowledge Graph: Claude Code & SDD
 * Tema: Catppuccin Mocha (dark) / Latte (light)
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Knowledge Graph — Claude Code & SDD",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "pt-BR",
    // baseUrl: "seudominio.com", // descomente para deploy
    ignorePatterns: ["private", "templates", ".obsidian", "copilot-codex"],
    defaultDateType: "modified",
    generateSocialImages: false,
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Inter",
        body: "Inter",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#eff1f5",       // Catppuccin Latte: base
          lightgray: "#e6e9ef",   // mantle
          gray: "#8c8fa1",        // overlay1
          darkgray: "#5c5f77",    // subtext0
          dark: "#4c4f69",        // text
          secondary: "#1e66f5",   // blue
          tertiary: "#7287fd",    // lavender
          highlight: "rgba(30, 102, 245, 0.1)",
          textHighlight: "#df8e1d88", // yellow
        },
        darkMode: {
          light: "#1e1e2e",       // Catppuccin Mocha: base
          lightgray: "#313244",   // surface0
          gray: "#6c7086",        // overlay0
          darkgray: "#a6adc8",    // subtext1
          dark: "#cdd6f4",        // text
          secondary: "#89b4fa",   // blue
          tertiary: "#b4befe",    // lavender
          highlight: "rgba(137, 180, 250, 0.12)",
          textHighlight: "#f9e2af88", // yellow
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "one-dark-pro",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents({
        showByDefault: true,
        minEntries: 2,
      }),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
