const React = require('react');
const { View } = require('react-native');

const MockRive = React.forwardRef((props, ref) => React.createElement(View, { ...props, ref, testID: props.testID || 'mock-rive' }));

module.exports = MockRive;
module.exports.default = MockRive;
module.exports.RiveRef = {};
