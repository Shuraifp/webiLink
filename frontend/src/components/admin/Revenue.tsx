"use client";

import { fetchRevenueData } from "@/lib/api/admin/adminApi";
import axios from "axios";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import toast from "react-hot-toast";

interface RevenueData {
  month: string;
  revenue: number;
}

export function Revenue() {
  const [timeframe, setTimeframe] = useState("Yearly");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [labels, setLabels] = useState([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [transactions, setTransactions] = useState<
    { user: string; plan: string; amount: number; date: string }[]
  >([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchRevenueData(
          timeframe,
          customStartDate,
          customEndDate
        );
        setRevenueData(response.data.totalPrices);
        setLabels(response.data.labels);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const message =
            err.response?.data.message || "Failed to fetch revenue data";
          setError(message);
          toast.error(message);
        } else {
          const message = "An unexpected error occurred.";
          setError(message);
          toast.error(message);
        }
      }
    };
    fetchData();
  }, [timeframe, customStartDate, customEndDate]);
  const handleCustomDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    if (name === "startDate") {
      setCustomStartDate(value);
    } else {
      setCustomEndDate(value);
    }
  };

  const updateTimeframe = (selectedTimeframe: string) => {
    setTimeframe(selectedTimeframe);
    // fetchRevenueData(timeframe, customStartDate, customEndDate);
  };

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Revenue",
        data: revenueData,
        borderColor: "rgb(255, 205, 86)",
        backgroundColor: "rgba(255, 205, 86, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Revenue Trend" },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Revenue (₹)" },
      },
    },
  };

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div>
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <h3 className="text-lg font-semibold text-gray-800 raleway mb-4">
          Revenue Trend
        </h3>
        <div className="h-[300px] w-full">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="mt-8">
          <div className="flex justify-center gap-3">
            <button
              className={`py-2 px-4 hover:bg-gray-300 rounded-xl ${
                timeframe === "Weekly" ? "bg-gray-300" : "bg-gray-100"
              }`}
              onClick={() => updateTimeframe("Weekly")}
            >
              Weekly
            </button>

            <button
              className={`py-2 px-4 hover:bg-gray-300 rounded-xl ${
                timeframe === "Monthly" ? "bg-gray-300" : "bg-gray-100"
              }`}
              onClick={() => updateTimeframe("Monthly")}
            >
              Monthly
            </button>

            <button
              className={`py-2 px-4 hover:bg-gray-300 rounded-xl ${
                timeframe === "Yearly" ? "bg-gray-300" : "bg-gray-100"
              }`}
              onClick={() => updateTimeframe("Yearly")}
            >
              Yearly
            </button>
            <div className="relative inline-block">
              <button
                className={`py-2 px-4 hover:bg-gray-300 rounded-xl ${
                  timeframe === "Custom" ? "bg-gray-300" : "bg-gray-100"
                }`}
                onClick={() => updateTimeframe("Custom")}
              >
                Custom Date Range
              </button>
              {timeframe === "Custom" && (
                <div className="absolute bg-white border border-gray-300 mt-2 p-2 rounded shadow-md">
                  <input
                    type="date"
                    name="startDate"
                    className="mb-2"
                    value={customStartDate}
                    onChange={handleCustomDateChange}
                  />
                  <input
                    type="date"
                    name="endDate"
                    value={customEndDate}
                    onChange={handleCustomDateChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 raleway mb-4">
          Recent Transactions
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-2 text-left text-gray-600 raleway">
                  User
                </th>
                <th className="px-4 py-2 text-left text-gray-600 raleway">
                  Plan
                </th>
                <th className="px-4 py-2 text-left text-gray-600 raleway">
                  Amount
                </th>
                <th className="px-4 py-2 text-left text-gray-600 raleway">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="px-4 py-2 text-gray-800">{txn.user}</td>
                  <td className="px-4 py-2 text-gray-600">{txn.plan}</td>
                  <td className="px-4 py-2 text-gray-600">
                    ₹{txn.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{txn.date}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-2 text-center text-gray-600"
                  >
                    No transactions available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
