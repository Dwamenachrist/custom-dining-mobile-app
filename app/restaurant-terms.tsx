import { View, Text, Image, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function RestaurantTermsScreen() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa', paddingTop: 25 }}>
            {/* Logo Section */}
            <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Image 
                            source={require('../assets/icon.png')} 
                            style={styles.logoImage} 
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.logoText}>Custom <Text style={styles.logoTextGold}>Dining</Text></Text>
                </View>

                {/* Main Title */}
                <Text style={styles.mainTitle}>Terms and Conditions For Onboarding Restaurants On Custom Dining.</Text>
                
                <Text style={styles.intro}>
                    These terms and conditions govern the relationship between the Custom Dining (the platform) and the restaurants (the partner restaurants).
                </Text>

            <ScrollView contentContainerStyle={styles.scrollContainer}>

                

                {/* Section 1 */}
                <Text style={styles.sectionHeader}>1. Definitions:</Text>
                <Text style={styles.body}>
                    <Text style={styles.bold}>Platform:</Text> Custom Dining, the digital service that connects users / customers with partner restaurants offering healthy meals suitable to meet your health needs.{'\n\n'}
                    <Text style={styles.bold}>Partner Restaurants:</Text> The business entities or restaurants that agrees to list and sell its food items on the platform.{'\n\n'}
                    <Text style={styles.bold}>Customers/Users:</Text> End-users who place their orders through the platform.{'\n\n'}
                    <Text style={styles.bold}>Menu Compliance:</Text> The nutritional and quality standards as defined by the platform.
                </Text>

                {/* Section 2 */}
                <Text style={styles.sectionHeader}>2. Eligibility and Onboarding:</Text>
                <Text style={styles.body}>
                    Restaurants must be legally registered and possess all required health, safety, and food handling licenses.{'\n\n'}
                    The onboarding process includes:{'\n'}
                    • Submission of business registration and food licenses.{'\n'}
                    • Menu and nutritional information review.{'\n'}
                    • Health certification; e.g., low sodium, plant-based options. (optional).
                </Text>

                {/* Section 3 */}
                <Text style={styles.sectionHeader}>3. Menu and Product Guidelines:</Text>
                <Text style={styles.body}>
                    Partner Restaurants must offer items that meet the Platform's health standards, such as:{'\n'}
                    • Clearly labeled nutritional information (calories, allergens, etc).{'\n'}
                    • Options for special diets (vegan, gluten-free, low carb, etc.).{'\n'}
                    • Any change to the menu must be communicated and approved by the platform.
                </Text>

                {/* Section 4 */}
                <Text style={styles.sectionHeader}>4. Quality Assurance and Food Safety:</Text>
                <Text style={styles.body}>
                    • Partner restaurants must always maintain consistent food quality and hygiene.{'\n'}
                    • Compliance checks maybe conducted periodically.{'\n'}
                    • Any health or safety violations may result in temporary suspension or removal from the platform.
                </Text>

                {/* Section 5 */}
                <Text style={styles.sectionHeader}>5. Order Management:</Text>
                <Text style={styles.body}>
                    • Restaurants must confirm and fulfill orders within the time-frames specified.{'\n'}
                    • Cancellation of orders should be minimized and reported with a valid reason.{'\n'}
                    • Accurate status updates on order preparation and delivery are mandatory.
                </Text>

                {/* Section 6 */}
                <Text style={styles.sectionHeader}>6. Fees and Payments:</Text>
                <Text style={styles.body}>
                    • The platform may charge a commission fee (% of each transaction).{'\n'}
                    • Payouts will be made on a [weekly/biweekly/monthly] basis, less any applicable fees.{'\n'}
                    • Restaurants are responsible for local tax reporting and compliance.
                </Text>

                {/* Section 7 */}
                <Text style={styles.sectionHeader}>7. Promotions and Marketing:</Text>
                <Text style={styles.body}>
                    • The platform may run promotional campaigns; participation is optional but may require discount offerings.{'\n'}
                    • Restaurants may not misrepresent their promotional prices or offerings.
                </Text>

                {/* Section 8 */}
                <Text style={styles.sectionHeader}>8. Intellectual Property:</Text>
                <Text style={styles.body}>
                    • Partner restaurants grant the platform rights to use logos, images, and menu items for promotional purposes.{'\n'}
                    • All proprietary recipes and internal branding remain the property of the restaurants.
                </Text>

                {/* Section 9 */}
                <Text style={styles.sectionHeader}>9. Customer / User Feedback and Review:</Text>
                <Text style={styles.body}>
                    • Customers/users can rate and review restaurants.{'\n'}
                    • The platform reserves the right to moderate and display feedback.{'\n'}
                    • Repeated negative review may prompt quality audits.
                </Text>

                {/* Section 10 */}
                <Text style={styles.sectionHeader}>10. Data Privacy:</Text>
                <Text style={styles.body}>
                    • Both parties agree to comply with data protection laws.{'\n'}
                    • The platform may use restaurant data for analytics but will not share it with third parties.
                </Text>

                {/* Section 11 */}
                <Text style={styles.sectionHeader}>11. Termination:</Text>
                <Text style={styles.body}>
                    • Either parties may terminate the agreement with [30 days] written notice.{'\n'}
                    • The platform may suspend services immediately in case of:{'\n'}
                    &nbsp;&nbsp;- Repeated health violations.{'\n'}
                    &nbsp;&nbsp;- Fraudulent behavior.{'\n'}
                    &nbsp;&nbsp;- Breach of terms.
                </Text>

                {/* Section 12 */}
                <Text style={styles.sectionHeader}>12. Dispute Resolution:</Text>
                <Text style={styles.body}>
                    Disputes will be resolved through [mediation/arbitration/legal courts] located in [jurisdiction].
                </Text>

                {/* Section 13 */}
                <Text style={styles.sectionHeader}>13. Governing Law:</Text>
                <Text style={styles.body}>
                    These terms are governed by the laws of the federal republic of Nigeria.
                </Text>

                {/* Section 14 */}
                <Text style={styles.sectionHeader}>14. Agreement:</Text>
                <Text style={styles.body}>
                    By signing up and accepting these terms digitally, the Partner Restaurant agrees to comply fully with the outlined terms and conditions and also operate within the Custom Dining Platform's ecosystem.
                </Text>

                <Text style={styles.contactInfo}>
                    For questions or issues, contact us at:{'\n'}
                    <Text style={styles.email}>help@customdining.ng</Text>
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 20,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    logoImage: {
        width: 50,
        height: 50,
    },
    logoText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    logoTextGold: {
        color: '#FFD700',
    },
    mainTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.secondary,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24,
    },
    intro: {
        fontSize: 14,
        color: colors.darkGray,
        lineHeight: 20,
        marginBottom: 25,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.secondary,
        marginTop: 20,
        marginBottom: 10,
    },
    body: {
        fontSize: 14,
        color: colors.darkGray,
        lineHeight: 22,
        marginBottom: 8,
    },
    bold: {
        fontWeight: 'bold',
        color: colors.secondary,
    },
    contactInfo: {
        fontSize: 14,
        color: colors.darkGray,
        lineHeight: 20,
        marginTop: 30,
        textAlign: 'center',
    },
    email: {
        color: colors.primary,
        fontWeight: 'bold',
    },
});