import type { BiometricChangeEvent } from './NativeReactNativeBiometrics';
import { type LogEntry } from './logger';
import { type EventSubscription } from 'react-native';
import { AuthType, BiometricStrength, type BiometryType } from './types';
export declare function isSensorAvailable(options?: {
    biometricStrength?: BiometricStrength;
}): Promise<BiometricSensorInfo>;
export declare function simplePrompt(promptMessage: string, options?: {
    biometricStrength?: BiometricStrength;
}): Promise<BiometricAuthResult>;
export { AuthType, BiometricStrength, BiometryTypes } from './types';
export type { BiometryType } from './types';
export declare function authenticateWithOptions(options: BiometricAuthOptions): Promise<BiometricAuthResult>;
export declare function createKeys(keyAlias?: string, keyType?: 'rsa2048' | 'ec256', biometricStrength?: BiometricStrength, allowDeviceCredentials?: boolean, failIfExists?: boolean): Promise<KeyCreationResult>;
/**
 * Creates a key pair using an options object, with control over whether the
 * key requires user authentication.
 *
 * With `requireAuthentication: false` the key can sign without any biometric
 * or device-credential prompt (see {@link sign}), while the private key still
 * never leaves the Android Keystore / iOS Keychain (Secure Enclave for EC
 * keys on device). Defaults preserve the behavior of {@link createKeys}:
 * keys are biometric-gated.
 *
 * @example
 * // Hardware-backed key usable without a biometric prompt
 * const { publicKey } = await createKeysWithOptions({
 *   keyAlias: 'server-auth-key',
 *   keyType: 'rsa2048',
 *   requireAuthentication: false,
 * });
 */
export declare function createKeysWithOptions(options?: CreateKeysOptions): Promise<KeyCreationResult>;
export declare function deleteKeys(keyAlias?: string): Promise<KeyDeletionResult>;
export declare function validateKeyIntegrity(keyAlias?: string): Promise<KeyIntegrityResult>;
export declare function verifyKeySignature(keyAlias: string | undefined, data: string, promptTitle?: string, promptSubtitle?: string, cancelButtonText?: string, returnAuthType?: boolean): Promise<SignatureResult>;
/**
 * Signs data with biometric authentication using advanced options.
 * This method provides more control over the authentication process,
 * including the ability to disable device credential fallback.
 *
 * @param options - Signature options including keyAlias, data, prompt settings, and security options
 * @returns Promise with signature result
 *
 * @example
 * // Require biometrics only (no PIN/pattern fallback)
 * const result = await signWithOptions({
 *   keyAlias: 'my_key',
 *   data: 'data to sign',
 *   promptTitle: 'Sign Transaction',
 *   disableDeviceFallback: true,
 *   biometricStrength: 'strong'
 * });
 */
export declare function signWithOptions(options: SignatureOptions): Promise<SignatureResult>;
/**
 * Signs data without any biometric or device-credential prompt.
 *
 * Only works with keys created via
 * `createKeysWithOptions({ requireAuthentication: false })`. Calling it on a
 * biometric-gated key never shows a prompt — it resolves with
 * `{ success: false, errorCode: 'KEY_REQUIRES_AUTHENTICATION' }`; use
 * {@link signWithOptions} for those keys instead.
 *
 * @example
 * const result = await sign({
 *   keyAlias: 'server-auth-key',
 *   data: payload,
 *   algorithm: SignatureAlgorithm.SHA512withRSA,
 * });
 */
export declare function sign(options: SignOptions): Promise<SignatureResult>;
export declare function validateSignature(keyAlias: string | undefined, data: string, signature: string): Promise<SignatureValidationResult>;
export declare function sha256(data: string, inputEncoding?: 'utf8' | 'base64'): Promise<Sha256Result>;
export declare function getKeyAttributes(keyAlias?: string): Promise<KeyAttributesResult>;
/**
 * Checks whether a key exists for the given alias without triggering any
 * biometric prompt.
 */
export declare function keyExists(keyAlias?: string): Promise<boolean>;
/**
 * Retrieves the public key for the given alias without triggering any
 * biometric prompt.
 *
 * Like the `publicKey` returned by {@link createKeys}, the result is
 * base64-encoded X.509 SubjectPublicKeyInfo DER on both platforms and for
 * both key types, so once base64-decoded it can be consumed directly by
 * standard tooling (e.g. `openssl pkey -pubin -inform DER`).
 *
 * Rejects with code `KEY_NOT_FOUND` if no key exists for the alias. On iOS,
 * a biometric-gated key may reject with `KEY_REQUIRES_AUTHENTICATION`
 * because the Keychain can refuse even a non-interactive lookup of an
 * auth-bound key — capture the `publicKey` from {@link createKeys} at
 * creation time for those keys (Android is unaffected).
 */
export declare function getPublicKey(keyAlias?: string): Promise<PublicKeyResult>;
export declare function configureKeyAlias(keyAlias: string): Promise<void>;
export declare function getDefaultKeyAlias(): Promise<string>;
export declare function getAllKeys(customAlias?: string): Promise<GetAllKeysResult>;
export declare function getDiagnosticInfo(): Promise<DiagnosticInfo>;
export declare function runBiometricTest(): Promise<BiometricTestResult>;
export declare function setDebugMode(enabled: boolean): Promise<void>;
export declare function getDeviceIntegrityStatus(): Promise<DeviceIntegrityResult>;
export type BiometricConfig = {
    keyAlias?: string;
    keyPrefix?: string;
};
export declare function configure(config: BiometricConfig): Promise<void>;
export type BiometricSensorInfo = {
    available: boolean;
    biometryType?: BiometryType;
    error?: string;
    errorCode?: string;
    fallbackUsed?: boolean;
    biometricStrength?: BiometricStrength;
    isDeviceSecure: boolean;
};
export type BiometricAuthOptions = {
    title?: string;
    subtitle?: string;
    description?: string;
    fallbackLabel?: string;
    cancelLabel?: string;
    disableDeviceFallback?: boolean;
    allowDeviceCredentials?: boolean;
    biometricStrength?: BiometricStrength;
    returnAuthType?: boolean;
};
export type BiometricAuthResult = {
    success: boolean;
    error?: string;
    errorCode?: string;
    fallbackUsed?: boolean;
    biometricStrength?: BiometricStrength;
    authType?: AuthType;
};
export type KeyCreationResult = {
    /** Base64-encoded X.509 SubjectPublicKeyInfo DER. */
    publicKey: string;
};
/**
 * Options for {@link createKeysWithOptions}.
 */
export type CreateKeysOptions = {
    /** The key alias. Defaults to the configured alias. */
    keyAlias?: string;
    /** Key type: 'rsa2048' or 'ec256'. Platform default applies when omitted. */
    keyType?: 'rsa2048' | 'ec256';
    /**
     * When true (default), using the private key requires user authentication —
     * the existing biometric-gated behavior. When false, the key is created
     * without any user-authentication requirement so {@link sign} works without
     * a prompt. The private key remains non-exportable in the Keystore/Keychain
     * and is hardware-backed where supported (Android TEE/StrongBox, iOS Secure
     * Enclave for EC keys; iOS RSA keys reside in the regular Keychain).
     */
    requireAuthentication?: boolean;
    /** Ignored when requireAuthentication is false. (Android only) */
    biometricStrength?: BiometricStrength;
    /** Ignored when requireAuthentication is false. */
    allowDeviceCredentials?: boolean;
    /** When true, rejects with KEY_ALREADY_EXISTS instead of replacing the key. */
    failIfExists?: boolean;
};
export type PublicKeyResult = {
    /** Base64-encoded X.509 SubjectPublicKeyInfo DER. */
    publicKey: string;
    /** 'rsa2048' or 'ec256' when the platform can determine it. */
    keyType?: string;
};
export type KeyDeletionResult = {
    success: boolean;
};
export type KeyIntegrityResult = {
    valid: boolean;
    keyExists: boolean;
    keyAttributes?: {
        algorithm: string;
        keySize: number;
        creationDate?: string;
        securityLevel: string;
    };
    integrityChecks: {
        keyFormatValid: boolean;
        keyAccessible: boolean;
        signatureTestPassed: boolean;
        hardwareBacked: boolean;
        strongBoxBacked?: boolean;
    };
    error?: string;
};
export type SignatureResult = {
    success: boolean;
    signature?: string;
    error?: string;
    errorCode?: string;
    authType?: AuthType;
};
/**
 * Input encoding for signature data.
 * Use this enum to specify how the input data should be interpreted.
 */
export declare enum InputEncoding {
    /** Data is a UTF-8 string (default) */
    UTF8 = "utf8",
    /** Data is base64-encoded binary - use for WebAuthn challenges or other binary data */
    Base64 = "base64"
}
/**
 * Signature algorithm for prompt-free signing via {@link sign}.
 *
 * Note: on Android, keys created before SHA-512 support was added (and keys
 * generated inside StrongBox) only permit SHA-256 — requesting a SHA-512
 * variant on such a key fails with UNSUPPORTED_ALGORITHM. On iOS the
 * algorithm is chosen per call and works with existing keys.
 */
export declare enum SignatureAlgorithm {
    SHA256withRSA = "SHA256withRSA",
    SHA512withRSA = "SHA512withRSA",
    SHA256withECDSA = "SHA256withECDSA",
    SHA512withECDSA = "SHA512withECDSA"
}
/**
 * Options for {@link sign} (prompt-free signing).
 */
export type SignOptions = {
    /** The key alias to use for signing. Defaults to the configured alias. */
    keyAlias?: string;
    /** The data to sign */
    data: string;
    /** Encoding of the input data. Defaults to InputEncoding.UTF8. */
    inputEncoding?: InputEncoding;
    /**
     * Signature algorithm. Defaults to the SHA-256 variant matching the key
     * type (SHA256withRSA for RSA keys, SHA256withECDSA for EC keys). Must
     * match the key type: requesting an RSA algorithm on an EC key (or vice
     * versa) fails with INVALID_ALGORITHM.
     */
    algorithm?: SignatureAlgorithm;
};
/**
 * Options for signing data with advanced security controls.
 */
export type SignatureOptions = {
    /** The key alias to use for signing. Defaults to the configured alias. */
    keyAlias?: string;
    /** The data to sign */
    data: string;
    /**
     * Encoding of the input data. Use InputEncoding enum.
     * - InputEncoding.UTF8 (default): Data is treated as a UTF-8 string
     * - InputEncoding.Base64: Data is decoded from base64 before signing
     *
     * Use InputEncoding.Base64 for WebAuthn challenges or other binary data.
     * This avoids double-encoding when your challenge is already bytes.
     *
     * @example
     * // For WebAuthn with binary challenge
     * signWithOptions({
     *   data: base64Challenge,
     *   inputEncoding: InputEncoding.Base64
     * })
     */
    inputEncoding?: InputEncoding;
    /** Title for the biometric prompt */
    promptTitle?: string;
    /** Subtitle for the biometric prompt */
    promptSubtitle?: string;
    /** Text for the cancel button */
    cancelButtonText?: string;
    /**
     * Biometric strength requirement (Android only).
     *
     * Has no effect on the signing prompt: Android Keystore keys can only be
     * unlocked by Class 3 (strong) biometrics or device credentials, and a
     * CryptoObject-bound prompt rejects Class 2 (weak) biometrics, so the
     * prompt offers the authenticators the key was created with. Camera-based
     * face unlock is Class 2 on most phones. To accept it, authenticate with
     * `authenticateWithOptions({ biometricStrength: BiometricStrength.Weak })`
     * first and sign with a key from
     * `createKeysWithOptions({ requireAuthentication: false })`.
     */
    biometricStrength?: BiometricStrength;
    /**
     * When true, prevents fallback to device credentials (PIN/pattern/password).
     * If biometrics are not available and this is true, the operation will fail.
     * This is useful for high-security operations that require biometric-only authentication.
     * (Android only - iOS Secure Enclave keys already enforce biometrics by default)
     */
    disableDeviceFallback?: boolean;
    /**
     * When true, includes authType in the result indicating how the user authenticated.
     * See AuthType enum for possible values.
     */
    returnAuthType?: boolean;
};
export type SignatureValidationResult = {
    valid: boolean;
    error?: string;
};
export type Sha256Result = {
    hash: string;
    error?: string;
};
export type KeyAttributesResult = {
    exists: boolean;
    attributes?: {
        algorithm: string;
        keySize: number;
        purposes: string[];
        digests: string[];
        padding: string[];
        creationDate?: string;
        securityLevel: string;
        hardwareBacked: boolean;
        userAuthenticationRequired: boolean;
    };
    error?: string;
};
export type GetAllKeysResult = {
    keys: Array<{
        alias: string;
        /** Base64-encoded X.509 SubjectPublicKeyInfo DER. */
        publicKey: string;
    }>;
};
export type DiagnosticInfo = {
    platform: string;
    osVersion: string;
    deviceModel: string;
    biometricCapabilities: string[];
    securityLevel: string;
    keyguardSecure: boolean;
    enrolledBiometrics: string[];
    lastError?: string;
};
export type BiometricTestResult = {
    success: boolean;
    results: {
        sensorAvailable: boolean;
        canAuthenticate: boolean;
        hardwareDetected: boolean;
        hasEnrolledBiometrics: boolean;
        secureHardware: boolean;
    };
    errors: string[];
    warnings: string[];
};
export type DeviceIntegrityResult = {
    isRooted?: boolean;
    isJailbroken?: boolean;
    isKeyguardSecure?: boolean;
    hasSecureHardware?: boolean;
    hasRuntimeHooks?: boolean;
    isDebuggerAttached?: boolean;
    runtimeHookDetails?: {
        fridaDetected: boolean;
        xposedDetected?: boolean;
    };
    isCompromised: boolean;
    riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
    error?: string;
};
export { logger, LogLevel, type LogEntry, type LoggerConfig, enableLogging, setLogLevel, configureLogger, } from './logger';
export declare function getLogs(): LogEntry[];
export declare function clearLogs(): void;
export type { BiometricChangeEvent };
/**
 * Subscribes to biometric change events.
 *
 * @param callback - Function to be called when biometric changes are detected
 * @returns EventSubscription that can be used to unsubscribe
 */
export declare function subscribeToBiometricChanges(callback: (event: BiometricChangeEvent) => void): EventSubscription;
/**
 * Unsubscribes from biometric change events.
 *
 * @param subscription - The EventSubscription returned from subscribeToBiometricChanges
 */
export declare function unsubscribeFromBiometricChanges(subscription: EventSubscription): void;
/**
 * Starts biometric change detection.
 * This will begin monitoring for changes in biometric enrollment.
 *
 * @returns Promise that resolves when detection is started
 */
export declare function startBiometricChangeDetection(): Promise<void>;
/**
 * Stops biometric change detection.
 * This will stop monitoring for changes in biometric enrollment.
 *
 * @returns Promise that resolves when detection is stopped
 */
export declare function stopBiometricChangeDetection(): Promise<void>;
//# sourceMappingURL=index.d.ts.map