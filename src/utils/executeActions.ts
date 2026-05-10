import { ActionValue, ListActionValue, ObjectItem } from "mendix";
import { LOG_PREFIX } from "../constants";

/**
 * Executes a Mendix action when allowed, logging a warning when it cannot be executed.
 *
 * @param action - The action to execute (may be undefined when the action is not configured).
 * @param name - Human-readable name of the action, used in the warning message.
 */
export function executeAction(action: ActionValue | undefined, name: string): void {
    if (!action) {
        return;
    }
    if (action.canExecute) {
        action.execute();
    } else {
        console.warn(LOG_PREFIX, `${name} action cannot be executed`);
    }
}

/**
 * Executes a per-item Mendix list action for a single item, logging a warning when it cannot run.
 *
 * @param listAction - The list action to dispatch on (may be undefined when the action is not configured).
 * @param item - The Mendix object item the action should run against.
 * @param name - Human-readable name of the action, used in the warning message.
 */
export function executeListItemAction(listAction: ListActionValue | undefined, item: ObjectItem, name: string): void {
    if (!listAction) {
        return;
    }
    const action = listAction.get(item);
    if (action.canExecute) {
        action.execute();
    } else {
        console.warn(LOG_PREFIX, `${name} action cannot be executed for item`, item.id);
    }
}
