import { useState } from "react";
import api from "../services/api";

const fetchAttachment = (id) => api.get(`/income/${id}/attachment`);
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  Paperclip,
} from "lucide-react";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDateTime = (date) =>
  new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function Income({
  income = [],
  categories = [],
  addCategory,
  addIncome,
  updateIncome,
  deleteIncome,
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");

  // -----------------------------------------
  // FILTER
  // -----------------------------------------

  const filtered = income.filter((item) => {
    const descriptionText = String(item.description || "");
    const idText = String(item.id || "");

    const matchesSearch =
      descriptionText
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      idText
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" ||
      item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // -----------------------------------------
  // OPEN ADD
  // -----------------------------------------

  const openAdd = () => {
    setEditing(null);
    setDescription("");
    setCategory("");
    setAmount("");
    setAttachment(null);
    setNewCategory("");
    setError("");
    setShowForm(true);
  };

  // -----------------------------------------
  // OPEN EDIT
  // -----------------------------------------

  const openEdit = (item) => {
    setEditing(item);
    setDescription(item.description || "");
    setCategory(item.category || "");
    setAmount(item.amount || "");
    setAttachment(item.attachment || null);
    setNewCategory("");
    setError("");
    setShowForm(true);
  };

  // -----------------------------------------
  // SUBMIT
  // -----------------------------------------

  const submit = (e) => {
    e.preventDefault();
    setError("");

    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }

    if (!category || category === "__new__") {
      setError("Please select a category.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    const data = {
      description: description.trim(),
      category: category.trim(),
      amount: Number(amount),
      attachment,
    };

    if (editing) {
      updateIncome(editing.id, data);
    } else {
      addIncome(data);
    }

    setShowForm(false);
    setEditing(null);
    setDescription("");
    setCategory("");
    setAmount("");
    setAttachment(null);
    setNewCategory("");
    setError("");
  };

  // -----------------------------------------
  // CATEGORY
  // -----------------------------------------

  const handleCategory = (value) => {
    setCategory(value);
    setError("");

    if (value === "__new__") {
      setNewCategory("");
    }
  };

  const saveNewCategory = async () => {
    const value = newCategory.trim();

    if (!value) {
      setError("Enter a category name.");
      return;
    }

    const success = await addCategory(value);

    if (success) {
      setCategory(value);
      setNewCategory("");
      setError("");
    }
  };

  // -----------------------------------------
  // ATTACHMENT
  // -----------------------------------------

  const handleAttachment = (e) => {
    const file = e.target.files?.[0] || null;

    setAttachment(file);
    setError("");
  };

  // -----------------------------------------
  // VIEW ATTACHMENT
  // -----------------------------------------

  const viewAttachment = async (item) => {
    if (!item?.attachment) return;

    if (item.attachment instanceof File) {
      // A file just picked in the form (not saved yet) — still a real File
      // object in memory, same as the original app.
      window.open(URL.createObjectURL(item.attachment), "_blank", "noopener,noreferrer");
      return;
    }

    // A saved record's attachment — the list only has the name/type, so the
    // actual bytes are fetched from the server right when it's opened.
    try {
      const full = await fetchAttachment(item.id);
      if (full?.dataUrl) window.open(full.dataUrl, "_blank", "noopener,noreferrer");
    } catch {
      // Nothing to open if the fetch failed — the button simply does nothing.
    }
  };

  // -----------------------------------------
  // CLOSE FORM
  // -----------------------------------------

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setError("");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Income
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage all business income transactions.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
        >
          <Plus size={18} />
          Add Income
        </button>

      </div>

      {/* =====================================
          FILTERS
      ====================================== */}

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row">

        <div className="relative flex-1">

          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search income..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
          />

        </div>

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value)
          }
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400"
        >
          <option value="All">
            All Categories
          </option>

          {categories.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

      </div>

      {/* =====================================
          TABLE
      ====================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px] text-left">

            <thead className="border-b border-slate-200 bg-slate-50">

              <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">

                <th className="px-5 py-4">
                  ID
                </th>

                <th className="px-5 py-4">
                  Description
                </th>

                <th className="px-5 py-4">
                  Category
                </th>

                <th className="px-5 py-4">
                  Amount
                </th>

                <th className="px-5 py-4">
                  Attachment
                </th>

                <th className="px-5 py-4">
                  Created By
                </th>

                <th className="px-5 py-4">
                  Created At
                </th>

                <th className="px-5 py-4 text-right">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {filtered.length === 0 ? (

                <tr>

                  <td
                    colSpan="8"
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    No income records found.
                  </td>

                </tr>

              ) : (

                filtered.map((item) => (

                  <tr
                    key={item.id}
                    className="text-sm hover:bg-slate-50"
                  >

                    {/* ID */}

                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {item.id}
                    </td>

                    {/* DESCRIPTION */}

                    <td className="px-5 py-4 font-medium text-slate-800">
                      {item.description}
                    </td>

                    {/* CATEGORY */}

                    <td className="px-5 py-4">

                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        {item.category}
                      </span>

                    </td>

                    {/* AMOUNT */}

                    <td className="px-5 py-4 font-bold text-emerald-600">
                      {money(item.amount)}
                    </td>

                    {/* ATTACHMENT */}

                    <td className="px-5 py-4">

                      {item.attachment ? (

                        <button
                          type="button"
                          onClick={() =>
                            viewAttachment(item)
                          }
                          className="flex max-w-[180px] items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                          title={
                            item.attachment.name ||
                            "View attachment"
                          }
                        >

                          <Paperclip size={16} />

                          <span className="truncate">
                            {item.attachment.name ||
                              "Attachment"}
                          </span>

                        </button>

                      ) : (

                        <span className="text-slate-400">
                          -
                        </span>

                      )}

                    </td>

                    {/* CREATED BY */}

                    <td className="px-5 py-4 text-slate-600">
                      {item.createdBy || "-"}
                    </td>

                    {/* CREATED AT */}

                    <td className="px-5 py-4 text-slate-500">
                      {item.createdAt
                        ? formatDateTime(
                            item.createdAt
                          )
                        : "-"}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4">

                      <div className="flex justify-end gap-1">

                        {/* VIEW */}

                        <button
                          type="button"
                          onClick={() => {
                            setSelected(item);
                            setShowView(true);
                          }}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                          title="View"
                        >
                          <Eye size={17} />
                        </button>

                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() =>
                            openEdit(item)
                          }
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          title="Edit"
                        >
                          <Pencil size={17} />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() => {
                            setSelected(item);
                            setShowDelete(true);
                          }}
                          className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================
          ADD / EDIT MODAL
      ====================================== */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  {editing
                    ? "Edit Income"
                    : "Add Income"}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Enter transaction details
                </p>

              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={19} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={submit}
              className="space-y-4 p-6"
            >

              {/* DESCRIPTION */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <input
                  type="text"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Example: Website Development"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                />

              </div>

              {/* CATEGORY */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    handleCategory(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                >

                  <option value="">
                    Select category
                  </option>

                  {categories.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}

                  <option value="__new__">
                    + Add New Category
                  </option>

                </select>

                {/* NEW CATEGORY */}

                {category === "__new__" && (

                  <div className="mt-3 flex gap-2">

                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) =>
                        setNewCategory(
                          e.target.value
                        )
                      }
                      placeholder="New category name"
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                    />

                    <button
                      type="button"
                      onClick={saveNewCategory}
                      className="rounded-xl bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      Add
                    </button>

                  </div>

                )}

              </div>

              {/* AMOUNT */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Amount
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value)
                    }
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
                  />

                </div>

              </div>

              {/* ATTACHMENT */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Attachment
                </label>

                <input
                  type="file"
                  onChange={handleAttachment}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium"
                />

                {attachment && (

                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">

                    <Paperclip size={14} />

                    <span className="truncate">
                      {attachment.name ||
                        "Attachment selected"}
                    </span>

                  </div>

                )}

              </div>

              {/* ERROR */}

              {error && (

                <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                  {error}
                </div>

              )}

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  {editing
                    ? "Update Income"
                    : "Save Income"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================
          VIEW MODAL
      ====================================== */}

      {showView && selected && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <h2 className="font-bold text-slate-900">
                Income Details
              </h2>

              <button
                type="button"
                onClick={() => {
                  setShowView(false);
                  setSelected(null);
                }}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={19} />
              </button>

            </div>

            <div className="space-y-4 p-6">

              <Detail
                label="ID"
                value={selected.id}
              />

              <Detail
                label="Description"
                value={selected.description}
              />

              <Detail
                label="Category"
                value={selected.category}
              />

              <Detail
                label="Amount"
                value={money(selected.amount)}
              />

              <Detail
                label="Created By"
                value={selected.createdBy || "-"}
              />

              <Detail
                label="Created At"
                value={
                  selected.createdAt
                    ? formatDateTime(
                        selected.createdAt
                      )
                    : "-"
                }
              />

              {/* ATTACHMENT */}

              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">

                <span className="text-sm text-slate-400">
                  Attachment
                </span>

                {selected.attachment ? (

                  <button
                    type="button"
                    onClick={() =>
                      viewAttachment(selected)
                    }
                    className="flex max-w-[220px] items-center gap-2 text-right text-sm font-medium text-blue-600 hover:text-blue-700"
                  >

                    <Paperclip size={15} />

                    <span className="truncate">
                      {selected.attachment.name ||
                        "View attachment"}
                    </span>

                  </button>

                ) : (

                  <span className="text-sm font-medium text-slate-800">
                    -
                  </span>

                )}

              </div>

            </div>

          </div>

        </div>

      )}

      {/* =====================================
          DELETE MODAL
      ====================================== */}

      {showDelete && selected && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">

          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <Trash2 size={21} />
            </div>

            <h2 className="mt-4 text-center text-lg font-bold text-slate-900">
              Delete Income?
            </h2>

            <p className="mt-2 text-center text-sm text-slate-500">
              Are you sure you want to delete{" "}
              <strong>
                {selected.description}
              </strong>
              ?
            </p>

            <div className="mt-6 flex gap-3">

              <button
                type="button"
                onClick={() => {
                  setShowDelete(false);
                  setSelected(null);
                }}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  deleteIncome(selected.id);
                  setShowDelete(false);
                  setSelected(null);
                }}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Yes, Delete
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">

      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-slate-800">
        {value}
      </span>

    </div>
  );
}

export default Income;