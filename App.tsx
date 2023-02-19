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

const LOCALIZATION_EVENT = 'change';

function App(): JSX.Element {
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
      <RootNavigator />
    </NativeBaseProvider>
  );
}

export default App;
