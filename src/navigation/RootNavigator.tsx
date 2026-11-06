import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { ReportScreen } from '../screens/ReportScreen';

const Tab = createBottomTabNavigator();

export const RootNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1B5E20',
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: {
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#ffffff',
          borderTopColor: '#e0e0e0',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName: any = 'home';
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Report') {
            iconName = focused ? 'pie-chart' : 'pie-chart-outline';
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Report"
        component={ReportScreen}
        options={{
          tabBarLabel: 'Report',
        }}
      />
    </Tab.Navigator>
  );
};
