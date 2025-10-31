import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import "./Home.css";

function Home() {
  const [categories, setCategories] = useState(["All"]);
  const [categoryMap, setCategoryMap] = useState({});
  const [products, setProducts] = useState([]);
  const [shuffledProducts, setShuffledProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const catRes = await fetch("https://ecommerce-backend-7jlj.onrender.com/categories");
        if (!catRes.ok) throw new Error("Failed to fetch categories");
        const catResult = await catRes.json();
        const catList = catResult.data || [];
        const map = {};
        catList.forEach((c) => {
          map[c.id] = c.name;
        });
        setCategoryMap(map);
        setCategories(["All", ...catList.map((c) => c.name)]);

        // Fetch products
        const prodRes = await fetch("https://ecommerce-backend-7jlj.onrender.com/products");
        if (!prodRes.ok) throw new Error("Failed to fetch products");
        const prodResult = await prodRes.json();
        const prodList = prodResult.data || [];
        setProducts(prodList);
        setShuffledProducts([...prodList].sort(() => 0.5 - Math.random()));
      } catch (err) {
        console.error(err);
        setError("Unable to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = (search ? products : shuffledProducts).filter((p) => {
    const categoryName = categoryMap[p.category_id] || "Unknown";
    const matchesCategory = selectedCategory === "All" || categoryName === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const visibleProducts = search ? filteredProducts : filteredProducts.slice(0, visibleCount);

  if (loading) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading products...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>🛍️ Support Local, Shop Local</h1>
          <p>Discover fresh produce, handmade crafts, and traditional goods from your community.</p>
          <button className="hero-btn">Explore Now</button>
        </div>
        <div className="hero-img">
          <img src="https://tse3.mm.bing.net/th/id/OIP.L3TMT9mYqRVb07F2RnMPzQHaEK?pid=Api&P=0&h=180" alt="local market" />
        </div>
      </div>

      {/* Categories Showcase */}
      <div className="categories">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            className={`category-btn ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="filters">
        <input
          type="text"
          placeholder="🔍 Search local goods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Festival Offers */}
      <div className="offers fade-in">
        <h2>🎉 Festival Deals</h2>
        <div className="offer-banner">
          <p>Get up to <span>30% OFF</span> on Handmade Items!</p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="product-grid">
        {visibleProducts.map((product, idx) => (
          <div key={product.id} className="product-card animated-card" style={{ animationDelay: `${idx * 0.1}s` }}>
            <ProductCard
              product={{
                id: product.id,
                name: product.title,
                price: product.price,
                category: categoryMap[product.category_id] || "Unknown",
                image: product.thumbnail
              }}
            />
          </div>
        ))}
      </div>

      {/* Load More */}
      {!search && visibleCount < filteredProducts.length && (
        <div className="load-more-container">
          <button className="load-btn" onClick={() => setVisibleCount(visibleCount + 6)}>
            Load More
          </button>
        </div>
      )}

      <Footer />
    </>
  );
}

export default Home;
