export declare enum BiometricStrength {
    Strong = "strong",
    Weak = "weak"
}
/**
 * Named `BiometryType` values, a drop-in for `BiometryTypes` from
 * `react-native-biometrics`.
 */
export declare const BiometryTypes: {
    readonly Biometrics: "Biometrics";
    readonly FaceID: "FaceID";
    readonly TouchID: "TouchID";
    readonly OpticID: "OpticID";
    readonly None: "None";
    readonly Unknown: "Unknown";
};
/**
 * The kind of biometry reported by `isSensorAvailable`.
 *
 * Android reports 'Biometrics' for any available sensor; 'FaceID', 'TouchID'
 * and 'OpticID' are iOS values. 'None' and 'Unknown' mean no usable sensor.
 */
export type BiometryType = (typeof BiometryTypes)[keyof typeof BiometryTypes];
/**
 * The type of authentication used to authenticate the user.
 *
 * On iOS, the actual authentication type is inferred from the biometrics
 * available on the device, due to platform limitations.
 */
export declare enum AuthType {
    Unknown = -1,
    None = 0,
    DeviceCredentials = 1,
    Biometrics = 2,
    FaceID = 3,
    TouchID = 4,
    OpticID = 5
}
//# sourceMappingURL=types.d.ts.map