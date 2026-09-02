// This Was Edited by phaseworld
import { FluxDispatcher } from "@vendetta/metro/common";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { logger } from "@vendetta";

const { getSerializedState } = findByProps("getSerializedState");
const { getCurrentUser } = findByStoreName("UserStore");

export function enable() {
    try {
        const user = getCurrentUser();
        if (!user) {
            logger.error("Failed to enable experiments: no user found");
            return;
        }

        try {
            Object.defineProperty(user, "flags", {
                writable: true,
                configurable: true,
                value: (user.flags ?? 0) | 1,
            });
        } catch (e) {
            logger.error("Failed to set user flags:", e);
            return;
        }

        let actionHandlers = [];
        try {
            const handlers = FluxDispatcher._actionHandlers?._computeOrderedActionHandlers?.("OVERLAY_INITIALIZE");
            if (handlers) {
                actionHandlers = handlers.filter((e) => e?.name?.includes("Experiment"));
            }
        } catch (e) {
            logger.error("Failed to get action handlers:", e);
        }

        if (actionHandlers.length === 0) {
            logger.error("No experiment handlers found");
            return;
        }

        const serialized = getSerializedState?.();
        actionHandlers.forEach(({ actionHandler }) => {
            try {
                actionHandler({
                    serializedExperimentStore: serialized,
                    user,
                });
            } catch (e) {
                logger.error("Failed to call experiment handler:", e);
            }
        });
    } catch (e) {
        logger.error(`Failed to enable experiments...`, e);
    }
}

export function payload() {
    FluxDispatcher.unsubscribe("CONNECTION_OPEN", payload);
    enable();
}
