import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { Landing } from './Landing';

const HomeStack = createStackNavigator();

export const HomeNavigation = (): React.ReactElement => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={Landing} />
    </HomeStack.Navigator>
  );
};
