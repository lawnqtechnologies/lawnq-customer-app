// Navigation.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { isReadyRef, navigationRef } from 'react-navigation-helpers';
import { SCREENS } from '../constant';
import { v2Colors, DarkTheme, LightTheme } from '@theme/themes';

// --- SVG icons ---
import Home from '@assets/v2/bottom-nav/home.svg';
import HomeGreen from '@assets/v2/bottom-nav/home-green.svg';
import Bookings from '@assets/v2/bottom-nav/bookings.svg';
import BookingsGreen from '@assets/v2/bottom-nav/bookings-green.svg';
import Property from '@assets/v2/bottom-nav/property.svg';
import PropertyGreen from '@assets/v2/bottom-nav/property-green.svg';
import Mail from '@assets/v2/bottom-nav/mail.svg';
import MailGreen from '@assets/v2/bottom-nav/mail-green.svg';
import User from '@assets/v2/bottom-nav/user.svg';
import UserGreen from '@assets/v2/bottom-nav/user-green.svg';

// --- Screens ---
import {
  AccountScreen,
  HomeScreen,
  InboxScreen,
  LandingScreen,
  LoginScreen,
} from '@screens/index';
import WelcomeScreen from '@screens/welcome/WelcomeScreen';
import ListScreen from '@shared-components/list-containers/ListContainerScreen';
import AddCardScreen from '@screens/account/menu-screens/payment/AddCardScreen';
import PaymentScreen from '@screens/account/menu-screens/payment/PaymentScreen';
import SearchServiceProvidersScreen from '@screens/home/search-service-providers/SearchServiceProvidersScreen';
import SuccessScreen from '@screens/home/search-service-providers/SuccessScreen';
import FailScreen from '@screens/home/search-service-providers/FailScreen';
import AboutUsScreen from '@screens/account/menu-screens/about-us/AboutUsScreen';
import PrivacyScreen from '@screens/account/menu-screens/privacy/PrivacyScreen';
import FAQScreen from '@screens/account/menu-screens/faq/FAQScreen';
import BookingDetailScreen from '@screens/bookings/booking-details/BookingDetails';
import ProfileScreen from '@screens/account/profile/ProfileScreen';
import BookingsScreen from '@screens/bookings/BookingsScreen';
import MyPropertiesScreen from '@screens/my-properties/MyPropertiesScreen';
import AddPropertyScreen from '@screens/my-properties/AddPropertyScreen';
import LocatePropertyAddress from '@screens/my-properties/LocatePropertyAddress';
import RatingFeedbackScreen from '@screens/rating-feedback/RatingFeedback';
import SignupScreen from '@screens/signup/SignupScreen';
import SetupPassword from '@screens/signup/SetupPassword';
import OTPScreen from '@screens/signup/otp/OTPScreen';
import TNC from '@screens/signup/tnc';
import SupportScreen from '@screens/account/menu-screens/support/SupportScreen';
import SuccessScheduleScreen from '@screens/home/search-service-providers/SuccessScheduleScreen';
import SearchScheduleServiceProviderScreen from '@screens/home/search-service-providers/SearchScheduleServiceProviderScreen';
import SingupAddressScreen from '@screens/signup/SingupAddressScreen';
import SignUpLocatePropertyAddress from '@screens/signup/SignUpLocatePropertyAddress';
import { AUTHENTICATION } from '@shared-constants';

// -----------------------------------------------------
// Route names
// -----------------------------------------------------
const APP_TABS = 'AppTabs' as const; // distinct name for the tab container

// -----------------------------------------------------
// Navigators
// -----------------------------------------------------
const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();
const Onboarding = createNativeStackNavigator();

// Tab icon helpers
const renderActiveIcon = (icon: JSX.Element) => (
  <View style={{ borderTopWidth: 2, marginTop: -6 }}>{icon}</View>
);

const renderTabIcon = (route: { name: string }, focused: boolean) => {
  switch (route.name) {
    case 'Home':
      return focused ? renderActiveIcon(<HomeGreen style={{ marginTop: 6 }} />) : <Home />;
    case 'Bookings':
      return focused ? renderActiveIcon(<BookingsGreen style={{ marginTop: 6 }} />) : <Bookings />;
    case 'Properties':
      return focused
        ? renderActiveIcon(<PropertyGreen height={23} width={23} style={{ marginTop: 6 }} />)
        : <Property height={23} width={23} />;
    case SCREENS.INBOX:
      return focused ? renderActiveIcon(<MailGreen style={{ marginTop: 6 }} />) : <Mail />;
    case 'Account':
      return focused ? renderActiveIcon(<UserGreen style={{ marginTop: 6 }} />) : <User />;
    default:
      return focused ? renderActiveIcon(<HomeGreen style={{ marginTop: 6 }} />) : <Home />;
  }
};

// Bottom tabs (main app area)
const AppTabs = () => (
  <Tab.Navigator
    initialRouteName="Home Screen"
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused }) => renderTabIcon(route, focused),
      tabBarActiveTintColor: v2Colors.green,
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Bookings" component={BookingsScreen} />
    <Tab.Screen name="Properties" component={MyPropertiesScreen} />
    {/* If you want Inbox in tabs, uncomment: */}
    {/* <Tab.Screen name={SCREENS.INBOX} component={InboxScreen} /> */}
    <Tab.Screen name="Account" component={AccountScreen} />
  </Tab.Navigator>
);

// Onboarding/Auth stack (shown when not logged-in or not onboarded)
const OnboardingStack = () => (
  <Onboarding.Navigator screenOptions={{ headerShown: false }}>
    <Onboarding.Screen name={SCREENS.LANDING} component={LandingScreen} />
    <Onboarding.Screen name={SCREENS.LOGIN} component={LoginScreen} />
    <Onboarding.Screen name={SCREENS.SIGNUP} component={SignupScreen} />
    <Onboarding.Screen name={SCREENS.SET_PASS} component={SetupPassword} />
    <Onboarding.Screen name={SCREENS.TNC} component={TNC} />
    <Onboarding.Screen name={SCREENS.OTP} component={OTPScreen} />
    <Onboarding.Screen name={SCREENS.SIGNUP_ADDRESS} component={SingupAddressScreen} />
    <Onboarding.Screen name={SCREENS.SIGNUP_LOCATE_ADDRESS} component={SignUpLocatePropertyAddress} />
    <Onboarding.Screen name={SCREENS.WELCOME} component={WelcomeScreen} />
  </Onboarding.Navigator>
);

// -----------------------------------------------------
// Root Navigation
// -----------------------------------------------------
const Navigation = () => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? DarkTheme : DarkTheme;
  const { TOKEN } = AUTHENTICATION;

  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [token] = await Promise.all([AsyncStorage.getItem(TOKEN)]);
        if (!mounted) return;
        setIsLoggedIn(!!token);
      } catch {
        if (mounted) {
          setIsLoggedIn(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      isReadyRef.current = false;
    };
  }, [TOKEN]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  const showApp = isLoggedIn;

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={theme}
      onReady={() => {
        isReadyRef.current = true;
      }}
    >
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {showApp ? (
          <>
            {/* Main app area (tab container) */}
            {/* <RootStack.Screen name={APP_TABS} component={AppTabs} /> */}

            {/* App-only stack screens (push over tabs) */}
            <RootStack.Screen name={SCREENS.HOME} component={HomeScreen} />
            <RootStack.Screen name={SCREENS.BOOKING_DETAIL} component={BookingDetailScreen} />
            <RootStack.Screen name={SCREENS.RATING_FEEDBACK} component={RatingFeedbackScreen} />
            <RootStack.Screen name={SCREENS.LIST} component={ListScreen} />
            <RootStack.Screen name={SCREENS.INBOX} component={InboxScreen} />
            <RootStack.Screen name={SCREENS.PAYMENT} component={PaymentScreen} />
            <RootStack.Screen name={SCREENS.ADD_CARD} component={AddCardScreen} />

            {/* Booking Today */}
            <RootStack.Screen
              name={SCREENS.SEARCH_SERVICE_PROVIDERS}
              component={SearchServiceProvidersScreen}
              options={{ gestureEnabled: false }}
            />
            <RootStack.Screen
              name={SCREENS.SUCCESS}
              component={SuccessScreen}
              options={{ gestureEnabled: false }}
            />
            <RootStack.Screen
              name={SCREENS.FAIL}
              component={FailScreen}
              options={{ gestureEnabled: false }}
            />

            {/* Book Later */}
            <RootStack.Screen
              name={SCREENS.SEARCH_SCHEDULE_SERVICE_PROVIDERS}
              component={SearchScheduleServiceProviderScreen}
              options={{ gestureEnabled: false }}
            />
            <RootStack.Screen
              name={SCREENS.SUCCESS_SCHEDULE}
              component={SuccessScheduleScreen}
              options={{ gestureEnabled: false }}
            />

            {/* Menu pages (also reachable from tabs) */}
            <RootStack.Screen name={SCREENS.ACCOUNT} component={AccountScreen} />
            <RootStack.Screen name={SCREENS.PROFILE} component={ProfileScreen} />
            <RootStack.Screen name={SCREENS.MY_PROPERTIES} component={MyPropertiesScreen} />
            <RootStack.Screen name={SCREENS.ADD_PROPERTY} component={AddPropertyScreen} />
            <RootStack.Screen name={SCREENS.LOCATE_PROPERTY} component={LocatePropertyAddress} />
            <RootStack.Screen name={SCREENS.ABOUT_US} component={AboutUsScreen} />
            <RootStack.Screen name={SCREENS.PRIVACY} component={PrivacyScreen} />
            <RootStack.Screen name={SCREENS.FAQ} component={FAQScreen} />
            <RootStack.Screen name={SCREENS.SUPPORT} component={SupportScreen} />
          </>
        ) : (
          <RootStack.Screen
            name="Onboarding"
            component={OnboardingStack}
            options={{ animation: 'none' }}
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;