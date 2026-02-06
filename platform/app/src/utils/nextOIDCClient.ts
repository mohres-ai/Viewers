import { UserManager } from 'oidc-client-ts';

/**
 * Creates a userManager from oidcSettings
 * LINK: https://github.com/IdentityModel/oidc-client-js/wiki#configuration
 *
 * @param {Object} oidcSettings
 * @param {string} oidcSettings.authServerUrl,
 * @param {string} oidcSettings.clientId,
 * @param {string} oidcSettings.authRedirectUri,
 * @param {string} oidcSettings.postLogoutRedirectUri,
 * @param {string} oidcSettings.responseType,
 * @param {string} oidcSettings.extraQueryParams,
 */
export default function getUserManagerForOpenIdConnectClient(oidcSettings) {
  if (!oidcSettings) {
    return;
  }

  if (!oidcSettings.authority || !oidcSettings.client_id || !oidcSettings.redirect_uri) {
    console.error('Missing required oidc settings:  authority, client_id, redirect_uri');
    return;
  }

  const settings = {
    ...oidcSettings,
    // The next client always use the code flow with PKCE
    response_type: 'code',
    revokeTokensOnSignout: oidcSettings.revokeAccessTokenOnSignout ?? true,
    filterProtocolClaims: true,
    // Disable automatic discovery to avoid CORS issues
    loadUserInfo: false,
    automaticSilentRenew: true,
    checkSessionInterval: 2000, // Check every 2 seconds
    // Use localStorage for persistent token storage
    userStore: typeof window !== 'undefined' ? window.localStorage : undefined,
    // Use explicit metadata if provided
    ...(oidcSettings.metadata ? { metadata: oidcSettings.metadata } : {}),
  };

  const userManager = new UserManager(settings);

  return userManager;
}
