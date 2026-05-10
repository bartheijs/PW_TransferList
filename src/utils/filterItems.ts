import { ListExpressionValue, ObjectItem } from "mendix";

/**
 * Filters a list of Mendix items by a case-insensitive substring match
 * against the value of a text-template expression evaluated per item.
 *
 * Returns the input list unchanged when the query (after trimming) is empty
 * or no search attribute is configured.
 *
 * @param items - The full list of items from a Mendix datasource.
 * @param query - The current search query as typed by the user.
 * @param searchAttribute - The text-template expression evaluated per item.
 */
export function filterItemsBySearch(
    items: ObjectItem[],
    query: string,
    searchAttribute: ListExpressionValue<string> | undefined
): ObjectItem[] {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed || !searchAttribute) {
        return items;
    }
    return items.filter(item => {
        const value = searchAttribute.get(item).value;
        return value ? value.toLowerCase().includes(trimmed) : false;
    });
}
