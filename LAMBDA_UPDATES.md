# Lambda Function Updates for Categories and Subcategories CRUD

## Required Changes to Lambda Function

Add the following cases to your Lambda function's switch statement (after the existing `GET /categories` and `GET /categories/{id}/subcategories` cases):

**Note:** Only POST (Create) and PUT (Update) endpoints are required. DELETE functionality has been removed from the frontend.

### 1. POST /categories - Create Category

```javascript
case "POST /categories": {
  const data = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  
  if (!data?.name) {
    return buildResponse(headers, 400, { message: "name is required" });
  }

  // Generate incremental ID
  const scanResult = await dynamo.scan({
    TableName: MENU_TABLE,
    ProjectionExpression: "id"
  }).promise();

  let newId;
  if (scanResult.Items && scanResult.Items.length > 0) {
    const ids = scanResult.Items
      .map(item => {
        const id = parseInt(item.id, 10);
        return Number.isFinite(id) ? id : 0;
      })
      .filter(id => id > 0);
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    newId = (maxId + 1).toString();
  } else {
    newId = "1";
  }

  const item = {
    id: newId,
    name: data.name.trim(),
    des: data.des?.trim() || "",
    icon: data.icon?.trim() || "",
    Seller_email: data.Seller_email?.trim() || data.sellerEmail?.trim() || "",
  };

  await dynamo.put({ TableName: MENU_TABLE, Item: item }).promise();
  body = item;
  break;
}
```

### 2. PUT /categories/{id} - Update Category

```javascript
case "PUT /categories/{id}": {
  const categoryId = event.pathParameters.id;
  
  // Check if category exists
  const existing = await dynamo.get({
    TableName: MENU_TABLE,
    Key: { id: categoryId }
  }).promise();

  if (!existing.Item) {
    return buildResponse(headers, 404, { message: "Category not found" });
  }

  const data = typeof event.body === "string" ? JSON.parse(event.body) : event.body;

  // Build update expression
  let updateExpression = "SET";
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};

  if (data.name !== undefined) {
    updateExpression += " #name = :name,";
    expressionAttributeNames["#name"] = "name";
    expressionAttributeValues[":name"] = data.name.trim();
  }

  if (data.des !== undefined) {
    updateExpression += " des = :des,";
    expressionAttributeValues[":des"] = data.des.trim() || "";
  }

  if (data.icon !== undefined) {
    updateExpression += " icon = :icon,";
    expressionAttributeValues[":icon"] = data.icon.trim() || "";
  }

  if (data.Seller_email !== undefined || data.sellerEmail !== undefined) {
    updateExpression += " Seller_email = :sellerEmail,";
    expressionAttributeValues[":sellerEmail"] = (data.Seller_email || data.sellerEmail || "").trim();
  }

  // Remove trailing comma
  updateExpression = updateExpression.slice(0, -1);

  const updateParams = {
    TableName: MENU_TABLE,
    Key: { id: categoryId },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW"
  };

  if (Object.keys(expressionAttributeNames).length > 0) {
    updateParams.ExpressionAttributeNames = expressionAttributeNames;
  }

  const result = await dynamo.update(updateParams).promise();
  body = result.Attributes;
  break;
}
```

### 3. POST /categories/{id}/subcategories - Create Subcategory

```javascript
case "POST /categories/{id}/subcategories": {
  const categoryId = event.pathParameters.id;

  // Verify category exists
  const category = await dynamo.get({
    TableName: MENU_TABLE,
    Key: { id: categoryId }
  }).promise();

  if (!category.Item) {
    return buildResponse(headers, 404, { message: "Category not found" });
  }

  const data = typeof event.body === "string" ? JSON.parse(event.body) : event.body;

  if (!data?.name) {
    return buildResponse(headers, 400, { message: "name is required" });
  }

  // Generate incremental ID for subcategory
  const scanResult = await dynamo.scan({
    TableName: SUB_CATEGORY_TABLE,
    ProjectionExpression: "id"
  }).promise();

  let newId;
  if (scanResult.Items && scanResult.Items.length > 0) {
    const ids = scanResult.Items
      .map(item => {
        const id = parseInt(item.id, 10);
        return Number.isFinite(id) ? id : 0;
      })
      .filter(id => id > 0);
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    newId = maxId + 1;
  } else {
    newId = 1;
  }

  const item = {
    id: newId,
    name: data.name.trim(),
    des: data.des?.trim() || "",
    icon: data.icon?.trim() || "",
    Menu_id: categoryId, // Link to parent category
    Seller_email: data.Seller_email?.trim() || data.sellerEmail?.trim() || "",
  };

  await dynamo.put({ TableName: SUB_CATEGORY_TABLE, Item: item }).promise();
  body = item;
  break;
}
```

### 4. PUT /categories/{id}/subcategories/{subId} - Update Subcategory

```javascript
case "PUT /categories/{id}/subcategories/{subId}": {
  const categoryId = event.pathParameters.id;
  const subCategoryId = parseInt(event.pathParameters.subId, 10);

  if (!Number.isFinite(subCategoryId)) {
    return buildResponse(headers, 400, { message: "Invalid subcategory ID" });
  }

  // Check if subcategory exists
  const existing = await dynamo.get({
    TableName: SUB_CATEGORY_TABLE,
    Key: { id: subCategoryId }
  }).promise();

  if (!existing.Item) {
    return buildResponse(headers, 404, { message: "Subcategory not found" });
  }

  // Verify it belongs to the category
  if (!doesSubCategoryBelongToMenu(existing.Item, categoryId)) {
    return buildResponse(headers, 400, { message: "Subcategory does not belong to this category" });
  }

  const data = typeof event.body === "string" ? JSON.parse(event.body) : event.body;

  // Build update expression
  let updateExpression = "SET";
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};

  if (data.name !== undefined) {
    updateExpression += " #name = :name,";
    expressionAttributeNames["#name"] = "name";
    expressionAttributeValues[":name"] = data.name.trim();
  }

  if (data.des !== undefined) {
    updateExpression += " des = :des,";
    expressionAttributeValues[":des"] = data.des.trim() || "";
  }

  if (data.icon !== undefined) {
    updateExpression += " icon = :icon,";
    expressionAttributeValues[":icon"] = data.icon.trim() || "";
  }

  if (data.Seller_email !== undefined || data.sellerEmail !== undefined) {
    updateExpression += " Seller_email = :sellerEmail,";
    expressionAttributeValues[":sellerEmail"] = (data.Seller_email || data.sellerEmail || "").trim();
  }

  // Remove trailing comma
  updateExpression = updateExpression.slice(0, -1);

  const updateParams = {
    TableName: SUB_CATEGORY_TABLE,
    Key: { id: subCategoryId },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW"
  };

  if (Object.keys(expressionAttributeNames).length > 0) {
    updateParams.ExpressionAttributeNames = expressionAttributeNames;
  }

  const result = await dynamo.update(updateParams).promise();
  body = result.Attributes;
  break;
}
```

## Admin Login (role support)

Update the existing **`case "POST /login"`** branch so the response includes the new `role` field from the `Adminuser` table. The frontend now expects this property and stores it in `localStorage`.

```javascript
case "POST /login":
  let response = {};
  const { email, Password } = JSON.parse(event.body);
  if (!email || !Password) {
    response = { message: "Missing email or password" };
  } else {
    const paramslogin = {
      TableName: "Adminuser",
      Key: { email },
    };
    try {
      const { Item } = await dynamo.get(paramslogin).promise();
      if (!Item || Item.password !== Password) {
        response = { message: "Invalid email or password" };
      } else {
        response = {
          message: "success",
          user: {
            name: Item.name,
            email: Item.email,
            role: Item.role ?? 0, // <‑ new field
          },
        };
      }
    } catch (error) {
      response = { message: "An error occurred during login" };
    }
  }
  body = response;
  break;
```

This change ensures every successful login returns the user's role so the UI can differentiate between admins, sellers, etc.

## Pending Products Workflow

Add a new constant near the top of the Lambda file:

```javascript
const PENDING_PRODUCTS_TABLE = "Pending-products";
```

### 1. POST /pending-products — Seller submission

```javascript
case "POST /pending-products": {
  const data = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  if (!data?.title || !data?.menuId || !data?.sellerEmail || data.sellerPrice === undefined) {
    return buildResponse(headers, 400, { message: "title, menuId, sellerEmail and sellerPrice are required" });
  }

  const newId = await generateIncrementalId(PENDING_PRODUCTS_TABLE);
  const now = new Date().toISOString();

  const item = {
    id: newId,
    title: data.title.trim(),
    description: data.description?.trim() || "",
    image: data.image?.trim() || "",
    menuId: String(data.menuId),
    menuName: data.menuName || "",
    subCategoryId: data.subCategoryId ? String(data.subCategoryId) : "",
    subCategoryName: data.subCategoryName || "",
    sellerPrice: Number(data.sellerPrice),
    stockQuantity: data.stockQuantity ?? "",
    availableQuantity: data.availableQuantity ?? "",
    shippingLocation: data.shippingLocation || "",
    shippingDescription: data.shippingDescription || "",
    country: data.country || "",
    sellerEmail: data.sellerEmail,
    sellerName: data.sellerName || "",
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  await dynamo.put({ TableName: PENDING_PRODUCTS_TABLE, Item: item }).promise();
  body = item;
  break;
}
```

### 2. GET /pending-products — List submissions

```javascript
case "GET /pending-products": {
  const sellerEmail = event.queryStringParameters?.sellerEmail;
  let params = { TableName: PENDING_PRODUCTS_TABLE };
  if (sellerEmail) {
    params = {
      ...params,
      FilterExpression: "sellerEmail = :email",
      ExpressionAttributeValues: { ":email": sellerEmail },
    };
  }
  const result = await dynamo.scan(params).promise();
  body = result.Items || [];
  break;
}
```

### 3. PUT /pending-products/{id}/approve — Approve & publish

```javascript
case "PUT /pending-products/{id}/approve": {
  const pendingId = event.pathParameters.id;
  const payload = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  if (!payload?.sellingPrice) {
    return buildResponse(headers, 400, { message: "sellingPrice is required" });
  }

  const { Item: pending } = await dynamo
    .get({ TableName: PENDING_PRODUCTS_TABLE, Key: { id: pendingId } })
    .promise();
  if (!pending) {
    return buildResponse(headers, 404, { message: "Pending product not found" });
  }

  // Create product entry (seller price becomes cost)
  const newProductId = await generateIncrementalId(PRODUCTS_TABLE);
  const now = new Date().toISOString();
  const productItem = {
    id: newProductId,
    title: pending.title,
    category: pending.menuName || "",
    categories: [String(pending.menuId)].filter(Boolean),
    content: {
      description: pending.description,
      price: `$${Number(payload.sellingPrice).toFixed(2)}`,
      cost: `$${Number(pending.sellerPrice).toFixed(2)}`,
      image: pending.image,
      country: pending.country || pending.shippingLocation || "",
      title: pending.title,
    },
    country: pending.country || "",
    createdAt: now,
    updatedAt: now,
    selleremail: pending.sellerEmail,
    Sub_category_id: pending.subCategoryId ? Number(pending.subCategoryId) : undefined,
    stockQuantity: pending.stockQuantity,
    availableQuantity: pending.availableQuantity,
    pendingId,
  };
  await dynamo.put({ TableName: PRODUCTS_TABLE, Item: productItem }).promise();

  await dynamo.update({
    TableName: PENDING_PRODUCTS_TABLE,
    Key: { id: pendingId },
    UpdateExpression:
      "SET #status = :status, approvedAt = :approvedAt, approvedBy = :approvedBy, publishedProductId = :productId, updatedAt = :updatedAt",
    ExpressionAttributeNames: { "#status": "status" },
    ExpressionAttributeValues: {
      ":status": "approved",
      ":approvedAt": now,
      ":approvedBy": payload.approvedBy || "admin",
      ":productId": newProductId,
      ":updatedAt": now,
    },
  }).promise();

  body = { message: "Product approved", productId: newProductId };
  break;
}
```

### 4. PUT /pending-products/{id}/reject — Reject submission

```javascript
case "PUT /pending-products/{id}/reject": {
  const pendingId = event.pathParameters.id;
  const payload = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  if (!payload?.reason) {
    return buildResponse(headers, 400, { message: "reason is required" });
  }

  const now = new Date().toISOString();
  await dynamo.update({
    TableName: PENDING_PRODUCTS_TABLE,
    Key: { id: pendingId },
    UpdateExpression:
      "SET #status = :status, rejectionReason = :reason, updatedAt = :updatedAt",
    ExpressionAttributeNames: { "#status": "status" },
    ExpressionAttributeValues: {
      ":status": "rejected",
      ":reason": payload.reason,
      ":updatedAt": now,
    },
  }).promise();

  body = { message: "Pending product rejected" };
  break;
}
```

### 5. Update `DELETE /products/{id}` to clean up seller submissions

When an admin removes a product that was previously approved, the matching entry in `Pending-products` should be marked as deleted so the seller no longer sees it.

```javascript
case "DELETE /products/{id}": {
  const productId = event.pathParameters.id;
  const existing = await dynamo
    .get({ TableName: PRODUCTS_TABLE, Key: { id: productId } })
    .promise();

  if (!existing.Item) {
    return buildResponse(headers, 404, { message: "Product not found" });
  }

  await dynamo
    .delete({ TableName: PRODUCTS_TABLE, Key: { id: productId } })
    .promise();

  if (existing.Item.pendingId) {
    await dynamo
      .update({
        TableName: PENDING_PRODUCTS_TABLE,
        Key: { id: String(existing.Item.pendingId) },
        UpdateExpression:
          "SET #status = :deleted, rejectionReason = :reason, updatedAt = :now",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":deleted": "deleted",
          ":reason": "Removed by admin",
          ":now": new Date().toISOString(),
        },
      })
      .promise();
  }

  body = { message: `Product ${productId} deleted` };
  break;
}
```

## Table Schema Reference

### MenuTable (Categories)
- **id** (String): Primary key
- **name** (String): Category name
- **des** (String): Description
- **icon** (String): Icon URL
- **Seller_email** (String): Seller email address

### Sub_Category (Subcategories)
- **id** (Number): Primary key
- **name** (String): Subcategory name
- **des** (String): Description
- **icon** (String): Icon URL
- **Menu_id** (String or Array): Reference to parent category ID
- **Seller_email** (String): Seller email address

### Pending-products (New table)
- **id** (String): Primary key
- **title**, **description**, **image**
- **menuId**, **menuName**, **subCategoryId**, **subCategoryName**
- **sellerPrice** (Number): price set by seller (used as cost)
- **sellerEmail**, **sellerName**
- **shippingLocation**, **shippingDescription**, **country**
- **stockQuantity**, **availableQuantity**
- **status** (`pending`, `approved`, `rejected`)
- **approvedAt/By**, **rejectionReason**, **publishedProductId**, timestamps

## Notes

1. The `scanAllItems` and `doesSubCategoryBelongToMenu` helper functions are already defined in your Lambda function.
2. The `buildResponse` helper function is already defined.
3. Make sure to add these cases in the correct location within your switch statement, after the existing GET endpoints for categories.
4. The ID generation logic uses incremental IDs based on the maximum existing ID in the table.

