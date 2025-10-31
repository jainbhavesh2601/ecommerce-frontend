import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { cartService, authService } from "../services";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCart();
    
    // Listen for cart update events
    const handleCartUpdate = () => {
      console.log('Cart updated event received, refreshing cart...');
      fetchCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch user's cart (auto-created on signup)
  const fetchCart = async () => {
    try {
      setLoading(true);
      if (!authService.isAuthenticated()) {
        navigate("/login");
        return;
      }

      const response = await cartService.getMyCart();
      console.log('Cart API response:', response);
      const cartData = response.data;
      console.log('Cart data:', cartData);
      console.log('Cart items:', cartData.cart_items);

      setCart(cartData);
      setCartItems(cartData.cart_items || []);
    } catch (err) {
      console.error("Error fetching cart:", err);
      if (err.response?.status === 401) {
        authService.logout();
        navigate("/login");
      } else {
        setError("Failed to load cart.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const handleQuantityChange = async (itemId, delta) => {
    try {
      const item = cartItems.find((i) => i.id === itemId);
      if (!item) return;

      const newQuantity = Math.max(1, item.quantity + delta);
      await cartService.updateCartItem(cart.id, itemId, { quantity: newQuantity });

      // Refresh cart to get updated totals
      await fetchCart();
    } catch (err) {
      console.error("Error updating quantity:", err);
      alert("Failed to update quantity.");
    }
  };

  // Remove item
  const handleRemove = async (itemId) => {
    try {
      await cartService.removeCartItem(cart.id, itemId);
      setCartItems((prev) => prev.filter((i) => i.id !== itemId));
      // Refresh cart to get updated totals
      await fetchCart();
    } catch (err) {
      console.error("Error removing item:", err);
      alert("Failed to remove item.");
    }
  };

  // Checkout redirect
  const handleCheckout = () => {
    if (!cartItems.length) {
      alert("Your cart is empty!");
      return;
    }
    navigate("/checkout");
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <h1>My Cart</h1>
          <p>Loading cart...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <h1>My Cart</h1>
          <p style={{ color: "red" }}>{error}</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1>My Cart</h1>
        {cartItems.length === 0 ? (
          <div>
            <p>Your cart is empty.</p>
          </div>
        ) : (
          <div style={styles.cartWrapper}>
            <div style={styles.items}>
              {cartItems.map((item) => (
                <div key={item.id} style={styles.item}>
                  <img
                    src={item.product?.thumbnail || "https://via.placeholder.com/200"}
                    alt={item.product?.title || "Product"}
                    style={styles.image}
                  />
                  <div style={styles.details}>
                    <h3>{item.product?.title || "Product"}</h3>
                    <p>₹{item.product?.price || 0}</p>
                    <div style={styles.quantity}>
                      <button onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                      <span style={{ margin: "0 1rem" }}>{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                    </div>
                    <button onClick={() => handleRemove(item.id)} style={styles.remove}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.summary}>
              <h2>Price Summary</h2>
              <p>Subtotal: ₹{subtotal}</p>
              <p>Discount: ₹0</p>
              <p>
                <strong>Total: ₹{subtotal}</strong>
              </p>
              <button onClick={handleCheckout} style={styles.checkout}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: { maxWidth: "1200px", margin: "2rem auto", padding: "0 1rem" },
  cartWrapper: { display: "flex", flexWrap: "wrap", gap: "2rem" },
  items: { flex: "2 1 600px" },
  item: { display: "flex", gap: "1rem", borderBottom: "1px solid #ccc", padding: "1rem 0" },
  image: { width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px" },
  details: { flex: 1 },
  quantity: { display: "flex", alignItems: "center", marginTop: "0.5rem" },
  remove: { marginTop: "0.5rem", background: "transparent", border: "none", color: "red", cursor: "pointer" },
  summary: { flex: "1 1 250px", border: "1px solid #ccc", borderRadius: "8px", padding: "1rem", height: "fit-content" },
  checkout: { width: "100%", padding: "0.8rem", marginTop: "1rem", backgroundColor: "#ffcc00", border: "none", cursor: "pointer", fontWeight: "bold" },
};

export default Cart;
