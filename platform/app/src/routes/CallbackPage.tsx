import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

function CallbackPage({ userManager, onRedirectSuccess }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const onRedirectError = error => {
    console.error('Callback error:', error);
    setError('Login failed. Please try again.');
    setLoading(false);
    
    // After 3 seconds, redirect to login
    setTimeout(() => {
      window.location.href = '/';
    }, 3000);
  };

  useEffect(() => {
    userManager
      .signinRedirectCallback()
      .then(user => {
        setLoading(false);
        onRedirectSuccess(user);
      })
      .catch(error => onRedirectError(error));
  }, [userManager, onRedirectSuccess]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div>Completing login...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
        <div>Redirecting...</div>
      </div>
    );
  }

  return null;
}

CallbackPage.propTypes = {
  userManager: PropTypes.object.isRequired,
};

export default CallbackPage;
