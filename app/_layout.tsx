import React from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Text } from 'react-native';

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        'outfit': require('./../assets/fonts/Outfit-Regular.ttf'),
        'outfit-Black': require('./../assets/fonts/Outfit-Black.ttf'),
        'outfit-Bold': require('./../assets/fonts/Outfit-Bold.ttf'),
        'outfit-ExtraBold': require('./../assets/fonts/Outfit-ExtraBold.ttf'),
        'outfit-ExtraLight': require('./../assets/fonts/Outfit-ExtraLight.ttf'),
        'outfit-Light': require('./../assets/fonts/Outfit-Light.ttf'),
        'outfit-Medium': require('./../assets/fonts/Outfit-Medium.ttf'),
        'outfit-SemiBold': require('./../assets/fonts/Outfit-SemiBold.ttf'),
        'outfit-Thin': require('./../assets/fonts/Outfit-Thin.ttf'),
    });

    if (!fontsLoaded) {
        return <Text>Loading...</Text>; // Placeholder while fonts are loading
    }

    return (
        <>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="login" />
                <Stack.Screen name="signup" />
                <Stack.Screen name="(tabs)" />
            </Stack>
        </>
    );
}
