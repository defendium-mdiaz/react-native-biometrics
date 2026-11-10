"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BiometryTypes = exports.BiometricStrength = exports.AuthType = void 0;
let BiometricStrength = exports.BiometricStrength = /*#__PURE__*/function (BiometricStrength) {
  BiometricStrength["Strong"] = "strong";
  BiometricStrength["Weak"] = "weak";
  return BiometricStrength;
}({});
/**
 * Named `BiometryType` values, a drop-in for `BiometryTypes` from
 * `react-native-biometrics`.
 */
const BiometryTypes = exports.BiometryTypes = {
  Biometrics: 'Biometrics',
  FaceID: 'FaceID',
  TouchID: 'TouchID',
  OpticID: 'OpticID',
  None: 'None',
  Unknown: 'Unknown'
};

/**
 * The kind of biometry reported by `isSensorAvailable`.
 *
 * Android reports 'Biometrics' for any available sensor; 'FaceID', 'TouchID'
 * and 'OpticID' are iOS values. 'None' and 'Unknown' mean no usable sensor.
 */
/**
 * The type of authentication used to authenticate the user.
 *
 * On iOS, the actual authentication type is inferred from the biometrics
 * available on the device, due to platform limitations.
 */
let AuthType = exports.AuthType = /*#__PURE__*/function (AuthType) {
  AuthType[AuthType["Unknown"] = -1] = "Unknown";
  AuthType[AuthType["None"] = 0] = "None";
  AuthType[AuthType["DeviceCredentials"] = 1] = "DeviceCredentials";
  AuthType[AuthType["Biometrics"] = 2] = "Biometrics";
  AuthType[AuthType["FaceID"] = 3] = "FaceID";
  AuthType[AuthType["TouchID"] = 4] = "TouchID";
  AuthType[AuthType["OpticID"] = 5] = "OpticID";
  return AuthType;
}({});
//# sourceMappingURL=types.js.map