import {View, useColorScheme} from 'react-native';
import {useEffect} from 'react';
import {isReadyRef, navigationRef} from 'react-navigation-helpers';
import {SCREENS} from '../constant';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {v2Colors, DarkTheme, LightTheme} from '@theme/themes';

// assets
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

import {
  AccountScreen,
  HomeScreen,
  InboxScreen,
  LandingScreen,
  LoginScreen,
} from '@screens/index';
import {NavigationContainer} from '@react-navigation/native';
import WelcomeScreen from '@screens/welcome/WelcomeScreen';
import ListScreen from '@shared-components/list-containers/ListContainerScreen';
import AddCardScreen from '@screens/account/menu-screens/payment/AddCardScreen';
import PaymentScreen from '@screens/account/menu-screens/payment/PaymentScreen';
import {useSelector} from 'react-redux';
import {RootState} from 'store';
import SearchServiceProvidersScreen from '@screens/home/search-service-providers/SearchServiceProvidersScreen';
import SuccessScreen from '@screens/home/search-service-providers/SuccessScreen';
import FailScreen from '@screens/home/search-service-providers/FailScreen';
import AboutUsScreen from '@screens/account/menu-screens/about-us/AboutUsScreen';
import PrivacyScreen from '@screens/account/menu-screens/privacy/PrivacyScreen';
import FAQScreen from '@screens/account/menu-screens/faq/FAQScreen';
import BookingDetailScreen from '@screens/bookings/booking-details/BookingDetails';
import ProfileScreen from '@screens/account/profile/ProfileScreen';
import BookingDetails from '@screens/bookings/booking-details/BookingDetails';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import SingupAddressScreenStyle from '@screens/signup/SingupAddressScreen.style';
import SingupAddressScreen from '@screens/signup/SingupAddressScreen';
import SignUpLocatePropertyAddress from '@screens/signup/SignUpLocatePropertyAddress';

// ? If you want to use stack or tab or both
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const Navigation = () => {
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

  /**
    |--------------------------------------------------
    | REDUX
    |--------------------------------------------------
    */
  const {totalChatCount} = useSelector((state: RootState) => state.system);
  const {fromAccountToPayment} = useSelector((state: RootState) => state.menu);

  /**
    |--------------------------------------------------
    | EFFECTS
    |--------------------------------------------------
    */
  useEffect((): any => {
    return () => (isReadyRef.current = false);
  }, []);

  /**
    |--------------------------------------------------
    | Local Component
    |--------------------------------------------------
    */

  const renderActiveIcon = (icon: JSX.Element) => (
    <View style={{borderTopWidth: 2, marginTop: -6}}>{icon}</View>
  );

  const renderTabIcon = (route: any, focused: boolean) => {
    switch (route.name) {
      case 'Home':
        return focused ? (
          renderActiveIcon(<HomeGreen style={{marginTop: 6}} />)
        ) : (
          <Home />
        );
      case 'Bookings':
        return focused ? (
          renderActiveIcon(<BookingsGreen style={{marginTop: 6}} />)
        ) : (
          <Bookings />
        );
      case 'Properties':
        return focused ? (
          renderActiveIcon(
            <PropertyGreen height={23} width={23} style={{marginTop: 6}} />,
          )
        ) : (
          <Property height={23} width={23} />
        );
      case SCREENS.INBOX:
        return focused ? (
          renderActiveIcon(<MailGreen style={{marginTop: 6}} />)
        ) : (
          <Mail />
        );
      case 'Account':
        return focused ? (
          renderActiveIcon(<UserGreen style={{marginTop: 6}} />)
        ) : (
          <User />
        );
      default:
        return focused ? (
          renderActiveIcon(<HomeGreen style={{marginTop: 6}} />)
        ) : (
          <Home />
        );
    }
  };

  const RenderTabNavigation = () => {
    return (
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarIcon: ({focused}) => renderTabIcon(route, focused),
          tabBarActiveTintColor: v2Colors.green,
          tabBarInactiveTintColor: 'gray',
        })}>
        <Tab.Screen name={'Home'} component={HomeScreen} />
        <Tab.Screen
          name={'Bookings'}
          component={BookingsScreen}
          options={{
            tabBarBadge: !totalChatCount ? undefined : totalChatCount,
          }}
        />
        <Tab.Screen name={'Properties'} component={MyPropertiesScreen} />
        {/* <Tab.Screen name={SCREENS.INBOX} component={InboxScreen} /> */}
        <Tab.Screen name={'Account'} component={AccountScreen} />
      </Tab.Navigator>
    );
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        isReadyRef.current = true;
      }}
      theme={isDarkMode ? DarkTheme : LightTheme}>
      <Stack.Navigator
        screenOptions={{headerShown: false, headerMode: 'screen'}}>
        <Stack.Screen name={SCREENS.LANDING} component={LandingScreen} />
        <Stack.Screen name={SCREENS.LOGIN} component={LoginScreen} />
        <Stack.Screen name={SCREENS.SIGNUP} component={SignupScreen} />
        <Stack.Screen name={SCREENS.SET_PASS} component={SetupPassword} />
        <Stack.Screen name={SCREENS.TNC} component={TNC} />
        <Stack.Screen name={SCREENS.OTP} component={OTPScreen} />
        <Stack.Screen name={SCREENS.SIGNUP_ADDRESS} component={SingupAddressScreen} />
         <Stack.Screen name={SCREENS.SIGNUP_LOCATE_ADDRESS} component={SignUpLocatePropertyAddress} />
        <Stack.Screen name={SCREENS.WELCOME} component={WelcomeScreen} />
        <Stack.Screen
          name={SCREENS.HOME}
          component={RenderTabNavigation}
          options={{gestureEnabled: false}}
        />

        {/* Booking Today */}
        <Stack.Screen
          name={SCREENS.SEARCH_SERVICE_PROVIDERS}
          component={SearchServiceProvidersScreen}
          options={{gestureEnabled: false}}
        />
        <Stack.Screen
          name={SCREENS.SUCCESS}
          component={SuccessScreen}
          options={{gestureEnabled: false}}
        />

        <Stack.Screen
          name={SCREENS.FAIL}
          component={FailScreen}
          options={{gestureEnabled: false}}
        />

        {/* Book Later */}
        <Stack.Screen
          name={SCREENS.SEARCH_SCHEDULE_SERVICE_PROVIDERS}
          component={SearchScheduleServiceProviderScreen}
          options={{gestureEnabled: false}}
        />

        <Stack.Screen
          name={SCREENS.SUCCESS_SCHEDULE}
          component={SuccessScheduleScreen}
          options={{gestureEnabled: false}}
        />

        <Stack.Screen name={SCREENS.ACCOUNT} component={AccountScreen} />
        <Stack.Screen name={SCREENS.PROFILE} component={ProfileScreen} />

        {/** Menu Screens */}
        <Stack.Screen
          name={SCREENS.MY_PROPERTIES}
          component={MyPropertiesScreen}
          // component={RenderTabNavigation}
        />
        <Stack.Screen
          name={SCREENS.ADD_PROPERTY}
          component={AddPropertyScreen}
        />
        <Stack.Screen
          name={SCREENS.LOCATE_PROPERTY}
          component={LocatePropertyAddress}
        />

        <Stack.Screen name={SCREENS.ABOUT_US} component={AboutUsScreen} />
        <Stack.Screen name={SCREENS.PRIVACY} component={PrivacyScreen} />
        <Stack.Screen name={SCREENS.FAQ} component={FAQScreen} />
        <Stack.Screen name={SCREENS.SUPPORT} component={SupportScreen} />
        {/** End of Menu Screens */}

        {/* <Stack.Screen name={SCREENS.ACTIVITIES} component={ActivitiesScreen} /> */}
        <Stack.Screen
          name={SCREENS.BOOKING_DETAIL}
          component={BookingDetailScreen}
        />

        <Stack.Screen
          name={SCREENS.RATING_FEEDBACK}
          component={RatingFeedbackScreen}
        />

        <Stack.Screen name={SCREENS.LIST} component={ListScreen} />

        <Stack.Screen name={SCREENS.INBOX} component={InboxScreen} />

        <Stack.Screen
          name={SCREENS.PAYMENT}
          component={PaymentScreen}
          options={{gestureEnabled: fromAccountToPayment}}
        />
        <Stack.Screen name={SCREENS.ADD_CARD} component={AddCardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
