import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import settingsService, { DEFAULT_RESTAURANT_SETTINGS } from '../services/settingsService';

const getPalaceInfo = () => {
  try {
    const s = settingsService.getCachedSettings();
    if (s && s.restaurant_name) return s;
  } catch (e) {}
  return DEFAULT_RESTAURANT_SETTINGS;
};

/**
 * Generate a clean, easy-to-read financial PDF report
 * for Ralahami Restaurant in simple, clear English
 */
export const generateFinancialPDF = (financialData, userEmail = 'Admin') => {
  const palaceInfo = getPalaceInfo();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors
  const darkNavy = [15, 23, 42];      // #0F172A
  const royalGold = [217, 119, 6];     // #D97706
  const emeraldGreen = [16, 185, 129]; // #10B981
  const textDark = [30, 41, 59];       // #1E293B
  const textMuted = [100, 116, 139];   // #64748B
  const bgLight = [248, 250, 252];     // #F8FAFC

  // 1. Header Banner
  doc.setFillColor(...darkNavy);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Gold accent strip
  doc.setFillColor(...royalGold);
  doc.rect(0, 40, pageWidth, 2, 'F');

  // Brand Header in Simple English
  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text((palaceInfo.restaurant_name || 'RALAHAMI RESTAURANT').toUpperCase(), 14, 15);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Financial Sales, Expenses & Net Profit Statement', 14, 22);

  const scopeLabel = financialData?.period?.label || 'Selected Period';
  doc.setFontSize(8.5);
  doc.setTextColor(180, 190, 205);
  doc.text(`${palaceInfo.address || 'Riverside Road, Ratnapura, Sri Lanka'} | Phone: ${palaceInfo.phone || '+94 77 123 4567'} | ${palaceInfo.email || 'info@raalahami.lk'}`, 14, 28);
  doc.text(`Report Scope: ${scopeLabel} | Printed: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 14, 34);

  let currentY = 50;

  // 2. Simple Financial Summary Box
  doc.setFillColor(...bgLight);
  doc.roundedRect(14, currentY, pageWidth - 28, 48, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 48, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkNavy);
  doc.text('1. FINANCIAL SUMMARY OVERVIEW', 18, currentY + 7);

  const kpis = financialData?.kpis || {};
  const expBreakdown = financialData?.expensesBreakdown || {};

  // 4-Column Grid inside the box
  const col1X = 18;
  const col2X = 64;
  const col3X = 110;
  const col4X = 156;
  const kpiRow1Y = currentY + 16;
  const kpiRow2Y = currentY + 34;

  // Row 1: Sales, Expenses, Net Profit, Total Orders
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('TOTAL SALES (EARNINGS)', col1X, kpiRow1Y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...royalGold);
  doc.text(kpis.grossRevenueFormatted || `LKR ${(kpis.grossRevenue || 0).toLocaleString()}`, col1X, kpiRow1Y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('TOTAL SPENDING (EXPENSES)', col2X, kpiRow1Y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...textDark);
  doc.text(expBreakdown.totalOperationalCostFormatted || `LKR ${(expBreakdown.totalOperationalCost || 0).toLocaleString()}`, col2X, kpiRow1Y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('NET PROFIT (TAKE HOME)', col3X, kpiRow1Y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  const netProfit = kpis.netProfit || 0;
  doc.setTextColor(netProfit >= 0 ? emeraldGreen[0] : 220, netProfit >= 0 ? emeraldGreen[1] : 38, netProfit >= 0 ? emeraldGreen[2] : 38);
  doc.text(kpis.netProfitFormatted || `LKR ${netProfit.toLocaleString()}`, col3X, kpiRow1Y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('TOTAL ORDERS PLACED', col4X, kpiRow1Y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkNavy);
  doc.text(`${kpis.totalOrders || 0} orders`, col4X, kpiRow1Y + 5);

  // Row 2: Salaries, Ingredients, Avg Sale, Profit Margin
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('STAFF SALARIES PAID', col1X, kpiRow2Y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...textDark);
  doc.text(expBreakdown.staffSalariesFormatted || `LKR ${(expBreakdown.staffSalaries || 0).toLocaleString()}`, col1X, kpiRow2Y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('INGREDIENTS & STOCK COSTS', col2X, kpiRow2Y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...textDark);
  doc.text(expBreakdown.inventoryPurchasesFormatted || expBreakdown.estimatedCOGSFormatted || `LKR 0`, col2X, kpiRow2Y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('AVG SALE PER ORDER', col3X, kpiRow2Y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...textDark);
  doc.text(kpis.averageOrderValueFormatted || `LKR ${(kpis.averageOrderValue || 0).toLocaleString()}`, col3X, kpiRow2Y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('FOOD PROFIT MARGIN', col4X, kpiRow2Y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...emeraldGreen);
  doc.text(kpis.grossKitchenMargin || '71.5%', col4X, kpiRow2Y + 5);

  currentY += 56;

  // 3. Sales by Order Type Table (Dine-In, Takeaway, Delivery)
  const channels = financialData?.channels || {};
  const grossRev = kpis.grossRevenue || 1;
  const channelData = [
    [
      'Dine-In (Restaurant Tables)',
      `${channels.dineIn?.count || 0} orders`,
      channels.dineIn?.formatted || `LKR ${(channels.dineIn?.revenue || 0).toLocaleString()}`,
      `${grossRev > 0 ? (((channels.dineIn?.revenue || 0) / grossRev) * 100).toFixed(1) : 0}% of sales`
    ],
    [
      'Takeaway (Counter Pickups)',
      `${channels.takeaway?.count || 0} orders`,
      channels.takeaway?.formatted || `LKR ${(channels.takeaway?.revenue || 0).toLocaleString()}`,
      `${grossRev > 0 ? (((channels.takeaway?.revenue || 0) / grossRev) * 100).toFixed(1) : 0}% of sales`
    ],
    [
      'Home Delivery (Direct to Customer)',
      `${channels.delivery?.count || 0} orders`,
      channels.delivery?.formatted || `LKR ${(channels.delivery?.revenue || 0).toLocaleString()}`,
      `${grossRev > 0 ? (((channels.delivery?.revenue || 0) / grossRev) * 100).toFixed(1) : 0}% of sales`
    ]
  ];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkNavy);
  doc.text('2. SALES BY ORDER TYPE', 14, currentY);
  currentY += 3;

  autoTable(doc, {
    startY: currentY,
    head: [['Order Type', 'Orders Placed', 'Total Sales', 'Share of Total Sales']],
    body: channelData,
    theme: 'striped',
    headStyles: {
      fillColor: darkNavy,
      textColor: [245, 158, 11],
      fontSize: 8.5,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: textDark
    },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 9;

  // 4. Best Selling Dishes Table
  const topDishes = (financialData?.topDishes || []).slice(0, 5).map(d => [
    `#${d.rank}`,
    d.name,
    d.category || 'Specialty',
    `${d.count} orders sold`,
    d.rev,
    d.margin || '70%'
  ]);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkNavy);
  doc.text('3. POPULAR & BEST SELLING DISHES', 14, currentY);
  currentY += 3;

  autoTable(doc, {
    startY: currentY,
    head: [['Rank', 'Dish Name', 'Category', 'Quantity Sold', 'Total Sales', 'Profit Margin']],
    body: topDishes,
    theme: 'striped',
    headStyles: {
      fillColor: darkNavy,
      textColor: [245, 158, 11],
      fontSize: 8.5,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: textDark
    },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 9;

  // Check if we need a new page for expenses ledger
  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  // 5. Expenses & Salaries Paid Table
  const formatCategory = (cat) => {
    switch (cat) {
      case 'STAFF_PAYROLL': return 'Staff Salary';
      case 'INVENTORY_PURCHASE': return 'Ingredients & Stock';
      case 'UTILITIES': return 'Electricity & Gas';
      case 'OPERATIONAL_OVERHEAD': return 'Restaurant Maintenance';
      case 'MARKETING': return 'Advertising & Promo';
      default: return (cat || 'Other Expense').replace(/_/g, ' ');
    }
  };

  const formatPaymentMethod = (method) => {
    switch (method) {
      case 'BANK_TRANSFER': return 'Bank Transfer';
      case 'CASH': return 'Cash';
      case 'DIRECT_DEBIT': return 'Auto Debit';
      case 'ONLINE': return 'Card / Online';
      default: return method || 'Bank Transfer';
    }
  };

  const expenses = (financialData?.recentExpenses || []).slice(0, 6).map(e => {
    const formattedDate = e.expense_date ? new Date(e.expense_date).toISOString().split('T')[0] : 'Recent';
    const formattedAmount = `LKR ${parseFloat(e.amount || 0).toLocaleString()}`;
    return [
      formattedDate,
      e.title,
      formatCategory(e.category),
      formatPaymentMethod(e.payment_method),
      formattedAmount
    ];
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkNavy);
  doc.text('4. RECENT EXPENSES & SALARIES PAID', 14, currentY);
  currentY += 3;

  autoTable(doc, {
    startY: currentY,
    head: [['Date', 'Expense Description', 'Category', 'Paid Via', 'Amount']],
    body: expenses.length > 0 ? expenses : [['N/A', 'No expenses recorded in this period', 'N/A', 'N/A', 'LKR 0']],
    theme: 'striped',
    headStyles: {
      fillColor: darkNavy,
      textColor: [245, 158, 11],
      fontSize: 8.5,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: textDark
    },
    margin: { left: 14, right: 14 }
  });

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text('RALAHAMI RESTAURANT — FINANCIAL & PROFIT STATEMENT', 14, pageHeight - 9);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 28, pageHeight - 9);
  }

  // Save/Download PDF
  const rawRange = financialData?.period?.range || 'monthly';
  const periodLabel = (financialData?.period?.label || '')
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');

  const dateStamp = new Date().toISOString().split('T')[0];
  const filename = `Ralahami_Financial_Report_${periodLabel || rawRange}_${dateStamp}.pdf`;
  doc.save(filename);
  return filename;
};

/**
 * Generate Order Fulfillment Daily PDF Report
 */
export const generateOrdersDailyPDF = (reportData, userEmail = 'Admin') => {
  const palaceInfo = getPalaceInfo();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const darkNavy = [15, 23, 42];
  const royalGold = [217, 119, 6];
  const emeraldGreen = [16, 185, 129];
  const textDark = [30, 41, 59];
  const textMuted = [100, 116, 139];
  const bgLight = [248, 250, 252];

  const reportDate = reportData?.date || new Date().toISOString().split('T')[0];
  const kpis = reportData?.kpis || reportData?.metrics || reportData?.summary || {};
  const orders = reportData?.orders || [];
  const topSelling = reportData?.topSellingItems || reportData?.topSellingDishes || [];

  // Header Banner
  doc.setFillColor(...darkNavy);
  doc.rect(0, 0, pageWidth, 42, 'F');
  doc.setFillColor(...royalGold);
  doc.rect(0, 40, pageWidth, 2, 'F');

  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text((palaceInfo.restaurant_name || 'RALAHAMI RESTAURANT').toUpperCase(), 14, 14);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Daily Order Fulfillment & Kitchen Dispatch Operations Report', 14, 21);

  doc.setFontSize(8.5);
  doc.setTextColor(180, 190, 205);
  doc.text(`${palaceInfo.address || 'Riverside Road, Ratnapura, Sri Lanka'} | Phone: ${palaceInfo.phone || '+94 77 123 4567'} | ${palaceInfo.email || 'info@raalahami.lk'}`, 14, 27);
  doc.text(`Report Date: ${reportDate} | Generated by: ${userEmail} | Exported: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 14, 33);

  let currentY = 48;

  // KPI Overview Box
  doc.setFillColor(...bgLight);
  doc.roundedRect(14, currentY, pageWidth - 28, 38, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 38, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkNavy);
  doc.text(`1. DAILY SALES & DISPATCH HIGHLIGHTS (${reportDate})`, 18, currentY + 6);

  const col1X = 18;
  const col2X = 64;
  const col3X = 110;
  const col4X = 156;
  const kpiRowY = currentY + 16;
  const kpiRow2Y = currentY + 28;

  // Row 1
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('DAILY REVENUE', col1X, kpiRowY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...royalGold);
  doc.text(kpis.totalRevenueFormatted || kpis.grossSalesFormatted || `LKR ${(kpis.totalRevenue || kpis.grossSales || 0).toLocaleString()}`, col1X, kpiRowY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('TOTAL ORDERS', col2X, kpiRowY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...textDark);
  doc.text(String(kpis.totalOrders || orders.length || 0), col2X, kpiRowY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('FULFILLED FEASTS', col3X, kpiRowY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...emeraldGreen);
  doc.text(String(kpis.completedOrders || kpis.completed || 0), col3X, kpiRowY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('AVG ORDER VALUE', col4X, kpiRowY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...textDark);
  doc.text(kpis.averageOrderValueFormatted || `LKR ${(kpis.averageOrderValue || 0).toLocaleString()}`, col4X, kpiRowY + 5);

  // Row 2: Channel Breakdown
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text(`Dispatch Breakdown: ${kpis.deliveryCount || 0} Home Deliveries  •  ${kpis.takeawayCount || 0} Takeaways  •  ${kpis.dineInCount || 0} Dine-In Tables  •  ${kpis.cancelledOrders || kpis.cancelled || 0} Cancelled`, col1X, kpiRow2Y + 4);

  currentY += 44;

  // 2. Top Sold Items on that Date
  if (topSelling.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...darkNavy);
    doc.text('2. DISH BREAKDOWN & VOLUME PREPARED', 14, currentY);
    currentY += 3;

    const topItemsRows = topSelling.map((item, idx) => [
      `#${idx + 1}`,
      item.title || item.name || 'Dish',
      String(item.quantitySold || item.quantity || 1),
      `LKR ${parseFloat(item.unitPrice || item.price || 0).toLocaleString()}`,
      `LKR ${parseFloat(item.totalSales || item.totalAmount || (item.quantitySold || 1) * (item.unitPrice || 0)).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Menu Dish Name', 'Units Prepared', 'Unit Price', 'Total Sales Volume']],
      body: topItemsRows,
      theme: 'striped',
      headStyles: {
        fillColor: darkNavy,
        textColor: [245, 158, 11],
        fontSize: 8,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: textDark
      },
      margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 8;
  }

  // 3. Detailed Daily Orders Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkNavy);
  doc.text(`3. DETAILED ORDERS DISPATCH LOG (${orders.length} Records)`, 14, currentY);
  currentY += 3;

  const orderRows = (orders.length > 0 ? orders : []).map(o => {
    const timeStr = o.createdAt || o.created_at ? new Date(o.createdAt || o.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--';
    const itemsSummary = Array.isArray(o.items) && o.items.length > 0
      ? o.items.map(it => `${it.quantity || 1}x ${it.name || it.title || it.menu_item_name}`).join(', ')
      : (o.order_items_text || 'Standard Meal');
    const orderNum = o.order_number || o.orderNumber || `#${o.id}`;
    const custName = o.customer_name || o.recipientName || o.userName || 'Guest Customer';
    const fulfillment = (o.fulfillment_type || o.order_type || o.orderType || 'Delivery').toUpperCase();
    const status = (o.status || 'PENDING').toUpperCase();
    const amount = `LKR ${parseFloat(o.total_amount || o.totalAmount || o.totalPrice || 0).toLocaleString()}`;

    return [
      orderNum,
      timeStr,
      custName,
      fulfillment,
      itemsSummary,
      status,
      amount
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Order #', 'Time', 'Customer', 'Fulfillment', 'Line Items', 'Status', 'Total']],
    body: orderRows.length > 0 ? orderRows : [['--', '--', 'No orders recorded on this date', '--', '--', '--', 'LKR 0']],
    theme: 'grid',
    headStyles: {
      fillColor: darkNavy,
      textColor: [245, 158, 11],
      fontSize: 8,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: textDark
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 16 },
      2: { cellWidth: 30 },
      3: { cellWidth: 22 },
      4: { cellWidth: 'auto' },
      5: { cellWidth: 22 },
      6: { cellWidth: 22, halign: 'right' }
    },
    margin: { left: 14, right: 14 }
  });

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text('RALAHAMI RESTAURANT — DAILY ORDER FULFILLMENT REPORT', 14, pageHeight - 9);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 28, pageHeight - 9);
  }

  const filename = `Ralahami_Daily_Orders_Report_${reportDate}.pdf`;
  doc.save(filename);
  return filename;
};

/**
 * Generate Inventory & Stock Movement Daily PDF Report
 */
export const generateInventoryDailyPDF = (reportData, userEmail = 'Admin') => {
  const palaceInfo = getPalaceInfo();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const darkNavy = [15, 23, 42];
  const royalGold = [217, 119, 6];
  const emeraldGreen = [16, 185, 129];
  const dangerRed = [239, 68, 68];
  const textDark = [30, 41, 59];
  const textMuted = [100, 116, 139];
  const bgLight = [248, 250, 252];

  const reportDate = reportData?.date || new Date().toISOString().split('T')[0];
  const kpis = reportData?.kpis || reportData?.summary || {};
  const inventory = reportData?.inventory || reportData?.items || [];
  const consumedToday = reportData?.consumedToday || reportData?.consumedItems || [];

  // Header Banner
  doc.setFillColor(...darkNavy);
  doc.rect(0, 0, pageWidth, 42, 'F');
  doc.setFillColor(...royalGold);
  doc.rect(0, 40, pageWidth, 2, 'F');

  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text((palaceInfo.restaurant_name || 'RALAHAMI RESTAURANT').toUpperCase(), 14, 14);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Daily Stock Health, Deductions & Ingredient Movement Report', 14, 21);

  doc.setFontSize(8.5);
  doc.setTextColor(180, 190, 205);
  doc.text(`${palaceInfo.address || 'Riverside Road, Ratnapura, Sri Lanka'} | Phone: ${palaceInfo.phone || '+94 77 123 4567'} | ${palaceInfo.email || 'info@raalahami.lk'}`, 14, 27);
  doc.text(`Report Date: ${reportDate} | Generated by: ${userEmail} | Exported: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 14, 33);

  let currentY = 48;

  // KPI Overview Box
  doc.setFillColor(...bgLight);
  doc.roundedRect(14, currentY, pageWidth - 28, 38, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 38, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkNavy);
  doc.text(`1. INVENTORY HEALTH & MOVEMENT SUMMARY (${reportDate})`, 18, currentY + 6);

  const col1X = 18;
  const col2X = 64;
  const col3X = 110;
  const col4X = 156;
  const kpiRowY = currentY + 16;
  const kpiRow2Y = currentY + 28;

  // Row 1
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('TOTAL TRACKED ITEMS', col1X, kpiRowY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkNavy);
  doc.text(String(kpis.totalItems || kpis.totalStockItems || inventory.length || 0), col1X, kpiRowY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('STOCK HEALTH RATE', col2X, kpiRowY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...emeraldGreen);
  doc.text(`${kpis.stockHealthPercent || (kpis.stockHealthRate !== undefined ? `${kpis.stockHealthRate}%` : '100%')}`, col2X, kpiRowY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('LOW STOCK WARNINGS', col3X, kpiRowY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  const lowCount = kpis.lowStockCount || 0;
  doc.setTextColor(...(lowCount > 0 ? dangerRed : emeraldGreen));
  doc.text(String(lowCount), col3X, kpiRowY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('INGREDIENTS USED', col4X, kpiRowY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...royalGold);
  doc.text(String(kpis.totalConsumedItemsCount || consumedToday.length || 0), col4X, kpiRowY + 5);

  // Row 2
  const healthyCount = kpis.healthyCount || kpis.healthyStockCount || (inventory.length - lowCount);
  const consumedUnits = kpis.totalConsumedUnitsFormatted || (kpis.totalQuantityConsumed !== undefined ? `${kpis.totalQuantityConsumed} units` : '0 units');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text(`Warehouse Status: ${healthyCount} items in optimal stock • ${consumedUnits} total quantity deducted for orders`, col1X, kpiRow2Y + 4);

  currentY += 44;

  // 2. Ingredients Consumed / Deducted Today
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkNavy);
  doc.text(`2. KITCHEN INGREDIENT CONSUMPTION & DEDUCTIONS (${consumedToday.length} Items)`, 14, currentY);
  currentY += 3;

  const consumedRows = (consumedToday.length > 0 ? consumedToday : []).map((item, idx) => [
    `#${idx + 1}`,
    item.name || item.ingredientName || 'Ingredient',
    item.category || 'Kitchen Stock',
    item.formattedQuantity || `${item.consumedQuantity || item.totalQuantityDeducted || 0} ${item.unit || 'units'}`,
    `Auto-deducted from ${item.orderCount || 1} recipe orders`
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Raw Ingredient Name', 'Category', 'Quantity Deducted', 'Usage Context']],
    body: consumedRows.length > 0 ? consumedRows : [['--', 'No kitchen stock deductions recorded on this date', '--', '0 units', 'Zero consumption logs']],
    theme: 'striped',
    headStyles: {
      fillColor: darkNavy,
      textColor: [245, 158, 11],
      fontSize: 8,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: textDark
    },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // 3. Current Pantry & Stock Levels
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkNavy);
  doc.text('3. CURRENT STOCK BALANCE & THRESHOLD AUDIT', 14, currentY);
  currentY += 3;

  const stockRows = (inventory.length > 0 ? inventory : []).map(item => {
    const curStock = Number(item.stock ?? item.currentStock ?? 0);
    const minThresh = Number(item.threshold ?? item.minimumThreshold ?? 0);
    const isLow = curStock <= minThresh;
    return [
      item.name,
      item.category || 'General',
      `${curStock} ${item.unit || 'units'}`,
      `${minThresh} ${item.unit || 'units'}`,
      item.supplier || 'Local Supplier',
      isLow ? 'LOW STOCK ALERT' : 'OPTIMAL LEVEL'
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Item / Ingredient', 'Category', 'Stock Level', 'Min Threshold', 'Supplier', 'Status']],
    body: stockRows.length > 0 ? stockRows : [['No items in stock inventory', '--', '--', '--', '--', '--']],
    theme: 'grid',
    headStyles: {
      fillColor: darkNavy,
      textColor: [245, 158, 11],
      fontSize: 8,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: textDark
    },
    margin: { left: 14, right: 14 }
  });

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text('RALAHAMI RESTAURANT — DAILY INVENTORY & STOCK REPORT', 14, pageHeight - 9);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 28, pageHeight - 9);
  }

  const filename = `Ralahami_Daily_Inventory_Report_${reportDate}.pdf`;
  doc.save(filename);
  return filename;
};

/**
 * Generate Reservations & Tables Daily PDF Report
 */
export const generateReservationsDailyPDF = (reportData, userEmail = 'Admin') => {
  const palaceInfo = getPalaceInfo();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const darkNavy = [15, 23, 42];
  const royalGold = [217, 119, 6];
  const emeraldGreen = [16, 185, 129];
  const textDark = [30, 41, 59];
  const textMuted = [100, 116, 139];
  const bgLight = [248, 250, 252];

  const reportDate = reportData?.date || new Date().toISOString().split('T')[0];
  const kpis = reportData?.kpis || reportData?.summary || {};
  const reservations = reportData?.reservations || [];
  const hallBreakdown = kpis.hallBreakdown || {};

  // Header Banner
  doc.setFillColor(...darkNavy);
  doc.rect(0, 0, pageWidth, 42, 'F');
  doc.setFillColor(...royalGold);
  doc.rect(0, 40, pageWidth, 2, 'F');

  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text((palaceInfo.restaurant_name || 'RALAHAMI RESTAURANT').toUpperCase(), 14, 14);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Daily Floor Plan Bookings, Seating Allocations & Covers Report', 14, 21);

  doc.setFontSize(8.5);
  doc.setTextColor(180, 190, 205);
  doc.text(`${palaceInfo.address || 'Riverside Road, Ratnapura, Sri Lanka'} | Phone: ${palaceInfo.phone || '+94 77 123 4567'} | ${palaceInfo.email || 'info@raalahami.lk'}`, 14, 27);
  doc.text(`Report Date: ${reportDate} | Generated by: ${userEmail} | Exported: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 14, 33);

  let currentY = 48;

  // KPI Overview Box
  doc.setFillColor(...bgLight);
  doc.roundedRect(14, currentY, pageWidth - 28, 38, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 38, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkNavy);
  doc.text(`1. FLOOR SEATING & COVERS SUMMARY (${reportDate})`, 18, currentY + 6);

  const col1X = 18;
  const col2X = 64;
  const col3X = 110;
  const col4X = 156;
  const kpiRowY = currentY + 16;
  const kpiRow2Y = currentY + 28;

  // Row 1
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('TOTAL RESERVATIONS', col1X, kpiRowY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkNavy);
  doc.text(String(kpis.totalReservations || reservations.length || 0), col1X, kpiRowY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('TOTAL GUESTS / COVERS', col2X, kpiRowY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...royalGold);
  doc.text(`${kpis.totalGuests || 0} Guests`, col2X, kpiRowY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('CONFIRMED / SEATED', col3X, kpiRowY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...emeraldGreen);
  doc.text(String((kpis.confirmedBookings || kpis.confirmed || 0) + (kpis.completedBookings || kpis.completed || 0)), col3X, kpiRowY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('CANCELLED BOOKINGS', col4X, kpiRowY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...textDark);
  doc.text(String(kpis.cancelledBookings || kpis.cancelled || 0), col4X, kpiRowY + 5);

  // Row 2: Hall Breakdown
  const royalHallCount = hallBreakdown['Royal Dining Hall'] || 0;
  const balconyCount = hallBreakdown['Balcony Court'] || 0;
  const suiteCount = hallBreakdown['Private Suite'] || 0;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text(`Hall Allocations: ${royalHallCount} Royal Dining Hall  •  ${balconyCount} Balcony Court  •  ${suiteCount} Private Suite`, col1X, kpiRow2Y + 4);

  currentY += 44;

  // 2. Bookings & Table Allocations Schedule
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkNavy);
  doc.text(`2. TABLE BOOKING & SEATING ROSTER (${reservations.length} Bookings)`, 14, currentY);
  currentY += 3;

  const resRows = (reservations.length > 0 ? reservations : []).map(r => {
    const bookingId = r.id || r.order_number || '--';
    const guestName = r.guest || r.customer_name || r.name || 'VIP Patron';
    const contact = r.phone || r.email || '--';
    const hallTable = `${r.hall || r.hall_name || 'Main Hall'} - ${r.table || r.table_number || 'Table'}`;
    const timeSlot = r.time || r.reservation_time || '--:--';
    const guests = `${r.guests || r.party_size || 2} Pax`;
    const status = (r.status || 'CONFIRMED').toUpperCase();
    const notes = r.notes || r.special_requests || 'Standard Reservation';

    return [
      bookingId,
      timeSlot,
      guestName,
      contact,
      hallTable,
      guests,
      status,
      notes
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Ref #', 'Time Slot', 'Guest Name', 'Contact Info', 'Hall & Table', 'Guests', 'Status', 'Special Notes']],
    body: resRows.length > 0 ? resRows : [['--', '--', 'No reservations scheduled for this date', '--', '--', '--', '--', '--']],
    theme: 'grid',
    headStyles: {
      fillColor: darkNavy,
      textColor: [245, 158, 11],
      fontSize: 8,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: textDark
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 16 },
      2: { cellWidth: 26 },
      3: { cellWidth: 26 },
      4: { cellWidth: 32 },
      5: { cellWidth: 16 },
      6: { cellWidth: 20 },
      7: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14 }
  });

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text('RALAHAMI RESTAURANT — DAILY RESERVATIONS & SEATING REPORT', 14, pageHeight - 9);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 28, pageHeight - 9);
  }

  const filename = `Ralahami_Daily_Reservations_Report_${reportDate}.pdf`;
  doc.save(filename);
  return filename;
};

export default generateFinancialPDF;


