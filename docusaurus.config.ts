import path from 'path';
import {themes as prismThemes, type Theme} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// GitHub "Dark Dimmed" syntax colors; background matches the dark raised
// surface (--ifm-background-surface-color) so code blocks sit one layer up
// from the page canvas.
const prismDarkDimmedTheme: Theme = {
  plain: {color: '#adbac7', backgroundColor: '#262c28'},
  styles: [
    {types: ['comment', 'prolog', 'doctype', 'cdata'], style: {color: '#768390', fontStyle: 'italic'}},
    {types: ['namespace'], style: {color: '#909dab'}},
    {types: ['string', 'char', 'attr-value'], style: {color: '#96d0ff'}},
    {types: ['punctuation', 'operator'], style: {color: '#adbac7'}},
    {
      types: [
        'entity',
        'url',
        'symbol',
        'number',
        'boolean',
        'variable',
        'constant',
        'property',
        'regex',
        'inserted',
        'attr-name',
      ],
      style: {color: '#6cb6ff'},
    },
    {types: ['atrule', 'keyword', 'selector'], style: {color: '#f47067'}},
    {types: ['function', 'function-variable', 'deleted'], style: {color: '#dcbdfb'}},
    {types: ['tag'], style: {color: '#8dddd2'}},
  ],
};

// GitHub light syntax colors, but on a white panel so code blocks read as
// raised surfaces over the paper canvas.
const prismLightTheme: Theme = {
  ...prismThemes.github,
  plain: {...prismThemes.github.plain, backgroundColor: '#ffffff'},
};

const config: Config = {
  title: 'Knowledge Base',
  tagline: 'Internal knowledge base for SAILTECHTEAM',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
    faster: {
      swcJsLoader: true,
      swcJsMinimizer: true,
      swcHtmlMinimizer: true,
      lightningCssMinimizer: true,
      rspackBundler: true,
      rspackPersistentCache: true,
      ssgWorkerThreads: true,
      mdxCrossCompilerCache: true,
    },
  },

  url: 'https://sailtechteam.github.io',
  baseUrl: '/knowledge-base/',

  organizationName: 'Linshu-Song',
  projectName: 'knowledge-base',

  onBrokenLinks: 'warn',
  onBrokenAnchors: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-CN', 'zh-HK'],
    localeConfigs: {
      en: {label: 'English'},
      'zh-CN': {label: '简体中文'},
      'zh-HK': {label: '繁體中文'},
    },
  },

  markdown: {
    mermaid: true,
    format: 'detect',
  },

  themes: ['@docusaurus/theme-mermaid'],

  plugins: [
    function photoswipePlugin() {
      return {
        name: 'photoswipe-plugin',
        getClientModules() {
          return [path.resolve(__dirname, './plugins/photoswipe/client')];
        },
      };
    },
    [
      'docusaurus-numbered-headings',
      {
        enabled: true,
        convention: 'iso-2145',
      },
    ],
    function vscodeLanguageserverAliasPlugin() {
      return {
        name: 'vscode-languageserver-alias-plugin',
        configureWebpack() {
          return {
            resolve: {
              alias: {
                'vscode-languageserver-types': path.resolve(
                  __dirname,
                  'node_modules/vscode-languageserver-types/lib/esm/main.js',
                ),
              },
            },
          };
        },
      };
    },
  ],

  stylesheets: [
    'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Source+Code+Pro:wght@200..900&display=swap',
    'https://fonts.googleapis.com/css2?family=Google+Sans+Code:ital,wght,MONO@0,300..800,1;1,300..800,1&family=Intel+One+Mono:ital,wght@0,300..700;1,300..700&display=swap',
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/SAILTECHTEAM/knowledge-base/tree/main/',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          showLastUpdateTime: false,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Knowledge Base',
      items: [
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/SAILTECHTEAM/knowledge-base',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      copyright: `Copyright \u00a9 ${new Date().getFullYear()} SAILTECHTEAM. Built with Docusaurus.`,
    },
    prism: {
      theme: prismLightTheme,
      darkTheme: prismDarkDimmedTheme,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
