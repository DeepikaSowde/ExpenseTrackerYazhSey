import { useState, useEffect } from "react";
import { BookOpen, Menu, X, ChevronDown } from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Expense from "./pages/Expenses";
import SettingsPage from "./pages/Settings";

import Toaster from "./components/Toaster";

import { navItems } from "./config/navigation";

import api from "./services/api";

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);

  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [admins, setAdmins] = useState([]);

  const [currentAdmin, setCurrentAdmin] = useState("");

  const [toast, setToast] = useState(null);

  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);

  const [loaded, setLoaded] = useState(false);

  // -------------------------
  // LOAD FROM THE API
  // -------------------------
  // Everything the app shows comes from the database, not local state — a
  // refresh always reflects whatever the last save actually persisted.
  useEffect(() => {
    (async () => {
      try {
        const [incomeRows, expenseRows, adminRows, incomeCats, expenseCats] = await Promise.all([
          api.get("/income"),
          api.get("/expenses"),
          api.get("/admins"),
          api.get("/categories?type=income"),
          api.get("/categories?type=expense"),
        ]);

        setIncome(incomeRows);
        setExpenses(expenseRows);
        setAdmins(adminRows);
        setCurrentAdmin(adminRows[0]?.name || "");
        setIncomeCategories(incomeCats);
        setExpenseCategories(expenseCats);
      } catch (err) {
        showToast(`Couldn't load data from the server — ${err.message}`, "error");
      } finally {
        setLoaded(true);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    })();
  }, []);

  // -------------------------
  // TOAST
  // -------------------------

  const showToast = (message, type = "success") => {
    setToast({
      message,
      type,
    });
  };

  // -------------------------
  // NAVIGATION
  // -------------------------

  const navigate = (page) => {
    setActivePage(page);
    setMobileMenu(false);
  };

  // -------------------------
  // INCOME
  // -------------------------

  const addIncome = async (data) => {
    try {
      const created = await api.postForm("/income", { ...data, createdBy: currentAdmin });
      setIncome((prev) => [created, ...prev]);
      showToast("Income added successfully");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const updateIncome = async (id, data) => {
    try {
      const updated = await api.putForm(`/income/${id}`, data);
      setIncome((prev) => prev.map((item) => (item.id === id ? updated : item)));
      showToast("Income updated successfully");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const deleteIncome = async (id) => {
    try {
      await api.del(`/income/${id}`);
      setIncome((prev) => prev.filter((item) => item.id !== id));
      showToast("Income deleted successfully");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // -------------------------
  // EXPENSE
  // -------------------------

  const addExpense = async (data) => {
    try {
      const created = await api.postForm("/expenses", { ...data, createdBy: currentAdmin });
      setExpenses((prev) => [created, ...prev]);
      showToast("Expense added successfully");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const updateExpense = async (id, data) => {
    try {
      const updated = await api.putForm(`/expenses/${id}`, data);
      setExpenses((prev) => prev.map((item) => (item.id === id ? updated : item)));
      showToast("Expense updated successfully");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const deleteExpense = async (id) => {
    try {
      await api.del(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((item) => item.id !== id));
      showToast("Expense deleted successfully");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // -------------------------
  // CATEGORIES
  // -------------------------

  const addIncomeCategory = async (category) => {
    try {
      const result = await api.post("/categories", { type: "income", name: category });
      setIncomeCategories((prev) => (prev.includes(result.name) ? prev : [...prev, result.name]));
      if (result.added) showToast("Income category added successfully");
      return true;
    } catch (err) {
      showToast(err.message, "error");
      return false;
    }
  };

  const addExpenseCategory = async (category) => {
    try {
      const result = await api.post("/categories", { type: "expense", name: category });
      setExpenseCategories((prev) => (prev.includes(result.name) ? prev : [...prev, result.name]));
      if (result.added) showToast("Expense category added successfully");
      return true;
    } catch (err) {
      showToast(err.message, "error");
      return false;
    }
  };

  // -------------------------
  // ADMINS
  // -------------------------

  const handleAddAdmin = async (name, role) => {
    try {
      const created = await api.post("/admins", { name, role });
      setAdmins((prev) => [...prev, created]);
      showToast("Admin added successfully");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteAdmin = async (id) => {
    const admin = admins.find((item) => item.id === id);
    try {
      await api.del(`/admins/${id}`);
      const remaining = admins.filter((item) => item.id !== id);
      setAdmins(remaining);
      if (admin?.name === currentAdmin) setCurrentAdmin(remaining[0]?.name || "");
      showToast("Admin deleted successfully");
      return true;
    } catch (err) {
      showToast(err.message, "error");
      return false;
    }
  };

  // -------------------------
  // PAGE
  // -------------------------

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <Dashboard income={income} expenses={expenses} navigate={navigate} />
        );

      case "income":
        return (
          <Income
            income={income}
            categories={incomeCategories}
            addIncome={addIncome}
            updateIncome={updateIncome}
            deleteIncome={deleteIncome}
            addCategory={addIncomeCategory}
          />
        );

      case "expense":
        return (
          <Expense
            expenses={expenses}
            categories={expenseCategories}
            addExpense={addExpense}
            updateExpense={updateExpense}
            deleteExpense={deleteExpense}
            addExpenseCategory={addExpenseCategory}
          />
        );

      case "settings":
        return (
          <SettingsPage
            admins={admins}
            addAdmin={handleAddAdmin}
            deleteAdmin={handleDeleteAdmin}
          />
        );

      default:
        return (
          <Dashboard income={income} expenses={expenses} navigate={navigate} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* MOBILE HEADER */}

      <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600">
            <BookOpen size={19} className="text-white" />
          </div>

          <div>
            <h1 className="text-sm font-bold">YazhSey Books</h1>

            <p className="text-[10px] text-slate-400">
              Income • Expenses • Profit
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenu((prev) => !prev)}
          className="rounded-lg p-2 hover:bg-slate-100"
        >
          {mobileMenu ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      <div className="flex min-h-screen">
        {/* SIDEBAR */}

        <aside
          className={`
            fixed
            z-40
            flex
            h-screen
            w-64
            flex-col
            bg-white
            border-r border-slate-200
            transition-transform duration-300
            lg:static
            ${
              mobileMenu
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
          `}
        >
          {/* LOGO */}

          <div className="flex h-20 shrink-0 items-center gap-3 border-b border-slate-100 px-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600">
              <BookOpen size={21} className="text-white" />
            </div>

            <div>
              <h1 className="font-bold text-slate-900">YazhSey Books</h1>

              <p className="text-[10px] text-slate-400">
                Income • Expenses • Profit
              </p>
            </div>
          </div>

          {/* NAVIGATION */}

          <nav className="space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;

              const active = activePage === item.id;

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    transition
                    ${
                      active
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }
                  `}
                >
                  <Icon size={18} />

                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* CURRENT ADMIN */}

          <div className="mt-auto shrink-0 border-t border-slate-100 bg-white p-4">
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                {currentAdmin.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {currentAdmin}
                </p>

                <p className="text-[11px] text-slate-400">Administrator</p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}

        <div className="min-w-0 flex-1">
          {/* TOP BAR */}

          <header className="hidden h-20 items-center justify-between border-b border-slate-200 bg-white px-6 lg:flex">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {navItems.find((item) => item.id === activePage)?.label}
              </h2>

              <p className="text-xs text-slate-400">
                Manage your business finances
              </p>
            </div>

            {/* ADMIN SWITCHER */}

            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                  {currentAdmin.charAt(0).toUpperCase()}
                </div>

                <div className="text-left">
                  <p className="text-sm font-medium">{currentAdmin}</p>

                  <p className="text-[10px] text-slate-400">Admin</p>
                </div>

                <ChevronDown size={15} />
              </button>

              <div className="absolute right-0 top-full z-50 mt-1 hidden w-52 rounded-xl border border-slate-200 bg-white p-1 shadow-lg group-hover:block">
                {admins.map((admin) => (
                  <button
                    type="button"
                    key={admin.id}
                    onClick={() => setCurrentAdmin(admin.name)}
                    className={`
                        w-full
                        rounded-lg
                        px-3
                        py-2
                        text-left
                        text-sm
                        ${
                          currentAdmin === admin.name
                            ? "bg-emerald-50 text-emerald-700"
                            : "hover:bg-slate-50"
                        }
                      `}
                  >
                    {admin.name}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* PAGE CONTENT */}

          <main className="p-4 sm:p-6">
            {loaded ? (
              renderPage()
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-slate-400">
                Loading your data…
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE OVERLAY */}

      {mobileMenu && (
        <div
          onClick={() => setMobileMenu(false)}
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
        />
      )}

      {/* TOASTER */}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;
