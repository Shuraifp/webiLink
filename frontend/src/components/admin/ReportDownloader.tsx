import React, { useState } from "react";
import {
  Download,
  FileText,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
} from "lucide-react";
import { Transaction } from "@/types/adminDashboard";

type Format = "comprehensive" | "summary"

export default function RevenuePDFExport({
  revenue,
  transactions,
  timeFrame,
  customStartDate,
  customEndDate,
}: {
  revenue: { x: number | string; y: number }[];
  transactions: Transaction[];
  timeFrame: string;
  customStartDate?: string;
  customEndDate?: string;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportFormat, setExportFormat] = useState("comprehensive" as Format);

  const generatePDF = async (format: Format) => {
    setIsGenerating(true);

    try {
      const totalRevenue = revenue.reduce((sum, item) => sum + item.y, 0);
      const avgRevenue = totalRevenue / revenue.length;
      const totalTransactions = transactions.length;
      const avgTransactionValue =
        transactions.reduce((sum, txn) => sum + txn.amount, 0) /
        totalTransactions;

      const printWindow = window.open("", "_blank");

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Revenue Report - ${new Date().toLocaleDateString()}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background: white;
              padding: 20px;
            }
            
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px solid #f59e0b;
              padding-bottom: 20px;
            }
            
            .company-logo {
              font-size: 32px;
              font-weight: bold;
              color: #f59e0b;
              margin-bottom: 10px;
            }
            
            .report-title {
              font-size: 28px;
              color: #1f2937;
              margin-bottom: 10px;
            }
            
            .report-meta {
              color: #6b7280;
              font-size: 14px;
            }
            
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
              margin-bottom: 40px;
            }
            
            .summary-card {
              background: linear-gradient(135deg, #f59e0b, #d97706);
              color: white;
              padding: 20px;
              border-radius: 12px;
              text-align: center;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .summary-card h3 {
              font-size: 14px;
              margin-bottom: 8px;
              opacity: 0.9;
            }
            
            .summary-card .value {
              font-size: 24px;
              font-weight: bold;
            }
            
            .section {
              margin-bottom: 40px;
              page-break-inside: avoid;
            }
            
            .section-title {
              font-size: 20px;
              color: #1f2937;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
            }
            
            .chart-placeholder {
              width: 100%;
              height: 300px;
              border: 2px dashed #d1d5db;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #f9fafb;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            
            .revenue-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .revenue-table th {
              background: #f59e0b;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: 600;
            }
            
            .revenue-table td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .revenue-table tbody tr:nth-child(even) {
              background: #f9fafb;
            }
            
            .revenue-table tbody tr:hover {
              background: #f3f4f6;
            }
            
            .trend-indicator {
              display: inline-flex;
              align-items: center;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
            }
            
            .trend-up {
              background: #dcfce7;
              color: #166534;
            }
            
            .trend-down {
              background: #fee2e2;
              color: #991b1b;
            }
            
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            
            .insights {
              background: #eff6ff;
              border-left: 4px solid #3b82f6;
              padding: 20px;
              margin: 20px 0;
              border-radius: 0 8px 8px 0;
            }
            
            .insights h4 {
              color: #1e40af;
              margin-bottom: 10px;
            }
            
            @media print {
              body { padding: 0; }
              .page-break { page-break-before: always; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-logo">📊 WEBILINK</div>
            <h1 class="report-title">${
              timeFrame !== "Custom"
                ? timeFrame
                : "From " + customStartDate + " to " + customEndDate
            } Revenue Analytics Report</h1>
            <div class="report-meta">
              Generated on ${new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })} | Report Type: ${
        format === "comprehensive" ? "Comprehensive" : "Summary"
      }
            </div>
          </div>

          <div class="summary-grid">
            <div class="summary-card">
              <h3>Total Revenue</h3>
              <div class="value">₹${totalRevenue.toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <h3>Average Monthly Revenue</h3>
              <div class="value">₹${Math.round(
                avgRevenue
              ).toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <h3>Total Transactions</h3>
              <div class="value">${totalTransactions}</div>
            </div>
            <div class="summary-card">
              <h3>Avg Transaction Value</h3>
              <div class="value">₹${Math.round(
                avgTransactionValue
              ).toLocaleString()}</div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Revenue Trend Analysis</h2>
            <div class="chart-placeholder">
              <div style="text-align: center; color: #6b7280;">
                <div style="font-size: 48px; margin-bottom: 10px;">📈</div>
                <div>Revenue Chart Visualization</div>
                <div style="font-size: 12px; margin-top: 5px;">Chart data would be rendered here in production</div>
              </div>
            </div>
            
            <table class="revenue-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Revenue</th>
                  <th>Growth</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${revenue
                  .map((item, index) => {
                    const prevRevenue =
                      index > 0 ? revenue[index - 1].y : item.y;
                    let growth;
                    let isPositive;

                    if (index === 0) {
                      growth = "0.0";
                      isPositive = true;
                    } else if (prevRevenue === 0 && item.y === 0) {
                      growth = "0.0";
                      isPositive = true;
                    } else if (prevRevenue === 0 && item.y !== 0) {
                      growth = "N/A";
                      isPositive = true;
                    } else {
                      growth = (
                        ((item.y - prevRevenue) / prevRevenue) *
                        100
                      ).toFixed(1);
                      isPositive = parseFloat(growth) >= 0;
                    }

                    return `
                    <tr>
        <td><strong>${item.x}</strong></td>
        <td>₹${item.y.toLocaleString()}</td>
        <td>${
          growth === "N/A" ? growth : (isPositive ? "+" : "") + growth + "%"
        }</td>
        <td>
          <span class="trend-indicator ${
            isPositive ? "trend-up" : "trend-down"
          }">
            ${isPositive ? "↗" : "↘"} ${isPositive ? "Growth" : "Decline"}
          </span>
        </td>
      </tr>
                  `;
                  })
                  .join("")}
              </tbody>
            </table>
          </div>

          ${
            format === "comprehensive"
              ? `
            <div class="page-break"></div>
            <div class="section">
              <h2 class="section-title">Recent Transactions</h2>
              <table class="revenue-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>User</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${transactions
                    .map(
                      (txn) => `
                    <tr>
                      <td><code>${txn.transactionId}</code></td>
                      <td>${txn.username}</td>
                      <td><strong>${txn.planname}</strong></td>
                      <td>₹${txn.amount.toLocaleString()}</td>
                      <td>${new Date(txn.date).toLocaleDateString()}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>

            <div class="section">
              <h2 class="section-title">Key Insights & Recommendations</h2>
              <div class="insights">
                <h4>📊 Performance Analysis</h4>
                <ul style="margin-left: 20px; margin-top: 10px;">
                  <li>Revenue shows ${
                    revenue[revenue.length - 1].y > revenue[0].y
                      ? "positive"
                      : "negative"
                  } trend over the reporting period</li>
                  <li>Average transaction value: ₹${Math.round(
                    avgTransactionValue
                  ).toLocaleString()}</li>
                  <li>Peak revenue month: ${
                    revenue.reduce((max, item) => (item.y > max.y ? item : max))
                      .x
                  }</li>
                </ul>
              </div>
              
              <div class="insights" style="background: #f0fdf4; border-left-color: #16a34a;">
                <h4 style="color: #15803d;">💡 Strategic Recommendations</h4>
                <ul style="margin-left: 20px; margin-top: 10px;">
                  <li>Focus on Premium plan conversions to increase average transaction value</li>
                  <li>Implement customer retention strategies for high-value subscribers</li>
                  <li>Consider seasonal promotions during low-revenue periods</li>
                </ul>
              </div>
            </div>
          `
              : ""
          }

          <div class="footer">
            <p><strong>MEETWISE Revenue Analytics</strong> | Confidential Business Report</p>
            <p>Generated automatically by the admin dashboard system</p>
            <p style="margin-top: 10px; font-size: 11px;">
              This report contains confidential business information. Distribution should be limited to authorized personnel only.
            </p>
          </div>
        </body>
        </html>
      `;

      printWindow!.document.write(htmlContent);
      printWindow!.document.close();

      // Wait for content to load
      setTimeout(() => {
        printWindow!.print();
        printWindow!.close();
        setIsGenerating(false);
      }, 1000);
    } catch (error) {
      console.error("PDF generation failed:", error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-yellow-600" />
            Export Revenue Report
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Generate comprehensive PDF reports with charts and analytics
          </p>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
            exportFormat === "comprehensive"
              ? "border-yellow-400 bg-yellow-50 shadow-md"
              : "border-gray-200 hover:border-yellow-300"
          }`}
          onClick={() => setExportFormat("comprehensive")}
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-800">
              Comprehensive Report
            </h4>
          </div>
          <p className="text-sm text-gray-600">
            Includes revenue trends, transaction details, insights, and
            recommendations
          </p>
          <div className="mt-2 text-xs text-gray-500">
            • Revenue analytics • Transaction history • Key insights • 4-6 pages
          </div>
        </div>

        <div
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
            exportFormat === "summary"
              ? "border-yellow-400 bg-yellow-50 shadow-md"
              : "border-gray-200 hover:border-yellow-300"
          }`}
          onClick={() => setExportFormat("summary")}
        >
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-800">Executive Summary</h4>
          </div>
          <p className="text-sm text-gray-600">
            High-level overview with key metrics and revenue trends only
          </p>
          <div className="mt-2 text-xs text-gray-500">
            • Key metrics • Revenue chart • Performance summary • 2-3 pages
          </div>
        </div>
      </div>

      {/* Quick Stats Preview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">₹1,68,000</div>
          <div className="text-xs text-gray-600">Total Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">33.6K</div>
          <div className="text-xs text-gray-600">Avg Monthly</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">5</div>
          <div className="text-xs text-gray-600">Transactions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">₹1,119</div>
          <div className="text-xs text-gray-600">Avg Value</div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => generatePDF(exportFormat)}
          disabled={isGenerating}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            isGenerating
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download{" "}
              {exportFormat === "comprehensive"
                ? "Comprehensive"
                : "Executive"}{" "}
              Report
            </>
          )}
        </button>

        <button
          onClick={() => {
            const csvContent = transactions
              .map(
                (txn) =>
                  `${txn.transactionId},${txn.username},${txn.planname},${txn.amount},${txn.date}`
              )
              .join("\n");
            const blob = new Blob(
              [`Transaction ID,Username,Plan,Amount,Date\n${csvContent}`],
              { type: "text/csv" }
            );
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `revenue-data-${
              new Date().toISOString().split("T")[0]
            }.csv`;
            a.click();
          }}
          className="px-4 py-3 border-2 border-yellow-400 text-yellow-600 rounded-lg font-semibold hover:bg-yellow-50 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Users className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <strong>Professional Tip:</strong> The comprehensive report includes
            detailed analytics perfect for stakeholder presentations, while the
            executive summary is ideal for quick decision-making meetings.
          </div>
        </div>
      </div>
    </div>
  );
}
