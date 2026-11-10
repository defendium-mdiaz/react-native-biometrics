"use strict";

import ReactNativeBiometrics from "./NativeReactNativeBiometrics.js";
import { logger, LogLevel } from "./logger.js";
// Biometric Change Detection API
import { DeviceEventEmitter, NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { BiometricStrength } from "./types.js";

/**
 * True in development builds. Bundlers and test setups that don't define
 * `__DEV__` count as release builds instead of throwing a ReferenceError.
 */
function isDev() {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

/**
 * Runs a native call with the library's standard logging. Logging only
 * happens in development builds, so it compiles out of release bundles,
 * where this is just `call()`.
 */
function logged(context, data, call) {
  if (!isDev()) {
    return call();
  }
  logger.debug(`${context} started`, context, data);
  return call().then(result => {
    logger.info(`${context} completed`, context, result);
    return result;
  }).catch(error => {
    logger.error(`${context} failed`, context, error, data);
    throw error;
  });
}
function stripAuthType(result, returnAuthType) {
  if (returnAuthType) {
    return result;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    authType: _,
    ...cleanResult
  } = result;
  return cleanResult;
}
export function isSensorAvailable(options) {
  return logged('isSensorAvailable', options, () =>
  // iOS doesn't support biometric strength, so it is called without parameters
  Platform.OS === 'android' ? ReactNativeBiometrics.isSensorAvailable(options?.biometricStrength || BiometricStrength.Strong) : ReactNativeBiometrics.isSensorAvailable());
}
export function simplePrompt(promptMessage, options) {
  const biometricStrength = options?.biometricStrength;
  return logged('simplePrompt', {
    promptMessage,
    biometricStrength
  }, () =>
  // iOS and other platforms ignore biometricStrength and use default behavior
  Platform.OS === 'android' ? ReactNativeBiometrics.simplePrompt(promptMessage, biometricStrength) : ReactNativeBiometrics.simplePrompt(promptMessage));
}
export { AuthType, BiometricStrength, BiometryTypes } from "./types.js";
export function authenticateWithOptions(options) {
  const {
    returnAuthType,
    ...nativeOptions
  } = options;
  return logged('authenticateWithOptions', undefined, () => {
    if (Platform.OS === 'android' && nativeOptions.biometricStrength) {
      return ReactNativeBiometrics.authenticateWithOptions(nativeOptions).then(result => stripAuthType(result, returnAuthType));
    }

    // For iOS or Android without biometricStrength, remove biometricStrength from options
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
      biometricStrength: _,
      ...cleanOptions
    } = nativeOptions;
    return ReactNativeBiometrics.authenticateWithOptions(cleanOptions).then(result => stripAuthType(result, returnAuthType));
  });
}
export function createKeys(keyAlias, keyType, biometricStrength, allowDeviceCredentials, failIfExists) {
  return logged('createKeys', {
    keyAlias,
    keyType,
    biometricStrength,
    allowDeviceCredentials,
    failIfExists
  }, () => ReactNativeBiometrics.createKeys(keyAlias, keyType, biometricStrength, allowDeviceCredentials ?? false, failIfExists ?? false));
}

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
export function createKeysWithOptions(options = {}) {
  const {
    keyAlias,
    keyType,
    requireAuthentication = true,
    biometricStrength,
    allowDeviceCredentials = false,
    failIfExists = false
  } = options;
  if (isDev() && !requireAuthentication && (biometricStrength !== undefined || allowDeviceCredentials)) {
    logger.debug('biometricStrength and allowDeviceCredentials are ignored when requireAuthentication is false', 'createKeysWithOptions');
  }
  return logged('createKeysWithOptions', {
    keyAlias,
    keyType,
    requireAuthentication,
    biometricStrength,
    allowDeviceCredentials,
    failIfExists
  }, () => ReactNativeBiometrics.createKeysWithOptions({
    keyAlias: keyAlias || undefined,
    keyType,
    requireAuthentication,
    biometricStrength: requireAuthentication ? biometricStrength : undefined,
    allowDeviceCredentials: requireAuthentication ? allowDeviceCredentials : false,
    failIfExists
  }));
}
export function deleteKeys(keyAlias) {
  return logged('deleteKeys', {
    keyAlias
  }, () => ReactNativeBiometrics.deleteKeys(keyAlias));
}
export function validateKeyIntegrity(keyAlias) {
  return logged('validateKeyIntegrity', {
    keyAlias
  }, () => ReactNativeBiometrics.validateKeyIntegrity(keyAlias));
}
export function verifyKeySignature(keyAlias = '', data, promptTitle, promptSubtitle, cancelButtonText, returnAuthType) {
  return logged('verifyKeySignature', {
    keyAlias,
    dataLength: data.length
  }, () => ReactNativeBiometrics.verifyKeySignature(keyAlias || null, data, promptTitle, promptSubtitle, cancelButtonText).then(result => stripAuthType(result, returnAuthType)));
}

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
export function signWithOptions(options) {
  const {
    keyAlias = '',
    data,
    inputEncoding = 'utf8',
    promptTitle,
    promptSubtitle,
    cancelButtonText,
    biometricStrength,
    disableDeviceFallback = false,
    returnAuthType
  } = options;
  const resolvedKeyAlias = keyAlias || null;
  if (isDev() && Platform.OS === 'android' && biometricStrength === BiometricStrength.Weak) {
    logger.warn('biometricStrength "weak" has no effect when signing on Android: Keystore keys can only be unlocked by Class 3 (strong) biometrics or device credentials, so the prompt offers whatever the key was created with', 'signWithOptions');
  }
  return logged('signWithOptions', {
    keyAlias,
    dataLength: data.length,
    inputEncoding,
    biometricStrength,
    disableDeviceFallback
  }, () => {
    const request = Platform.OS === 'android' ?
    // On Android, use the new method with options
    ReactNativeBiometrics.verifyKeySignatureWithOptions(resolvedKeyAlias, data, promptTitle, promptSubtitle, cancelButtonText, biometricStrength, disableDeviceFallback, inputEncoding) :
    // On iOS, use the standard method with inputEncoding
    ReactNativeBiometrics.verifyKeySignatureWithEncoding(resolvedKeyAlias, data, promptTitle, promptSubtitle, cancelButtonText, inputEncoding);
    return request.then(result => stripAuthType(result, returnAuthType));
  });
}

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
export function sign(options) {
  const {
    keyAlias,
    data,
    inputEncoding = 'utf8',
    algorithm
  } = options;
  return logged('sign', {
    keyAlias,
    dataLength: data.length,
    inputEncoding,
    algorithm
  }, () => ReactNativeBiometrics.signData({
    keyAlias: keyAlias || undefined,
    data,
    inputEncoding,
    algorithm
  }));
}
export function validateSignature(keyAlias = '', data, signature) {
  return logged('validateSignature', {
    keyAlias,
    dataLength: data.length,
    signatureLength: signature.length
  }, () => ReactNativeBiometrics.validateSignature(keyAlias, data, signature));
}
export function sha256(data, inputEncoding = 'utf8') {
  return logged('sha256', {
    dataLength: data.length,
    inputEncoding
  }, () => ReactNativeBiometrics.sha256(data, inputEncoding));
}
export function getKeyAttributes(keyAlias) {
  return logged('getKeyAttributes', {
    keyAlias
  }, () => ReactNativeBiometrics.getKeyAttributes(keyAlias));
}

/**
 * Checks whether a key exists for the given alias without triggering any
 * biometric prompt.
 */
export function keyExists(keyAlias) {
  return logged('keyExists', {
    keyAlias
  }, () => ReactNativeBiometrics.getKeyAttributes(keyAlias || undefined).then(result => result.exists));
}

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
export function getPublicKey(keyAlias) {
  return logged('getPublicKey', {
    keyAlias
  }, () => ReactNativeBiometrics.getPublicKey(keyAlias || undefined));
}

// Key management configuration
export function configureKeyAlias(keyAlias) {
  return logged('configureKeyAlias', {
    keyAlias
  }, () => ReactNativeBiometrics.configureKeyAlias(keyAlias));
}
export function getDefaultKeyAlias() {
  return logged('getDefaultKeyAlias', undefined, () => ReactNativeBiometrics.getDefaultKeyAlias());
}
export function getAllKeys(customAlias) {
  return logged('getAllKeys', {
    customAlias
  }, () => ReactNativeBiometrics.getAllKeys(customAlias));
}

// Debugging utilities
export function getDiagnosticInfo() {
  return logged('getDiagnosticInfo', undefined, () => ReactNativeBiometrics.getDiagnosticInfo());
}
export function runBiometricTest() {
  return logged('runBiometricTest', undefined, () => ReactNativeBiometrics.runBiometricTest());
}
export function setDebugMode(enabled) {
  // Enable/disable centralized logging based on debug mode
  logger.setEnabled(enabled);
  logger.setLevel(enabled ? LogLevel.DEBUG : LogLevel.INFO);
  return logged('setDebugMode', {
    enabled
  }, () => ReactNativeBiometrics.setDebugMode(enabled));
}
export function getDeviceIntegrityStatus() {
  return logged('getDeviceIntegrityStatus', undefined, () => ReactNativeBiometrics.getDeviceIntegrityStatus());
}

// Configuration types

// Initialize library with configuration
export function configure(config) {
  const {
    keyAlias
  } = config;
  if (keyAlias) {
    return logged('configure', config, () => configureKeyAlias(keyAlias));
  }
  if (isDev()) {
    logger.info('configure completed (no key alias)', 'configure', config);
  }
  return Promise.resolve();
}

// Export types for TypeScript users

/**
 * Options for {@link createKeysWithOptions}.
 */

/**
 * Input encoding for signature data.
 * Use this enum to specify how the input data should be interpreted.
 */
export let InputEncoding = /*#__PURE__*/function (InputEncoding) {
  /** Data is a UTF-8 string (default) */
  InputEncoding["UTF8"] = "utf8";
  /** Data is base64-encoded binary - use for WebAuthn challenges or other binary data */
  InputEncoding["Base64"] = "base64";
  return InputEncoding;
}({});

/**
 * Signature algorithm for prompt-free signing via {@link sign}.
 *
 * Note: on Android, keys created before SHA-512 support was added (and keys
 * generated inside StrongBox) only permit SHA-256 — requesting a SHA-512
 * variant on such a key fails with UNSUPPORTED_ALGORITHM. On iOS the
 * algorithm is chosen per call and works with existing keys.
 */
export let SignatureAlgorithm = /*#__PURE__*/function (SignatureAlgorithm) {
  SignatureAlgorithm["SHA256withRSA"] = "SHA256withRSA";
  SignatureAlgorithm["SHA512withRSA"] = "SHA512withRSA";
  SignatureAlgorithm["SHA256withECDSA"] = "SHA256withECDSA";
  SignatureAlgorithm["SHA512withECDSA"] = "SHA512withECDSA";
  return SignatureAlgorithm;
}({});

/**
 * Options for {@link sign} (prompt-free signing).
 */

/**
 * Options for signing data with advanced security controls.
 */

// Export logging utilities
export { logger, LogLevel, enableLogging, setLogLevel, configureLogger } from "./logger.js";

// Convenience function to get logs for debugging
export function getLogs() {
  return logger.getLogs();
}

// Convenience function to clear logs
export function clearLogs() {
  logger.clearLogs();
}
/**
 * Subscribes to biometric change events.
 *
 * @param callback - Function to be called when biometric changes are detected
 * @returns EventSubscription that can be used to unsubscribe
 */
export function subscribeToBiometricChanges(callback) {
  if (isDev()) {
    logger.debug('Subscribing to biometric changes', 'subscribeToBiometricChanges');
  }

  // New architecture: events emitted through the codegen event emitter are
  // only delivered to its own subscribers, never to DeviceEventEmitter.
  if (typeof ReactNativeBiometrics.onBiometricChange === 'function') {
    return ReactNativeBiometrics.onBiometricChange(callback);
  }

  // Old architecture: NativeEventEmitter invokes the native addListener
  // method — required on iOS, where RCTEventEmitter drops events while its
  // listener count is zero — and both platforms auto-start detection when
  // the first listener attaches.
  if (NativeModules.ReactNativeBiometrics != null) {
    return new NativeEventEmitter(NativeModules.ReactNativeBiometrics).addListener('onBiometricChange', callback);
  }

  // Environments without the native module (e.g. web).
  return DeviceEventEmitter.addListener('onBiometricChange', callback);
}

/**
 * Unsubscribes from biometric change events.
 *
 * @param subscription - The EventSubscription returned from subscribeToBiometricChanges
 */
export function unsubscribeFromBiometricChanges(subscription) {
  if (isDev()) {
    logger.debug('Unsubscribing from biometric changes', 'unsubscribeFromBiometricChanges');
  }
  subscription.remove();
}

/**
 * Starts biometric change detection.
 * This will begin monitoring for changes in biometric enrollment.
 *
 * @returns Promise that resolves when detection is started
 */
export function startBiometricChangeDetection() {
  return logged('startBiometricChangeDetection', undefined, () => ReactNativeBiometrics.startBiometricChangeDetection());
}

/**
 * Stops biometric change detection.
 * This will stop monitoring for changes in biometric enrollment.
 *
 * @returns Promise that resolves when detection is stopped
 */
export function stopBiometricChangeDetection() {
  return logged('stopBiometricChangeDetection', undefined, () => ReactNativeBiometrics.stopBiometricChangeDetection());
}
//# sourceMappingURL=index.js.map