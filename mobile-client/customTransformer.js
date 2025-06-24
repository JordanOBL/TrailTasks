const svgTransformer = require('react-native-svg-transformer');
const babelTransformer = require('metro-react-native-babel-transformer');

module.exports.transform = function ({ src, filename, options }) {
    if (filename.endsWith('.svg')) {
        return svgTransformer.transform({ src, filename, options });
    }
    return babelTransformer.transform({ src, filename, options });
};
