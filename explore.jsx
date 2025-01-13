import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from './../../constants/Colors'; // Adjust path as needed
import { Ionicons } from '@expo/vector-icons'; // For the search icon

const exploreData = [
  { id: '1', name: 'Car', icon: require('./../../assets/images/car.png'), route: '/car' },
  { id: '2', name: 'Laptop', icon: require('./../../assets/images/laptop.png'), route: '/LaptopPriceForm' },
  { id: '3', name: 'House', icon: require('./../../assets/images/house.png'), route: '/house' },
  { id: '4', name: 'Motorcycles', icon: require('./../../assets/images/motorcycles.png'), route: '/motorcycles' },
  { id: '5', name: 'Furniture', icon: require('./../../assets/images/furniture.png'), route: '/furniture' },
  { id: '6', name: 'Smartphones', icon: require('./../../assets/images/smartphones.png'), route: '/smartphones' },
  { id: '7', name: 'Equipments', icon: require('./../../assets/images/equipment.png'), route: '/equipments' },
  { id: '8', name: 'RealEstate', icon: require('./../../assets/images/real_estates.png'), route: '/realestate' },
  { id: '9', name: 'Art', icon: require('./../../assets/images/art.png'), route: '/art' },
];

export default function Explore() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(exploreData);

  // Function to handle search input
  const handleSearch = (text) => {
    setSearchQuery(text);

    // Filter data based on search input
    const filtered = exploreData.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredData(filtered);
  };

  // Function to handle card press
  const handleCardPress = (route) => {
    console.log(`Navigating to ${route}`);
    router.push(route);
  };

  // Render each card
  const renderCard = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleCardPress(item.route)}>
      <Image source={item.icon} style={styles.cardIcon} />
      <Text style={styles.cardText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={24} color={Colors.GRAY} style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search"
          placeholderTextColor={Colors.GRAY}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Categories Grid */}
      {filteredData.length > 0 ? (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          numColumns={2} // Two cards per row
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No categories found.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: Colors.LIGHT_GRAY,
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    marginBottom: 20,
  },
  searchIcon: {
    marginLeft: 15,
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    height: 50,
    fontSize: 16,
    fontFamily: 'outfit-Medium',
    paddingHorizontal: 10,
  },
  gridContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    paddingVertical: 25,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  cardIcon: {
    width: 70,
    height: 70,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    fontFamily: 'outfit-Bold',
    color: '#333333',
    textAlign: 'center',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  noResultsText: {
    fontSize: 18,
    fontFamily: 'outfit-Medium',
    color: Colors.GRAY,
  },
});
