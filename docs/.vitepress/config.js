import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Kachina-MD',
  ignoreDeadLinks:true,
  description: 'WhatsApp Bot Framework - Simple, Fast, and Modular',
  base: '/', // GitHub Pages base URL

  head: [
    ['link', { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#0eb94dff' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'Kachina-MD | WhatsApp Bot Framework' }],
    ['meta', { property: 'og:site_name', content: 'Kachina-MD' }],
    ['meta', { property: 'og:image', content: 'https://kachina-md.dev/og-image.png' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/client' },
      { text: 'Examples', link: '/examples/basic-bot' },
      {
        text: 'v2.x.x',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'Contributing', link: '/contributing' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Kachina-MD?', link: '/guide/what-is-kachina' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
          ]
        },
        {
          text: 'Authentication',
          items: [
            { text: 'Overview', link: '/guide/authentication/overview' },
            { text: 'QR Code Method', link: '/guide/authentication/qr-code' },
            { text: 'Pairing Code Method', link: '/guide/authentication/pairing-code' },
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Client', link: '/guide/core/client' },
            { text: 'Messages', link: '/guide/core/messages' },
            { text: 'Events', link: '/guide/core/events' },
            { text: 'Plugins', link: '/guide/core/plugins' },
          ]
        },
        {
          text: 'Features',
          items: [
            { text: 'Sending Messages', link: '/guide/features/sending-messages' },
            { text: 'Media Handling', link: '/guide/features/media' },
            { text: 'Stickers', link: '/guide/features/stickers' },
            { text: 'View Once Messages', link: '/guide/features/view-once' },
            { text: 'Groups', link: '/guide/features/groups' },
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Client', link: '/api/client' },
            { text: 'Messages', link: '/api/messages' },
            { text: 'Media', link: '/api/media' },
            { text: 'Groups', link: '/api/groups' },
            { text: 'Stickers', link: '/api/stickers' },
            { text: 'Helpers', link: '/api/utils' },
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Basic Bot', link: '/examples/basic-bot' },
            { text: 'Pairing Code Bot', link: '/examples/pairing-bot' },
            { text: 'View Once Reader', link: '/examples/view-once' },
            { text: 'Group Management', link: '/examples/group-management' },
            { text: 'Media Bot', link: '/examples/media-bot' },
            { text: 'Plugin System', link: '/examples/plugins' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/idlanyor/kachina-core' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@roidev/kachina-md' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Roynaldi'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/idlanyor/kachina-core/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  }
})
