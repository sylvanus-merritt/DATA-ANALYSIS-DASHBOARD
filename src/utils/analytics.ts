import { OrderItem, CustomDimension, CustomMetric, CustomSort } from '../types';

export interface KPISummary {
  totalRevenue: number;
  totalUnits: number;
  uniqueOrders: number;
  averageOrderValue: number;
  averageItemPrice: number;
  multiItemOrderCount: number;
  multiItemOrderShare: number;
  activeDaysCount: number;
  dailyRevenueAverage: number;
  topProductByRevenue: { name: string; revenue: number; units: number };
  topProductByUnits: { name: string; units: number; revenue: number };
  topPaymentMethod: { method: string; revenue: number; share: number };
}

export function calculateKPIs(items: OrderItem[]): KPISummary {
  if (items.length === 0) {
    return {
      totalRevenue: 0,
      totalUnits: 0,
      uniqueOrders: 0,
      averageOrderValue: 0,
      averageItemPrice: 0,
      multiItemOrderCount: 0,
      multiItemOrderShare: 0,
      activeDaysCount: 0,
      dailyRevenueAverage: 0,
      topProductByRevenue: { name: 'None', revenue: 0, units: 0 },
      topProductByUnits: { name: 'None', units: 0, revenue: 0 },
      topPaymentMethod: { method: 'None', revenue: 0, share: 0 },
    };
  }

  const totalRevenue = items.reduce((acc, curr) => acc + curr.price, 0);
  const totalUnits = items.length;

  // Order grouping
  const orderMap = new Map<string, OrderItem[]>();
  const dateSet = new Set<string>();
  const productRevMap = new Map<string, { revenue: number; units: number }>();
  const paymentRevMap = new Map<string, number>();

  for (const item of items) {
    dateSet.add(item.date);

    if (!orderMap.has(item.orderNumber)) {
      orderMap.set(item.orderNumber, []);
    }
    orderMap.get(item.orderNumber)!.push(item);

    // Product tracking
    const currentProd = productRevMap.get(item.product) || { revenue: 0, units: 0 };
    productRevMap.set(item.product, {
      revenue: currentProd.revenue + item.price,
      units: currentProd.units + 1,
    });

    // Payment tracking
    paymentRevMap.set(item.paymentMethod, (paymentRevMap.get(item.paymentMethod) || 0) + item.price);
  }

  const uniqueOrders = orderMap.size;
  const averageOrderValue = uniqueOrders > 0 ? totalRevenue / uniqueOrders : 0;
  const averageItemPrice = totalUnits > 0 ? totalRevenue / totalUnits : 0;

  let multiItemOrderCount = 0;
  for (const [, orderItems] of orderMap) {
    if (orderItems.length > 1) {
      multiItemOrderCount++;
    }
  }
  const multiItemOrderShare = uniqueOrders > 0 ? (multiItemOrderCount / uniqueOrders) * 100 : 0;
  const activeDaysCount = dateSet.size;
  const dailyRevenueAverage = activeDaysCount > 0 ? totalRevenue / activeDaysCount : 0;

  // Top product by revenue
  let topProdRev = { name: 'N/A', revenue: 0, units: 0 };
  let topProdUnits = { name: 'N/A', units: 0, revenue: 0 };
  for (const [prodName, stats] of productRevMap.entries()) {
    if (stats.revenue > topProdRev.revenue) {
      topProdRev = { name: prodName, revenue: stats.revenue, units: stats.units };
    }
    if (stats.units > topProdUnits.units) {
      topProdUnits = { name: prodName, units: stats.units, revenue: stats.revenue };
    }
  }

  // Top payment method
  let topPay = { method: 'N/A', revenue: 0, share: 0 };
  for (const [method, rev] of paymentRevMap.entries()) {
    if (rev > topPay.revenue) {
      topPay = {
        method,
        revenue: rev,
        share: totalRevenue > 0 ? (rev / totalRevenue) * 100 : 0,
      };
    }
  }

  return {
    totalRevenue,
    totalUnits,
    uniqueOrders,
    averageOrderValue,
    averageItemPrice,
    multiItemOrderCount,
    multiItemOrderShare,
    activeDaysCount,
    dailyRevenueAverage,
    topProductByRevenue: topProdRev,
    topProductByUnits: topProdUnits,
    topPaymentMethod: topPay,
  };
}

export interface DailyTrendPoint {
  date: string;
  formattedDate: string;
  revenue: number;
  units: number;
  orders: number;
  aov: number;
  cumulativeRevenue: number;
  rollingAvgRevenue: number;
}

export function calculateDailyTrend(items: OrderItem[]): DailyTrendPoint[] {
  if (items.length === 0) return [];

  // Group by date
  const dateMap = new Map<string, OrderItem[]>();
  for (const item of items) {
    if (!dateMap.has(item.date)) {
      dateMap.set(item.date, []);
    }
    dateMap.get(item.date)!.push(item);
  }

  const sortedDates = Array.from(dateMap.keys()).sort();
  let cumulative = 0;
  const recentRevenues: number[] = [];

  return sortedDates.map((date) => {
    const dayItems = dateMap.get(date)!;
    const revenue = dayItems.reduce((sum, it) => sum + it.price, 0);
    const units = dayItems.length;
    const orders = new Set(dayItems.map((it) => it.orderNumber)).size;
    const aov = orders > 0 ? revenue / orders : 0;
    cumulative += revenue;

    recentRevenues.push(revenue);
    if (recentRevenues.length > 7) {
      recentRevenues.shift();
    }
    const rollingAvgRevenue = recentRevenues.reduce((a, b) => a + b, 0) / recentRevenues.length;

    const d = new Date(`${date}T00:00:00`);
    const formattedDate = isNaN(d.getTime())
      ? date
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      date,
      formattedDate,
      revenue,
      units,
      orders,
      aov,
      cumulativeRevenue: cumulative,
      rollingAvgRevenue: Math.round(rollingAvgRevenue * 100) / 100,
    };
  });
}

export interface DayOfWeekData {
  day: string;
  shortDay: string;
  revenue: number;
  units: number;
  orders: number;
  share: number;
}

export function calculateDayOfWeekData(items: OrderItem[]): DayOfWeekData[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const stats = days.map((day, idx) => ({
    day,
    shortDay: shortDays[idx],
    revenue: 0,
    units: 0,
    orderNumbers: new Set<string>(),
  }));

  const dayIndices: Record<string, number> = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6,
  };

  const totalRev = items.reduce((sum, it) => sum + it.price, 0);

  for (const item of items) {
    const idx = dayIndices[item.dayOfWeek];
    if (idx !== undefined) {
      stats[idx].revenue += item.price;
      stats[idx].units += 1;
      stats[idx].orderNumbers.add(item.orderNumber);
    }
  }

  return stats.map((st) => ({
    day: st.day,
    shortDay: st.shortDay,
    revenue: st.revenue,
    units: st.units,
    orders: st.orderNumbers.size,
    share: totalRev > 0 ? (st.revenue / totalRev) * 100 : 0,
  }));
}

export interface ProductPerformance {
  product: string;
  revenue: number;
  units: number;
  orders: number;
  unitPrice: number;
  revenueShare: number;
  unitShare: number;
  priceTier: string;
  paymentBreakdown: Record<string, number>;
}

export function calculateProductPerformance(items: OrderItem[]): ProductPerformance[] {
  const map = new Map<
    string,
    {
      revenue: number;
      units: number;
      orders: Set<string>;
      unitPrice: number;
      priceTier: string;
      paymentBreakdown: Record<string, number>;
    }
  >();

  const totalRev = items.reduce((s, it) => s + it.price, 0);
  const totalUnits = items.length;

  for (const it of items) {
    if (!map.has(it.product)) {
      map.set(it.product, {
        revenue: 0,
        units: 0,
        orders: new Set(),
        unitPrice: it.price,
        priceTier: it.priceTier,
        paymentBreakdown: {},
      });
    }

    const current = map.get(it.product)!;
    current.revenue += it.price;
    current.units += 1;
    current.orders.add(it.orderNumber);
    current.paymentBreakdown[it.paymentMethod] =
      (current.paymentBreakdown[it.paymentMethod] || 0) + 1;
  }

  const result: ProductPerformance[] = [];
  for (const [prod, data] of map.entries()) {
    result.push({
      product: prod,
      revenue: data.revenue,
      units: data.units,
      orders: data.orders.size,
      unitPrice: data.unitPrice,
      revenueShare: totalRev > 0 ? (data.revenue / totalRev) * 100 : 0,
      unitShare: totalUnits > 0 ? (data.units / totalUnits) * 100 : 0,
      priceTier: data.priceTier,
      paymentBreakdown: data.paymentBreakdown,
    });
  }

  // Sort descending by revenue by default
  return result.sort((a, b) => b.revenue - a.revenue);
}

export interface PaymentMethodAnalysis {
  paymentMethod: string;
  revenue: number;
  units: number;
  orders: number;
  revenueShare: number;
  unitShare: number;
  averageTransaction: number;
}

export function calculatePaymentBreakdown(items: OrderItem[]): PaymentMethodAnalysis[] {
  const map = new Map<string, { revenue: number; units: number; orders: Set<string> }>();
  const totalRev = items.reduce((s, it) => s + it.price, 0);
  const totalUnits = items.length;

  for (const it of items) {
    if (!map.has(it.paymentMethod)) {
      map.set(it.paymentMethod, { revenue: 0, units: 0, orders: new Set() });
    }
    const cur = map.get(it.paymentMethod)!;
    cur.revenue += it.price;
    cur.units += 1;
    cur.orders.add(it.orderNumber);
  }

  const result: PaymentMethodAnalysis[] = [];
  for (const [method, data] of map.entries()) {
    result.push({
      paymentMethod: method,
      revenue: data.revenue,
      units: data.units,
      orders: data.orders.size,
      revenueShare: totalRev > 0 ? (data.revenue / totalRev) * 100 : 0,
      unitShare: totalUnits > 0 ? (data.units / totalUnits) * 100 : 0,
      averageTransaction: data.orders.size > 0 ? data.revenue / data.orders.size : 0,
    });
  }

  return result.sort((a, b) => b.revenue - a.revenue);
}

export interface CrossSellPair {
  productA: string;
  productB: string;
  count: number;
  totalPairRevenue: number;
}

export function calculateCrossSellPairs(items: OrderItem[]): {
  pairs: CrossSellPair[];
  singleItemOrderCount: number;
  multiItemOrderCount: number;
  singleItemRevenue: number;
  multiItemRevenue: number;
  singleItemAOV: number;
  multiItemAOV: number;
} {
  const orderMap = new Map<string, OrderItem[]>();
  for (const it of items) {
    if (!orderMap.has(it.orderNumber)) {
      orderMap.set(it.orderNumber, []);
    }
    orderMap.get(it.orderNumber)!.push(it);
  }

  let singleItemOrderCount = 0;
  let multiItemOrderCount = 0;
  let singleItemRevenue = 0;
  let multiItemRevenue = 0;

  const pairCountMap = new Map<string, { count: number; totalPairRevenue: number; pA: string; pB: string }>();

  for (const [, orderItems] of orderMap) {
    const orderTotal = orderItems.reduce((acc, x) => acc + x.price, 0);
    if (orderItems.length === 1) {
      singleItemOrderCount++;
      singleItemRevenue += orderTotal;
    } else {
      multiItemOrderCount++;
      multiItemRevenue += orderTotal;

      // Extract unique combinations of pairs in this order
      for (let i = 0; i < orderItems.length; i++) {
        for (let j = i + 1; j < orderItems.length; j++) {
          const names = [orderItems[i].product, orderItems[j].product].sort();
          const key = `${names[0]} + ${names[1]}`;
          const current = pairCountMap.get(key) || {
            count: 0,
            totalPairRevenue: 0,
            pA: names[0],
            pB: names[1],
          };
          current.count += 1;
          current.totalPairRevenue += orderItems[i].price + orderItems[j].price;
          pairCountMap.set(key, current);
        }
      }
    }
  }

  const pairs: CrossSellPair[] = Array.from(pairCountMap.values())
    .map((v) => ({
      productA: v.pA,
      productB: v.pB,
      count: v.count,
      totalPairRevenue: v.totalPairRevenue,
    }))
    .sort((a, b) => b.count - a.count || b.totalPairRevenue - a.totalPairRevenue);

  return {
    pairs,
    singleItemOrderCount,
    multiItemOrderCount,
    singleItemRevenue,
    multiItemRevenue,
    singleItemAOV: singleItemOrderCount > 0 ? singleItemRevenue / singleItemOrderCount : 0,
    multiItemAOV: multiItemOrderCount > 0 ? multiItemRevenue / multiItemOrderCount : 0,
  };
}

export interface CustomAggregatedPoint {
  dimensionKey: string;
  dimensionLabel: string;
  value: number;
  formattedValue: string;
  revenue: number;
  units: number;
  orders: number;
  avgPrice: number;
  percentage: number;
}

export function aggregateCustom(
  items: OrderItem[],
  dimension: CustomDimension,
  metric: CustomMetric,
  sort: CustomSort,
  topN: number = 0
): CustomAggregatedPoint[] {
  if (items.length === 0) return [];

  const map = new Map<string, { label: string; revenue: number; units: number; orders: Set<string> }>();
  const totalRevenue = items.reduce((s, it) => s + it.price, 0);

  for (const it of items) {
    let key = '';
    let label = '';

    switch (dimension) {
      case 'product':
        key = it.product;
        label = it.product;
        break;
      case 'paymentMethod':
        key = it.paymentMethod;
        label = it.paymentMethod;
        break;
      case 'dayOfWeek':
        key = `${it.dayOfWeekIndex}-${it.dayOfWeek}`;
        label = it.dayOfWeek;
        break;
      case 'weekLabel':
        key = it.weekLabel;
        label = it.weekLabel;
        break;
      case 'date':
        key = it.date;
        label = it.date;
        break;
      case 'priceTier':
        key = it.priceTier;
        label = it.priceTier;
        break;
    }

    if (!map.has(key)) {
      map.set(key, { label, revenue: 0, units: 0, orders: new Set() });
    }
    const cur = map.get(key)!;
    cur.revenue += it.price;
    cur.units += 1;
    cur.orders.add(it.orderNumber);
  }

  let points: CustomAggregatedPoint[] = Array.from(map.entries()).map(([key, data]) => {
    let value = 0;
    let formattedValue = '';

    switch (metric) {
      case 'revenue':
        value = data.revenue;
        formattedValue = `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        break;
      case 'units':
        value = data.units;
        formattedValue = `${value} units`;
        break;
      case 'orders':
        value = data.orders.size;
        formattedValue = `${value} orders`;
        break;
      case 'avgPrice':
        value = data.units > 0 ? data.revenue / data.units : 0;
        formattedValue = `$${value.toFixed(2)}`;
        break;
    }

    const percentage = totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0;

    return {
      dimensionKey: key,
      dimensionLabel: data.label,
      value: Math.round(value * 100) / 100,
      formattedValue,
      revenue: data.revenue,
      units: data.units,
      orders: data.orders.size,
      avgPrice: data.units > 0 ? data.revenue / data.units : 0,
      percentage,
    };
  });

  // Sorting
  if (sort === 'desc') {
    points.sort((a, b) => b.value - a.value);
  } else if (sort === 'asc') {
    points.sort((a, b) => a.value - b.value);
  } else if (sort === 'alpha') {
    points.sort((a, b) => a.dimensionLabel.localeCompare(b.dimensionLabel));
  } else if (sort === 'chrono') {
    points.sort((a, b) => a.dimensionKey.localeCompare(b.dimensionKey));
  }

  if (topN > 0 && points.length > topN) {
    points = points.slice(0, topN);
  }

  return points;
}
