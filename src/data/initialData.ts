import { OrderItem, PaymentMethod } from '../types';

export const RAW_CSV_DATA = `Order Number,Product,Price,Date,Payment Method
TT-1001,Slim-Fit Denim Jeans,$88.00,2025-08-15,Credit Card
TT-1001,Technical Performance Joggers,$75.00,2025-08-15,Credit Card
TT-1002,Classic Fit Chinos,$78.00,2025-08-15,eWallet
TT-1003,Flannel-Lined Canvas Work Pants,$98.00,2025-08-16,Cash
TT-1004,Double-Pleated Khaki Trousers,$82.00,2025-08-16,Credit Card
TT-1005,Relaxed Fit Corduroy Trousers,$85.00,2025-08-17,Debit Card
TT-1005,Multi-Pocket Cargo Shorts,$58.00,2025-08-17,eWallet
TT-1006,Premium Tailored Trousers,$175.00,2025-08-18,Credit Card
TT-1007,Classic Denim Overalls,$115.00,2025-08-18,eWallet
TT-1008,Drawstring Linen Trousers,$92.00,2025-08-19,Debit Card
TT-1009,Slim-Fit Denim Jeans,$88.00,2025-08-19,Credit Card
TT-1009,Classic Fit Chinos,$78.00,2025-08-19,Cash
TT-1010,Tailored Wool Dress Trousers,$145.00,2025-08-20,Cash
TT-1011,Technical Performance Joggers,$75.00,2025-08-20,eWallet
TT-1012,Multi-Pocket Cargo Shorts,$58.00,2025-08-21,Cash
TT-1013,Striped Seersucker Trousers,$95.00,2025-08-21,Debit Card
TT-1014,Slim-Fit Denim Jeans,$88.00,2025-08-22,Debit Card
TT-1015,Flannel-Lined Canvas Work Pants,$98.00,2025-08-22,eWallet
TT-1015,Classic Fit Chinos,$78.00,2025-08-22,Debit Card
TT-1016,Drawstring Linen Trousers,$92.00,2025-08-23,Credit Card
TT-1017,Premium Tailored Trousers,$175.00,2025-08-24,Credit Card
TT-1018,Double-Pleated Khaki Trousers,$82.00,2025-08-24,Cash
TT-1018,Relaxed Fit Corduroy Trousers,$85.00,2025-08-24,Cash
TT-1019,Technical Performance Joggers,$75.00,2025-08-25,Debit Card
TT-1020,Classic Denim Overalls,$115.00,2025-08-25,Credit Card
TT-1021,Multi-Pocket Cargo Shorts,$58.00,2025-08-26,Credit Card
TT-1022,Classic Fit Chinos,$78.00,2025-08-26,Debit Card
TT-1023,Slim-Fit Denim Jeans,$88.00,2025-08-27,Debit Card
TT-1024,Tailored Wool Dress Trousers,$145.00,2025-08-27,eWallet
TT-1025,Flannel-Lined Canvas Work Pants,$98.00,2025-08-28,eWallet
TT-1025,Multi-Pocket Cargo Shorts,$58.00,2025-08-28,Debit Card
TT-1026,Drawstring Linen Trousers,$92.00,2025-08-29,Debit Card
TT-1027,Striped Seersucker Trousers,$95.00,2025-08-29,Credit Card
TT-1028,Relaxed Fit Corduroy Trousers,$85.00,2025-08-30,eWallet
TT-1029,Premium Tailored Trousers,$175.00,2025-08-30,Debit Card
TT-1029,Classic Fit Chinos,$78.00,2025-08-30,Debit Card
TT-1030,Technical Performance Joggers,$75.00,2025-08-31,Credit Card
TT-1031,Slim-Fit Denim Jeans,$88.00,2025-09-01,eWallet
TT-1032,Double-Pleated Khaki Trousers,$82.00,2025-09-01,Credit Card
TT-1033,Classic Denim Overalls,$115.00,2025-09-02,eWallet
TT-1034,Flannel-Lined Canvas Work Pants,$98.00,2025-09-02,Cash
TT-1034,Classic Fit Chinos,$78.00,2025-09-02,Cash
TT-1035,Multi-Pocket Cargo Shorts,$58.00,2025-09-03,Debit Card
TT-1036,Drawstring Linen Trousers,$92.00,2025-09-03,Credit Card
TT-1037,Tailored Wool Dress Trousers,$145.00,2025-09-04,Debit Card
TT-1038,Striped Seersucker Trousers,$95.00,2025-09-04,eWallet
TT-1039,Technical Performance Joggers,$75.00,2025-09-05,Cash
TT-1040,Slim-Fit Denim Jeans,$88.00,2025-09-05,Debit Card
TT-1040,Relaxed Fit Corduroy Trousers,$85.00,2025-09-05,eWallet
TT-1041,Classic Fit Chinos,$78.00,2025-09-06,Cash
TT-1042,Premium Tailored Trousers,$175.00,2025-09-06,Credit Card
TT-1043,Flannel-Lined Canvas Work Pants,$98.00,2025-09-07,Credit Card
TT-1044,Double-Pleated Khaki Trousers,$82.00,2025-09-08,Cash
TT-1045,Multi-Pocket Cargo Shorts,$58.00,2025-09-08,eWallet
TT-1046,Classic Denim Overalls,$115.00,2025-09-09,Cash
TT-1047,Tailored Wool Dress Trousers,$145.00,2025-09-09,eWallet
TT-1047,Classic Fit Chinos,$78.00,2025-09-09,Cash
TT-1048,Drawstring Linen Trousers,$92.00,2025-09-10,Credit Card
TT-1049,Slim-Fit Denim Jeans,$88.00,2025-09-10,Cash
TT-1050,Technical Performance Joggers,$75.00,2025-09-11,Debit Card
TT-1051,Striped Seersucker Trousers,$95.00,2025-09-12,Debit Card
TT-1052,Relaxed Fit Corduroy Trousers,$85.00,2025-09-12,eWallet
TT-1053,Premium Tailored Trousers,$175.00,2025-09-13,eWallet
TT-1054,Flannel-Lined Canvas Work Pants,$98.00,2025-09-13,Cash
TT-1054,Multi-Pocket Cargo Shorts,$58.00,2025-09-13,Credit Card
TT-1055,Double-Pleated Khaki Trousers,$82.00,2025-09-14,eWallet
TT-1056,Classic Fit Chinos,$78.00,2025-09-14,Debit Card
TT-1057,Slim-Fit Denim Jeans,$88.00,2025-09-15,eWallet
TT-1058,Classic Denim Overalls,$115.00,2025-09-16,Debit Card
TT-1059,Drawstring Linen Trousers,$92.00,2025-09-16,Debit Card
TT-1059,Technical Performance Joggers,$75.00,2025-09-16,Debit Card
TT-1060,Tailored Wool Dress Trousers,$145.00,2025-09-17,Cash
TT-1061,Striped Seersucker Trousers,$95.00,2025-09-17,Credit Card
TT-1062,Relaxed Fit Corduroy Trousers,$85.00,2025-09-18,eWallet
TT-1063,Premium Tailored Trousers,$175.00,2025-09-18,Credit Card
TT-1064,Slim-Fit Denim Jeans,$88.00,2025-09-19,Credit Card
TT-1065,Flannel-Lined Canvas Work Pants,$98.00,2025-09-19,eWallet
TT-1065,Classic Fit Chinos,$78.00,2025-09-19,eWallet
TT-1066,Double-Pleated Khaki Trousers,$82.00,2025-09-20,eWallet
TT-1067,Multi-Pocket Cargo Shorts,$58.00,2025-09-21,eWallet
TT-1068,Technical Performance Joggers,$75.00,2025-09-21,Credit Card
TT-1069,Classic Denim Overalls,$115.00,2025-09-22,eWallet
TT-1070,Drawstring Linen Trousers,$92.00,2025-09-22,Cash
TT-1071,Tailored Wool Dress Trousers,$145.00,2025-09-23,Credit Card
TT-1072,Slim-Fit Denim Jeans,$88.00,2025-09-23,eWallet
TT-1072,Striped Seersucker Trousers,$95.00,2025-09-23,eWallet
TT-1073,Relaxed Fit Corduroy Trousers,$85.00,2025-09-24,Credit Card
TT-1074,Classic Fit Chinos,$78.00,2025-09-24,Debit Card
TT-1075,Premium Tailored Trousers,$175.00,2025-09-25,Cash
TT-1076,Flannel-Lined Canvas Work Pants,$98.00,2025-09-26,Cash
TT-1077,Double-Pleated Khaki Trousers,$82.00,2025-09-26,Cash
TT-1078,Multi-Pocket Cargo Shorts,$58.00,2025-09-27,Cash
TT-1079,Technical Performance Joggers,$75.00,2025-09-27,Debit Card
TT-1079,Drawstring Linen Trousers,$92.00,2025-09-27,Cash
TT-1080,Classic Denim Overalls,$115.00,2025-09-28,Debit Card
TT-1081,Tailored Wool Dress Trousers,$145.00,2025-09-28,Cash
TT-1082,Slim-Fit Denim Jeans,$88.00,2025-09-29,Cash
TT-1083,Striped Seersucker Trousers,$95.00,2025-09-29,eWallet
TT-1084,Relaxed Fit Corduroy Trousers,$85.00,2025-09-30,eWallet
TT-1084,Classic Fit Chinos,$78.00,2025-09-30,Debit Card
TT-1085,Premium Tailored Trousers,$175.00,2025-10-01,Credit Card
TT-1086,Double-Pleated Khaki Trousers,$82.00,2025-10-01,Credit Card
TT-1087,Flannel-Lined Canvas Work Pants,$98.00,2025-10-02,eWallet
TT-1088,Technical Performance Joggers,$75.00,2025-10-02,Cash
TT-1089,Multi-Pocket Cargo Shorts,$58.00,2025-10-03,Credit Card
TT-1090,Drawstring Linen Trousers,$92.00,2025-10-03,Credit Card
TT-1091,Classic Denim Overalls,$115.00,2025-10-04,Cash
TT-1092,Tailored Wool Dress Trousers,$145.00,2025-10-04,Cash
TT-1092,Classic Fit Chinos,$78.00,2025-10-04,Debit Card
TT-1093,Slim-Fit Denim Jeans,$88.00,2025-10-05,Debit Card
TT-1094,Striped Seersucker Trousers,$95.00,2025-10-05,Cash
TT-1095,Relaxed Fit Corduroy Trousers,$85.00,2025-10-06,eWallet
TT-1096,Premium Tailored Trousers,$175.00,2025-10-06,Cash
TT-1097,Flannel-Lined Canvas Work Pants,$98.00,2025-10-07,Credit Card
TT-1097,Slim-Fit Denim Jeans,$88.00,2025-10-07,Debit Card
TT-1098,Double-Pleated Khaki Trousers,$82.00,2025-10-07,eWallet`;

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function parseCSV(csvText: string): OrderItem[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length <= 1) return [];

  const items: OrderItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse line taking possible quotes into account
    const parts = line.split(',');
    if (parts.length < 5) continue;

    const orderNumber = parts[0].trim();
    const product = parts[1].trim();
    const priceStr = parts[2].replace('$', '').trim();
    const price = parseFloat(priceStr) || 0;
    const date = parts[3].trim();
    const paymentMethod = parts[4].trim() as PaymentMethod;

    // Date calculations
    const d = new Date(`${date}T00:00:00`);
    const dayOfWeek = isNaN(d.getTime()) ? 'Unknown' : DAYS_OF_WEEK[d.getDay()];
    const dayOfWeekIndex = isNaN(d.getTime()) ? 0 : d.getDay();

    // Week label calculation
    let weekLabel = 'Week Unknown';
    if (!isNaN(d.getTime())) {
      const monthShort = d.toLocaleString('en-US', { month: 'short' });
      const dayNum = d.getDate();
      // Group by 7-day windows or month blocks
      const weekNum = Math.ceil(dayNum / 7);
      weekLabel = `${monthShort} W${weekNum}`;
    }

    let priceTier: OrderItem['priceTier'] = 'Mid-Tier ($70-$100)';
    if (price < 70) {
      priceTier = 'Economy (<$70)';
    } else if (price > 100) {
      priceTier = 'Premium (>$100)';
    }

    items.push({
      id: `${orderNumber}-${i}-${product.replace(/\s+/g, '-').toLowerCase()}`,
      orderNumber,
      product,
      price,
      date,
      paymentMethod,
      dayOfWeek,
      dayOfWeekIndex,
      weekLabel,
      priceTier,
    });
  }

  return items;
}

export const INITIAL_ORDER_ITEMS: OrderItem[] = parseCSV(RAW_CSV_DATA);
