/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import * as RNLocalize from 'react-native-localize';
import { useColorScheme } from 'react-native';
import { setI18nConfig } from './src/helpers/i18n';
import { RootNavigator } from './src/routes/RootNavigator';
import { NativeBaseProvider } from 'native-base';
import { useNetInfo } from '@react-native-community/netinfo';
import { BannerConnection } from './src/components/organisms';

const LOCALIZATION_EVENT = 'change';

function App(): JSX.Element {
  const { isConnected, isInternetReachable } = useNetInfo();
  const isDarkMode = useColorScheme() === 'dark';

  setI18nConfig();

  useEffect(() => {
    // Listen for system locale changes, and update configuration accordingly.
    RNLocalize.addEventListener(LOCALIZATION_EVENT, setI18nConfig);

    return () => {
      RNLocalize.removeEventListener(LOCALIZATION_EVENT, setI18nConfig);
    };
  }, []);

  return (
    <NativeBaseProvider>
      <>
        {!isConnected && <BannerConnection />}
        <RootNavigator />
      </>
    </NativeBaseProvider>
  );
}

export default App;
