import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { GenerateSW } from 'workbox-webpack-plugin';

const defaultMeta = {
  charset: {
    charset: 'UTF-8',
  },
  viewport: 'width=device-width,initial-scale=1.0,user-scalable=no',
};
export default defineConfig({
  tools: {
    rspack: {
      plugins: [
        new GenerateSW({
          clientsClaim: true,
          skipWaiting: true,
          maximumFileSizeToCacheInBytes: 500 * 1024 * 1024,
          cleanupOutdatedCaches: true,
          exclude: [/\.html$/, /\.js$/, /\.css$/, /\.txt$/],
          importScripts: ['cache-handler.js'],
        }),
      ],
    },
  },
  plugins: [pluginReact()],
  output: {
    assetPrefix: '/ndzy-web/',
  },
  html: {
    title: 'web',
    favicon: 'https://cdn.jsdelivr.net/gh/ndzy01/img/ndzy.png',
    meta: defaultMeta,
  },
});
