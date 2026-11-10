"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("expo/config-plugins");
const pkg = require('../../package.json');
const DEFAULT_FACE_ID_PERMISSION = 'Allow $(PRODUCT_NAME) to use Face ID for secure authentication';
const BIOMETRIC_PERMISSIONS = [
    'android.permission.USE_BIOMETRIC',
    'android.permission.USE_FINGERPRINT',
];
/**
 * Add the NSFaceIDUsageDescription key to Info.plist.
 * An existing value (e.g. from `ios.infoPlist`) is kept unless an explicit
 * `faceIDPermission` string is provided.
 */
const withBiometricsIOS = (config, options) => {
    return (0, config_plugins_1.withInfoPlist)(config, (iosConfig) => {
        if (options.faceIDPermission !== false) {
            iosConfig.modResults.NSFaceIDUsageDescription =
                options.faceIDPermission ||
                    iosConfig.modResults.NSFaceIDUsageDescription ||
                    DEFAULT_FACE_ID_PERMISSION;
        }
        return iosConfig;
    });
};
/**
 * Add the USE_BIOMETRIC and USE_FINGERPRINT permissions to AndroidManifest.xml.
 * `withPermissions` de-duplicates against permissions that already exist.
 */
const withBiometricsAndroid = (config) => {
    return config_plugins_1.AndroidConfig.Permissions.withPermissions(config, BIOMETRIC_PERMISSIONS);
};
const withBiometrics = (config, options) => {
    config = withBiometricsIOS(config, options || {});
    config = withBiometricsAndroid(config);
    return config;
};
exports.default = (0, config_plugins_1.createRunOncePlugin)(withBiometrics, pkg.name, pkg.version);
