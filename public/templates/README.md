# Word Document Template Setup

This directory contains templates for generating printable order documents.

## Setting Up Your Word Template

1. **Create your Word document** (`order-template.docx`) with the layout you want
2. **Use template variables** in the format `{variableName}` where you want data inserted
3. **Place the template file** in this `public/templates/` directory

## Available Template Variables

### Order Information

- `{orderName}` - Name of the order
- `{orderId}` - Unique order ID
- `{orderDate}` - Date the order was created
- `{requestedBy}` - Person who requested the order
- `{status}` - Current order status

### Supplier Information

- `{supplierName}` - Name of the supplier
- `{supplierContact}` - Contact person at supplier
- `{supplierEmail}` - Supplier email address
- `{supplierPhone}` - Supplier phone number
- `{supplierAddress}` - Supplier address

### Financial Information

- `{deliveryCost}` - Cost of delivery
- `{subtotal}` - Total before delivery cost
- `{totalAmount}` - Final total amount

### Notes

- `{notes}` - Additional order notes

### Order Items (Table Loop)

For creating a table of order items, use:

```
{#items}
{itemNumber} | {name} | {quantity} | {unitPrice} | {totalPrice} | {notes}
{/items}
```

## Example Template Structure

```
ORDER FORM
===========

Order: {orderName}
Order ID: {orderId}
Date: {orderDate}
Requested by: {requestedBy}
Status: {status}

SUPPLIER DETAILS
================
Company: {supplierName}
Contact: {supplierContact}
Email: {supplierEmail}
Phone: {supplierPhone}
Address: {supplierAddress}

ORDER ITEMS
===========
| # | Item | Qty | Unit Price | Total | Notes |
|---|------|-----|------------|-------|-------|
{#items}
| {itemNumber} | {name} | {quantity} | £{unitPrice} | £{totalPrice} | {notes} |
{/items}

TOTALS
======
Subtotal: £{subtotal}
Delivery: £{deliveryCost}
TOTAL: £{totalAmount}

NOTES
=====
{notes}
```

## File Location

Place your template file at: `public/templates/order-template.docx`

## Testing

Once your template is ready, you can test it by:

1. Creating or editing an order
2. Using the "Print Order" button in the actions menu
3. Or using the print button next to uploaded documents
