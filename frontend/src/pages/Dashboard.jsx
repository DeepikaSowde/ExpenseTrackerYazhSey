import { useMemo, useState } from "react";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarDays,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function Dashboard({ income, expenses, totals, navigate }) {
  const [filter, setFilter] = useState("This Month");

  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [appliedCustom, setAppliedCustom] = useState({
    start: "",
    end: "",
  });

  const [customError, setCustomError] = useState("");

  // ==================================================
  // FILTERED TRANSACTIONS
  // ==================================================

  const filtered = useMemo(() => {
    const all = [
      ...income.map((item) => ({
        ...item,
        type: "income",
      })),
      ...expenses.map((item) => ({
        ...item,
        type: "expense",
      })),
    ];

    const now = new Date();

    return all.filter((item) => {
      const date = new Date(item.createdAt);

      // TODAY
      if (filter === "Today") {
        return date.toDateString() === now.toDateString();
      }

      // THIS WEEK
      if (filter === "This Week") {
        const weekStart = new Date(now);

        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);

        return date >= weekStart;
      }

      // THIS MONTH
      if (filter === "This Month") {
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }

      // LAST 6 MONTHS
      if (filter === "Last 6 Months") {
        const start = new Date(now);

        start.setMonth(now.getMonth() - 6);
        start.setHours(0, 0, 0, 0);

        return date >= start;
      }

      // THIS YEAR
      if (filter === "This Year") {
        return date.getFullYear() === now.getFullYear();
      }

      // CUSTOM RANGE
      if (filter === "Custom Range") {
        if (!appliedCustom.start || !appliedCustom.end) {
          return false;
        }

        const start = new Date(appliedCustom.start);
        start.setHours(0, 0, 0, 0);

        const end = new Date(appliedCustom.end);
        end.setHours(23, 59, 59, 999);

        return date >= start && date <= end;
      }

      return true;
    });
  }, [income, expenses, filter, appliedCustom]);

  // ==================================================
  // FILTERED TOTALS
  // ==================================================

  const filteredIncome = filtered
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const filteredExpense = filtered
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const filteredProfit = filteredIncome - filteredExpense;

  // ==================================================
  // CHART SCALE
  // ==================================================

  const maxValue = Math.max(filteredIncome, filteredExpense, 1);

  const incomeHeight = filteredIncome
    ? Math.max((filteredIncome / maxValue) * 150, 12)
    : 4;

  const expenseHeight = filteredExpense
    ? Math.max((filteredExpense / maxValue) * 150, 12)
    : 4;

  // ==================================================
  // RECENT TRANSACTIONS
  // ONLY 4
  // ==================================================

  const recentTransactions = [...filtered]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 4);

  // ==================================================
  // CUSTOM RANGE
  // ==================================================

  const applyCustom = () => {
    setCustomError("");

    if (!customStart || !customEnd) {
      setCustomError("Select both dates.");
      return;
    }

    if (customStart > customEnd) {
      setCustomError("Start date must be before end date.");
      return;
    }

    setAppliedCustom({
      start: customStart,
      end: customEnd,
    });
  };

  const handleFilterChange = (item) => {
    setFilter(item);
    setCustomError("");

    if (item !== "Custom Range") {
      setAppliedCustom({
        start: "",
        end: "",
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-3">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Financial Overview
          </h1>

          <p className="mt-0.5 text-xs text-slate-500">
            Track your business income, expenses and profit.
          </p>
        </div>
      </div>

      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
        <div className="flex min-h-9 flex-wrap items-center gap-1.5">

          {[
            "Today",
            "This Week",
            "This Month",
            "Last 6 Months",
            "This Year",
            "Custom Range",
          ].map((item) => (
            <button
              key={item}
              onClick={() => handleFilterChange(item)}
              className={`h-8 rounded-lg px-2.5 text-[11px] font-medium transition ${
                filter === item
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item}
            </button>
          ))}

          {/* INLINE CUSTOM RANGE */}

          {filter === "Custom Range" && (
            <>
              <div className="mx-1 hidden h-5 w-px bg-slate-200 sm:block" />

              <input
                type="date"
                value={customStart}
                onChange={(e) => {
                  setCustomStart(e.target.value);
                  setCustomError("");
                }}
                className="h-8 rounded-lg border border-slate-200 px-2 text-[11px] text-slate-600 outline-none focus:border-slate-400"
              />

              <span className="text-[11px] text-slate-400">
                to
              </span>

              <input
                type="date"
                value={customEnd}
                onChange={(e) => {
                  setCustomEnd(e.target.value);
                  setCustomError("");
                }}
                className="h-8 rounded-lg border border-slate-200 px-2 text-[11px] text-slate-600 outline-none focus:border-slate-400"
              />

              <button
                onClick={applyCustom}
                disabled={!customStart || !customEnd}
                className="h-8 rounded-lg bg-slate-900 px-3 text-[11px] font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Apply
              </button>

              {customError && (
                <span className="text-[10px] text-rose-500">
                  {customError}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* =================================================
          KPI CARDS
      ================================================= */}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">

        {/* TOTAL INCOME */}

        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Total Income
            </span>

            <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600">
              <TrendingUp size={16} />
            </div>
          </div>

          <p className="mt-2 text-lg font-bold text-slate-900">
            {money(filteredIncome)}
          </p>
        </div>

        {/* TOTAL EXPENSE */}

        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Total Expenses
            </span>

            <div className="rounded-lg bg-rose-50 p-1.5 text-rose-600">
              <TrendingDown size={16} />
            </div>
          </div>

          <p className="mt-2 text-lg font-bold text-slate-900">
            {money(filteredExpense)}
          </p>
        </div>

        {/* PROFIT */}

        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Net Profit
            </span>

            <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
              <Wallet size={16} />
            </div>
          </div>

          <p
            className={`mt-2 text-lg font-bold ${
              filteredProfit >= 0
                ? "text-emerald-600"
                : "text-rose-600"
            }`}
          >
            {money(filteredProfit)}
          </p>
        </div>

        {/* TRANSACTIONS */}

        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Transactions
            </span>

            <div className="rounded-lg bg-violet-50 p-1.5 text-violet-600">
              <IndianRupee size={16} />
            </div>
          </div>

          <p className="mt-2 text-lg font-bold text-slate-900">
            {filtered.length}
          </p>
        </div>
      </div>

      {/* =================================================
          CHART + RECENT TRANSACTIONS
      ================================================= */}

      <div className="grid gap-3 xl:grid-cols-3">

        {/* =================================================
            PROFESSIONAL BAR CHART
        ================================================= */}

        <div className="rounded-xl border border-slate-200 bg-white p-4">

          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Income vs Expense
              </h3>

              <p className="mt-0.5 text-[10px] text-slate-400">
                Selected period comparison
              </p>
            </div>
          </div>

          {/* CHART AREA */}

          <div className="relative h-[205px]">

            {/* HORIZONTAL GRID */}

            <div className="absolute inset-x-0 top-3 bottom-8 flex flex-col justify-between">
              <div className="border-t border-slate-100" />
              <div className="border-t border-slate-100" />
              <div className="border-t border-slate-100" />
              <div className="border-t border-slate-100" />
              <div className="border-t border-slate-200" />
            </div>

            {/* BARS */}

            <div className="absolute inset-x-0 top-3 bottom-8 flex items-end justify-center gap-12">

              {/* INCOME */}

              <div className="flex h-full w-16 flex-col items-center justify-end">

                <div className="mb-2 h-5 text-center">
                  <span className="text-[10px] font-semibold text-emerald-600">
                    {money(filteredIncome)}
                  </span>
                </div>

                <div
                  className="w-12 rounded-t-lg bg-emerald-500 shadow-sm transition-all duration-500"
                  style={{
                    height: `${incomeHeight}px`,
                  }}
                />

                <div className="mt-2 text-center">
                  <p className="text-[10px] font-semibold text-slate-700">
                    Income
                  </p>
                </div>
              </div>

              {/* EXPENSE */}

              <div className="flex h-full w-16 flex-col items-center justify-end">

                <div className="mb-2 h-5 text-center">
                  <span className="text-[10px] font-semibold text-rose-600">
                    {money(filteredExpense)}
                  </span>
                </div>

                <div
                  className="w-12 rounded-t-lg bg-rose-500 shadow-sm transition-all duration-500"
                  style={{
                    height: `${expenseHeight}px`,
                  }}
                />

                <div className="mt-2 text-center">
                  <p className="text-[10px] font-semibold text-slate-700">
                    Expense
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* =================================================
            RECENT TRANSACTIONS
        ================================================= */}

        <div className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-2">

          <div className="mb-2.5 flex items-center justify-between">

            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Recent Transactions
              </h3>

              <p className="text-[10px] text-slate-400">
                Latest 4 financial activities
              </p>
            </div>

            <CalendarDays
              size={17}
              className="text-slate-400"
            />
          </div>

          <div className="space-y-1.5">

            {recentTransactions.length === 0 ? (

              <div className="flex h-24 items-center justify-center text-xs text-slate-400">
                No transactions found.
              </div>

            ) : (

              recentTransactions.map((item) => (

                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/30 px-3 py-2 transition hover:bg-slate-50"
                >

                  <div className="flex min-w-0 items-center gap-3">

                    {/* TYPE ICON */}

                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        item.type === "income"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {item.type === "income" ? (
                        <ArrowDownToLine size={14} />
                      ) : (
                        <ArrowUpFromLine size={14} />
                      )}
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-xs font-semibold text-slate-800">
                        {item.description}
                      </p>

                      <p className="mt-0.5 truncate text-[10px] text-slate-400">
                        {item.category} • {formatDate(item.createdAt)}
                      </p>

                    </div>
                  </div>

                  <p
                    className={`ml-3 whitespace-nowrap text-xs font-bold ${
                      item.type === "income"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {item.type === "income" ? "+" : "-"}
                    {money(item.amount)}
                  </p>

                </div>

              ))
            )}

          </div>
        </div>
      </div>

      {/* =================================================
          MANAGEMENT BUTTONS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* MANAGE INCOME */}

        <button
          type="button"
          onClick={() => navigate("income")}
          className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
        >
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white">
                <ArrowDownToLine size={22} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                  Income
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-800">
                  Manage Income
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Add, edit and track income
                </p>
              </div>

            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-500 shadow-sm transition-all duration-300 group-hover:translate-x-1 group-hover:bg-emerald-500 group-hover:text-white">
              →
            </div>

          </div>

          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-100/50 transition-transform duration-500 group-hover:scale-150" />
        </button>

        {/* MANAGE EXPENSE */}

        <button
          type="button"
          onClick={() => navigate("expense")}
          className="group relative overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
        >
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white">
                <ArrowUpFromLine size={22} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-orange-600">
                  Expenses
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-800">
                  Manage Expense
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Add, edit and track expenses
                </p>
              </div>

            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-orange-500 shadow-sm transition-all duration-300 group-hover:translate-x-1 group-hover:bg-orange-500 group-hover:text-white">
              →
            </div>

          </div>

          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-100/50 transition-transform duration-500 group-hover:scale-150" />
        </button>

      </div>
    </div>
  );
}

export default Dashboard;