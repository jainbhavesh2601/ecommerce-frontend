import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { productService, cartService, authService } from '../services';

function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validImages, setValidImages] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const result = await productService.getProductById(id);
        console.log('Product fetched:', result.data);
        console.log('Images:', result.data.images);
        console.log('Images type:', typeof result.data.images);
        console.log('Thumbnail:', result.data.thumbnail);
        
        // Handle images - backend sends as JSON string or array
        let parsedProduct = { ...result.data };
        
        // Parse images if it's a string
        if (typeof parsedProduct.images === 'string') {
          try {
            // Try to parse as JSON string
            parsedProduct.images = JSON.parse(parsedProduct.images);
            console.log('Parsed images from JSON string:', parsedProduct.images);
          } catch (e) {
            console.error('Failed to parse images, using thumbnail only:', e);
            // If parsing fails, use thumbnail as the only image
            parsedProduct.images = [parsedProduct.thumbnail];
          }
        }
        
        // If images is not an array at this point, make it one with thumbnail
        if (!Array.isArray(parsedProduct.images)) {
          console.warn('Images is not an array, using thumbnail');
          parsedProduct.images = [parsedProduct.thumbnail];
        }
        
        // Filter out empty strings and ensure valid URLs
        parsedProduct.images = parsedProduct.images.filter(img => img && typeof img === 'string' && img.trim().length > 0);
        
        // If no valid images after filtering, use thumbnail
        if (parsedProduct.images.length === 0) {
          console.warn('No valid images found, using thumbnail');
          parsedProduct.images = [parsedProduct.thumbnail];
        }
        
        // Ensure thumbnail is first in the array if not already there
        if (parsedProduct.thumbnail && !parsedProduct.images.includes(parsedProduct.thumbnail)) {
          parsedProduct.images = [parsedProduct.thumbnail, ...parsedProduct.images];
        }
        
        console.log('Final parsed images:', parsedProduct.images);
        setProduct(parsedProduct);
        
        // Validate images - only keep URLs that can be loaded
        validateImages(parsedProduct.images, parsedProduct.thumbnail);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Unable to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Function to validate and filter working image URLs
  const validateImages = async (images, thumbnail) => {
    const validUrls = [];
    
    for (const imageUrl of images) {
      try {
        // Test if image can be loaded
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(imageUrl);
          img.onerror = () => reject();
          img.src = imageUrl;
          // Timeout after 3 seconds
          setTimeout(() => reject(), 3000);
        });
        validUrls.push(imageUrl);
        console.log('Valid image:', imageUrl);
      } catch {
        console.log('Invalid/broken image, skipping:', imageUrl);
      }
    }
    
    // If no valid images found, use thumbnail
    if (validUrls.length === 0 && thumbnail) {
      validUrls.push(thumbnail);
    }
    
    console.log('Valid images after filtering:', validUrls);
    setValidImages(validUrls);
  };

  const handleAddToCart = async () => {
    if (!authService.isAuthenticated()) {
      alert('Please log in to add items to cart');
      navigate('/login');
      return;
    }

    try {
      console.log('Adding to cart:', {
        product_id: product.id,
        product_id_type: typeof product.id,
        quantity: 1,
        product_title: product.title
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

  if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading product...</p>;
  if (error) return <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>;
  if (!product) return <p style={{ textAlign: 'center' }}>No product found.</p>;

  const isAvailable = product.stock > 0;

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.left}>
          <img
            src={validImages[currentImage] || product.thumbnail || 'https://via.placeholder.com/400'}
            alt={product.title}
            style={styles.mainImage}
          />
          {validImages.length > 1 && (
            <div style={styles.thumbnailContainer}>
              {validImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.title} - Image ${idx + 1}`}
                  style={{
                    ...styles.thumbnail,
                    border: idx === currentImage ? '2px solid #ffcc00' : '1px solid #ccc',
                  }}
                  onClick={() => setCurrentImage(idx)}
                />
              ))}
            </div>
          )}
        </div>

        <div style={styles.right}>
          <h1>{product.title}</h1>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            ₹{Number(product.price).toLocaleString()}{' '}
            {product.discount_percentage > 0 && (
              <span style={{ color: 'green' }}>({product.discount_percentage}% OFF)</span>
            )}
          </p>
          <p>{product.description}</p>
          <p><strong>Brand:</strong> {product.brand}</p>
          <p><strong>Rating:</strong> {product.rating}⭐</p>
          {!isAvailable && <p style={{ color: 'red', fontWeight: 'bold' }}>Product Not Available</p>}

          <div style={{ margin: '1rem 0' }}>
            <button
              style={{
                ...styles.button,
                backgroundColor: isAvailable ? '#ffcc00' : '#ccc',
                cursor: isAvailable ? 'pointer' : 'not-allowed',
              }}
              onClick={handleAddToCart}
              disabled={!isAvailable}
            >
              {isAvailable ? 'Add to Cart' : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    maxWidth: '1200px',
    margin: '2rem auto',
    gap: '2rem',
    padding: '0 1rem',
  },
  left: { flex: '1 1 300px' },
  mainImage: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  thumbnailContainer: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem' },
  thumbnail: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  right: { flex: '1 1 400px' },
  button: {
    padding: '0.8rem 1.5rem',
    fontSize: '1rem',
    borderRadius: '6px',
    border: 'none',
    fontWeight: 'bold',
  },
};

export default ProductDetail;
