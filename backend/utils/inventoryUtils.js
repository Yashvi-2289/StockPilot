
function calculateDaysRemaining(stock, averageDailySales) {
    if (averageDailySales === 0) {
        return null;
    }

   
    return Number((stock / averageDailySales).toFixed(2));
}

function calculateReorderPoint(
    averageDailySales,
    leadTimeDays,
    safetyStock
) {
    return averageDailySales * leadTimeDays + safetyStock;
}

function calculateSuggestedOrder(
    stock,
    averageDailySales,
    leadTimeDays,
    safetyStock
) {
    const targetStock = calculateReorderPoint(
        averageDailySales,
        leadTimeDays,
        safetyStock
    );

    return Math.ceil(Math.max(0, targetStock - stock));
}
module.exports = {
    calculateDaysRemaining,calculateSuggestedOrder,calculateReorderPoint
};