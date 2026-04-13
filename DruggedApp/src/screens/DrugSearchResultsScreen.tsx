import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../theme';
import { Drug } from '../services/drugDatabase';

type RootStackParamList = {
  SectionSelect: undefined;
  Home: undefined;
  UserInfo: { symptom: string };
  Results: { symptom: string; age: number; sex: string; pregnancy: boolean };
  DrugSearch: undefined;
  DrugSearchResults: { drugs: Drug[]; query: string };
  Disclaimer: undefined;
};

type DrugSearchResultsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DrugSearchResults'>;
  route: RouteProp<RootStackParamList, 'DrugSearchResults'>;
};

export const DrugSearchResultsScreen: React.FC<DrugSearchResultsScreenProps> = ({
  navigation,
  route,
}) => {
  const { drugs, query } = route.params;

  const formatPrice = (price: number) => {
    return `EGP ${price.toFixed(2)}`;
  };

  const renderDrugCard = (drug: Drug) => {
    const hasDiscount = drug.price_old && drug.price_old > drug.price;
    const discountPercent = hasDiscount
      ? Math.round(((drug.price_old! - drug.price) / drug.price_old!) * 100)
      : 0;

    return (
      <View key={drug.id} style={styles.drugCard}>
        <View style={styles.drugHeader}>
          <Text style={styles.drugName}>{drug.trade_name}</Text>
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercent}%</Text>
            </View>
          )}
        </View>

        <Text style={styles.drugIngredient}>{drug.active_ingredient}</Text>

        <View style={styles.drugDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.currentPrice}>{formatPrice(drug.price)}</Text>
              {hasDiscount && (
                <Text style={styles.oldPrice}>{formatPrice(drug.price_old!)}</Text>
              )}
            </View>
          </View>

          {drug.manufacturer && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Manufacturer:</Text>
              <Text style={styles.detailValue}>{drug.manufacturer}</Text>
            </View>
          )}

          {drug.distributor && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Distributor:</Text>
              <Text style={styles.detailValue}>{drug.distributor}</Text>
            </View>
          )}

          {drug.category && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category:</Text>
              <Text style={styles.detailValue}>{drug.category}</Text>
            </View>
          )}

          {drug.route && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Route:</Text>
              <Text style={styles.detailValue}>{drug.route}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const uniqueIngredients = [...new Set(drugs.map((d) => d.active_ingredient))];
  const priceRange = {
    min: Math.min(...drugs.map((d) => d.price)),
    max: Math.max(...drugs.map((d) => d.price)),
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Search Results</Text>
        <Text style={styles.subtitle}>
          "{query}" - {drugs.length} drugs found
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{uniqueIngredients.length}</Text>
            <Text style={styles.summaryLabel}>Active Ingredients</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
            </Text>
            <Text style={styles.summaryLabel}>Price Range</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={drugs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => renderDrugCard(item)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No drugs found</Text>
          </View>
        }
      />
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
    paddingBottom: spacing.md,
  },
  backButton: {
    marginBottom: spacing.sm,
  },
  backText: {
    ...typography.body,
    color: colors.primary.green,
    fontWeight: '600',
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral.gray,
  },
  summaryCard: {
    margin: spacing.lg,
    marginTop: 0,
    backgroundColor: colors.primary.green,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    ...typography.h3,
    color: colors.neutral.white,
  },
  summaryLabel: {
    ...typography.small,
    color: colors.neutral.white,
    opacity: 0.8,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  drugCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  drugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  drugName: {
    ...typography.h2,
    flex: 1,
  },
  discountBadge: {
    backgroundColor: colors.accent.red,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  discountText: {
    ...typography.small,
    color: colors.neutral.white,
    fontWeight: '700',
  },
  drugIngredient: {
    ...typography.body,
    color: colors.neutral.gray,
    marginBottom: spacing.md,
  },
  drugDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    ...typography.small,
    color: colors.neutral.gray,
  },
  detailValue: {
    ...typography.small,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPrice: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary.green,
  },
  oldPrice: {
    ...typography.small,
    color: colors.neutral.gray,
    textDecorationLine: 'line-through',
    marginLeft: spacing.sm,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.neutral.gray,
  },
});