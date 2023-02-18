import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Button, Text } from 'react-native';
import { translate } from '../../../helpers/i18n';

export const Landing = () => {
  const rootNav = useNavigation();
  return (
    <Button
      onPress={() => rootNav.navigate('Login')}
      title={translate('commons.start')}
    />
  );
};
