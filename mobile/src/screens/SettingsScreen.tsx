import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.goBack();
        },
      },
    ]);
  };

  const SettingsItem = ({
    icon,
    label,
    value,
    onPress,
    showArrow = true,
    iconColor = colors.textSecondary,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
    iconColor?: string;
  }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.settingsIconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <Text style={styles.settingsItemLabel}>{label}</Text>
      </View>
      <View style={styles.settingsItemRight}>
        {value && <Text style={styles.settingsItemValue}>{value}</Text>}
        {showArrow && onPress && (
          <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Account Section */}
          {isAuthenticated && user && (
            <View style={styles.section}>
              <View style={styles.profileCard}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.avatarGradient}
                >
                  <Ionicons name="person" size={28} color={colors.textOnPrimary} />
                </LinearGradient>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>
                    {user.displayName || 'User'}
                  </Text>
                  <Text style={styles.profileEmail}>{user.email}</Text>
                </View>
                <TouchableOpacity style={styles.editButton}>
                  <Ionicons name="pencil" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {/* Usage Card */}
              <View style={styles.usageCard}>
                <View style={styles.usageHeader}>
                  <Text style={styles.usageTitle}>Monthly Usage</Text>
                  <View style={styles.usageBadge}>
                    <Text style={styles.usageBadgeText}>
                      {user.subscriptionTier === 'premium' ? 'PRO' : 'FREE'}
                    </Text>
                  </View>
                </View>
                <View style={styles.usageBarContainer}>
                  <View
                    style={[
                      styles.usageBar,
                      { width: `${(user.monthlyUsage / 10) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.usageText}>
                  {user.monthlyUsage} of 10 recordings used
                </Text>
                {user.subscriptionTier !== 'premium' && (
                  <TouchableOpacity
                    style={styles.upgradeButton}
                    onPress={() => Alert.alert('Coming Soon', 'Subscription management coming soon!')}
                  >
                    <Ionicons name="diamond" size={16} color={colors.accent} />
                    <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.sectionCard}>
              <SettingsItem
                icon="language"
                label="Output Language"
                value="English (US)"
                iconColor={colors.primary}
                onPress={() => Alert.alert('Coming Soon', 'Language settings coming soon!')}
              />

              <View style={styles.divider} />

              <SettingsItem
                icon="sparkles"
                label="Default Style"
                value="Professional"
                iconColor={colors.accent}
                onPress={() => Alert.alert('Coming Soon', 'Default tone settings coming soon!')}
              />

              <View style={styles.divider} />

              <SettingsItem
                icon="musical-notes"
                label="Audio Quality"
                value="High"
                iconColor={colors.success}
                onPress={() => Alert.alert('Coming Soon', 'Audio quality settings coming soon!')}
              />
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.sectionCard}>
              <SettingsItem
                icon="information-circle"
                label="App Version"
                value="1.0.0"
                iconColor={colors.textLight}
                showArrow={false}
              />

              <View style={styles.divider} />

              <SettingsItem
                icon="document-text"
                label="Privacy Policy"
                iconColor={colors.textLight}
                onPress={() => Alert.alert('Privacy Policy', 'Opens privacy policy page')}
              />

              <View style={styles.divider} />

              <SettingsItem
                icon="shield-checkmark"
                label="Terms of Service"
                iconColor={colors.textLight}
                onPress={() => Alert.alert('Terms of Service', 'Opens terms of service page')}
              />

              <View style={styles.divider} />

              <SettingsItem
                icon="help-circle"
                label="Help & Support"
                iconColor={colors.textLight}
                onPress={() => Alert.alert('Help', 'Opens help page')}
              />
            </View>
          </View>

          {/* Auth Actions */}
          {isAuthenticated ? (
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Auth')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.loginButtonGradient}
              >
                <Ionicons name="log-in-outline" size={20} color={colors.textOnPrimary} />
                <Text style={styles.loginText}>Sign Up / Log In</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h4,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.caption,
    fontWeight: typography.semibold,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  avatarGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  profileName: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  profileEmail: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usageCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  usageTitle: {
    fontSize: typography.bodySmall,
    fontWeight: typography.medium,
    color: colors.textSecondary,
  },
  usageBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  usageBadgeText: {
    fontSize: typography.caption,
    fontWeight: typography.bold,
    color: colors.textOnPrimary,
    letterSpacing: 0.5,
  },
  usageBarContainer: {
    height: 6,
    backgroundColor: colors.backgroundLight,
    borderRadius: 3,
    marginBottom: spacing.sm,
  },
  usageBar: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  usageText: {
    fontSize: typography.caption,
    color: colors.textLight,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  upgradeButtonText: {
    fontSize: typography.bodySmall,
    fontWeight: typography.medium,
    color: colors.accent,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsItemLabel: {
    fontSize: typography.body,
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  settingsItemValue: {
    fontSize: typography.bodySmall,
    color: colors.textLight,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  logoutText: {
    fontSize: typography.body,
    color: colors.error,
    fontWeight: typography.medium,
  },
  loginButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  loginText: {
    fontSize: typography.body,
    color: colors.textOnPrimary,
    fontWeight: typography.semibold,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
