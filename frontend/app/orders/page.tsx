
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
};

const dishOptions = [
  "Chicken Biryani",
  "Vegetable Fried Rice",
  "Masala Dosa",
  "Paneer Butter Masala",
  "Pain Dosa",
  "Kotu Parotta",

];
type StockItem = {
  name: string;
  quantity: number;
  unit: string;
  minimum: number;
};

const recipes: Record<
  string,
  { name: string; quantity: number }[]
> = {
  "Chicken Biryani": [
    { name: "Rice", quantity: 0.15 },
    { name: "Chicken", quantity: 0.2 },
    { name: "Oil", quantity: 0.02 },
  ],
  "Vegetable Fried Rice": [
    { name: "Rice", quantity: 0.12 },
    { name: "Vegetables", quantity: 0.1 },
    { name: "Oil", quantity: 0.015 },
  ],
  "Masala Dosa": [
    { name: "Dosa Batter", quantity: 0.2 },
    { name: "Potatoes", quantity: 0.1 },
    { name: "Oil", quantity: 0.01 },
  ],
  "Paneer Butter Masala": [
    { name: "Paneer", quantity: 0.15 },
    { name: "Tomatoes", quantity: 0.1 },
    { name: "Oil", quantity: 0.02 },
  ],
};
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [dishName, setDishName] = useState(dishOptions[0]);
  const [quantity, setQuantity] = useState(1);
  const [loaded, setLoaded] = useState(false);
const [stockError, setStockError] = useState("");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kitchen-orders");
      if (saved) setOrders(JSON.parse(saved));
    } catch {
      console.error("Could not load saved orders.");
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
  setStockError("");

  if (!customerName.trim()) return;

  const recipe = recipes[dishName];

  if (!recipe) {
    setStockError(
      "A recipe has not been added for this dish yet."
    );
    return;
  }

  try {
    const savedStock = localStorage.getItem("kitchen-stock");

    if (!savedStock) {
      setStockError("Stock information could not be found.");
      return;
    }

    const currentStock: StockItem[] = JSON.parse(savedStock);

    if (!Array.isArray(currentStock)) {
      setStockError("Your stock information is invalid.");
      return;
    }

    // Check whether enough ingredients are available.
    for (const ingredient of recipe) {
      const item = currentStock.find(
        (stockItem) => stockItem.name === ingredient.name
      );

      const required = ingredient.quantity * quantity;

      if (!item || item.quantity < required) {
        setStockError(
          `Not enough ${ingredient.name} in stock.`
        );
        return;
      }
    }

    // Deduct the ingredients.
    const updatedStock = currentStock.map((item) => {
      const ingredient = recipe.find(
        (recipeItem) => recipeItem.name === item.name
      );

      if (!ingredient) return item;

      return {
        ...item,
        quantity: Number(
          (item.quantity - ingredient.quantity * quantity).toFixed(3)
        ),
      };
    });

    // Save updated inventory.
    localStorage.setItem(
      "kitchen-stock",
      JSON.stringify(updatedStock)
    );

    // Create the order.
    const newOrder: Order = {
      id: Date.now(),
      customerName: customerName.trim(),
      dishName,
      quantity,
      status: "Pending",
      createdAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setOrders((previous) => [...previous, newOrder]);

    setCustomerName("");
    setQuantity(1);
    setStockError("");
  } catch {
    setStockError("Could not update stock. Please try again.");
  }
}

    setOrders((previous) => [...previous, newOrder]);
    setCustomerName("");
    setQuantity(1);
  }

  function updateStatus(id: number, status: OrderStatus) {
    setOrders((previous) =>
      previous.map((order) =>
        order.id === id ? { ...order, status } : order
      )
    );
  }

  function deleteOrder(id: number) {
    setOrders((previous) =>
      previous.filter((order) => order.id !== id)
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-5 text-slate-900 md:p-10">
      <div className="mx-auto max-w-6xl">
        <a href="/" className="text-sm text-emerald-700 hover:underline">
          ← Back to Kitchen Dashboard
        </a>

        <header className="my-6">
          <h1 className="text-3xl font-bold">🧾 Kitchen Orders</h1>
          <p className="mt-2 text-slate-500">
            Create orders and track kitchen preparation.
          </p>
        </header>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {(["Pending", "Preparing", "Ready", "Served"] as OrderStatus[]).map(
            (status) => (
              <div key={status} className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">{status}</p>
                <p className="mt-2 text-3xl font-bold">
                  {orders.filter((order) => order.status === status).length}
                </p>
              </div>
            )
          )}
        </div>

        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Create New Order</h2>
{stockError && (
  <p className="mb-3 rounded-lg bg-red-100 p-3 text-sm text-red-700">
    {stockError}
  </p>
)}
          <form onSubmit={addOrder} className="grid gap-4 md:grid-cols-4">
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Customer name"
              required
              className="min-w-0 rounded-lg border p-3"
            />

            <select
              value={dishName}
              onChange={(event) => setDishName(event.target.value)}
              className="min-w-0 rounded-lg border p-3"
            >
              {dishOptions.map((dish) => (
                <option key={dish} value={dish}>{dish}</option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              max="10000"
              required
              value={quantity}
              onChange={(event) =>
                setQuantity(Math.max(1, Math.min(10000, Number(event.target.value) || 1)))
              }
              className="rounded-lg border p-3"
              aria-label="Quantity"
            />

            <button
              type="submit"
              className="rounded-lg bg-emerald-600 p-3 font-semibold text-white hover:bg-emerald-700"
            >
              + Create Order
            </button>
          </form>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">All Orders</h2>

          {orders.length === 0 ? (
            <p className="rounded-xl border border-dashed p-8 text-center text-slate-500">
              No orders yet. Create your first order above.
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"
                >
                  <div>
                    <h3 className="font-semibold">{order.dishName}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Customer: {order.customerName} · Qty: {order.quantity}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Ordered at {order.createdAt}
                    </p>
                  </div>

                  <select
                    value={order.status}
                    onChange={(event) =>
                      updateStatus(order.id, event.target.value as OrderStatus)
                    }
                    className="rounded-lg border p-2"
                    aria-label={`Status for ${order.customerName}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready">Ready</option>
                    <option value="Served">Served</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => deleteOrder(order.id)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
