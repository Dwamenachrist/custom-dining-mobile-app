import { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import AuthService from '../services/authService';

export default function ChangePasswordScreen() {
    const router = useRouter();
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const isNewPasswordValid = newPassword.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const doPasswordsMatch = newPassword === confirmPassword && newPassword.length > 0;

    const handleChangePassword = async () => {
        setError('');
        setIsLoading(true);
        
        try {
            if (!currentPassword) {
                setError('Please enter your current password.');
                return;
            }

            if (!newPassword) {
                setError('Please enter a new password.');
                return;
            }

            if (!isNewPasswordValid) {
                setError('New password must be at least 8 characters and contain at least one special character.');
                return;
            }

            if (!doPasswordsMatch) {
                setError('New passwords do not match.');
                return;
            }

            if (currentPassword === newPassword) {
                setError('New password must be different from current password.');
                return;
            }

            console.log(' Changing password for logged-in user');

            const response = await AuthService.changePassword(currentPassword, newPassword);

            if (response.success) {
                console.log(' Password changed successfully');
                setIsSuccess(true);
            } else {
                setError(response.message || 'Failed to change password. Please check your current password and try again.');
            }
        } catch (error) {
            console.error(' Change password error:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const handleDone = () => {
        router.back();
    };

    if (isSuccess) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.lightGray }}>
                <StatusBar barStyle="dark-content" />

                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 48 }}>
                    <TouchableOpacity onPress={handleBack} style={{ marginRight: 16 }}>
                        <Ionicons name="arrow-back" size={24} color={colors.darkGray} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: colors.black }}>
                        Change Password
                    </Text>
                </View>

                <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
                    <View style={{ alignItems: 'center', marginBottom: 32 }}>
                        <View style={{
                            width: 96,
                            height: 96,
                            backgroundColor: '#dcfce7',
                            borderRadius: 48,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 24
                        }}>
                            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                        </View>
                    </View>

                    <View style={{ marginBottom: 32 }}>
                        <Text style={{
                            fontSize: 24,
                            fontWeight: 'bold',
                            textAlign: 'center',
                            color: colors.black,
                            marginBottom: 16
                        }}>
                            Password Changed Successfully
                        </Text>
                        <Text style={{
                            fontSize: 16,
                            textAlign: 'center',
                            color: colors.darkGray,
                            lineHeight: 24
                        }}>
                            Your password has been updated successfully. You can continue using the app with your new password.
                        </Text>
                    </View>

                    <Button
                        title="Done"
                        variant="primary"
                        onPress={handleDone}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.lightGray }}>
            <StatusBar barStyle="dark-content" />

            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 48 }}>
                <TouchableOpacity onPress={handleBack} style={{ marginRight: 16 }}>
                    <Ionicons name="arrow-back" size={24} color={colors.darkGray} />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: '600', color: colors.black }}>
                    Change Password
                </Text>
            </View>

            <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <Image
                    source={require('../assets/password-reset.png')}
                    style={{ width: 126, height: 126 }}
                    resizeMode="contain"
                />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'flex-start',
                        paddingTop: 20,
                        paddingHorizontal: 24,
                        paddingBottom: 40,
                    }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ marginBottom: 32 }}>
                        <Text style={{
                            fontSize: 24,
                            fontWeight: 'bold',
                            textAlign: 'center',
                            color: colors.black,
                            marginBottom: 8
                        }}>
                            Change Your Password
                        </Text>
                        <Text style={{
                            fontSize: 16,
                            textAlign: 'center',
                            color: colors.darkGray,
                            lineHeight: 24
                        }}>
                            Enter your current password and choose a new one
                        </Text>
                    </View>

                    <View style={{ marginBottom: 24 }}>
                        <TextInput
                            placeholder="Current Password"
                            value={currentPassword}
                            onChangeText={(text) => {
                                setCurrentPassword(text);
                                if (error) setError('');
                            }}
                            secureTextEntry
                            variant={error && !currentPassword ? 'error' : 'default'}
                            editable={!isLoading}
                        />
                        <Text style={{ fontSize: 12, marginTop: 4, color: colors.darkGray }}>
                            Enter your current password to verify your identity
                        </Text>
                    </View>

                    <View style={{ marginBottom: 24 }}>
                        <TextInput
                            placeholder="New Password"
                            value={newPassword}
                            onChangeText={(text) => {
                                setNewPassword(text);
                                if (error) setError('');
                            }}
                            secureTextEntry
                            variant={error && !newPassword ? 'error' : 'default'}
                            editable={!isLoading}
                        />
                        {newPassword && (
                            <Text style={{
                                fontSize: 12,
                                marginTop: 4,
                                color: isNewPasswordValid ? '#10B981' : colors.darkGray
                            }}>
                                {isNewPasswordValid ? ' Password meets requirements' : 'Must be at least 8 characters with special character'}
                            </Text>
                        )}
                    </View>

                    <View style={{ marginBottom: 24 }}>
                        <TextInput
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (error) setError('');
                            }}
                            secureTextEntry
                            variant={error && !confirmPassword ? 'error' : 'default'}
                            editable={!isLoading}
                        />
                        {confirmPassword && (
                            <Text style={{
                                fontSize: 12,
                                marginTop: 4,
                                color: doPasswordsMatch ? '#10B981' : colors.darkGray
                            }}>
                                {doPasswordsMatch ? ' Passwords match' : 'Passwords do not match'}
                            </Text>
                        )}
                    </View>

                    {error ? (
                        <View style={{
                            backgroundColor: '#fee2e2',
                            borderRadius: 8,
                            padding: 12,
                            marginBottom: 24
                        }}>
                            <Text style={{
                                color: '#dc2626',
                                fontSize: 14,
                                textAlign: 'center'
                            }}>
                                {error}
                            </Text>
                        </View>
                    ) : null}

                    <Button
                        title={isLoading ? 'Changing Password...' : 'Change Password'}
                        variant="primary"
                        onPress={handleChangePassword}
                        disabled={isLoading || !currentPassword || !newPassword || !confirmPassword || !isNewPasswordValid || !doPasswordsMatch}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
