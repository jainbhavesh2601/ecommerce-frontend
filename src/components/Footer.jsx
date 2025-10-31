import React from 'react';

function Footer() {
  return (
    <footer style={styles.footer}>
      <p>© 2025 ArtisansAlley. All rights reserved.</p>
    </footer>
  );
}

const styles = {
  footer: {
    textAlign: 'center',
    padding: '1rem',
    backgroundColor: '#242424',
    color: 'white',
    marginTop: '2rem',
  },
};

export default Footer;
