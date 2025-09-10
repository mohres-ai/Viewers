/** @type {AppTypes.Config} */
window.config = {
  name: 'config/local_pacs.js',
  routerBasename: null,
  extensions: [],
  modes: [],
  customizationService: {},
  showStudyList: true,
  maxNumberOfWebWorkers: 3,
  showWarningMessageForCrossOrigin: false, // Disabled for local development
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
  defaultDataSourceName: 'local_pacs',
  dataSources: [
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'local_pacs',
      configuration: {
        friendlyName: 'Local PACS Backend Server',
        name: 'PAXELIA PACS',
        // Main DICOMweb endpoints pointing to our FastAPI backend
        qidoRoot: 'http://localhost:8000/api/v1/qido-rs',
        wadoRoot: 'http://localhost:8000/api/v1/wado-rs',
        stowRoot: 'http://localhost:8000/api/v1/stow-rs',
        
        // Authentication enabled
        requestOptions: {
          auth: {
            type: 'bearer',
          }
        },
        
        // Backend capabilities
        qidoSupportsIncludeField: true,
        supportsReject: false, // Not implemented yet
        supportsStow: true, // Our STOW-RS implementation
        dicomUploadEnabled: true,
        
        // Image rendering options
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        
        // Performance and features
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: true,
        supportsWildcard: false,
        staticWado: false, // Dynamic WADO server
        singlepart: 'video',
        
        // Bulk data handling
        bulkDataURI: {
          enabled: true,
          relativeResolution: 'studies',
        },
        
        // DICOM compliance
        omitQuotationForMultipartRequest: false,
        
        // CORS handling for local development
        requestHeaders: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      },
    },
    
    // Demo data source commented out to force local PACS usage
    // {
    //   namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
    //   sourceName: 'demo',
    //   configuration: {
    //     friendlyName: 'Demo AWS S3 Static Server',
    //     name: 'aws',
    //     wadoUriRoot: 'https://d14fa38qiwhyfd.cloudfront.net/dicomweb',
    //     qidoRoot: 'https://d14fa38qiwhyfd.cloudfront.net/dicomweb',
    //     wadoRoot: 'https://d14fa38qiwhyfd.cloudfront.net/dicomweb',
    //     qidoSupportsIncludeField: false,
    //     imageRendering: 'wadors',
    //     thumbnailRendering: 'wadors',
    //     enableStudyLazyLoad: true,
    //     supportsFuzzyMatching: true,
    //     supportsWildcard: false,
    //     staticWado: true,
    //     singlepart: 'bulkdata,video',
    //     bulkDataURI: {
    //       enabled: true,
    //       relativeResolution: 'studies',
    //       transform: url => url.replace('/pixeldata.mp4', '/rendered'),
    //     },
    //     omitQuotationForMultipartRequest: true,
    //   },
    // },
    
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
      // Could redirect to login page or show authentication modal
    }
    
    // Handle backend errors
    if (error.status >= 500) {
      console.error('Backend server error - check PACS backend status');
    }
    
    // Handle CORS errors for development
    if (error.status === 0) {
      console.warn('CORS error - ensure backend CORS is configured for frontend origin');
    }
  },
  
  // Authentication configuration
  oidc: [
    {
      authority: 'http://localhost:8000',
      client_id: 'ohif-pacs-viewer',
      redirect_uri: 'http://localhost:3000/callback',
      response_type: 'code',
      scope: 'openid profile email',
      post_logout_redirect_uri: 'http://localhost:3000/',
      silent_redirect_uri: 'http://localhost:3000/silent-refresh.html',
      automaticSilentRenew: false,
      revokeAccessTokenOnSignout: true,
      // Additional settings for stability
      loadUserInfo: false, // Disable to avoid extra requests
      checkSessionInterval: 0, // Disable check session
      silentRequestTimeoutInSeconds: 30,
      // Explicit endpoint configuration to avoid discovery
      metadata: {
        issuer: 'http://localhost:8000',
        authorization_endpoint: 'http://localhost:8000/auth/authorize',
        token_endpoint: 'http://localhost:8000/auth/token',
        userinfo_endpoint: 'http://localhost:8000/auth/userinfo',
        end_session_endpoint: 'http://localhost:8000/auth/endsession',
        revocation_endpoint: 'http://localhost:8000/auth/revoke',
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