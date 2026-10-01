import React, { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";

export default function Reports({
  incomes,
  expenses,
}) {
  const totalIncome = useMemo(
    () =>
      incomes.reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      ),
    [incomes]
  );

  const totalExpenses = useMemo(
    () =>
      expenses.reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      ),
    [expenses]
  );

  const profit = totalIncome - totalExpenses;

  const expenseCategories = useMemo(() => {
    const result = {};

    expenses.forEach((item) => {
      const category = item.category || "Other";

      result[category] =
        (result[category] || 0) +
        Number(item.amount || 0);
    });

    return Object.entries(result).sort(
      (a, b) => b[1] - a[1]
    );
  }, [expenses]);

  const incomeCategories = useMemo(() => {
    const result = {};

    incomes.forEach((item) => {
      const category = item.category || "Other";

      result[category] =
        (result[category] || 0) +
        Number(item.amount || 0);
    });

    return Object.entries(result).sort(
      (a, b) => b[1] - a[1]
    );
  }, [incomes]);

  const money = (value) =>
    `₹${Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Reports
        </h1>

        <p className="mt-1 text-sm text-[#85817A]">
          Financial performance and category breakdown.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#E7E4DE] bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <TrendingUp size={18} />
            </div>

            <div>
              <p className="text-xs text-[#8B8780]">
                Income
              </p>

              <p className="text-lg font-semibold text-emerald-700">
                {money(totalIncome)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E7E4DE] bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-2.5 text-red-600">
              <TrendingDown size={18} />
            </div>

            <div>
              <p className="text-xs text-[#8B8780]">
                Expenses
              </p>

              <p className="text-lg font-semibold text-red-700">
                {money(totalExpenses)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E7E4DE] bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#F2F0EC] p-2.5 text-[#1C3038]">
              <Wallet size={18} />
            </div>

            <div>
              <p className="text-xs text-[#8B8780]">
                Net Profit
              </p>

              <p className="text-lg font-semibold">
                {money(profit)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Income */}
        <div className="rounded-2xl border border-[#E7E4DE] bg-white">
          <div className="border-b border-[#ECEAE5] px-5 py-4">
            <h2 className="font-semibold">
              Income by Category
            </h2>
          </div>

          <div className="p-5">
            {incomeCategories.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#99958E]">
                No income data available.
              </p>
            ) : (
              <div className="space-y-4">
                {incomeCategories.map(
                  ([category, amount]) => {
                    const percentage =
                      totalIncome > 0
                        ? (amount / totalIncome) * 100
                        : 0;

                    return (
                      <div key={category}>
                        <div className="mb-1.5 flex justify-between text-sm">
                          <span className="text-[#5F5B55]">
                            {category}
                          </span>

                          <span className="font-semibold">
                            {money(amount)}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-[#F0EEEA]">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>

        {/* Expenses */}
        <div className="rounded-2xl border border-[#E7E4DE] bg-white">
          <div className="border-b border-[#ECEAE5] px-5 py-4">
            <h2 className="font-semibold">
              Expenses by Category
            </h2>
          </div>

          <div className="p-5">
            {expenseCategories.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#99958E]">
                No expense data available.
              </p>
            ) : (
              <div className="space-y-4">
                {expenseCategories.map(
                  ([category, amount]) => {
                    const percentage =
                      totalExpenses > 0
                        ? (amount / totalExpenses) * 100
                        : 0;

                    return (
                      <div key={category}>
                        <div className="mb-1.5 flex justify-between text-sm">
                          <span className="text-[#5F5B55]">
                            {category}
                          </span>

                          <span className="font-semibold">
                            {money(amount)}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-[#F0EEEA]">
                          <div
                            className="h-full rounded-full bg-red-500"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}