import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService, authService } from '../services';

function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Prevent navigation when clicking button
    
    if (!authService.isAuthenticated()) {
      alert('Please log in to add items to cart');
      navigate('/login');
      return;
    }

    try {
      console.log('Adding to cart from ProductCard:', {
        product_id: product.id,
        product_id_type: typeof product.id,
        quantity: 1,
        product_title: product.title || product.name
      });
      
      // Ensure product_id is a valid UUID string
      let productId = String(product.id);
      
      // Fix malformed UUIDs (13 chars in last group instead of 12)
      const uuidParts = productId.split('-');
      if (uuidParts.length === 5 && uuidParts[4].length === 13) {
        // Remove the extra character from the last group
        uuidParts[4] = uuidParts[4].substring(0, 12);
        productId = uuidParts.join('-');
        console.log('Fixed malformed UUID:', productId);
      }
      
      console.log('Product ID as string:', productId);
      
      const response = await cartService.addItemToMyCart({
        product_id: productId,
        quantity: 1,
      });
      
      console.log('Item added to cart successfully:', response);
      alert('✅ Product added to cart!');
      
      // Trigger custom cart update event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        authService.logout();
        navigate('/login');
      } else if (error.response?.status === 404) {
        alert('❌ Cart not found. Please try refreshing the page.');
      } else if (error.response?.status === 400) {
        alert(`❌ Invalid request: ${error.response?.data?.detail || 'Please check your input.'}`);
      } else if (error.response?.status === 500) {
        alert('❌ Server error. Please try again later.');
      } else {
        alert(`❌ Failed to add to cart: ${error.message || 'Please try again.'}`);
      }
    }
  };

  return (
    <div
      style={styles.card}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <img src={product.thumbnail || product.image} alt={product.title || product.name} style={styles.image} />
      <h3 style={styles.name}>{product.title || product.name}</h3>
      <p style={styles.price}>₹{product.price}</p>
      
      <button 
        style={styles.button}
        onClick={handleAddToCart}
      >
        Add to Cart
      </button>
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  image: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    marginBottom: '0.5rem',
  },
  name: {
    fontSize: '1rem',
    marginBottom: '0.5rem',
  },
  price: {
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  button: {
    padding: '0.5rem',
    width: '100%',
    backgroundColor: '#0077ff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default ProductCard;
