import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Button, Text } from 'react-native';
import { translate } from '../../../helpers/i18n';

export const Login = () => {
  const rootNav = useNavigation();
  return (
    <Button
      onPress={() => rootNav.navigate('Landing')}
      title={translate('auth.landing_screen.login')}
    />
  );
};
