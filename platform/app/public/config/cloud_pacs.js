/** @type {AppTypes.Config} */
window.config = {
  name: 'config/cloud_pacs.js',
  routerBasename: null,
  extensions: [],
  modes: [],
  customizationService: {},
  showStudyList: true,
  maxNumberOfWebWorkers: 3,
  showWarningMessageForCrossOrigin: false, // Disabled for cloud deployment
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
  defaultDataSourceName: 'cloud_pacs',
  dataSources: [
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'cloud_pacs',
      configuration: {
        friendlyName: 'PAXELIA Cloud PACS Server',
        name: 'PAXELIA PACS',
        // Main DICOMweb endpoints pointing to cloud backend
        qidoRoot: 'https://paxelia-925088117749.me-central1.run.app/api/v1/qido-rs',
        wadoRoot: 'https://paxelia-925088117749.me-central1.run.app/api/v1/wado-rs',
        stowRoot: 'https://paxelia-925088117749.me-central1.run.app/api/v1/stow-rs',

        // Authentication enabled for cloud deployment
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
      console.error('Backend server error - check cloud PACS backend status');
    }

    // Handle CORS errors
    if (error.status === 0) {
      console.warn('CORS error - ensure cloud backend CORS is configured for frontend origin');
    }
  },

  // Authentication configuration for cloud deployment
  oidc: [
    {
      authority: 'https://paxelia-925088117749.me-central1.run.app',
      client_id: 'ohif-pacs-viewer',
      redirect_uri: 'http://localhost:3000/callback', // Still localhost since frontend runs locally
      response_type: 'code',
      scope: 'openid profile email',
      post_logout_redirect_uri: 'http://localhost:3000/',
      silent_redirect_uri: 'http://localhost:3000/silent-refresh.html',
      automaticSilentRenew: false,
      revokeAccessTokenOnSignout: true,
      // Optimized settings for cloud deployment
      loadUserInfo: false,
      checkSessionInterval: 0,
      silentRequestTimeoutInSeconds: 30,
      // Explicit endpoint configuration for cloud backend
      metadata: {
        issuer: 'https://paxelia-925088117749.me-central1.run.app',
        authorization_endpoint: 'https://paxelia-925088117749.me-central1.run.app/auth/authorize',
        token_endpoint: 'https://paxelia-925088117749.me-central1.run.app/auth/token',
        userinfo_endpoint: 'https://paxelia-925088117749.me-central1.run.app/auth/userinfo',
        end_session_endpoint: 'https://paxelia-925088117749.me-central1.run.app/auth/endsession',
        revocation_endpoint: 'https://paxelia-925088117749.me-central1.run.app/auth/revoke',
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
            'PAXELIA Cloud Viewer'
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