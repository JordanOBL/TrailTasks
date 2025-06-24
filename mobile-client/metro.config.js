const { getDefaultConfig } = require('@react-native/metro-config');

module.exports = (async () => {
    const defaultConfig = await getDefaultConfig(__dirname);

    return {
        ...defaultConfig,
        transformer: {
            ...defaultConfig.transformer,
            babelTransformerPath: require.resolve('./customTransformer'), // Use the custom transformer
            hermesParser: false,
        },
        resolver: {
            ...defaultConfig.resolver,
            sourceExts: [...defaultConfig.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx', 'cjs', 'svg'], // Add SVG support
            assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'), // Exclude SVG from assetExts
        },
    };
})();
