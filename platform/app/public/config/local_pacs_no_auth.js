/** @type {AppTypes.Config} */
window.config = {
  name: 'config/local_pacs_no_auth.js',
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
        friendlyName: 'Local PACS Backend Server (No Auth)',
        name: 'PAXELIA PACS',
        // Main DICOMweb endpoints pointing to our FastAPI backend
        qidoRoot: 'http://localhost:8000/api/v1/qido-rs',
        wadoRoot: 'http://localhost:8000/api/v1/wado-rs',
        stowRoot: 'http://localhost:8000/api/v1/stow-rs',

        // Authentication DISABLED for local development
        // requestOptions: {
        //   auth: {
        //     type: 'bearer',
        //   }
        // },

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
      console.warn('Authentication required but disabled for local development');
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

  // NO OIDC configuration for local development
  // oidc: [],

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
            'PAXELIA Viewer (Local Dev)'
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