// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Attempt to wrap with NativeWind, but fall back to default config if there are issues
try {
  const { withNativewind } = require('nativewind/metro');
  module.exports = withNativewind(config);
} catch (error) {
  // Fall back to default config if withNativewind fails
  module.exports = config;
}
