import React from 'react';
import { useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router';
import CallbackPage from '../routes/CallbackPage';
import SignoutCallbackComponent from '../routes/SignoutCallbackComponent';
import LegacyClient from './legacyOIDCClient';
import NextClient from './nextOIDCClient';

function _isAbsoluteUrl(url) {
  return url.includes('http://') || url.includes('https://');
}

function _makeAbsoluteIfNecessary(url, base_url) {
  if (_isAbsoluteUrl(url)) {
    return url;
  }

  /*
   * Make sure base_url and url are not duplicating slashes.
   */
  if (base_url[base_url.length - 1] === '/') {
    base_url = base_url.slice(0, base_url.length - 1);
  }

  return base_url + url;
}

const initUserManager = (oidc, routerBasename) => {
  if (!oidc || !oidc.length) {
    return;
  }

  const firstOpenIdClient = oidc[0];
  const { protocol, host } = window.location;
  const baseUri = `${protocol}//${host}${routerBasename}`;

  const redirect_uri = firstOpenIdClient.redirect_uri || '/callback';
  const silent_redirect_uri = firstOpenIdClient.silent_redirect_uri || '/silent-refresh.html';
  const post_logout_redirect_uri = firstOpenIdClient.post_logout_redirect_uri || '/';

  const openIdConnectConfiguration = Object.assign({}, firstOpenIdClient, {
    redirect_uri: _makeAbsoluteIfNecessary(redirect_uri, baseUri),
    silent_redirect_uri: _makeAbsoluteIfNecessary(silent_redirect_uri, baseUri),
    post_logout_redirect_uri: _makeAbsoluteIfNecessary(post_logout_redirect_uri, baseUri),
  });

  const client = firstOpenIdClient.response_type === 'code' ? NextClient : LegacyClient;

  return client(openIdConnectConfiguration);
};

function LogoutComponent(props) {
  const { userManager } = props;
  localStorage.setItem('signoutEvent', 'true');
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  userManager.signoutRedirect({
    post_logout_redirect_uri: query.get('redirect_uri'),
  });
  return null;
}

function LoginComponent({ userManager, oidcAuthority }) {
  const queryParams = new URLSearchParams(window.location.search);
  const iss = queryParams.get('iss');
  const loginHint = queryParams.get('login_hint');
  const targetLinkUri = queryParams.get('target_link_uri');
  
  if (iss && iss !== oidcAuthority) {
    console.error('iss of /login does not match the oidc authority');
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ color: 'red' }}>Invalid issuer</div>
      </div>
    );
  }

  React.useEffect(() => {
    userManager.removeUser().then(() => {
      if (targetLinkUri !== null) {
        try {
          const ohifRedirectTo = {
            pathname: new URL(targetLinkUri).pathname,
          };
          sessionStorage.setItem('ohif-redirect-to', JSON.stringify(ohifRedirectTo));
        } catch (e) {
          console.warn('Invalid target link URI, using default');
        }
      } else {
        const ohifRedirectTo = {
          pathname: '/',
        };
        sessionStorage.setItem('ohif-redirect-to', JSON.stringify(ohifRedirectTo));
      }

      if (loginHint !== null) {
        userManager.signinRedirect({ login_hint: loginHint });
      } else {
        userManager.signinRedirect();
      }
    }).catch(error => {
      console.error('Login initialization error:', error);
    });
  }, [userManager, targetLinkUri, loginHint]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column'
    }}>
      <div>Redirecting to login...</div>
    </div>
  );
}

function OpenIdConnectRoutes({ oidc, routerBasename, userAuthenticationService }) {
  const userManager = initUserManager(oidc, routerBasename);

  const getAuthorizationHeader = () => {
    const user = userAuthenticationService.getUser();

    // if the user is null return early, next time
    // we hit this function we will have a user
    if (!user) {
      return;
    }

    return {
      Authorization: `Bearer ${user.access_token}`,
    };
  };

  const handleUnauthenticated = () => {
    console.log('Handling unauthenticated user - redirecting to login');
    
    // Check if we're already in the middle of authentication
    const authInProgress = sessionStorage.getItem('auth-in-progress');
    if (authInProgress) {
      console.log('Authentication already in progress, skipping redirect');
      return null;
    }
    
    // Mark authentication as in progress
    sessionStorage.setItem('auth-in-progress', 'true');
    
    // Note: Don't await the redirect. If you make this component async it
    // causes a react error before redirect as it returns a promise of a component rather than a component.
    userManager.signinRedirect().catch(error => {
      console.error('Signin redirect failed:', error);
      sessionStorage.removeItem('auth-in-progress');
    });

    // return null because this is used in a react component
    return null;
  };

  const navigate = useNavigate();

  //for multi-tab logout
  useEffect(() => {
    localStorage.removeItem('signoutEvent');
    const storageEventListener = event => {
      const signOutEvent = localStorage.getItem('signoutEvent');
      if (signOutEvent) {
        navigate(`/logout?redirect_uri=${encodeURIComponent(window.location.href)}`);
      }
    };

    window.addEventListener('storage', storageEventListener);

    return () => {
      window.removeEventListener('storage', storageEventListener);
    };
  }, []);

  useEffect(() => {
    userAuthenticationService.set({ enabled: true });

    userAuthenticationService.setServiceImplementation({
      getAuthorizationHeader,
      handleUnauthenticated,
    });
  }, []);

  useEffect(() => {
    const userLoadedHandler = user => {
      console.log('User loaded:', user);
      userAuthenticationService.setUser(user);
    };

    const userUnloadedHandler = () => {
      console.log('User unloaded');
      userAuthenticationService.setUser(null);
    };

    const silentRenewErrorHandler = error => {
      console.error('Silent renew error:', error);
    };

    userManager.events.addUserLoaded(userLoadedHandler);
    userManager.events.addUserUnloaded(userUnloadedHandler);
    userManager.events.addSilentRenewError(silentRenewErrorHandler);

    // Check if user is already loaded
    userManager.getUser().then(user => {
      if (user && !user.expired) {
        console.log('User already authenticated:', user);
        userAuthenticationService.setUser(user);
      }
    }).catch(error => {
      console.error('Error getting user:', error);
    });

    // Cleanup on component unmount.
    return () => {
      userManager.events.removeUserLoaded(userLoadedHandler);
      userManager.events.removeUserUnloaded(userUnloadedHandler);
      userManager.events.removeSilentRenewError(silentRenewErrorHandler);
    };
  }, [userManager, userAuthenticationService]);

  const oidcAuthority = oidc[0].authority;

  const location = useLocation();
  const { pathname, search } = location;

  const redirectURI = userManager.settings._redirect_uri ?? userManager.settings.redirect_uri;
  const silentRedirectURI =
    userManager.settings._silent_redirect_uri ?? userManager.settings.silent_redirect_uri;
  const postLogoutRedirectURI =
    userManager.settings._post_logout_redirect_uri ?? userManager.settings.post_logout_redirect_uri;

  const redirect_uri = new URL(redirectURI).pathname.replace(
    routerBasename !== '/' ? routerBasename : '',
    ''
  );
  const silent_refresh_uri = new URL(silentRedirectURI).pathname; //.replace(routerBasename,'')
  const post_logout_redirect_uri = new URL(postLogoutRedirectURI).pathname; //.replace(routerBasename,'');

  // Only store redirect info if we're not already on an auth-related path
  const authPaths = [redirect_uri, silent_refresh_uri, post_logout_redirect_uri, '/login', '/logout'];
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));
  
  if (!isAuthPath && !sessionStorage.getItem('ohif-redirect-to')) {
    sessionStorage.setItem('ohif-redirect-to', JSON.stringify({ pathname, search }));
  }

  return (
    <Routes>
      <Route
        path={silent_refresh_uri}
        onEnter={window.location.reload}
      />
      <Route
        path={post_logout_redirect_uri}
        element={
          <SignoutCallbackComponent
            userManager={userManager}
            successCallback={() => console.log('Signout successful')}
            errorCallback={error => {
              console.warn(error);
              console.warn('Signout failed');
            }}
          />
        }
      />
      <Route
        path={redirect_uri}
        element={
          <CallbackPage
            userManager={userManager}
            onRedirectSuccess={user => {
              // Get redirect info from sessionStorage with fallback
              const redirectInfo = sessionStorage.getItem('ohif-redirect-to');
              let pathname = '/';
              let search = '';
              
              if (redirectInfo) {
                try {
                  const parsed = JSON.parse(redirectInfo);
                  pathname = parsed.pathname || '/';
                  search = parsed.search || '';
                } catch (e) {
                  console.warn('Failed to parse redirect info:', e);
                  pathname = '/';
                  search = '';
                }
              }

              // Clean up the stored redirect info and auth progress flag
              sessionStorage.removeItem('ohif-redirect-to');
              sessionStorage.removeItem('auth-in-progress');

              // Set the user in the authentication service
              userAuthenticationService.setUser(user);
              console.log('User authenticated successfully, navigating to:', pathname);

              // Navigate to the intended destination
              navigate({
                pathname,
                search,
              });
            }}
          />
        }
      />
      <Route
        path="/login"
        element={
          <LoginComponent
            userManager={userManager}
            oidcAuthority={oidcAuthority}
          />
        }
      />
      <Route
        path="/logout"
        element={<LogoutComponent userManager={userManager} />}
      />
    </Routes>
  );
}

export default OpenIdConnectRoutes;
