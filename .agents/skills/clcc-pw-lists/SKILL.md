---
name: clcc-pw-lists
description: Mendix 10 pluggable-widget list datasource guidance. Use when implementing or reviewing ListValue, ObjectItem, list-linked properties, datasource status handling, pagination, sorting, filtering, or selection.
---

## Introduction

`ListValue` is used to represent a list of objects for the datasource property. Corresponding list item values represent properties of different types linked to a datasource property.

## ListValue {#listvalue}

When a `datasource` property with `isList="true"` is configured for a widget, the client component gets a list of objects represented as a `ListValue`. This type allows detailed access and control over the data source.

```ts
export interface ObjectItem {
    id: GUID;
}

export interface ListValue {
    status: ValueStatus;

    offset: number;
    limit: number;
    setOffset(offset: number): void;
    setLimit(limit: Option<number>): void;
    requestTotalCount(needTotalCount: boolean): void;
    hasMoreItems?: boolean;
    totalCount?: number;
    items?: ObjectItem[];

    sortOrder: SortInstruction[];
    filter: Option<FilterCondition>;
    setSortOrder(sortOrder: Option<SortInstruction[]>): void;
    setFilter(filter: Option<FilterCondition>): void;
}
```

### Working With Actual Data

The `items` property contains all the requested data items of the datasource. However, it is not possible to access domain data directly from `ListValue`, as every object is represented only by GUID in the `items` array. Instead, a list of items may be used in combination with other properties, for example with a property of type [`attribute`](/apidocs-mxsdk/apidocs/pluggable-widgets-property-types-10/#attribute), [`action`](/apidocs-mxsdk/apidocs/pluggable-widgets-property-types-10/#action), or [`widgets`](/apidocs-mxsdk/apidocs/pluggable-widgets-property-types-10/#widgets). See the next section for detailed information about working with different property types in combination with `ListValue`.

### View State {#view-state}

View state is a mechanism of storing the current state of a page when user navigates away from the page and restoring that state when user navigates back to the page. For example user has some sorting order applied in a DataGrid widget on an overview page and navigates away to a detail page. When user gets back to the overview page, the DataGrid widget will be initialized with previously used sorting order.

View state works transparently for a widget, no additional steps needed from the widget in order to benefit from view state mechanism. 

The following information of a `ListView` is getting automatically stored and restored:

* Pagination state (`limit` and `offset` fields)
* Sorting state (`sortOrder` field)
* Filtering state (`filter` field)

### Status of the List Value Items {#status-of-the-list-value-items}

The `status` property provides the component with additional information about the state of the items and how the component should handle them:

```tsx
export const enum ValueStatus {
    Loading = "loading",
    Unavailable = "unavailable",
    Available = "available"
}

if (this.props.listValue.status === ValueStatus.Available) {
    return (
        <div>
            ...
        </div>
    );
} else if (this.props.listValue.status === ValueStatus.Loading) {
    return <p>Loading... Please, wait...</p>;
} else if (this.props.listValue.status === ValueStatus.Unavailable) {
    return <p>There are no available items to show.</p>;
}
```

More specifically, the `status` property functions as follows:

* When `status` is `ValueStatus.Available`, then the list value items are accessible, and the result is exposed in the `items` array.
* When `status` is `ValueStatus.Unavailable`, then the list does not have any available data and the `items` array is `undefined`. This can be the case if the data source depends on a surrounding data view which has no data.
* When `status` is `ValueStatus.Loading`, then the list is waiting for new data to arrive. This can be triggered by a change in data that the data source depends on (such as a parent data view) or by an entity update, which occurs if an object of that type is committed or deleted. If this is done from a microflow, a [refresh in client](/refguide/change-object/#refresh-in-client) is also required.
    * If the list value was previously in a `ValueStatus.Available` state, then the previous `items` array is still returned. This allows a component to keep showing the previous items if it does not need to handle the `Loading` state explicitly, which prevents flickering.
    * In other cases, the `items` is `undefined`. This happens if a page is still being loaded or if the previous state was `ValueStatus.Unavailable`.

## Linked Property Values {#linked-values}

### ListActionValue {#listactionvalue}

`ListActionValue` represents action that may be applied to items from `ListValue`. The `ListActionValue` is an object and its definition is as follows:

```ts
export interface ListActionValue {
    get: (item: ObjectItem) => ActionValue;
}
```

In order to call an action on a particular item of a `ListValue` first an instance of `ActionValue` should be obtained by calling `ListActionValue.get` with the item (assuming widget properties are configured as follows):

```ts
interface MyListWidgetsProps {
    myDataSource: ListValue;
    myListAction: ListActionValue;
}
```

The following code sample shows how to call `myListAction` on the first element from the `myDataSource`.

```ts
const actionOnFirstItem = this.props.myListAction.get(this.props.myDataSource.item[0]);

actionOnFirstItem.execute();
```

In this code sample, checks of status `myDataSource` and availability of items are omitted for simplicity. See the [ActionValue section](/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis-10/#actionvalue) for more information about the usage of `ActionValue`.

### ListAttributeValue {#listattributevalue}

`ListAttributeValue` represents an [attribute property](/apidocs-mxsdk/apidocs/pluggable-widgets-property-types-10/#attribute) that is linked to a data source.
This allows the client component to access attribute values on individual items from a `ListValue`. `ListAttributeValue` is an object and its definition is as follows:

```ts
export interface ListAttributeValue<T extends AttributeValue> {
    get: (item: ObjectItem) => EditableValue<T>; // NOTE: EditableValue obtained from ListAttributeValue always readonly

    id: ListAttributeId;
    sortable: boolean;
    filterable: boolean;

    type: AttributeType;

    formatter: ValueFormatter<T>;
    universe: Option<T[]>; // only for attributes of type Enumeration
}
```

#### Obtaining Attribute Value {#obtaining-attribute-value}

{{% alert color="warning" %}}
Due to a technical limitation it is not yet possible to edit attributes obtained via `ListAttributeValue`. `EditableValue`s returned by `ListAttributeValue` are always **readonly**.
{{% /alert %}}

In order to work with the attribute value of a particular item of a `ListValue` first an instance of `EditableValue<T>` should be obtained by calling `ListAttributeValue.get` with the item. The type `<T>` depends on the allowed value types as configured for the attribute property. 

Let's take a look at some example. Assuming widget properties are configured as follows with `myAttributeOnDatasource` property allowing attribute of type `string`:

```ts
interface MyListWidgetsProps {
    myDataSource: ListValue;
    myAttributeOnDatasource: ListAttributeValue<string>;
}
```

The following code sample shows how to get an `EditableValue<string>` that represents a read-only value of an attribute of the first element from the `myDataSource`.

```ts
const attributeValue = this.props.myAttributeOnDatasource.get(this.props.myDataSource.items[0]);
```

Note: in this code sample checks of status of `myDataSource` and availability of items are omitted for simplicity. See [EditableValue section](/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis-10/#editable-value) for more information about usage of `EditableValue`.

#### Attribute ID, Sortable and Filterable Flags {#listattributevalue-id-sortable-filterable}

`id` field of type `ListAttributeId` represents the unique randomly generated string identifier of an attribute. That identifier could be used when applying sorting and filtering on a linked data source property to identify which attribute should be used for sorting and/or filtering. For more information, see the [Sorting](#listvalue-sorting) and [Filtering](#listvalue-filtering) sections.

Fields `sortable` and `filterable` specify if the attribute could be used for sorting and/or filtering. Those flags have to be checked before a widget applies filtering or sorting on a data source property. Any attempt to filter on a non-filterable attribute or sort on a non-sortable attribute leads to an error during the execution time.

#### Attribute Type

The [attribute](/apidocs-mxsdk/apidocs/pluggable-widgets-property-types-10/#attribute) property defines which attribute types can be configured for that property. For example, an attribute property may be configured to allow attributes of type `String` and `Integer` in order to present progress. While this is convenient for users, it may require additional work for developers by processing different data types.

It is possible to determine the type of attribute by checking the `type` field on an attribute property. The following code sample shows how to check the attribute type on the property named `myAttributeOnDatasource`:

```ts
if (this.props.myAttributeOnDatasource.type === "String") {
    console.log("String attribute");
} else if (this.props.myAttributeOnDatasource.type === "Integer") {
    console.log("Integer attribute");
} else {
    console.log("Not a String/Integer attribute");
}
```

#### Formatter and Universe

The `formatter` field represents the default formatter used on values obtained by the `get` function.

The optional `universe` field represents an array of possible values for an attribute. For more information, see the `universe` field of [EditableValue](/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis-10/#editable-value).

### ListReferenceValue and ListReferenceSetValue {#listassociationvalue}

`ListReferenceValue` and `ListReferenceSetValue` are both used to represent an [association property](/apidocs-mxsdk/apidocs/pluggable-widgets-property-types-10/#association) that is linked to a data source. This allows the client component to access associated values of individual items from a `ListValue`. `ListReferenceValue` and `ListReferenceSetValue` are both objects and their definitions are as follows:

```ts
export type ListReferenceValue = ListAssociationValue<ObjectItem> & { type: "Reference" };

export type ListReferenceSetValue = ListAssociationValue<ObjectItem[]> & { type: "ReferenceSet" };

export interface ListAssociationValue<T extends ObjectItem | ObjectItem[]> {
  get: (item: ObjectItem) => DynamicValue<T>;

  id: ListAssociationId;
  filterable: boolean;
}
```

#### Obtaining Association Values

In order to work with an object or objects that are associated with a particular item returned by `ListValue`, first an instance of `DynamicValue<ObjectItem>` (for `ListReferenceValue`) or `DynamicValue<ObjectItem[]>` (for `ListReferenceSetValue`) should be obtained by calling `get` with the item. 

If the association property has been configured to allow both types of associations, the type of the property is defined as `ListReferenceValue | ListReferenceSetValue` and a check on its `type` should be done to narrow down the type. For more information, see the [Association Type](#association-type) section.

Consult the following example code, which assumes widget properties are configured with the `myAssociationOnDatasource` property allowing association of type `Reference`:

```ts
interface MyListWidgetsProps {
    myDataSource: ListValue;
    mySelectableObjects: ListValue;
    myAssociationOnDatasource: ListReferenceValue;
    myAttributeOnSelectableObjects: ListAttributeValue;
}
```

The following code example shows how to get a `DynamicValue<ObjectItem>` that represents a read-only value of an associated object of the first element from the `myDataSource`:

```ts
const associationValue = this.props.myAssociationOnDatasource.get(this.props.myDataSource.items[0]);
```

This will return an `ObjectItem` representing the associated object, because in this example the widget is configured to allow only singular associations. If you want to access the individual attribute values of this associated object, you may use an attribute property linked to the selectable objects data source and pass the associated object to it. For more information, see [Obtaining Attribute Value section](/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis-list-values-10/#obtaining-attribute-value).

Please note these code samples omit checks of `myDataSource` status and availability of items for simplicity. See [DynamicValue section](/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis-10/#dynamic-value) for more information on the usages of `DynamicValue`.

#### Association ID and Filterable Flags {#listassociationvalue-id-filterable}

The `id` field of type `ListAssociationId` represents the unique randomly-generated string identifier of an association. That identifier can be used when applying filtering on a linked data source property to identify which association should be used for filtering. For more information, see the [Filtering](#listvalue-filtering) section.

The `filterable` field specifies if the association can be used for filtering. This flag has to be checked before a widget applies filtering on a data source property. An attempt to filter on a non-filterable association leads to an error during the execution time.

#### Association Type {#association-type}

The [association](/apidocs-mxsdk/apidocs/pluggable-widgets-property-types-10/#association) property determines which association types could be configured for that property. For example, an association property may be configured to allow associations of type `Reference` and not `ReferenceSet`.

It is possible to determine the type of association by checking the `type` field on an association property. This is useful if the property has been configured to allow both references and reference sets. The following code sample shows how to check the association type on the property named `myAssociationOnDatasource`:

```ts
if (this.props.myAssociationOnDatasource.type === "Reference") {
  console.log("Reference association");
} else {
  // TypeScript will narrow it down to "ReferenceSet" when the type is not equal to "Reference"
  console.log("ReferenceSet association");
}
```

### ListWidgetValue {#listwidgetvalue}

`ListWidgetValue` represents a [widget property](/apidocs-mxsdk/apidocs/pluggable-widgets-property-types-10/#widgets) that is linked to a data source. This allows the client component to render child widgets with items from a `ListValue`.
`ListWidgetValue` is an object and its definition is as follows:

```ts
export interface ListWidgetValue {
    get: (item: ObjectItem) => ReactNode;
}
```

For clarity, consider the following example using `ListValue` together with the `widgets` property type. When the `widgets` property named `myWidgets` is configured to be tied to a `datasource` named `myDataSource`, the client component props appear as follows:

```ts
interface MyListWidgetsProps {
    myDataSource: ListValue;
    myWidgets: (i: ObjectItem) => ReactNode;
}
```

Because of the above configurations, the client component may render every instance of widgets with a specific item from the list like this:

```ts
this.props.myDataSource.items.map(i => this.props.myWidgets.get(i));
```

When the `widgets` property is not required, there may not be any child widgets configured. In that case the value of the widgets property will be `undefined` (as in the example above `myWidgets`).

### ListExpressionValue {#listexpressionvalue}

`ListExpressionValue` represents an [expression property](/apidocs-mxsdk/apidocs/pluggable-widgets-property-types-10/#expression) or [text template property](/apidocs-mxsdk/apidocs/pluggable-widgets-property-types-10/#texttemplate) that is linked to a data source. This allows the client component to access expression or text template values for individual items from a `ListValue`. `ListExpressionValue` is an object and its definition is as follows:

```ts
export interface ListExpressionValue<T extends AttributeValue> {
    get: (item: ObjectItem) => DynamicValue<T>;
};
```

The type `<T>` depends on the return type as configured for the expression property. For a text template property, this type is always `string`.

In order to work with the expression or text template value of a particular item of a `ListValue`, first an instance of `DynamicValue` should be obtained by calling `ListExpressionValue.get` with the item (assuming widget properties are configured as follows with an expression of type `boolean`):

```ts
interface MyListWidgetsProps {
    myDataSource: ListValue;
    myExpressionOnDatasource: ListExpressionValue<boolean>;
    myTextTemplateOnDatasource: ListExpressionValue<string>;
}
```

The following code sample shows how to get a `DynamicValue` that represents the value of an expression for the first element from the `myDataSource`.

```ts
const expressionValue = this.props.myDataSource.myExpressionOnDatasource.get(this.props.myDataSource.item[0]);
```

## Filter Helpers{#filter-helpers}

### Value Helpers {#filter-value-helpers}

Two basic helpers that allow to represent attributes and literal values in filter conditions are `attribute` and `literal` helpers. When creating a filter condition, every attribute or literal value has to be wrapped with a corresponding helper.

#### Attribute

The `attribute` helper takes one argument of type `ListAttributeId`. See [ListAttributeValue](#listattributevalue).

The following code sample shows how to apply `attribute` helper and use its result in constructing a filter condition:

```ts
const attrA = attribute(this.props.myAttributeA.id);
const filterCondition = equals(attrA, literal("Bob"));
```

Attribute types available for filtering:

* `Boolean`
* `DateTime`
* `AutoNumber`
* `Integer`
* `Long`
* `Decimal`
* `Enum`
* `String`
* `HashString`

Attribute types **not** available for filtering:

* `Binary`
* `EnumSet`
* `ObjectReference`
* `ObjectReferenceSet`

#### Literal

The `literal` helper takes one argument. Accepted argument types are:

* Boolean values for `Boolean` attribute types
* String literals for `String`, `HashString` and `Enumeration` attribute types 
* `BigJS` numbers for `AutoNumber`, `Integer`, `Long` and `Decimal` attribute types
* `Date` objects for `DateTime` attribute type
* `undefined` for any attribute type

The following code sample shows how to use `literal` helper:

```ts
const falsy = literal(false); // for Boolean
const bob = literal("Bob"); // for String, HashString, Enumeration
const meaningOfLife = literal(new BigJS(42)); // for AutoNumber, Integer, Long, Decimal
const now = literal(new Date()); // for DateTime
const undef = literal(undefined);
```

### Basic Helpers

#### Equals

The `equals` helper takes two arguments produced by [Value helpers](#filter-value-helpers).
Accepts attributes and literals of any type.

The following code sample shows how to use `equals` helper:

```ts
const attrA = attribute(this.props.myAttributeA.id);
const name = literal("Bob");

// filter keeps items where value equals "Bob"
const filterCondition = equals(attrA, name);
```

#### NotEqual

The `notEqual` helper takes two arguments produced by [Value helpers](#filter-value-helpers).
Accepts attributes and literals of any type.

The following code sample shows how to use `notEqual` helper:

```ts
const attrA = attribute(this.props.myAttributeA.id);
const name = literal("Bob");

// filter keeps items where value not equal to "Bob"
const filterCondition = notEqual(attrA, name);
```

#### GreaterThan

The `greaterThan` helper takes two arguments produced by [Value helpers](#filter-value-helpers).
Allows only `String`, `HashString`, `Enumeration`, `AutoNumber`, `Integer`, `Long` `Decimal`, `DateTime` attributes and their corresponding literals.

The following code sample shows how to use `greaterThan` helper:

```ts
const attr = attribute(this.props.myAttributeA.id);
const meaningOfLife = literal(new BigJS(42));

// filter keeps items where value is greater than 42
const filterCondition = greaterThan(attr, meaningOfLife);
```

#### LessThan

The `lessThan` helper takes two arguments produced by [Value helpers](#filter-value-helpers).
Allows only `String`, `HashString`, `Enumeration`, `AutoNumber`, `Integer`, `Long` `Decimal`, `DateTime` attributes and their corresponding literals.

The following code sample shows how to use `lessThan` helper:

```ts
const attr = attribute(this.props.myAttributeA.id);
const meaningOfLife = literal(new BigJS(42));

// filter keeps items where value is less than 42
const filterCondition = lessThan(attr, meaningOfLife); 
```

#### GreaterThanOrEqual

The `greaterThanOrEqual` helper takes two arguments produced by [Value helpers](#filter-value-helpers).
Allows only `String`, `HashString`, `Enumeration`, `AutoNumber`, `Integer`, `Long` `Decimal`, `DateTime` attributes and their corresponding literals.

The following code sample shows how to use `greaterThanOrEqual` helper:

```ts
const attr = attribute(this.props.myAttributeA.id);
const meaningOfLife = literal(new BigJS(42));

// filter keeps items where value is greater than or equals 42
const filterCondition = greaterThanOrEqual(attr, meaningOfLife); 
```

#### LessThanOrEqual

The `lessThanOrEqual` helper takes two arguments produced by [Value helpers](#filter-value-helpers).
Allows only `String`, `HashString`, `Enumeration`, `AutoNumber`, `Integer`, `Long` `Decimal`, `DateTime` attributes and their corresponding literals.

The following code sample shows how to use `lessThanOrEqual` helper:

```ts
const attr = attribute(this.props.myAttributeA.id);
const meaningOfLife = literal(new BigJS(42));

// filter keeps items where value is less than or equals 42
const filterCondition = lessThanOrEqual(attr, meaningOfLife); 
```

### String Conditions

#### Contains

The `contains` helper takes two arguments produced by [Value helpers](#filter-value-helpers).
Allows only `String`, `Integer`, `Long`, `Decimal` attributes and `String` literals.

The following code sample shows how to use `contains` helper:

```ts
const attrStr = attribute(this.props.myAttributeA.id); // string attribute
const subStr = literal("secret");

// filter keeps items where value has a substring "secret"
// like "my secret password", "secret file", "top secret"
const filterCondition1 = contains(attrStr, subStr);

// also works with numeric attributes
const attrNum = attribute(this.props.myAttributeB.id); // integer attribute
const subNum = literal("1337");

// filter keeps items where value has sequence of numbers "1337"
// like "133700", "1231337", "913379"
const filterCondition2 = contains(attrNum, substrNum);
```

#### StartsWith

The `startsWith` helper takes two arguments produced by [Value helpers](#filter-value-helpers).
Allows only `String`, `Integer`, `Long`, `Decimal` attributes and `String` literals.

The following code sample shows how to use `startsWith` helper:

```ts
const attrStr = attribute(this.props.myAttributeA.id); // string attribute
const subStr = literal("secret");

// filter keeps items where value starts with substring "secret"
// like "secret file", but not "my secret password" or "top secret"
const filterCondition1 = startsWith(attrStr, subStr);

// also works with numeric attributes
const attrNum = attribute(this.props.myAttributeB.id); // integer attribute
const subNum = literal("1337");

// filter keeps items where value stats with sequence of numbers "1337"
// like "133700", but not "1231337" or "913379"
const filterCondition2 = startsWith(attrNum, substrNum);
```

#### EndsWith

The `endsWith` helper takes two arguments produced by [Value helpers](#filter-value-helpers).
Allows only `String`, `Integer`, `Long`, `Decimal` attributes and `String` literals.

The following code sample shows how to use `endsWith` helper:

```ts
const attrStr = attribute(this.props.myAttributeA.id); // string attribute
const subStr = literal("secret");

// filter keeps items where value ends with substring "secret"
// like "top secret", but not "my secret password" or "secret file"
const filterCondition1 = startsWith(attrStr, subStr);

// also works with numeric attributes
const attrNum = attribute(this.props.myAttributeB.id); // integer attribute
const subNum = literal("1337");

// filter keeps items where value ends with sequence of numbers "1337"
// like "1231337", but not "133700" or "913379"
const filterCondition2 = startsWith(attrNum, substrNum);
```

### Logic Conditions

#### And

The `and` helper is used to combine other conditions in *logical and* operation. Takes 2 or more arguments.

The following usage example specifies that *all conditions have to be true* for an object in order to appear in the resulting filtered set:

```ts
const filterCondition = and(
    startsWith(attribute(this.props.myAttributeA.id), literal("Hi")), // myAttributeA starts with string "Hi"
    equals(attribute(this.props.myAttributeB.id), literal(5)), // myAttributeB equals 5
    greaterThan(attribute(this.props.myAttributeC.id), literal(new Date())) // myAttributeC greaterThan current date and time
);
```

#### Or

The `or` helper is used to combine other conditions in *logical or* operation. Takes 2 or more arguments.

The following usage example specifies that *at least one condition have to be true* for an object in order to appear in the resulting filtered set:

```ts
const filterCondition = or(
    endsWith(attribute(this.props.myAttributeA.id), literal("Z")), // myAttributeA ends with string "Z"
    graterThan(attribute(this.props.myAttributeB.id), literal(10)), // myAttributeB greater that 10
    equals(attribute(this.props.myAttributeC.id), literal(true)) // myAttributeC equals True
);
```

#### Not

The `not` helper inverts a condition. It takes one argument.

The following usage example specifies that `myAttributeA` have to start with any letter except `"X"` by inverting `startsWith` condition:

```ts
const filterCondition = not(
    startsWith(attribute(this.props.myAttributeA.id), literal("X")),
);
```
