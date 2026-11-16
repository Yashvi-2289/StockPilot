

#functions for calculating stocks

> How many days the current stock will last based on average daily sales.
1. Days Remaining
return stock / averageDailySales;


>The minimum stock level at which we should place a new order.
2. Reorder Point
return averageDailySales * leadTimeDays + safetyStock;


>How much stock should we order to cover supplier delivery time plus 30 additional days.

const targetStock = averageDailySales * (leadTimeDays + 30) + safetyStock;
return Math.max(0, targetStock - stock);
