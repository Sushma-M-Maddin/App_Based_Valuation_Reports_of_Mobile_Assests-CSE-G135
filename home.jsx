import { View} from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import Header from '../../components/Home/Header';
import Slider from '../../components/Home/Slider';
import Category from '../../components/Home/Category';
import HomeButton from '../../components/Home/HomeButton';

const router = useRouter();
const handleButton=()=>{
  router.navigate('/explore');
}
export default function home() {
  return (
    <View>
      {/* Header */}
      <Header/>

      {/* Slider */}
      <Slider/>

      {/* category */}
      <Category/>

      {/* Button to start a new valuation*/}
      <HomeButton onPress={handleButton} title="Start New Valuation" />

    </View>
  )
}