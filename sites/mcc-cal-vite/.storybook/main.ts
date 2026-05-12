import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|md)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions'
  ],
  framework: {
    name: '@storybook/react',
    options: {},
  },
  docs: {
    autodocs: {
      tag: 'autodocs',
    routeBasePath: '/docs',
    tocTemplate: '# Table of Contents\n\n{{#toc}}\n\n---\n\n{{#content}}',
    defaultName: 'Documentation',
      title: 'McCal Media Components',
      description: 'Component documentation and usage examples',
    },
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgen: 'react-docgen-typescript',
  },
  viteFinal: async () => ({
    define: {
      imports: [
        `import React from 'react'`,
        `import { type StoryFn, type Meta } from '@storybook/react'`,
      ],
    globalComponents: ['@storybook/react'],
    plugins: [
        {
          name: '@storybook/react',
          options: {},
        },
      ],
    ],
  }),
}),
};

export default config;
