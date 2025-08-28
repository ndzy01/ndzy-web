import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

const defaultMeta = {
  charset: {
    charset: 'UTF-8',
  },
  viewport: 'width=device-width,initial-scale=1.0,user-scalable=no',
};
export default defineConfig({
  plugins: [pluginReact()],
  output: {
    assetPrefix: '/music/',
  },
  html: {
    title: 'web',
    favicon: 'https://cdn.jsdelivr.net/gh/ndzy01/img/ndzy.png',
    meta: defaultMeta,
  },
});
