import React from 'react';
import { Button, Text } from 'react-native';
import { translate } from '../../../helpers/i18n';

export const Landing = () => {
  return <Button title={translate('hello')} />;
};
