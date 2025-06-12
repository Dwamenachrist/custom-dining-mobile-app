import { View, Text, Image, StyleSheet } from 'react-native';

export default function GreetingHeader({ name }: { name: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Good morning, {name}</Text>
      <View style={styles.rightSection}>
        <Image source={require('../assets/notification.png')} 
          style={styles.icon}
        />
      <Image source={require('../assets/profile.png')} style={styles.avatar} /> 
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 12,
    resizeMode: 'contain',
  },
});