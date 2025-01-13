import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token'); // Check if token exists
        if (token) {
          setIsLoggedIn(true);
          router.navigate('/(tabs)/home'); // Redirect to home if logged in
        } else {
          setIsLoggedIn(false); // Stay on the entry screen if not logged in
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };

    checkLoginStatus(); // Run the check when the component mounts
  }, []);

  const onContinue = () => {
    router.navigate("/login"); // Navigate to the login screen
  };

  // If the user is logged in, nothing is rendered on this screen
  if (isLoggedIn) {
    return null; // Home screen is already shown
  }
  
  return (
    <View style={styles.container}>
      <View>
      <Image 
        source={require("../assets/images/logo_image-removebg-preview.png")} 
        style={styles.image}
      />
      </View>
      <View>
        <Text style={{
           fontSize:24,
           fontFamily:'outfit-Bold',
           textAlign:'center',
        }}>Discover the 
        <Text style={{color:'#6C63FF'}}> True Worth </Text>of Your Mobile Asset</Text>
      </View>
      <TouchableOpacity style={styles.btn} onPress={onContinue}>
                    <Text style={{
                        textAlign:'center',
                        color:'white',
                        fontFamily:'outfit'
                    }}>Let's Get Started</Text>
                </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensures the container takes up the full screen
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center', // Centers content horizontally
    backgroundColor: '#fff', // Optional background color
    padding: 16, // Padding to give space around the content
  },
  image: {
    marginTop:20,
   // width: 250, // You can adjust this size
    //height: 250, // Adjust the size of the image
    marginBottom: 30, // Adds space between the image and the button
  },
  btn: {
    marginTop: 20,
      fontSize: 18,
      fontFamily: 'outfit-Bold',
      color: '#fff',
      backgroundColor: '#6C63FF',
      paddingHorizontal: 30,
      paddingVertical: 10,
      width:300,
      borderRadius: 10,
      overflow: 'hidden',
      textAlign: 'center',
  }
});

export default Index;
