
"use client";

import { useEffect, useState } from "react";

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

const initialStock: Ingredient[] = [
  { name: "Rice", quantity: 25, unit: "kg", minimum: 5 },
  { name: "Chicken", quantity: 12, unit: "kg", minimum: 4 },
  { name: "Vegetables", quantity: 8, unit: "kg", minimum: 3 },
  { name: "Oil", quantity: 10, unit: "L", minimum: 2 },
  { name: "Dosa Batter", quantity: 6, unit: "kg", minimum: 2 },
  { name: "Potatoes", quantity: 7, unit: "kg", minimum: 2 },
  { name: "Paneer", quantity: 4, unit: "kg", minimum: 1 },
  { name: "Tomatoes", quantity: 5, unit: "kg", minimum: 2 },
];

function todayString() {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
} 
 

export default function Home() {
  const [date, setDate] = useState(""); 
  const [stock, setStock] = useState(initialStock);
  const [menus, setMenus] = useState<Record<string, KitchenTask[]>>({});
  const [loaded, setLoaded] = useState(false);
  const [selectedDish, setSelectedDish] = useState("1");
  const [servings, setServings] = useState(10);

 
useEffect(() => {
  const now = new Date();

  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  setDate(today);

  try {
    const savedStock = localStorage.getItem("kitchen-stock");
    const savedMenus = localStorage.getItem("kitchen-menus");

    if (savedStock) setStock(JSON.parse(savedStock));
    if (savedMenus) setMenus(JSON.parse(savedMenus));
  } catch {
    console.error("Could not load saved kitchen data.");
  }

  setLoaded(true);
}, []);


  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("kitchen-stock", JSON.stringify(stock));
    localStorage.setItem("kitchen-menus", JSON.stringify(menus));
  }, [stock, menus, loaded]);

  const tasks = menus[date] || [];

  function addDish() {
    const dishId = Number(selectedDish);
    if (tasks.some((task) => task.dishId === dishId)) {
      alert("This dish is already on today's menu.");
      return;
    }

    setMenus((previous) => ({
      ...previous,
      [date]: [
        ...(previous[date] || []),
        { dishId, status: "Pending", servings },
      ],
    }));
  }

  function updateStatus(
    dishId: number,
    status: KitchenTask["status"]
  ) {
    setMenus((previous) => ({
      ...previous,
      [date]: (previous[date] || []).map((task) =>
        task.dishId === dishId ? { ...task, status } : task
      ),
    }));
  }

  function changeStock(name: string, amount: number) {
    setStock((previous) =>
      previous.map((item) =>
        item.name === name
          ? { ...item, quantity: Math.max(0, item.quantity + amount) }
          : item
      )
    );
  }

  const requirements = tasks.flatMap((task) => {
    const dish = dishes.find((item) => item.id === task.dishId);
    if (!dish) return [];
    return dish.ingredients.map((ingredient) => ({
      name: ingredient.name,
      quantity: ingredient.quantity * task.servings,
    }));
  });

  const totals = requirements.reduce<Record<string, number>>(
    (result, item) => {
      result[item.name] = (result[item.name] || 0) + item.quantity;
      return result;
    },
    {}
  );

  const lowStock = stock.filter(
    (item) => item.quantity <= item.minimum
  ).length;

  const ready = tasks.filter((task) => task.status === "Ready").length;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 md:flex">
      <aside className="flex w-full flex-col bg-slate-950 p-6 text-white md:min-h-screen md:w-64">
        <div className="mb-10">
          <div className="text-2xl font-bold">🍳 KitchenDesk</div>
          <p className="mt-2 text-sm text-slate-400">
            Hotel Management System
          </p>
        </div>

        <p className="mb-3 text-xs uppercase tracking-widest text-slate-500">
          Kitchen workspace
        </p>
       
<button
  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
  className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-left font-medium text-white"
>
  ▦ &nbsp; Kitchen Dashboard
</button>

        
<button
  onClick={() =>
    document.getElementById("inventory-stock")?.scrollIntoView({
      behavior: "smooth",
    })
  }
  className="w-full rounded-xl px-4 py-3 text-left text-slate-300 hover:bg-slate-800"
>
  📦 &nbsp; Inventory & Stock
</button>
 

<button
  onClick={() =>
    document.getElementById("daily-menu")?.scrollIntoView({
      behavior: "smooth",
    })
  }
  className="mt-3 w-full rounded-xl px-4 py-3 text-left text-slate-300 hover:bg-slate-800"
>
  ☷ &nbsp; Daily Menu
</button>

<a
  href="/waiter"
  className="mt-3 block w-full rounded-xl px-4 py-3 text-left text-slate-300 hover:bg-slate-800"
>
  🍽️ &nbsp; Waiter Panel
</a>


<a
  href="/admin"
  className="mt-3 block w-full rounded-xl px-4 py-3 text-left text-slate-300 hover:bg-slate-800"
>
  🛡️ &nbsp; Admin Panel
</a>

<a
  href="/orders"
  className="mt-3 block w-full rounded-xl px-4 py-3 text-left text-slate-300 hover:bg-slate-800"
>
  🧾 &nbsp; Kitchen Orders
</a>

        <div className="mt-auto hidden border-t border-slate-800 pt-5 md:block">
          <p className="font-medium">Kitchen Staff</p>
          <p className="mt-1 text-sm text-slate-400">
            Staff workspace
          </p>
    </div>
      </aside>

      <section className="min-w-0 flex-1 p-5 md:p-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Kitchen / Overview</p>
            <h1 className="mt-1 text-3xl font-bold">
              Kitchen Dashboard
            </h1>
            <p className="mt-2 text-slate-500">
              Manage daily dishes, ingredients and preparation.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-3 shadow-sm">
            <label className="mb-1 block text-xs text-slate-500">
              Menu date
            </label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="bg-transparent font-medium outline-none"
            />
          </div>
        </header>

      
<div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  {[
    {
      label: "Dishes on menu",
      value: tasks.length,
      icon: "🍽️",
    },
    {
      label: "Ready dishes",
      value: ready,
      icon: "✅",
    },
    {
      label: "Stock items",
      value: stock.length,
      icon: "📦",
    },
    {
      label: "Low stock alerts",
      value: lowStock,
      icon: "⚠️",
    },
  ].map((card) => (
    <div
      key={card.label}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">
          {card.label}
        </span>
        <span className="text-2xl">{card.icon}</span>
      </div>
      <p className="mt-4 text-3xl font-bold">{card.value}</p>
    </div>
  ))}
</div>


        <div className="mb-8 grid gap-6 xl:grid-cols-3">
          <section
  id="daily-menu"
  className="rounded-2xl border bg-white p-5 shadow-sm xl:col-span-2"
>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Today's Menu</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Select dishes and update their status.
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
                {tasks.length} dishes
              </span>
            </div>

            <div className="mb-5 flex flex-wrap items-end gap-3 rounded-xl bg-slate-50 p-4">
              <div className="min-w-40 flex-1">
                <label className="mb-2 block text-sm font-medium">
                  Add dish
                </label>
                <select
                  value={selectedDish}
                  onChange={(event) =>
                    setSelectedDish(event.target.value)
                  }
                  className="w-full rounded-lg border bg-white p-3"
                >
                  {dishes.map((dish) => (
                    <option key={dish.id} value={dish.id}>
                      {dish.name} — {dish.category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Servings
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={servings}
                  onChange={(event) =>
                    setServings(
                      Math.max(1, Math.min(10000, Number(event.target.value) || 1))
                    )
                  }
                  className="w-24 rounded-lg border bg-white p-3"
                />
              </div>
              <button
                onClick={addDish}
                className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
              >
                + Add dish
              </button>
            </div>

            <div className="space-y-3">
              {tasks.length === 0 && (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <p className="text-3xl">🍲</p>
                  <p className="mt-3 font-semibold">No dishes added</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Add this dishes to create menu for this data.
                  </p>
                </div>
              )}

              {tasks.map((task) => {
                const dish = dishes.find(
                  (item) => item.id === task.dishId
                );
                if (!dish) return null;

                const missing = dish.ingredients.some((ingredient) => {
                  const item = stock.find(
                    (entry) => entry.name === ingredient.name
                  );
                  return (
                    !item ||
                    item.quantity <
                      ingredient.quantity * task.servings
                  );
                });

                return (
                  <div
                    key={task.dishId}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"
                  >
                    <div className="min-w-40 flex-1">
                      <h3 className="font-semibold">{dish.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {dish.category} · {task.servings} servings
                      </p>
                      <p
                        className={`mt-2 text-xs font-medium ${
                          missing ? "text-red-600" : "text-emerald-700"
                        }`}
                      >
                        {missing
                          ? "⚠ Insufficient stock"
                          : "✓ Ingredients available"}
                      </p>
                    </div>
                    <select
                      value={task.status}
                      onChange={(event) =>
                        updateStatus(
                          task.dishId,
                          event.target.value as KitchenTask["status"]
                        )
                      }
                      className="rounded-lg border bg-white p-2 text-sm"
                    >
                      <option>Pending</option>
                      <option>Preparing</option>
                      <option>Ready</option>
                    </select>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold">Ingredient Requirements</h2>
            <p className="mb-5 mt-1 text-sm text-slate-500">
              Total stock needed for this day's menu.
            </p>

            {Object.keys(totals).length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                Add menu dishes to calculate requirements.
              </p>
            ) : (
              <div className="space-y-5">
                {Object.entries(totals).map(([name, quantity]) => {
                  const item = stock.find(
                    (entry) => entry.name === name
                  );
                  const available = item?.quantity || 0;
                  const enough = available >= quantity;

                  return (
                    <div key={name}>
                      <div className="mb-2 flex justify-between gap-2 text-sm">
                        <span className="font-medium">{name}</span>
                        <span
                          className={
                            enough ? "text-slate-500" : "text-red-600"
                          }
                        >
                          {quantity.toFixed(2)} / {available}{" "}
                          {item?.unit}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            enough ? "bg-emerald-500" : "bg-red-500"
                          }`}
                          style={{
                            width: `${
                              quantity === 0
                                ? 0
                                : Math.min(100, (quantity / Math.max(available, quantity)) * 100)
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

       <section
  id="inventory-stock"
  className="rounded-2xl border bg-white p-5 shadow-sm"
       >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Stock Availability</h2>
              <p className="mt-1 text-sm text-slate-500">
                Update quantities when ingredients are received or used.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
              {lowStock} items need attention
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-500">
                  <th className="p-3 font-medium">Ingredient</th>
                  <th className="p-3 font-medium">Available</th>
                  <th className="p-3 font-medium">Minimum stock</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Adjust stock</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((item) => (
                  <tr key={item.name} className="border-b last:border-0">
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="p-3">
                      {item.minimum} {item.unit}
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          item.quantity <= item.minimum
                            ? "bg-red-50 text-red-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {item.quantity <= item.minimum
                          ? "Low stock"
                          : "Available"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          aria-label={`Remove one ${item.unit} of ${item.name}`}
                          onClick={() => changeStock(item.name, -1)}
                          className="h-8 w-8 rounded-lg border hover:bg-slate-100"
                        >
                          −
                        </button>
                        <button
                          aria-label={`Add one ${item.unit} of ${item.name}`}
                          onClick={() => changeStock(item.name, 1)}
                          className="h-8 w-8 rounded-lg border hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Demo inventory only. Quantities and menus are saved in this
            browser.
          </p>
        </section>
      </section>
    </main>
  );
}