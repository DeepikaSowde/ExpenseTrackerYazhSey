import { useState } from "react";
import {
  Plus,
  Trash2,
  ShieldCheck,
  X,
  UserRound,
} from "lucide-react";

function Settings({
  admins,
  currentAdmin,
  addAdmin,
  deleteAdmin,
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [selected, setSelected] = useState(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Administrator");

  const submitAdmin = (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    addAdmin(name.trim(), role);

    setName("");
    setRole("Administrator");
    setShowAdd(false);
  };

  const confirmDelete = () => {
    if (!selected) return;

    deleteAdmin(selected.id);

    setSelected(null);
    setShowDelete(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage administrators and application access.
        </p>
      </div>

      {/* Admin Management */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center">

          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={20}
                className="text-slate-700"
              />

              <h2 className="font-semibold text-slate-900">
                Admin Management
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-400">
              Add or remove system administrators.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-amber-600 hover:shadow-md active:scale-[0.98]"
          >
            <Plus size={17} />
            Add Admin
          </button>
        </div>

        {/* Admin Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">

            <thead className="bg-slate-50">
              <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">

                <th className="px-5 py-4">
                  Admin ID
                </th>

                <th className="px-5 py-4">
                  Name
                </th>

                <th className="px-5 py-4">
                  Role
                </th>

                <th className="px-5 py-4">
                  Status
                </th>

                <th className="px-5 py-4 text-right">
                  Action
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {admins.map((admin) => (
                <tr
                  key={admin.id}
                  className="text-sm"
                >

                  {/* Admin ID */}
                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {admin.id}
                  </td>

                  {/* Name */}
                  <td className="px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <UserRound size={17} />
                      </div>

                      <div>
                        <p className="font-medium text-slate-800">
                          {admin.name}
                        </p>

                        {admin.name === currentAdmin && (
                          <p className="text-xs text-emerald-600">
                            Current admin
                          </p>
                        )}
                      </div>

                    </div>

                  </td>

                  {/* Role */}
                  <td className="px-5 py-4 text-slate-600">
                    {admin.role}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      Active
                    </span>

                  </td>

                  {/* Action */}
                  <td className="px-5 py-4 text-right">

                    <button
                      type="button"
                      disabled={admins.length === 1}
                      onClick={() => {
                        setSelected(admin);
                        setShowDelete(true);
                      }}
                      className={`rounded-lg p-2 transition ${
                        admins.length === 1
                          ? "cursor-not-allowed text-slate-300"
                          : "text-rose-600 hover:bg-rose-50"
                      }`}
                    >
                      <Trash2 size={17} />
                    </button>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        </div>

        {/* Last Admin Warning */}
        {admins.length === 1 && (
          <div className="border-t border-slate-100 bg-amber-50 px-5 py-3 text-xs text-amber-700">
            At least one administrator must always remain in the system.
          </div>
        )}

      </div>

      {/* Add Admin Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>
                <h2 className="font-bold text-slate-900">
                  Add Admin
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Create a new administrator account
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="rounded-lg p-2 transition hover:bg-slate-100"
              >
                <X size={19} />
              </button>

            </div>

            {/* Form */}
            <form
              onSubmit={submitAdmin}
              className="space-y-5 p-6"
            >

              {/* Name */}
              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Admin Name
                </label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter admin name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />

              </div>

              {/* Role */}
              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Role
                </label>

                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="Administrator">
                    Administrator
                  </option>

                  <option value="Finance Manager">
                    Finance Manager
                  </option>

                  <option value="Accountant">
                    Accountant
                  </option>
                </select>

              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-amber-600 hover:shadow-md active:scale-[0.98]"
                >
                  <Plus size={17} />
                  Add Admin
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDelete && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">

          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">

            {/* Icon */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <Trash2 size={21} />
            </div>

            {/* Title */}
            <h2 className="mt-4 text-center text-lg font-bold text-slate-900">
              Delete Admin?
            </h2>

            {/* Message */}
            <p className="mt-2 text-center text-sm text-slate-500">
              Are you sure you want to remove{" "}
              <strong>{selected.name}</strong>?
            </p>

            {/* Buttons */}
            <div className="mt-6 flex gap-3">

              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setShowDelete(false);
                }}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 active:scale-[0.98]"
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

export default Settings;