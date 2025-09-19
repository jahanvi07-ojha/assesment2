import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

const API = "http://localhost:5000/api"; // make sure backend runs on :5000

function App() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [sweets, setSweets] = useState([]);
  const [form, setForm] = useState({ email: "", password: "", username: "" });
  const [newSweet, setNewSweet] = useState({
    name: "",
    category: "",
    price: 0,
    quantity: 0,
    photo: "",
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [purchaseQty, setPurchaseQty] = useState({});

  // ===== Create API instance with token =====
  const api = axios.create({
    baseURL: API,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  // ===== AUTH =====
  const register = async () => {
    try {
      await axios.post(`${API}/auth/register`, form);
      toast.success("✅ User registered! Please log in.");
      setIsRegistering(false);
    } catch (err) {
      toast.error(
        "❌ Registration failed: " +
          (err.response?.data?.message || "Server error")
      );
    }
  };

  const login = async () => {
    try {
      const res = await axios.post(`${API}/auth/login`, {
        email: form.email,
        password: form.password,
      });

      setToken(res.data.token);
      const payload = JSON.parse(atob(res.data.token.split(".")[1]));
      setUser(payload);

      toast.success("✅ Logged in successfully!");
    } catch (err) {
      toast.error(
        "❌ Login failed: " +
          (err.response?.data?.msg ||
            err.response?.data?.message ||
            "Server error")
      );
    }
  };

  const logout = () => {
    setToken("");
    setUser(null);
    setSweets([]);
    toast.info("👋 Logged out");
  };

  // ===== SWEETS =====
  const loadSweets = async () => {
    try {
      const res = await api.get("/sweets");
      setSweets(res.data);
    } catch (err) {
      toast.error(
        "❌ Failed to load sweets: " +
          (err.response?.data?.message || "Server error")
      );
    }
  };

  const purchase = async (id, qty = 1) => {
    try {
      await api.post(`/orders/${id}/purchase`, { quantity: qty });
      toast.success("✅ Purchase successful!");
      loadSweets();
    } catch (err) {
      toast.error(
        "❌ " + (err.response?.data?.message || "Purchase failed")
      );
    }
  };

  const addSweet = async () => {
    try {
      await api.post("/sweets", newSweet);
      toast.success("✅ Sweet added!");
      loadSweets();
    } catch (err) {
      toast.error("❌ Failed to add sweet");
    }
  };

  const deleteSweet = async (id) => {
    try {
      await api.delete(`/sweets/${id}`);
      toast.success("✅ Sweet deleted successfully!");
      loadSweets();
    } catch (err) {
      toast.error(
        "❌ Failed to delete sweet: " +
          (err.response?.data?.message || "Server error")
      );
    }
  };

  // load sweets whenever token changes
  useEffect(() => {
    if (token) loadSweets();
  }, [token]);

  // Filter sweets by search
  const filteredSweets = sweets.filter((sweet) =>
    sweet.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4 main-heading">🍭 Sweet Shop</h1>
      <ToastContainer position="top-right" autoClose={3000} />

      {!token ? (
        // ===== AUTH SCREENS =====
        <div className="row justify-content-center">
          <div className="col-md-6 bg-white p-4 shadow-lg rounded">
            <h2 className="mb-3">{isRegistering ? "Register" : "Login"}</h2>
            {isRegistering && (
              <input
                className="form-control my-2"
                placeholder="Username"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />
            )}
            <input
              className="form-control my-2"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="form-control my-2"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              className="btn btn-primary w-100 mb-2"
              onClick={isRegistering ? register : login}
            >
              {isRegistering ? "Register" : "Login"}
            </button>
            <p className="text-center mt-2">
              {isRegistering
                ? "Already have an account? "
                : "Don't have an account? "}
              <span
                className="text-primary"
                style={{ cursor: "pointer" }}
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {isRegistering ? "Log In" : "Register here"}
              </span>
            </p>
          </div>
        </div>
      ) : (
        // ===== MAIN APP =====
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <p className="mb-0">
              Welcome <strong>{user?.isAdmin ? "Admin" : "User"}</strong> (
              {user?.email})
            </p>
            <button className="btn btn-danger btn-sm" onClick={logout}>
              Logout
            </button>
          </div>

          <hr />
          <h2>Available Sweets</h2>

          {/* Search bar */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search for a sweet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Sweets list */}
          <div className="row">
            {filteredSweets.length > 0 ? (
              filteredSweets.map((s) => (
                <div key={s._id} className="col-md-4 mb-3">
                  <div className="card p-3 shadow-sm">
                    {s.photo && (
                      <img
                        src={s.photo}
                        className="card-img-top mb-2"
                        alt={s.name}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                    )}
                    <h5>{s.name}</h5>
                    <p>
                      {s.category} | ₹{s.price}
                    </p>
                    <p>In stock: {s.quantity}</p>

                    {/* Quantity input */}
                    <input
                      type="number"
                      min="1"
                      max={s.quantity}
                      value={purchaseQty[s._id] || 1}
                      className="form-control mb-2"
                      onChange={(e) =>
                        setPurchaseQty({
                          ...purchaseQty,
                          [s._id]: Number(e.target.value),
                        })
                      }
                    />

                    <button
                      className="btn btn-sm btn-success mb-2"
                      disabled={s.quantity <= 0}
                      onClick={() =>
                        purchase(s._id, purchaseQty[s._id] || 1)
                      }
                    >
                      Buy
                    </button>

                    {user?.isAdmin && (
                      <button
                        className="btn btn-sm btn-danger mt-2"
                        onClick={() => deleteSweet(s._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center">
                No sweets found matching your search.
              </p>
            )}
          </div>

          <hr />
          {user?.isAdmin && (
            <div className="card p-3 mt-4">
              <h2>Add New Sweet</h2>
              <div className="row">
                <div className="col-md-3">
                  <input
                    className="form-control"
                    placeholder="Name"
                    onChange={(e) =>
                      setNewSweet({ ...newSweet, name: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-3">
                  <input
                    className="form-control"
                    placeholder="Category"
                    onChange={(e) =>
                      setNewSweet({ ...newSweet, category: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-2">
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Price"
                    onChange={(e) =>
                      setNewSweet({
                        ...newSweet,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="col-md-2">
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Quantity"
                    onChange={(e) =>
                      setNewSweet({
                        ...newSweet,
                        quantity: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="col-md-2">
                  <input
                    className="form-control"
                    placeholder="Photo URL"
                    onChange={(e) =>
                      setNewSweet({ ...newSweet, photo: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-2">
                  <button
                    className="btn btn-primary w-100"
                    onClick={addSweet}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;


