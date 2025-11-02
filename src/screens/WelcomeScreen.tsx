import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { waitlistService } from '../services/waitlist.service';
import type { WaitlistFormData } from '../types';

interface FormData {
    email: string;
    name?: string;
}

export const WelcomeScreen: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>();

    /**
     * Handles waitlist form submission
     * Saves email to Firestore and shows success message
     */
    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            const result = await waitlistService.addToWaitlist(
                data.email,
                data.name
            );

            if (result.success) {
                setIsSuccess(true);
                reset();

                Alert.alert(
                    'Success! 🎉',
                    'You\'ve been added to our waitlist.\n\nWe\'ll notify you when we launch!',
                    [{ text: 'Awesome!' }]
                );
            }
        } catch (error) {
            console.error('Waitlist submission error:', error);
            const errorMessage = error instanceof Error
                ? error.message
                : 'Something went wrong. Please try again.';

            Alert.alert(
                'Oops!',
                errorMessage,
                [{ text: 'OK' }]
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header Section */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoText}>📚</Text>
                        </View>
                        <Text style={styles.appName}>no news</Text>
                        <Text style={styles.tagline}>Your personal reading sanctuary</Text>
                    </View>

                    {/* Hero Section */}
                    <View style={styles.heroSection}>
                        <Text style={styles.heroTitle}>
                            Save what matters.{'\n'}Read without noise.
                        </Text>
                        <Text style={styles.heroDescription}>
                            A beautiful, distraction-free space to collect and revisit the articles,
                            ideas, and stories that truly matter to you.
                        </Text>
                    </View>

                    {/* Features List */}
                    <View style={styles.featuresSection}>
                        <FeatureItem
                            icon="🔖"
                            title="Smart Bookmarking"
                            description="Save articles instantly from any source"
                        />
                        <FeatureItem
                            icon="🎯"
                            title="Focus on Quality"
                            description="No distractions, just your curated collection"
                        />
                        <FeatureItem
                            icon="🌙"
                            title="Beautiful Reading"
                            description="Clean interface designed for comfort"
                        />
                    </View>

                    {/* Waitlist Form */}
                    <View style={styles.formSection}>
                        <Text style={styles.formTitle}>Join the Waitlist</Text>
                        <Text style={styles.formSubtitle}>
                            Be the first to know when we launch
                        </Text>

                        <View style={styles.form}>
                            {/* Name Input */}
                            <Controller
                                control={control}
                                name="name"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Name (optional)"
                                            placeholderTextColor="#999"
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            autoCapitalize="words"
                                            returnKeyType="next"
                                        />
                                    </View>
                                )}
                            />

                            {/* Email Input */}
                            <Controller
                                control={control}
                                name="email"
                                rules={{
                                    required: true,
                                    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={[
                                                styles.input,
                                                errors.email && styles.inputError,
                                            ]}
                                            placeholder="Email address *"
                                            placeholderTextColor="#999"
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoComplete="email"
                                            returnKeyType="done"
                                            onSubmitEditing={handleSubmit(onSubmit)}
                                        />
                                        {errors.email && (
                                            <Text style={styles.errorText}>
                                                {errors.email.message}
                                            </Text>
                                        )}
                                    </View>
                                )}
                            />

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    isSubmitting && styles.submitButtonDisabled,
                                ]}
                                onPress={handleSubmit(onSubmit)}
                                disabled={isSubmitting}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.submitButtonText}>
                                    {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.privacyNote}>
                            We respect your privacy. No spam, ever.
                        </Text>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Made with ❤️ for mindful readers
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

/**
 * Feature item component for displaying app features
 */
interface FeatureItemProps {
    icon: string;
    title: string;
    description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
    <View style={styles.featureItem}>
        <Text style={styles.featureIcon}>{icon}</Text>
        <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDescription}>{description}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 20,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    logoText: {
        fontSize: 40,
    },
    appName: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    heroSection: {
        paddingVertical: 32,
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1a1a1a',
        textAlign: 'center',
        lineHeight: 36,
        marginBottom: 16,
    },
    heroDescription: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 8,
    },
    featuresSection: {
        paddingVertical: 24,
    },
    featureItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    featureIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    formSection: {
        paddingVertical: 32,
        alignItems: 'center',
    },
    formTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 8,
        textAlign: 'center',
    },
    formSubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
        textAlign: 'center',
    },
    form: {
        width: '100%',
        maxWidth: 400,
    },
    inputContainer: {
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#E5E5E5',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1a1a1a',
    },
    inputError: {
        borderColor: '#FF6B6B',
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 14,
        marginTop: 6,
        marginLeft: 4,
    },
    submitButton: {
        backgroundColor: '#1a1a1a',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    submitButtonDisabled: {
        backgroundColor: '#999',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    privacyNote: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: 16,
    },
    footer: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#999',
    },
});

