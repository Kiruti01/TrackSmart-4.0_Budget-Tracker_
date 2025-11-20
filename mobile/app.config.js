export default {
  expo: {
    name: 'TrackSmart',
    slug: 'tracksmart-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.tracksmart.mobile',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.tracksmart.mobile',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    scheme: 'tracksmart',
    plugins: ['expo-router'],
    extra: {
      eas: {
        projectId: 'your-project-id',
      },
    },
  },
};
