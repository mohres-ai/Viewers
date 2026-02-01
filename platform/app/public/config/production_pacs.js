/** @type {AppTypes.Config} */
window.config = {
  name: 'config/production_pacs.js',
  routerBasename: null,
  extensions: [],
  modes: [],
  customizationService: {},
  showStudyList: true,
  maxNumberOfWebWorkers: 3,
  showWarningMessageForCrossOrigin: false,
  showCPUFallbackMessage: true,
  showLoadingIndicator: true,
  experimentalStudyBrowserSort: false,
  strictZSpacingForVolumeViewport: true,
  groupEnabledModesFirst: true,
  allowMultiSelectExport: false,
  maxNumRequests: {
    interaction: 100,
    thumbnail: 75,
    prefetch: 25,
  },
  defaultDataSourceName: 'production_pacs',
  dataSources: [
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'production_pacs',
      configuration: {
        friendlyName: 'PAXELIA Production PACS Server',
        name: 'PAXELIA PACS',
        // Production DICOMweb endpoints pointing to your VPS backend
        qidoRoot: 'https://backend.paxelia.com/api/v1/qido-rs',
        wadoRoot: 'https://backend.paxelia.com/api/v1/wado-rs',
        stowRoot: 'https://backend.paxelia.com/api/v1/stow-rs',

        // Authentication enabled for production deployment
        requestOptions: {
          auth: {
            type: 'bearer',
          }
        },

        // Backend capabilities
        qidoSupportsIncludeField: true,
        supportsReject: false,
        supportsStow: true,
        dicomUploadEnabled: true,

        // Image rendering options
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',

        // Performance and features
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: true,
        supportsWildcard: false,
        staticWado: false,
        singlepart: 'video',

        // Bulk data handling
        bulkDataURI: {
          enabled: true,
          relativeResolution: 'studies',
        },

        // DICOM compliance
        omitQuotationForMultipartRequest: false,
      },
    },

    // DICOM JSON support
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomjson',
      sourceName: 'dicomjson',
      configuration: {
        friendlyName: 'DICOM JSON',
        name: 'json',
      },
    },

    // Local file support
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomlocal',
      sourceName: 'dicomlocal',
      configuration: {
        friendlyName: 'Local DICOM Files',
      },
    },
  ],

  // Error handling
  httpErrorHandler: error => {
    console.warn('HTTP Error:', error.status, error.message);

    // Handle authentication errors
    if (error.status === 401) {
      console.warn('Authentication required - redirecting to login');
    }

    // Handle backend errors
    if (error.status >= 500) {
      console.error('Backend server error - check PACS backend status');
    }

    // Handle CORS errors
    if (error.status === 0) {
      console.warn('CORS error - ensure backend CORS is configured for frontend origin');
    }
  },

  // Authentication configuration for production
  oidc: [
    {
      authority: 'https://backend.paxelia.com',
      client_id: 'ohif-pacs-viewer',
      redirect_uri: 'https://viewer.paxelia.com/callback',
      response_type: 'code',
      scope: 'openid profile email',
      post_logout_redirect_uri: 'https://viewer.paxelia.com/',
      silent_redirect_uri: 'https://viewer.paxelia.com/silent-refresh.html',
      automaticSilentRenew: false,
      revokeAccessTokenOnSignout: true,
      // Production settings
      loadUserInfo: false,
      checkSessionInterval: 0,
      silentRequestTimeoutInSeconds: 30,
      // Explicit endpoint configuration for production backend
      metadata: {
        issuer: 'https://backend.paxelia.com',
        authorization_endpoint: 'https://backend.paxelia.com/auth/authorize',
        token_endpoint: 'https://backend.paxelia.com/auth/token',
        userinfo_endpoint: 'https://backend.paxelia.com/auth/userinfo',
        end_session_endpoint: 'https://backend.paxelia.com/auth/endsession',
        revocation_endpoint: 'https://backend.paxelia.com/auth/revoke',
        response_types_supported: ['code'],
        subject_types_supported: ['public'],
        id_token_signing_alg_values_supported: ['HS256'],
        scopes_supported: ['openid', 'profile', 'email'],
        revocation_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post']
      }
    },
  ],

  // White labeling for PACS system
  whiteLabeling: {
    createLogoComponentFn: function (React) {
      return React.createElement(
        'div',
        {
          className: 'flex items-center',
        },
        [
          React.createElement('img', {
            key: 'logo',
            src: './ohif-logo.svg',
            className: 'w-8 h-8 mr-2',
          }),
          React.createElement(
            'span',
            {
              key: 'title',
              className: 'text-white text-lg font-semibold',
            },
            'PAXELIA Viewer'
          ),
        ]
      );
    },
  },

  // Study prefetcher configuration
  studyPrefetcher: {
    enabled: true,
    maxNumPrefetchRequests: 5,
  },

  // Custom hotkeys for PACS workflow
  hotkeys: [
    {
      commandName: 'toggleCinePlay',
      label: 'Toggle Cine Play',
      keys: ['space'],
    },
    {
      commandName: 'resetViewport',
      label: 'Reset Viewport',
      keys: ['r'],
    },
    {
      commandName: 'nextImage',
      label: 'Next Image',
      keys: ['ArrowDown', 's'],
    },
    {
      commandName: 'previousImage',
      label: 'Previous Image',
      keys: ['ArrowUp', 'w'],
    },
  ],
};