const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Make sure SVG, TTF, and other assets are handled as binary assets (not JS)
config.resolver.assetExts = config.resolver.assetExts
  .filter(ext => !['js', 'jsx', 'ts', 'tsx'].includes(ext))
  .concat(['ttf', 'otf', 'woff', 'woff2', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']);

module.exports = config;