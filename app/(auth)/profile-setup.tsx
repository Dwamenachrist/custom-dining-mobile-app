import React from "react";
import { View, Text, ScrollView,TouchableOpacity, TextInput, Pressable, Alert,Image } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';
import { useState,useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from "~/components/Button";
import { launchImageLibrary } from "react-native-image-picker";
import { launchCamera } from "react-native-image-picker";
import { router } from "expo-router";
import { Checkbox } from "react-native-paper";
import { DropdownInput } from "~/components/DropdownInput";
import * as ImagePicker from 'expo-image-picker';




export default function ProfileScreen() {

  const [profileName , setProfileName] = useState('')
  const [profileAge , setProfileAge] = useState('')
  const [profileGender , setProfileGender] = useState('')
  const [goal , setGoal] = useState('')
  const [image , setImage] = useState('')
  const [selectedPreference, setSelectedPreference] = useState('');


  const handleProfile = async()=>{
    try{
   await AsyncStorage.setItem('profileName',profileName),
   await AsyncStorage.setItem('goal',goal),
   await AsyncStorage.setItem('profileAge',profileAge),
   await AsyncStorage.setItem('profileGender',profileGender);
   Alert.alert('Profie Saved');
   //router.push('/(tabs)/home')
    }
    catch (error){
      console.error('Error saving info',error)
    }
  }

  const handlePreferenceSelect = async (preference :string) => {
    setSelectedPreference(preference);
    try {
      await AsyncStorage.setItem('dietaryPreference', preference);
      // Also update the dietary preferences object
      const dietaryPreferences = {
        vegan: preference === 'vegan',
        lowSugar: preference === 'lowSugar',
        lowCarb: preference === 'lowCarb'
      };
      await AsyncStorage.setItem('dietaryPreferences', JSON.stringify(dietaryPreferences));
    } catch (error) {
      console.error('Error saving dietary preference:', error);
    }
  };

  
  const healthGoals = [
    'Weight Loss',
    'Muscle Gain',
    'Maintain Weight',
    'Improve Fitness',
  ];

 
  const pickImage = async (source:any) => {
    try {
      let result;
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Sorry, we need camera permissions to make this work!');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      }

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        // Optionally save the image URI to AsyncStorage
        try {
          await AsyncStorage.setItem('profileImage', result.assets[0].uri);
        } catch (error) {
          console.error('Error saving image URI:', error);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Choose Image Source',
      'Select where you want to get the image from',
      [
        {
          text: 'Camera',
          onPress: () => pickImage('camera'),
        },
        {
          text: 'Gallery',
          onPress: () => pickImage('gallery'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{flex:1,backgroundColor:"#F7F5F0"}}>
        <Pressable onPress={()=>{router.navigate('/home')}}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </Pressable>
        <View style={{marginBottom:30}}>
          <Text style={{fontFamily:'SemiBold',textAlign:'center',fontWeight:'700',fontSize:18,color:"#333333"}}>Customized Profile</Text>
        </View>
        <ScrollView  style={{padding:"4%"}}>
           <View style={{}}>
                  
                  <TouchableOpacity 
                    onPress={showImagePickerOptions}
                    style={{
                      width: 150,
                      height: 150,
                      backgroundColor: image ? 'transparent' : "#008000",
                      alignSelf: 'center',
                      borderRadius: 100,
                      overflow: 'hidden',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      {image ? (
                        <Image 
                          source={{ uri: image }} 
                          style={{ width: '100%', height: '100%' }}
                        />
                      ) : (
                        <Text style={{textAlign:'center',color:'white'}}>Add Photo</Text>
                      )}
                  </TouchableOpacity>
            </View>

            <View>
              <Text></Text>
            </View>

            <View style={{marginTop:30}}>
              <TextInput style={{height:45,width:358,padding:8,borderRadius:4,color:"#F7F5F0",backgroundColor:"#FFFFFF"}} placeholder="Name" placeholderTextColor={("#778089")} onChangeText={setProfileName}/>
              <TextInput style={{height:45,width:358,padding:8,borderRadius:4,color:"#F7F5F0",backgroundColor:"#FFFFFF",marginTop:10}} placeholder="Age" placeholderTextColor={("#778089")} onChangeText={setProfileAge}/>
              <TextInput style={{height:45,width:358,padding:8,borderRadius:4,color:"#F7F5F0",backgroundColor:"#FFFFFF",marginTop:10}}placeholder="Gender" placeholderTextColor={("#778089")} onChangeText={setProfileGender}/>
            </View>

            <View style={{marginTop:30}}>
              <Text style={{fontFamily:'PoppinsBold',fontWeight:'700',fontSize:18}}>Health Goal</Text>
              <View style={{marginTop:15}}>
                <DropdownInput
                  value={goal}
                  onChangeText={setGoal}
                  placeholder="Select Goal"
                  items={healthGoals}
                />
              </View> 
            </View>

            <View style={{marginTop:30}}>
              <Text style={{fontFamily:'PoppinsBold',fontSize:18,fontWeight:'700',marginBottom:15}}>Dietary Preferences</Text>
              <TouchableOpacity 
                style={{flexDirection:'row',marginTop:5}}
                onPress={() => handlePreferenceSelect('vegan')}
              >
                <MaterialCommunityIcons 
                  name={selectedPreference === 'vegan' ? "checkbox-marked" : "checkbox-blank-outline"} 
                  size={35} 
                  color="black" 
                />
                <Text style={{fontWeight:'400',fontSize:16,fontFamily:'PoppinsRegular',marginLeft:10}}>Vegan</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{flexDirection:'row',marginTop:5}}
                onPress={() => handlePreferenceSelect('lowSugar')}
              >
                <MaterialCommunityIcons 
                  name={selectedPreference === 'lowSugar' ? "checkbox-marked" : "checkbox-blank-outline"} 
                  size={35} 
                  color="black" 
                />
                <Text style={{fontWeight:'400',fontSize:16,fontFamily:'PoppinsRegular',marginLeft:10}}>Low - Sugar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{flexDirection:'row',marginTop:5}}
                onPress={() => handlePreferenceSelect('lowCarb')}
              >
                <MaterialCommunityIcons 
                  name={selectedPreference === 'lowCarb' ? "checkbox-marked" : "checkbox-blank-outline"} 
                  size={35} 
                  color="black" 
                />
                <Text style={{fontWeight:'400',fontSize:16,fontFamily:'PoppinsRegular',marginLeft:10}}>Low - Carb</Text>
              </TouchableOpacity>
            </View>

            <View className="mt-4">
              <Button 
              title={'Save'} 
              variant="primary" 
              onPress={handleProfile}
              />
            </View>
        </ScrollView>
    </SafeAreaView>
  );
} 