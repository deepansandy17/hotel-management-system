
"use client";

import { useEffect, useState } from "react";

type OrderStatus = "Pending" | "Preparing" | "Ready" | "Served";

type KitchenOrder = {
  id: number;
  customerName: string;
  dishName: string;
  quantity: number;
  status: OrderStatus;
  createdAt: string;
};

const statuses: OrderStatus[] = [
  "Pending",
  "Preparing",
  "Ready",
  "Served",
];

type Ingredient = {
  name: string;
  quantity: number;
  unit: string;
  minimum: number;
};

type Dish = {
  id: number;
  name: string;
  category: string;
  ingredients: { name: string; quantity: number }[];
};

type KitchenTask = {
  dishId: number;
  status: "Pending" | "Preparing" | "Ready";
  servings: number;
};

const dishes: Dish[] = [
  {
    id: 1,
    name: "Chicken Biryani",
    category: "Lunch",
    ingredients: [
      { name: "Rice", quantity: 0.15 },
      { name: "Chicken", quantity: 0.2 },
      { name: "Oil", quantity: 0.02 },
    ],
  },
  {
    id: 2,
    name: "Vegetable Fried Rice",
    category: "Lunch",
    ingredients: [
      { name: "Rice", quantity: 0.12 },
      { name: "Vegetables", quantity: 0.1 },
      { name: "Oil", quantity: 0.015 },
    ],
  },
  {
    id: 3,
    name: "Masala Dosa",
    category: "Breakfast",
    ingredients: [
      { name: "Dosa Batter", quantity: 0.2 },
      { name: "Potatoes", quantity: 0.1 },
      { name: "Oil", quantity: 0.01 },
    ],
  },
  {
    id: 4,
    name: "Paneer Butter Masala",
    category: "Dinner",
    ingredients: [
      { name: "Paneer", quantity: 0.15 },
      { name: "Tomatoes", quantity: 0.1 },
      { name: "Oil", quantity: 0.02 },
    ],
  },
];

export default function AdminPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState("All");
  const [lastUpdated, setLastUpdated] = useState("");

const [stock, setStock] = useState<Ingredient[]>([]);
const [menus, setMenus] = useState<Record<string, KitchenTask[]>>({});
const [menuDate, setMenuDate] = useState("");

 
function loadOrders() {
  try {
    const savedOrders = localStorage.getItem("kitchen-orders");
    const parsedOrders: KitchenOrder[] = savedOrders
      ? JSON.parse(savedOrders)
      : [];

    const savedStock = localStorage.getItem("kitchen-stock");
    const savedMenus = localStorage.getItem("kitchen-menus");

    const today = new Date();
    const todayKey = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    setOrders(Array.isArray(parsedOrders) ? parsedOrders : []);
    setStock(savedStock ? JSON.parse(savedStock) : []);
    setMenus(savedMenus ? JSON.parse(savedMenus) : {});
    setMenuDate(todayKey);
    setLastUpdated(new Date().toLocaleTimeString());
  } catch {
    console.error("Could not load saved kitchen data.");
  }
}


  useEffect(() => {
    loadOrders();
    setLoaded(true);
  }, []);

  const visibleOrders =
    filter === "All"
      ? orders
      : orders.filter((order) => order.status === filter);

  const pending = orders.filter((order) => order.status === "Pending").length;
  const preparing = orders.filter((order) => order.status === "Preparing").length;
  const ready = orders.filter((order) => order.status === "Ready").length;
  const served = orders.filter((order) => order.status === "Served").length;

const todayMenu = menus[menuDate] || [];

const readyDishes = todayMenu.filter(
  (task) => task.status === "Ready"
).length;

const lowStockItems = stock.filter(
  (item) => item.quantity <= item.minimum
);

const todaysDishNames = todayMenu
  .map((task) => dishes.find((dish) => dish.id === task.dishId))
  .filter((dish) => dish !== undefined);

  function statusStyle(status: OrderStatus) {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800";
      case "Preparing":
        return "bg-blue-100 text-blue-800";
      case "Ready":
        return "bg-emerald-100 text-emerald-800";
      case "Served":
        return "bg-slate-200 text-slate-700";
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="bg-slate-950 px-5 py-5 text-white md:flex md:items-center md:justify-between md:px-8">
        <div>
          <h1 className="text-2xl font-bold">🛡️ Admin Panel</h1>
          <p className="mt-1 text-sm text-slate-400">
            Hotel Management System
          </p>
        </div>

        <nav className="mt-4 flex flex-wrap gap-3 md:mt-0">
      <a
  href="/waiter"
  className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
>
  Waiter Panel
</a>

          <button
            type="button"
            onClick={loadOrders}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            ↻ Refresh Orders
          </button>
        </nav>
      </aside>

      <div className="mx-auto max-w-7xl p-5 md:p-8">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold">Kitchen Order Overview</h2>
            <p className="mt-2 text-slate-500">
              View and monitor orders received by the kitchen.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            Last refreshed: {lastUpdated || "Not yet refreshed"}
          </div>
        </div>

<section className="mb-8 grid gap-4 md:grid-cols-2">
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 className="text-lg font-bold">🍽️ Daily Menu Overview</h3>
    <p className="mt-2 text-sm text-slate-500">
      Menu for {menuDate || "today"}
    </p>

    <div className="mt-4 flex gap-6">
      <div>
        <p className="text-sm text-slate-500">Dishes</p>
        <p className="text-2xl font-bold">{todayMenu.length}</p>
      </div>
      <div>
        <p className="text-sm text-slate-500">Ready</p>
        <p className="text-2xl font-bold">{readyDishes}</p>
      </div>
    </div>

    <ul className="mt-4 space-y-2">
      {todaysDishNames.length === 0 ? (
        <li className="text-sm text-slate-500">
          No dishes have been added to today's menu.
        </li>
      ) : (
        todaysDishNames.map((dish) => (
          <li key={dish.id} className="rounded-lg bg-slate-50 p-2 text-sm">
            {dish.name} — {dish.category}
          </li>
        ))
      )}
    </ul>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 className="text-lg font-bold">📦 Inventory Overview</h3>

    <div className="mt-4 flex gap-6">
      <div>
        <p className="text-sm text-slate-500">Stock items</p>
        <p className="text-2xl font-bold">{stock.length}</p>
      </div>
      <div>
        <p className="text-sm text-slate-500">Low stock</p>
        <p className="text-2xl font-bold text-red-600">
          {lowStockItems.length}
        </p>
      </div>
    </div>

    <ul className="mt-4 space-y-2">
      {stock.length === 0 ? (
        <li className="text-sm text-slate-500">
          No stock data found. Check the Kitchen Dashboard first.
        </li>
      ) : (
        stock.map((item) => (
          <li
            key={item.name}
            className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-2 text-sm"
          >
            <span>{item.name}</span>
            <span
              className={
                item.quantity <= item.minimum
                  ? "font-semibold text-red-600"
                  : "text-emerald-700"
              }
            >
              {item.quantity} {item.unit}
              {item.quantity <= item.minimum ? " · Low stock" : ""}
            </span>
          </li>
        ))
      )}
    </ul>
  </div>
</section>

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total Orders", value: orders.length, icon: "📋" },
            { label: "Pending", value: pending, icon: "⏳" },
            { label: "Preparing", value: preparing, icon: "👨‍🍳" },
            { label: "Ready / Served", value: ready + served, icon: "✅" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-slate-500">{item.label}</p>
                <span className="text-2xl">{item.icon}</span>
              </div>
              <p className="mt-3 text-3xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-bold">All Kitchen Orders</h3>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-lg border bg-white p-2 text-sm"
              aria-label="Filter orders by status"
            >
              <option value="All">All Orders</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {!loaded ? (
            <p className="p-8 text-center text-slate-500">
              Loading orders...
            </p>
          ) : visibleOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <p className="text-4xl">🧾</p>
              <p className="mt-3 font-semibold">No orders found</p>
              <p className="mt-1 text-sm text-slate-500">
                Create an order on the Kitchen Orders page, then refresh here.
              </p>
              <a
                href="/orders"
                className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
              >
                Open Kitchen Orders
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-500">
                    <th className="p-3 font-medium">Order ID</th>
                    <th className="p-3 font-medium">Customer</th>
                    <th className="p-3 font-medium">Dish</th>
                    <th className="p-3 font-medium">Quantity</th>
                    <th className="p-3 font-medium">Order Time</th>
                    <th className="p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="p-3 font-medium">#{order.id}</td>
                      <td className="p-3">{order.customerName}</td>
                      <td className="p-3">{order.dishName}</td>
                      <td className="p-3">{order.quantity}</td>
                      <td className="p-3">{order.createdAt}</td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-4 text-xs text-slate-500">
          Demo mode: orders are read from this browser's local storage.
          Refresh to load the latest saved orders.
        </p>
      </div>
    </main>
  );
}
