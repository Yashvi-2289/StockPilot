const Product = require("../models/product.js");
const Sale = require("../models/Sale.js");

const millisecondsPerDay = 24 * 60 * 60 * 1000;

function calculateAverageDailySales(totalQuantity, firstSaleDate, today = new Date()) {
    if (!Number.isFinite(totalQuantity) || totalQuantity < 0) {
        throw new TypeError("Total sale quantity must be a non-negative number");
    }

    const firstSale = new Date(firstSaleDate);
    const currentDate = new Date(today);
    if (Number.isNaN(firstSale.getTime()) || Number.isNaN(currentDate.getTime())) {
        throw new TypeError("Sale dates must be valid dates");
    }

    const firstSaleDay = Date.UTC(
        firstSale.getUTCFullYear(),
        firstSale.getUTCMonth(),
        firstSale.getUTCDate()
    );
    const currentDay = Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate()
    );
    const daysSinceFirstSale = Math.max(
        1,
        Math.floor((currentDay - firstSaleDay) / millisecondsPerDay) + 1
    );

    return totalQuantity / daysSinceFirstSale;
}

async function getSalesTotalsByProduct(productIds, session) {
    if (productIds.length === 0) {
        return new Map();
    }

    let aggregation = Sale.aggregate([
        { $match: { productId: { $in: productIds } } },
        {
            $group: {
                _id: "$productId",
                totalQuantity: { $sum: "$quantity" },
                firstSaleDate: { $min: "$createdAt" }
            }
        }
    ]);

    if (session) {
        aggregation = aggregation.session(session);
    }

    const totals = await aggregation.exec();
    return new Map(
        totals.map((total) => [
            String(total._id),
            {
                totalQuantity: total.totalQuantity,
                firstSaleDate: total.firstSaleDate
            }
        ])
    );
}

async function refreshAverageDailySales(products, today = new Date()) {
    if (products.length === 0) {
        return;
    }

    const totalsByProduct = await getSalesTotalsByProduct(
        products.map((product) => product._id)
    );
    const updates = [];

    for (const product of products) {
        const totals = totalsByProduct.get(String(product._id));
        const averageDailySales = totals
            ? calculateAverageDailySales(
                totals.totalQuantity,
                totals.firstSaleDate,
                today
            )
            : 0;

        if (product.averageDailySales !== averageDailySales) {
            updates.push({
                updateOne: {
                    filter: { _id: product._id },
                    update: { $set: { averageDailySales } }
                }
            });
        }
        product.averageDailySales = averageDailySales;
    }

    if (updates.length > 0) {
        await Product.bulkWrite(updates);
    }
}

module.exports = {
    calculateAverageDailySales,
    getSalesTotalsByProduct,
    refreshAverageDailySales
};
