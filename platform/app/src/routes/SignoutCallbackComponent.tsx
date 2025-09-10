import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function SignoutCallbackComponent({ userManager }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const onRedirectSuccess = () => {
    try {
      // Get stored redirect URL or default to home
      const redirectInfo = sessionStorage.getItem('ohif-redirect-to');
      let redirectPath = '/';
      
      if (redirectInfo) {
        try {
          const { pathname, search = '' } = JSON.parse(redirectInfo);
          redirectPath = search ? `${pathname}?${search}` : pathname;
        } catch (e) {
          console.warn('Failed to parse redirect info, using default');
        }
      }

      // Clear the redirect info
      sessionStorage.removeItem('ohif-redirect-to');
      
      // Navigate to the destination
      navigate(redirectPath);
    } catch (error) {
      console.error('Redirect success error:', error);
      navigate('/');
    }
  };

  const onRedirectError = error => {
    console.error('Signout callback error:', error);
    setError('Logout failed. Redirecting to home...');
    
    // After 3 seconds, redirect to home anyway
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  useEffect(() => {
    userManager
      .signoutRedirectCallback()
      .then(() => {
        setLoading(false);
        onRedirectSuccess();
      })
      .catch(error => {
        setLoading(false);
        onRedirectError(error);
      });
  }, [userManager, navigate]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div>Completing logout...</div>
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
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  return null;
}

SignoutCallbackComponent.propTypes = {
  userManager: PropTypes.object.isRequired,
};

export default SignoutCallbackComponent;
