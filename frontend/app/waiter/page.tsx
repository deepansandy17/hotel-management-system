
"use client";

import { useEffect, useState } from "react";

type OrderStatus = "Pending" | "Preparing" | "Ready" | "Served";

type Order = {
  id: number;
  customerName: string;
  dishName: string;
  quantity: number;
  status: OrderStatus;
  createdAt: string;
  tableNumber?: number;
  notes?: string;
};

const menu = [
  { name: "Chicken Biryani", price: 220 },
  { name: "Vegetable Fried Rice", price: 150 },
  { name: "Masala Dosa", price: 90 },
  { name: "Paneer Butter Masala", price: 190 },
];

const tables = Array.from({ length: 12 }, (_, i) => i + 1);

export default function WaiterPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tableNumber, setTableNumber] = useState("1");
  const [customerName, setCustomerName] = useState("");
  const [dishName, setDishName] = useState(menu[0].name);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kitchen-orders");
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        if (Array.isArray(parsed)) setOrders(parsed);
      }
    } catch {
      console.error("Could not load orders.");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("kitchen-orders", JSON.stringify(orders));
    }
  }, [orders, loaded]);

  function addOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newOrder: Order = {
      id: Date.now(),
      customerName: customerName.trim() || `Table ${tableNumber}`,
      dishName,
      quantity,
      status: "Pending",
      createdAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      tableNumber: Number(tableNumber),
      notes: notes.trim(),
    };

    setOrders((previous) => [...previous, newOrder]);
    setCustomerName("");
    setQuantity(1);
    setNotes("");
  }

  function updateStatus(id: number, status: OrderStatus) {
    setOrders((previous) =>
      previous.map((order) =>
        order.id === id ? { ...order, status } : order
      )
    );
  }

  const activeOrders = orders.filter((order) => order.status !== "Served");
  const occupiedTables = new Set(
    activeOrders
      .filter((order) => order.tableNumber)
      .map((order) => order.tableNumber)
  ).size;
  const readyOrders = activeOrders.filter(
    (order) => order.status === "Ready"
  ).length;

  const visibleOrders = orders.filter((order) =>
    filter === "All" ? true : order.status === filter
  );

  const billTotal = orders.reduce((sum, order) => {
    const item = menu.find((dish) => dish.name === order.dishName);
    return sum + (item?.price ?? 0) * order.quantity;
  }, 0);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-slate-950 px-5 py-5 text-white md:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">🍽️ Waiter Panel</h1>
            <p className="mt-1 text-sm text-slate-400">
              Restaurant Service Management
            </p>
          </div>
          <nav className="flex flex-wrap gap-2">
            <a href="/" className="rounded-lg px-3 py-2 text-sm hover:bg-slate-800">
              Dashboard
            </a>
            <a href="/orders" className="rounded-lg px-3 py-2 text-sm hover:bg-slate-800">
              Kitchen Orders
            </a>
            <a href="/admin" className="rounded-lg px-3 py-2 text-sm hover:bg-slate-800">
              Admin
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-5 md:p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold">Waiter Dashboard</h2>
          <p className="mt-2 text-slate-500">
            Take orders, monitor food preparation, and serve your guests.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total Orders", value: orders.length, icon: "🧾" },
            { label: "Occupied Tables", value: occupiedTables, icon: "🪑" },
            { label: "Ready to Serve", value: readyOrders, icon: "🔔" },
            {
              label: "Estimated Bill Total",
              value: `₹${billTotal.toLocaleString("en-IN")}`,
              icon: "💰",
            },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-slate-500">{card.label}</p>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <p className="mt-3 text-2xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        <section className="mb-8 rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="mb-5 text-xl font-bold">Create Customer Order</h3>

          <form onSubmit={addOrder} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Table Number</label>
              <select
                value={tableNumber}
                onChange={(event) => setTableNumber(event.target.value)}
                className="w-full rounded-lg border bg-white p-3"
              >
                {tables.map((table) => (
                  <option key={table} value={table}>Table {table}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Customer Name (optional)</label>
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Enter customer name"
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Dish</label>
              <select
                value={dishName}
                onChange={(event) => setDishName(event.target.value)}
                className="w-full rounded-lg border bg-white p-3"
              >
                {menu.map((dish) => (
                  <option key={dish.name} value={dish.name}>
                    {dish.name} — ₹{dish.price}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Quantity</label>
              <input
                type="number"
                min="1"
                max="10000"
                required
                value={quantity}
                onChange={(event) =>
                  setQuantity(Math.max(1, Math.min(10000, Number(event.target.value) || 1)))
                }
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Special Request</label>
              <input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="e.g. Less spicy"
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-600 p-3 font-semibold text-white hover:bg-emerald-700"
              >
                + Send Order to Kitchen
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-bold">Customer Orders</h3>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-lg border bg-white p-2 text-sm"
              aria-label="Filter orders"
            >
              <option value="All">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Preparing">Preparing</option>
              <option value="Ready">Ready</option>
              <option value="Served">Served</option>
            </select>
          </div>

          {!loaded ? (
            <p className="p-8 text-center text-slate-500">Loading orders...</p>
          ) : visibleOrders.length === 0 ? (
            <p className="rounded-xl border border-dashed p-8 text-center text-slate-500">
              No orders yet. Create your first customer order above.
            </p>
          ) : (
            <div className="space-y-3">
              {visibleOrders.map((order) => {
                const dish = menu.find((item) => item.name === order.dishName);
                return (
                  <div key={order.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold">{order.dishName}</h4>
                      <p className="mt-1 text-sm text-slate-500">
                        Table {order.tableNumber ?? "—"} · {order.customerName} · Qty: {order.quantity}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {order.createdAt} · Estimated: ₹{(dish?.price ?? 0) * order.quantity}
                      </p>
                      {order.notes && (
                        <p className="mt-1 text-sm text-amber-700">
                          Special request: {order.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                        {order.status}
                      </span>
                      {order.status === "Ready" && (
                        <button
                          type="button"
                          onClick={() => updateStatus(order.id, "Served")}
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                          Mark Served
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <p className="mt-4 text-xs text-slate-500">
          Demo mode: sample prices are used. Orders are stored in this browser.
        </p>
      </div>
    </main>
  );
}
