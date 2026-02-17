const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Evita que o Metro use o "exports" do package.json do @tanstack/react-query,
// que aponta para o build "modern" (ESM) e quebra a resolução de "./useQueries.js".
// Com isso o Metro usa "main"/"module" (build legacy) que funciona no React Native.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
