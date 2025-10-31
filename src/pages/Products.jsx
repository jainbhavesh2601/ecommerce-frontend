import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { productService, categoryService } from '../services';

function Products() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search')?.toLowerCase() || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [categoryMap, setCategoryMap] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNearby, setShowNearby] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Fetch categories & products
  const fetchData = async () => {
    try {
      // Fetch categories
      const catResult = await categoryService.getAllCategories();
      const catList = catResult.data || [];
      const map = {};
      catList.forEach(c => (map[c.id] = c.name));
      setCategoryMap(map);
      setCategories(['All', ...catList.map(c => c.name)]);

      // Prepare API parameters
      const params = {};
      
      // Add search parameter if present
      if (searchQuery) {
        params.search = searchQuery;
      }

      // Fetch products
      console.log('Fetching all products with params:', params);
      const prodData = await productService.getAllProducts(params);
      setProducts(Array.isArray(prodData.data) ? prodData.data : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load products.');
      setLoading(false);
    }
  };

  // Fetch products with location filtering
  const fetchDataWithLocation = async (lat, lon) => {
    try {
      setLoading(true);
      
      // Fetch categories
      const catResult = await categoryService.getAllCategories();
      const catList = catResult.data || [];
      const map = {};
      catList.forEach(c => (map[c.id] = c.name));
      setCategoryMap(map);
      setCategories(['All', ...catList.map(c => c.name)]);

      // Prepare API parameters with location
      const params = {
        user_lat: lat,
        user_lon: lon,
        max_distance_km: 200,
        sort_by_distance: true
      };
      
      // Add search parameter if present
      if (searchQuery) {
        params.search = searchQuery;
      }

      // Fetch products with location filtering
      console.log('Fetching nearby products with params:', params);
      const prodData = await productService.getAllProducts(params);
      console.log('Received products:', prodData.data);
      setProducts(Array.isArray(prodData.data) ? prodData.data : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load products.');
      setLoading(false);
    }
  };

  // Handle nearby products toggle
  const handleNearbyToggle = async () => {
    console.log('handleNearbyToggle called, showNearby:', showNearby);
    
    if (!showNearby) {
      // Request location permission
      if (navigator.geolocation) {
        console.log('Requesting location permission...');
        setLoading(true);
        
        // Add timeout and error handling options
        const options = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        };
        
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            console.log('Location obtained:', lat, lon);
            
            // Set state first
            setUserLocation({ lat, lon });
            setLocationEnabled(true);
            setShowNearby(true);
            
            // Fetch with location parameters
            console.log('Fetching products with location params:', { lat, lon, max_distance_km: 200 });
            await fetchDataWithLocation(lat, lon);
          },
          (err) => {
            console.error('Error getting location:', err);
            setLoading(false);
            
            let errorMessage = 'Location access denied.';
            if (err.code === 1) {
              errorMessage = 'Location access denied by user.';
            } else if (err.code === 2) {
              errorMessage = 'Location unavailable.';
            } else if (err.code === 3) {
              errorMessage = 'Location request timed out.';
            }
            
            alert(errorMessage);
          },
          options
        );
      } else {
        console.error('Geolocation not supported');
        alert('Geolocation is not supported by this browser.');
      }
    } else {
      // Turn off nearby filtering
      console.log('Turning off nearby filtering');
      setShowNearby(false);
      setLocationEnabled(false);
      setUserLocation(null);
      setLoading(true);
      await fetchData();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter & sort
  const filteredProducts = products
    .filter(p => {
      const categoryName = categoryMap[p.category_id] || 'Unknown';
      return selectedCategory === 'All' || categoryName === selectedCategory;
    })
    .filter(p => p.title.toLowerCase().includes(searchQuery))
    .sort((a, b) => {
      if (sortOption === 'priceLow') return Number(a.price) - Number(b.price);
      if (sortOption === 'priceHigh') return Number(b.price) - Number(a.price);
      return 0;
    });

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>Products</h1>

        {/* Filters */}
        <div style={styles.filters}>
          <div>
            <strong>Category:</strong>
            <select
              id="category-select"
              name="category"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={styles.select}
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <strong>Sort By:</strong>
            <select
              id="sort-select"
              name="sort"
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
              style={styles.select}
            >
              <option value="">Default</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>

          <div>
            <button
              onClick={handleNearbyToggle}
              style={showNearby ? styles.nearbyBtnActive : styles.nearbyBtn}
            >
              {showNearby ? '📍 Show All Products' : '📍 Show Nearby Products'}
            </button>
          </div>
        </div>

        {/* Location Status */}
        {showNearby && locationEnabled && (
          <div style={styles.locationBanner}>
            ✓ Showing products within 200 km of your location
          </div>
        )}

        {/* Loading / Error / Product Grid */}
        {loading && <p>Loading products...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={styles.productGrid}>
          {!loading && !error && filteredProducts.length > 0 && filteredProducts.map(product => (
            <div
              key={product.id}
              style={styles.card}
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <img
                src={product.thumbnail || (product.images && product.images[0]) || 'https://via.placeholder.com/200'}
                alt={product.title || 'Product'}
                style={styles.image}
              />
              <h3 style={styles.productTitle}>{product.title}</h3>
              <p style={styles.price}>₹{product.price}</p>
              <p style={styles.brand}>{product.brand}</p>
              <p style={styles.category}>{categoryMap[product.category_id]}</p>
            </div>
          ))}

          {!loading && filteredProducts.length === 0 && (
            <p>No products found for "{searchQuery}"</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' },
  title: { fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' },
  filters: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
    alignItems: 'center',
  },
  select: { padding: '0.5rem', fontSize: '1rem', marginLeft: '0.5rem' },
  nearbyBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  nearbyBtnActive: {
    padding: '0.5rem 1rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  locationBanner: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '0.75rem',
    borderRadius: '5px',
    marginBottom: '1rem',
    textAlign: 'center',
    fontWeight: '500',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '1rem',
    textAlign: 'center',
    backgroundColor: '#fff',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    cursor: 'pointer',
  },
  image: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    borderRadius: '10px',
    marginBottom: '0.5rem',
  },
  productTitle: { fontSize: '1.1rem', fontWeight: '600', margin: '0.5rem 0' },
  price: { color: '#28a745', fontWeight: 'bold' },
  brand: { color: '#555', fontSize: '0.9rem' },
  category: { color: '#888', fontSize: '0.85rem', marginTop: '0.3rem' },
};

export default Products;
