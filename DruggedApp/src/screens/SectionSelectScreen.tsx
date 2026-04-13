import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius } from '../theme';

type RootStackParamList = {
  SectionSelect: undefined;
  Home: undefined;
  UserInfo: { symptom: string };
  Results: { symptom: string; age: number; sex: string; pregnancy: boolean };
  DrugSearch: undefined;
  DrugSearchResults: { query: string };
  Disclaimer: undefined;
};

type SectionSelectScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SectionSelect'>;
};

export const SectionSelectScreen: React.FC<SectionSelectScreenProps> = ({
  navigation,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Drugged</Text>
          <Text style={styles.subtitle}>
            Choose how you need help
          </Text>
        </View>

        <TouchableOpacity
          style={styles.sectionCard}
          onPress={() => navigation.navigate('Home')}
        >
          <View style={styles.sectionIcon}>
            <Text style={styles.iconText}>💊</Text>
          </View>
          <View style={styles.sectionInfo}>
            <Text style={styles.sectionTitle}>OTC Recommendation</Text>
            <Text style={styles.sectionDescription}>
              Find safe over-the-counter medications based on your symptoms and health profile
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sectionCard}
          onPress={() => navigation.navigate('DrugSearch')}
        >
          <View style={styles.sectionIcon}>
            <Text style={styles.iconText}>🔍</Text>
          </View>
          <View style={styles.sectionInfo}>
            <Text style={styles.sectionTitle}>Drug Search</Text>
            <Text style={styles.sectionDescription}>
              Search our database of {23596}+ drugs, compare prices, and find alternatives
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Educational use only. Consult a pharmacist before taking any medication.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.offWhite,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
    marginTop: spacing.xl,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral.gray,
  },
  sectionCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  sectionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: 28,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    ...typography.small,
    color: colors.neutral.gray,
  },
  arrow: {
    fontSize: 28,
    color: colors.neutral.gray,
    fontWeight: '300',
  },
  disclaimer: {
    marginTop: 'auto',
    padding: spacing.md,
  },
  disclaimerText: {
    ...typography.small,
    color: colors.neutral.gray,
    textAlign: 'center',
  },
});