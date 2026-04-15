import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../theme';
import { Drug } from '../services/drugDatabase';

type RootStackParamList = {
  DrugSearchResults: { drugs: Drug[]; query: string };
  DrugDetail: { drug: Drug };
};

type DrugDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DrugDetail'>;
  route: RouteProp<RootStackParamList, 'DrugDetail'>;
};

export const DrugDetailScreen: React.FC<DrugDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { drug } = route.params;

  const formatPrice = (price: number) => {
    return `EGP ${price.toFixed(2)}`;
  };

  const hasDiscount = drug.price_old && drug.price_old > drug.price;
  const discountPercent = hasDiscount
    ? Math.round(((drug.price_old! - drug.price) / drug.price_old!) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.drugName}>{drug.trade_name}</Text>
          <Text style={styles.ingredient}>{drug.active_ingredient}</Text>

          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercent}% Discount</Text>
            </View>
          )}
        </View>

        {/* Price Card */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>{formatPrice(drug.price)}</Text>
            {hasDiscount && (
              <Text style={styles.oldPrice}>{formatPrice(drug.price_old!)}</Text>
            )}
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Drug Information</Text>

          {drug.manufacturer && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Manufacturer</Text>
              <Text style={styles.infoValue}>{drug.manufacturer}</Text>
            </View>
          )}

          {drug.distributor && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Distributor</Text>
              <Text style={styles.infoValue}>{drug.distributor}</Text>
            </View>
          )}

          {drug.category && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={styles.infoValue}>{drug.category}</Text>
            </View>
          )}

          {drug.subcategory && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Subcategory</Text>
              <Text style={styles.infoValue}>{drug.subcategory}</Text>
            </View>
          )}

          {drug.subcategory2 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Class</Text>
              <Text style={styles.infoValue}>{drug.subcategory2}</Text>
            </View>
          )}

          {drug.route && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Administration Route</Text>
              <Text style={styles.infoValue}>{drug.route}</Text>
            </View>
          )}
        </View>

        {/* Notes Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Important Notes</Text>
          <Text style={styles.disclaimerText}>
            This information is for reference only. Always consult a qualified healthcare provider before starting any medication.
            Do not self-diagnose or self-medicate based on this data.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.offWhite,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backButton: {},
  backText: {
    ...typography.body,
    color: colors.primary.green,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingTop: 0,
    paddingBottom: spacing.xl,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  drugName: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  ingredient: {
    ...typography.body,
    color: colors.neutral.gray,
    marginBottom: spacing.md,
  },
  discountBadge: {
    backgroundColor: colors.accent.red,
    alignSelf: 'flex-start',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  discountText: {
    ...typography.small,
    color: colors.neutral.white,
    fontWeight: '700',
  },
  priceCard: {
    backgroundColor: colors.primary.green,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  currentPrice: {
    ...typography.h2,
    color: colors.neutral.white,
    fontWeight: '700',
  },
  oldPrice: {
    ...typography.body,
    color: colors.neutral.white,
    opacity: 0.7,
    textDecorationLine: 'line-through',
  },
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  infoLabel: {
    ...typography.body,
    color: colors.neutral.gray,
    flex: 1,
  },
  infoValue: {
    ...typography.body,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  disclaimerText: {
    ...typography.small,
    color: colors.neutral.gray,
    lineHeight: 20,
  },
});
