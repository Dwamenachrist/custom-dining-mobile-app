import { View, Text, Image, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function TermsScreen() {
    return (
        <SafeAreaView style={{ flex: 1, marginTop: 60 }}>
            <View style={styles.logoContainer}>
                    <Image source={require('../assets/terms.png')} style={{ width: 150, height: 150, marginTop: 10 }} />
                </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.header}>Terms & Conditions</Text>
                <Text style={styles.subtle}>Effective Date: July 1st 2025</Text>
                <Text style={styles.subtle}>Last Updated: June 10th 2025</Text>

                <Text style={styles.sectionHeader}>Acceptance of Terms</Text>
                <Text style={styles.body}>By downloading, accessing, or using the Custom Dining mobile application, you agree to be bound by these Terms and Conditions. If you do not agree, do not use the app.</Text>

                <Text style={styles.sectionHeader}>Eligibility</Text>
                <Text style={styles.body}>You must be at least 18 years old to register and use the app. By registering, you confirm that all information provided is accurate and complete.</Text>

                <Text style={styles.sectionHeader}>Intellectual property</Text>
                <Text style={styles.body}>All content and trademarks in the app are owned by Custom Dining. Unauthorized use, reproduction, or distribution is prohibited.</Text>

                <Text style={styles.sectionHeader}>Account Suspension or Termination</Text>
                <Text style={styles.body}>We reserve the right to suspend or terminate accounts that violate these Terms.</Text>

                <Text style={styles.header}>Privacy Policy</Text>
                <Text style={styles.subtle}>Effective Date: July 1st 2025</Text>
                <Text style={styles.subtle}>Last Updated: June 10th 2025</Text>

                <Text style={styles.sectionHeader}>We collect the following user and restaurant data:</Text>
                <Text style={styles.body}>Users: Name, email, dietary preferences, location, order history.{"\n"}Restaurants: Name, contact info, menu details, operational location.</Text>

                <Text style={styles.sectionHeader}>How We Use Your Data</Text>
                <Text style={styles.body}>To personalize meal recommendations.{"\n"}To process and manage orders.{"\n"}To improve app features and performance.{"\n"}For customer support and communication.</Text>

                <Text style={styles.sectionHeader}>Data Sharing</Text>
                <Text style={styles.body}>We may share limited data:{"\n"}With partner restaurants for order processing.{"\n"}With third-party services (e.g., payment or delivery systems).{"\n"}Only when required by law or to protect users and our platform.</Text>

                <Text style={styles.sectionHeader}>Cookies and Tracking</Text>
                <Text style={styles.body}>We use cookies and analytics to enhance user experience and app performance. You may adjust permissions in your device settings.</Text>

                <Text style={[styles.body]}>For questions or issues, contact us at:{"\n"}<Text style={[styles.email, { marginBottom: 20 }]}>help@customdining.ng</Text></Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        paddingHorizontal: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },
    logoText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
        marginBottom: 12,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.secondary,
        marginVertical: 10,
        textAlign: 'left',
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.secondary,
        marginTop: 16,
        marginBottom: 4,
    },
    subtle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 2,
    },
    body: {
        fontSize: 14,
        color: colors.darkGray,
        marginBottom: 8,
    },
    email: {
        color: colors.primary,
        fontWeight: 'bold',
    },
});