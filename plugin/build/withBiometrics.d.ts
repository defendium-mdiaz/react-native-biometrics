import { type ConfigPlugin } from 'expo/config-plugins';
type Options = {
    /**
     * The iOS `NSFaceIDUsageDescription` message shown when the app first uses
     * Face ID. Pass `false` to skip adding it (e.g. when you manage it yourself
     * via `ios.infoPlist`). Defaults to a generic message.
     */
    faceIDPermission?: string | false;
};
declare const _default: ConfigPlugin<void | Options>;
export default _default;
