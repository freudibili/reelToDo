const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  "@common": "./src/common",
  "@features": "./src/features",
  "@core": "./src/core",
  "@config": "./src/config",
};

module.exports = config;
