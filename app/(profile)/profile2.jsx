/*import { View, Text } from 'react-native';


export default function OrderScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Order Screen</Text>
    </View>
  );
} */


import React from "react";
import { View, Text, ScrollView,TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';
import { useState,useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from "~/components/Button";
import { launchImageLibrary } from "react-native-image-picker";
import { launchCamera } from "react-native-image-picker";


export default function ProfileScreen() {

  const [profileName , setProfileName] = useState('')
  const [profileAge , setProfileAge] = useState('')
  const [profileGender , setProfileGender] = useState('')
  const [goal , setGoal] = useState('')
  const [image , setImage] = useState('')

  const handleProfile = async()=>{
    AsyncStorage.setItem('profileName',profileName),
    AsyncStorage.setItem('goal',goal)
  }

  const pickImage = () =>{
    launchImageLibrary({mediaType:'photo'},
      (response)=>{
        if (response.didCancel){console.log('you cancelled');}
          else if (response.assets && response.assets.length >0) {
            setImage(response.assets[0].uri);
          }
        }
      )
  }

  return (
    <SafeAreaView style={{flex:1,backgroundColor:'white'}}>
        <View>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </View>
        <View style={{marginBottom:30}}>
          <Text style={{fontFamily:'SemiBold',textAlign:'center',fontWeight:'700',fontSize:18,color:"#333333"}}>Customized Profile</Text>
        </View>
        <ScrollView  style={{padding:"4%"}}>
           <View style={{}}>
                  
                  <TouchableOpacity style={{width:150,height:150,backgroundColor:"#008000",alignSelf:'center',borderRadius:100}} onPress={pickImage}><Text style={{textAlign:'center',marginTop:70}}>Add Photo</Text></TouchableOpacity>
            </View>

            <View>
              <Text></Text>
            </View>

            <View style={{marginTop:30}}>
              <TextInput style={{height:45,width:358,padding:8,borderRadius:4,color:"#F7F5F0",backgroundColor:'red'}} placeholder="Name" placeholderTextColor={("#778089")} onChangeText={setProfileName}/>
              <TextInput style={{height:45,width:358,padding:8,borderRadius:4,color:"#F7F5F0",backgroundColor:'red',marginTop:10}} placeholder="Age" placeholderTextColor={("#778089")} onChangeText={setProfileAge}/>
              <TextInput style={{height:45,width:358,padding:8,borderRadius:4,color:"#F7F5F0",backgroundColor:'red',marginTop:10}}placeholder="Gender" placeholderTextColor={("#778089")} onChangeText={setProfileGender}/>
            </View>

            <View style={{marginTop:30}}>
              <Text style={{fontFamily:'PoppinsBold',fontWeight:'700',fontSize:18}}>Health Goal</Text>
              <View >
                <TextInput style={{height:45,width:358,padding:8,borderRadius:4,color:"#F7F5F0",backgroundColor:'red',marginTop:15}} placeholder="Select Goal" placeholderTextColor={("#778089")} onChangeText={setGoal}/>
                <View style={{position:'absolute',marginLeft:330,top:25}}>
                  <Entypo name="chevron-small-down" size={24} color="black" />
                </View>
              </View> 
            </View>

            <View style={{marginTop:30}}>
              <Text style={{fontFamily:'PoppinsBold',fontSize:18,fontWeight:'700',marginBottom:15}}>Dietary Preferences</Text>
              <View style={{flexDirection:'row',marginTop:5}}>
                <MaterialCommunityIcons name="checkbox-blank-outline" size={35} color="black" />
                <Text style={{fontWeight:'400',fontSize:16,fontFamily:'PoppinsRegular',marginLeft:10}}>Vegan</Text>
              </View>
              <View style={{flexDirection:'row',marginTop:5}}>
                <MaterialCommunityIcons name="checkbox-blank-outline" size={35} color="black" />
                <Text style={{fontWeight:'400',fontSize:16,fontFamily:'PoppinsRegular',marginLeft:10}}>Low - Sugar</Text>
              </View>
              <View style={{flexDirection:'row',marginTop:5}}>
                <MaterialCommunityIcons name="checkbox-blank-outline" size={35} color="black" />
                <Text style={{fontWeight:'400',fontSize:16,fontFamily:'PoppinsRegular',marginLeft:10}}>Low - Carb</Text>
              </View>
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