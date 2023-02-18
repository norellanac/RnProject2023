/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import * as RNLocalize from 'react-native-localize';
import {
  SafeAreaView,
  StyleSheet,
  Button,
  useColorScheme,
  View,
  Text,
} from 'react-native';
import { setI18nConfig, translate } from './src/helpers/i18n';
import { RootNavigator } from './src/routes/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}

export default App;
