import { View, Text, Image, StyleSheet, TouchableOpacity,Alert ,Modal} from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function Profile() {
  const [user, setUser] = useState({ name: '', email: '' });
  const [image, setImage] = useState(null);  // State to store the image URI
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch user data from AsyncStorage when the component mounts
    const getUserData = async () => {
      try {
        const name = await AsyncStorage.getItem('userName');
        const email = await AsyncStorage.getItem('userEmail');
        if (name && email) {
          setUser({ name, email });
        }
      } catch (error) {
        console.error('Error fetching user data from AsyncStorage', error);
      }
    };

    getUserData();
  }, []);

  // Function to pick an image from the gallery
  const pickImage = async () => {
    setModalVisible(false);
    // Request permission to access media library
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access media library is required!');
      return;
    }

    // Open the image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],  // Crop the image to a square if you like
      quality: 1,  // Max quality
    });

    if (!result.canceled) {
      console.log('Image selected:', result.assets[0].uri); // Access the URI of the selected image
      setImage(result.assets[0].uri);  // Set the picked image URI
    }
  };

  // Function to take a photo using the camera
  const takePhoto = async () => {
    setModalVisible(false);
    // Request permission to use the camera
    let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access the camera is required!');
      return;
    }
    // Open the camera to take a photo
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],  // Crop the image to a square if you like
      quality: 1,  // Max quality
    });
    if (!result.canceled) {
      console.log('Photo taken:', result.assets[0].uri);  // Access the URI of the taken photo
      setImage(result.assets[0].uri);  // Set the taken photo URI
    } else {
      console.log('Camera canceled');
    }
  };

  // Function to show an alert to pick an image or take a photo
  const chooseImageSource = () => {
      setModalVisible(true); // Open the modal unconditionally
    
  };

  // Function to delete the selected image
  const deleteImage = () => {
    setImage(null); // Reset image state to null
    setModalVisible(false); // Close the modal
  };


  const logout = async () => {
    try {
      // Clear user data from AsyncStorage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userName');
      await AsyncStorage.removeItem('userEmail');
      Alert.alert('Logged Out', 'You have successfully logged out');
      // Reset navigation stack and navigate to the login screen (index.tsx or similar)
      router.push("/login");
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error during logout');
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.profileContainer}>
        {/* TouchableOpacity allows the user to pick or take a photo */}
        <TouchableOpacity onPress={chooseImageSource}>
          <Image
            source={image ? { uri: image } : require('../../assets/images/profile_pic.jpg')}  // Show picked or default image
            style={styles.profileImage}
          />
        </TouchableOpacity>
        
        <Text style={styles.username}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>

        {/* Logout Button */}
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
       {/* Custom Modal for Alert Box */}
       <Modal
  animationType="slide"
  transparent={true}
  visible={modalVisible}
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      {image && ( // Only show "Delete Image" option if an image exists
        <TouchableOpacity style={styles.modalButton} onPress={deleteImage}>
          <AntDesign name="delete" size={24} color="black" />
          <Text style={styles.modalButtonText}>Delete Image</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
        <AntDesign name="picture" size={24} color="black" />
        <Text style={styles.modalButtonText}>Pick from Gallery</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.modalButton} onPress={takePhoto}>
      <Feather name="camera" size={24} color="black" />
        <Text style={styles.modalButtonText}>Take a Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.modalButton]}
        onPress={() => setModalVisible(false)}
      >
        <MaterialCommunityIcons name="cancel" size={24} color="black" />
        <Text style={styles.modalButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 42,
    fontFamily: 'outfit-Bold',
    //marginTop: 5,
  },
  profileContainer: {
    display: 'flex',
    alignItems: 'center',
    marginVertical: 25,
  },
  profileImage: {
    width: 100,  // Adjust the size of the profile image
    height: 100,
    borderRadius: 50,  // Circular profile image
  },
  username: {
    fontFamily: 'outfit-Bold',
    fontSize: 20,
    marginTop: 10,
  },
  email: {
    fontFamily: 'outfit',
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
    marginTop:50
  },
  logoutText: {
    textAlign:'center',
    color:'white',
    fontFamily:'outfit'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparent black background
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#6C63FF',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF6C63',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6C63FF',
    fontSize: 16,
  },
});
