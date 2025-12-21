import React, {
  useMemo,
  useState,
  useCallback,
  useLayoutEffect,
  useEffect,
} from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  useWindowDimensions,
  Alert,
} from 'react-native';
import {useFocusEffect, useTheme} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import * as _ from 'lodash';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import database from '@react-native-firebase/database';
import * as NavigationService from 'react-navigation-helpers';

/**
 * ? Local imports
 */
import createStyles from './BookingsScreen.style';

import {SCREENS} from '@shared-constants';
import Text from '@shared-components/text-wrapper/TextWrapper';
import HeaderContainer from '@shared-components/headers/HeaderContainer';
import WholeScreenLoader from '@shared-components/loaders/WholeScreenLoader';
// ? Tabs
import Reusable from './tab-views/reusable-tab/ReusableTab';

import {useBooking} from '@services/hooks/useBooking';
import {systemActions} from '@services/states/system/system.slice';
import {v2Colors} from '@theme/themes';
import {RootState} from 'store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * ? Constants
 */
const RESERVATIONS_INITIAL_DATA = [
  {
    Address1: '',
    BookingRefNo: '',
    BookingStatus: '',
    BookingTypeDesc: '',
    CustomerId: '',
    DateCompleted: '',
    IntervalTimeLabel: '',
    LawnAreaLabel: '',
    PropertyAddId: '',
    ServiceFee: '',
    ServiceProviderId: '',
    ServiceTypeDesc: '',
  },
];

interface IReservationsItemProps {
  Address1: string;
  BookingRefNo: string;
  BookingStatus: string;
  BookingTypeDesc: string;
  CustomerId: string;
  DateCompleted: string;
  IntervalTimeLabel: string;
  LawnAreaLabel: string;
  PropertyAddId: string;
  ServiceFee: string;
  ServiceProviderId: string;
  ServiceTypeDesc: string;
}

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IReservationsScreenProps {
  style?: CustomStyleProp;
  navigation: any;
  route?: any;
}

const BookingsScreen: React.FC<IReservationsScreenProps> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const {colors} = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const layout = useWindowDimensions();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  /**
   * ? Hooks
   */
  const {getBookingHistory} = useBooking();

  /**
   * ? Actions
   */
  const {
    onSetPendingChatCount,
    onSetCompletedChatCount,
    onSetInDisputeChatCount,
  } = systemActions;

  /**
   * ? Redux States
   */
  const {customerId, deviceDetails, isFromMenu} = useSelector(
    (state: RootState) => state.user,
  );
  const {completedChatCount, pendingChatCount} = useSelector(
    (state: RootState) => state.system,
  );

  /**
   * ? States
   */
  const [completedReservations, setCompletedReservations] = useState<
    Array<IReservationsItemProps>
  >([]);
  const [outstandingReservations, setOutstandingReservations] = useState<
    Array<IReservationsItemProps>
  >([]);
  const [inDisputeReservations, setInDisputeReservations] = useState<
    Array<IReservationsItemProps>
  >([]);
  const [chatTotalCount, setChatTotalCount] = useState<number>(0);

  /**
   * ? On Mount
   */
  useFocusEffect(
    useCallback(() => {
      fetchChatCount();
    }, [route]),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      tabBarBadge: !chatTotalCount ? null : chatTotalCount,
    });
  }, [chatTotalCount]);

  useEffect(() => {
    AsyncStorage.setItem('Onboarding', 'true');
  }, []);

  /**
   * ? Functions
   */
  const fetchChatCount = useCallback(() => {
    console.log('fetchChatCount');
    database()
      .ref(`/chat_count/customer/${customerId}/`)
      .once('value')
      .then(snapshot => {
        const data = snapshot.val();
        // console.log("data:", data);
        if (!data) return fetchBookingHistory([]);

        let countArray: Array<any> = [];
        let totalCount: number = 0;
        Object?.keys(data).forEach(function (key) {
          const item = data[key];
          // console.log("item:", item);
          const {s_count} = item;
          totalCount += s_count;
          countArray.push({bookingRef: key, count: s_count});
        });

        fetchBookingHistory(countArray);
        setChatTotalCount(totalCount);
      });
  }, []);

  const fetchBookingHistory = async (countArray: Array<any>) => {
    setIsLoading(true);
    // console.log("countArray:", countArray);
    try {
      const payload = {
        CustomerId: customerId,
        BookingRefNo: '',
        DeviceDetails: deviceDetails,
      };

      let fetchedTotalCompletedChatCount: number = 0;
      let fetchedTotalPendingChatCount: number = 0;
      let fetchedTotalInDisputeChatCount: number = 0;

      console.log('fetchBookingHistory payload:', payload);
      getBookingHistory(
        payload,
        (data: any) => {
          console.log('response from fetchBookingHistory');
          console.log(data);

          let newArrayCompleted: any = [];
          let newArrayOutstanding: any = [];
          let newArrayInDispute: any = [];

          data?.map((d: any) => {
            const {BookingRefNo} = d;
            let hasCompletedNotif = false;
            let hasPendingNotif = false;
            let hasInDisputeNotif = false;

            if (!_.size(countArray)) {
              if (d.BookingStatus === 'COMPLETED')
                newArrayCompleted.push({...d, s_count: 0});
              if (
                d.BookingStatus === 'ACCEPTED' ||
                d.BookingStatus === 'IN PROGRESS'
              )
                newArrayOutstanding.push({...d, s_count: 0});
              if (d.BookingStatus === 'DISPUTE')
                newArrayInDispute.push({...d, s_count: 0});
              return;
            }

            countArray?.map((countItem: any) => {
              // console.log("countItem:", countItem);
              const {bookingRef, count} = countItem;
              if (BookingRefNo === bookingRef) {
                if (d.BookingStatus === 'COMPLETED') {
                  newArrayCompleted.push({...d, s_count: count});
                  hasCompletedNotif = true;
                  fetchedTotalCompletedChatCount += count;
                } else hasCompletedNotif = false;

                if (
                  d.BookingStatus === 'ACCEPTED' ||
                  d.BookingStatus === 'IN PROGRESS'
                ) {
                  newArrayOutstanding.push({...d, s_count: count});
                  hasPendingNotif = true;
                  fetchedTotalPendingChatCount += count;
                } else hasPendingNotif = false;

                if (d.BookingStatus === 'DISPUTE') {
                  newArrayInDispute.push({...d, s_count: count});
                  hasInDisputeNotif = true;
                  fetchedTotalInDisputeChatCount += count;
                } else hasInDisputeNotif = false;
              }
            });
            if (d.BookingStatus === 'COMPLETED' && !hasCompletedNotif)
              return newArrayCompleted.push({...d, s_count: 0});
            if (
              (d.BookingStatus === 'ACCEPTED' ||
                d.BookingStatus === 'IN PROGRESS') &&
              !hasPendingNotif
            )
              return newArrayOutstanding.push({...d, s_count: 0});
            if (d.BookingStatus === 'DISPUTE' && !hasPendingNotif)
              return newArrayInDispute.push({...d, s_count: 0});
          });

          setCompletedReservations(newArrayCompleted);
          setOutstandingReservations(newArrayOutstanding);
          setInDisputeReservations(newArrayInDispute);
          setIsLoading(false);
          dispatch(onSetCompletedChatCount(fetchedTotalCompletedChatCount));
          dispatch(onSetPendingChatCount(fetchedTotalPendingChatCount));
          dispatch(onSetInDisputeChatCount(fetchedTotalInDisputeChatCount));
        },
        (error: any) => {
          setIsLoading(false);
          Alert.alert(
            'Oops',
            'Something went wrong. Please try again later.',
            [
              {
                text: 'Add',
                onPress: () => NavigationService.navigate(SCREENS.HOME),
              },
              // {text: 'Cancel', style: 'cancel'},
            ],
            {cancelable: false},
          );
          console.log('error:', error);
        },
      );
    } catch (error) {
      Alert.alert(
        'Oops',
        'Something went wrong. Please try again later.',
        [
          {
            text: 'Add',
            onPress: () => NavigationService.navigate(SCREENS.HOME),
          },
          // {text: 'Cancel', style: 'cancel'},
        ],
        {cancelable: false},
      );
      // 'Something went wrong. Please try again later.';
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const Count = (props: {count: number}) => {
    return (
      <View style={styles.chatCountContainer}>
        <Text bold color="white">
          {props.count}
        </Text>
      </View>
    );
  };

  /**
   * ? For Tabs
   */
  const FirstScreen = () => (
    <Reusable
      navigation={navigation}
      data={outstandingReservations}
      statusType="pending"
    />
  );
  const SecondScreen = () => (
    <Reusable
      navigation={navigation}
      data={completedReservations}
      statusType="completed"
    />
  );
  const ThirdScreen = () => (
    <Reusable
      navigation={navigation}
      data={inDisputeReservations}
      statusType="dispute"
    />
  );

  const renderScene = SceneMap({
    first: FirstScreen,
    second: SecondScreen,
    third: ThirdScreen,
  });

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {
      key: 'first',
      title: 'Pending',
    },
    {
      key: 'second',
      title: 'Completed',
    },
    {
      key: 'third',
      title: 'In Dispute',
    },
  ]);

  return (
    <>
      <HeaderContainer
        pageTitle="Bookings"
        navigateTo={SCREENS.HOME}
        backDisabled={!isFromMenu}
      />
      <View style={styles.container}>
        <TabView
          navigationState={{index, routes}}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{width: layout.width}}
          renderTabBar={props => {
            return (
              <TabBar
                {...props}
                indicatorStyle={{backgroundColor: colors.neonGreen}}
                style={{
                  backgroundColor: 'white',

                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.22,
                  shadowRadius: 2.22,

                  elevation: 3,
                }}
                pressOpacity={0}
                renderLabel={({route, focused, color}) => (
                  <View>
                    {route.title == 'Pending' && !!pendingChatCount && (
                      <Count count={pendingChatCount} />
                    )}
                    {route.title == 'Completed' && !!completedChatCount && (
                      <Count count={completedChatCount} />
                    )}
                    <Text
                      color={focused ? v2Colors.green : v2Colors.gray}
                      style={{fontWeight: '600'}}>
                      {_.toUpper(route.title)}
                    </Text>
                  </View>
                )}
              />
            );
          }}
        />
      </View>
      {isLoading && <WholeScreenLoader />}
    </>
  );
};

export default BookingsScreen;
