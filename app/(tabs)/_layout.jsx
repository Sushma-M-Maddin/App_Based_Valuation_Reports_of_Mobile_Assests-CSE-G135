import { View, Text } from 'react-native'
import React from 'react'
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router'

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown:false,
      tabBarActiveTintColor: '#6C63FF',
      tabBarInactiveTintColor: 'gray'
    }}>
      <Tabs.Screen name='home'
      options={{
        tabBarLabel:'Home',
        tabBarIcon:({color})=><Feather name="home" 
        size={24} color={color} />
      }}/>
      <Tabs.Screen name='explore'
      options={{
        tabBarLabel:'Explore',
        tabBarIcon:({color})=><AntDesign name="plus" 
        size={24} color={color} />
      }}/>
      
      <Tabs.Screen name='profile'
      options={{
        tabBarLabel:'Profile',
        tabBarIcon:({color})=><Ionicons name="person-outline"  // "people-outline"
        size={24} color={color}  />
      }}/>
    </Tabs>
  )
}