// This Was Edited by phaseworld
import { FluxDispatcher, ReactNative } from "@vendetta/metro/common";
import { findByStoreName } from "@vendetta/metro";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { enable, payload } from "./snippet";

const { getCurrentUser } = findByStoreName("UserStore");

function tryEnable() {
    if (getCurrentUser()) {
        enable();
    } else {
        FluxDispatcher.subscribe("CONNECTION_OPEN", payload);
    }
}

tryEnable();

export const onUnload = () => showConfirmationAlert({
    title: "Wait!",
    content: "Disabling experiments requires a restart - would you like to do that now?",
    confirmText: "Sure",
    cancelText: "Not now",
    // @ts-expect-error oh god
    confirmColor: "red",
    onConfirm: () => ReactNative.NativeModules.BundleUpdaterManager.reload(),
});
