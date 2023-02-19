import { StackScreenProps } from '@react-navigation/stack';
import { Box } from 'native-base';
import React from 'react';
import { Button } from 'react-native';
import { translate } from '../../../helpers/i18n';
import { AuthStackParams } from './AuthStack';

interface Props extends StackScreenProps<AuthStackParams, 'Landing'> {}

export const Landing = ({ route, navigation }: Props) => {
  return (
    <Box alignItems="center" justifyContent="center" flex={1}>
      <Button
        onPress={() => navigation.navigate('Login')}
        title={translate('commons.start')}
      />
    </Box>
  );
};
