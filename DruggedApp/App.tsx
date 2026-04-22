import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  HomeScreen,
  UserInfoScreen,
  ResultsScreen,
  SectionSelectScreen,
  DrugSearchScreen,
  DrugSearchResultsScreen,
  DrugDetailScreen,
  DrugAlternativesScreen,
  MenuScreen,
  DonationScreen,
} from './src/screens';
import { colors } from './src/theme';
import { Drug, initDatabase, getDrugCount } from './src/services/drugDatabase';
import { RootStackParamList } from './src/navigation/types';

// Configure notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const EMPATHY_MESSAGES = [
  "Every small donation helps keep this app free for everyone 💚",
  "Help us maintain this drug database with a small donation 🙏",
  "Your support means we can keep improving this app ❤️",
  "If you find this app useful, consider supporting development 💝",
];

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [drugCount, setDrugCount] = useState<number>(0);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDatabase();
        const count = await getDrugCount();
        setDrugCount(count);
        console.log('[App] Database initialized, total drugs:', count);
        setDbInitialized(true);
      } catch (error) {
        console.error('[App] Database initialization failed:', error);
        setDbError(String(error));
      }
    };

    initializeApp();
  }, [retryCount]);

  useEffect(() => {
    const setupNotifications = async () => {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          android: {
            allowAlert: true,
            allowSound: false,
            allowBadge: false,
          },
        });
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[Notifications] Permission not granted');
        return;
      }

      // Android notification channel setup
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('donation-reminders', {
          name: 'Donation reminders',
          description: 'Gentle reminders to support the app',
          importance: Notifications.AndroidImportance.LOW,
          vibrationPattern: [],
          lightColor: colors.primary.green,
        });
      }

      // Cancel existing notifications to avoid duplicates
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule recurring notifications (every 4-6 days, random interval)
      const randomMessage = EMPATHY_MESSAGES[Math.floor(Math.random() * EMPATHY_MESSAGES.length)];
      const intervalDays = Math.floor(Math.random() * 3) + 4; // 4,5,6 days

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Drugged App',
          body: randomMessage,
          data: { screen: 'Donation' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          repeats: true,
          seconds: intervalDays * 24 * 60 * 60,
        },
      });

      console.log(`[Notifications] Scheduled donation reminder every ${intervalDays} days`);
    };

    if (dbInitialized) {
      setupNotifications();
    }
  }, [dbInitialized]);

  if (dbError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load database</Text>
        <Text style={styles.errorDetail}>{dbError}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setDbError(null);
            setRetryCount(c => c + 1);
          }}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!dbInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.green} />
        <Text style={styles.loadingText}>Preparing drug database...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="SectionSelect"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.neutral.offWhite,
          },
          headerTintColor: colors.neutral.black,
          headerTitleStyle: {
            fontWeight: '700',
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.neutral.offWhite,
          },
        }}
      >
        <Stack.Screen
          name="SectionSelect"
          component={SectionSelectScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UserInfo"
          component={UserInfoScreen}
          options={{
            title: 'Your Info',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{
            title: 'Results',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="DrugSearch"
          component={DrugSearchScreen}
          options={{ headerShown: false }}
          initialParams={{ drugCount }}
        />
        <Stack.Screen
          name="DrugSearchResults"
          component={DrugSearchResultsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DrugDetail"
          component={DrugDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DrugAlternatives"
          component={DrugAlternativesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Menu"
          component={MenuScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Donation"
          component={DonationScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.offWhite,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.neutral.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.offWhite,
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accent.red,
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: colors.neutral.gray,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: colors.primary.green,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
  },
});