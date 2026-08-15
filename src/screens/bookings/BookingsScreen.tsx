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
  Alert,
  InteractionManager,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect, useTheme} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import * as _ from 'lodash';
import {getDatabase, get, ref} from '@react-native-firebase/database';
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
import SEARCH from '@assets/v2/list/search.svg';

import {useBooking} from '@services/hooks/useBooking';
import {systemActions} from '@services/states/system/system.slice';
import {v2Colors} from '@theme/themes';
import {RootState} from 'store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKINGS_FOCUS_REFRESH_COOLDOWN_MS = 15000;
const PENDING_BOOKING_STATUSES = new Set(['PENDING', 'ACCEPTED', 'IN PROGRESS']);
const COMPLETED_BOOKING_STATUS = 'COMPLETED';
const DISPUTE_BOOKING_STATUS = 'DISPUTE';

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
  s_count?: number;
}

const normalizeBookingStatus = (status?: string) =>
  `${status || ''}`.trim().toUpperCase();

const isPendingBooking = (booking: IReservationsItemProps) =>
  PENDING_BOOKING_STATUSES.has(normalizeBookingStatus(booking.BookingStatus));

const isCompletedBooking = (booking: IReservationsItemProps) =>
  normalizeBookingStatus(booking.BookingStatus) === COMPLETED_BOOKING_STATUS;

const isDisputeBooking = (booking: IReservationsItemProps) =>
  normalizeBookingStatus(booking.BookingStatus) === DISPUTE_BOOKING_STATUS;

const getBookingChatCount = (booking: IReservationsItemProps) =>
  Number(booking.s_count || 0);

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IReservationsScreenProps {
  style?: CustomStyleProp;
  navigation: any;
  route?: any;
}

const BookingsScreen: React.FC<IReservationsScreenProps> = ({
  navigation,
}) => {
  const theme = useTheme();
  const {colors} = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
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
  const isChatCountRequestInFlight = React.useRef<boolean>(false);
  const hasLoadedBookingsRef = React.useRef<boolean>(false);
  const lastBookingsFocusLoadAtRef = React.useRef<number>(0);

  /**
   * ? Functions
   */
  const fetchChatCount = useCallback(() => {
    if (isChatCountRequestInFlight.current) {
      return;
    }

    isChatCountRequestInFlight.current = true;
    const db = getDatabase();
    get(ref(db, `/chat_count/customer/${customerId}/`))
      .then(snapshot => {
        const data = snapshot.val();
        // console.log("data:", data);
        if (!data) {
          fetchBookingHistory([]);
          setChatTotalCount(0);
          return;
        }

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
      })
      .catch(error => {
        console.log('fetchChatCount error:', error);
      })
      .finally(() => {
        isChatCountRequestInFlight.current = false;
      });
  }, [customerId]);

  /**
   * ? On Mount
   */
  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        const now = Date.now();
        if (
          hasLoadedBookingsRef.current &&
          now - lastBookingsFocusLoadAtRef.current <
            BOOKINGS_FOCUS_REFRESH_COOLDOWN_MS
        ) {
          return;
        }

        lastBookingsFocusLoadAtRef.current = now;
        fetchChatCount();
      });

      return () => {
        task.cancel();
      };
    }, [fetchChatCount]),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      tabBarBadge: !chatTotalCount ? null : chatTotalCount,
    });
  }, [chatTotalCount, navigation]);

  useEffect(() => {
    AsyncStorage.setItem('Onboarding', 'true');
  }, []);

  const fetchBookingHistory = async (countArray: Array<any>) => {
    setIsLoading(!hasLoadedBookingsRef.current);
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

      getBookingHistory(
        payload,
        (data: any) => {
          const chatCountByBookingRef = new Map(
            countArray.map((countItem: any) => [
              countItem.bookingRef,
              Number(countItem.count || 0),
            ]),
          );

          const reservationsWithChatCount: Array<IReservationsItemProps> = (
            Array.isArray(data) ? data : []
          ).map((booking: IReservationsItemProps) => ({
            ...booking,
            s_count: chatCountByBookingRef.get(booking.BookingRefNo) || 0,
          }));

          const newArrayCompleted =
            reservationsWithChatCount.filter(isCompletedBooking);
          const newArrayOutstanding =
            reservationsWithChatCount.filter(isPendingBooking);
          const newArrayInDispute =
            reservationsWithChatCount.filter(isDisputeBooking);

          fetchedTotalCompletedChatCount = newArrayCompleted.reduce(
            (total, booking) => total + getBookingChatCount(booking),
            0,
          );
          fetchedTotalPendingChatCount = newArrayOutstanding.reduce(
            (total, booking) => total + getBookingChatCount(booking),
            0,
          );
          fetchedTotalInDisputeChatCount = newArrayInDispute.reduce(
            (total, booking) => total + getBookingChatCount(booking),
            0,
          );

          setCompletedReservations(newArrayCompleted);
          setOutstandingReservations(newArrayOutstanding);
          setInDisputeReservations(newArrayInDispute);
          hasLoadedBookingsRef.current = true;
          setIsLoading(false);
          dispatch(onSetCompletedChatCount(fetchedTotalCompletedChatCount));
          dispatch(onSetPendingChatCount(fetchedTotalPendingChatCount));
          dispatch(onSetInDisputeChatCount(fetchedTotalInDisputeChatCount));
        },
        (error: any) => {
          hasLoadedBookingsRef.current = true;
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
      hasLoadedBookingsRef.current = true;
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
      // 'Something went wrong. Please try again later.';
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const Count = (props: {count: number}) => {
    return (
      <View pointerEvents="none" style={styles.chatCountContainer}>
        <Text bold color="white">
          {props.count}
        </Text>
      </View>
    );
  };

  /**
   * ? For Tabs
   */
  const pendingTabReservations = useMemo(
    () => outstandingReservations.filter(isPendingBooking),
    [outstandingReservations],
  );
  const completedTabReservations = useMemo(
    () => completedReservations.filter(isCompletedBooking),
    [completedReservations],
  );
  const disputeTabReservations = useMemo(
    () => inDisputeReservations.filter(isDisputeBooking),
    [inDisputeReservations],
  );

  const [index, setIndex] = useState(0);
  const tabs = useMemo(
    () => [
      {key: 'first', title: 'Pending'},
      {key: 'second', title: 'Completed'},
      {key: 'third', title: 'In Dispute'},
    ],
    [],
  );

  const activeTabRawData = useMemo(() => {
    switch (index) {
      case 0:
        return pendingTabReservations;
      case 1:
        return completedTabReservations;
      case 2:
        return disputeTabReservations;
      default:
        return [];
    }
  }, [completedTabReservations, disputeTabReservations, index, pendingTabReservations]);

  /**
   * ? Search - same filtering approach as MyPropertiesScreen: case-insensitive
   * substring match across multiple fields, not just one.
   */
  const [searchText, setSearchText] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchedItems, setSearchedItems] = useState<
    Array<IReservationsItemProps>
  >([]);

  const onSearch = (searchString: string) => {
    const query = searchString.trim().toLowerCase();
    if (!query) return setSearchedItems(activeTabRawData);

    const filteredBookings = activeTabRawData.filter((item: any) =>
      [
        item.Address1,
        item.BookingRefNo,
        item.BookingTypeDesc,
        item.ServiceTypeDesc,
        item.BookingStatus,
        item.BookingDate,
      ].some(field => _.toLower(field).trim().includes(query)),
    );

    setSearchedItems(filteredBookings);
  };

  // ? Reset search whenever the selected tab changes so results don't leak across tabs
  useEffect(() => {
    setSearchText('');
    setSearchedItems([]);
  }, [index]);

  const displayedTabData = searchText ? searchedItems : activeTabRawData;

  const activeScene = useMemo(() => {
    switch (index) {
      case 0:
        return (
          <Reusable
            navigation={navigation}
            data={displayedTabData}
            statusType="pending"
          />
        );
      case 1:
        return (
          <Reusable
            navigation={navigation}
            data={displayedTabData}
            statusType="completed"
          />
        );
      case 2:
        return (
          <Reusable
            navigation={navigation}
            data={displayedTabData}
            statusType="dispute"
          />
        );
      default:
        return null;
    }
  }, [displayedTabData, index, navigation]);

  return (
    <>
      <HeaderContainer
        pageTitle="Bookings"
        navigateTo={SCREENS.HOME}
        backDisabled={!isFromMenu}
      />
      <View style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: 'white',
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 1},
            shadowOpacity: 0.22,
            shadowRadius: 2.22,
            elevation: 3,
          }}>
          {tabs.map((tab, tabIndex) => {
            const isFocused = index === tabIndex;

            return (
              <Pressable
                key={tab.key}
                onPress={() => setIndex(tabIndex)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 14,
                  borderBottomWidth: 2,
                  borderBottomColor: isFocused
                    ? colors.neonGreen
                    : 'transparent',
                }}>
                <View>
                  {tab.title === 'Pending' && !!pendingChatCount && (
                    <Count count={pendingChatCount} />
                  )}
                  {tab.title === 'Completed' && !!completedChatCount && (
                    <Count count={completedChatCount} />
                  )}
                  <Text
                    color={isFocused ? v2Colors.green : v2Colors.gray}
                    style={{fontWeight: '600'}}>
                    {_.toUpper(tab.title)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {activeTabRawData.length > 5 && (
          <View style={{marginBottom: 20, marginTop: 20}}>
            {!searchText && <SEARCH style={styles.search} />}
            <TextInput
              style={styles.searchInputText}
              placeholder="Search Bookings"
              onChangeText={(text: string) => {
                setSearchLoading(true);
                setSearchText(text);

                setTimeout(() => {
                  setSearchLoading(false);
                  onSearch(text);
                }, 1000);
              }}
              defaultValue={searchText}
              placeholderTextColor={v2Colors.gray}
              autoCorrect={false}
              clearButtonMode="always"
            />
          </View>
        )}

        {searchLoading && (
          <ActivityIndicator
            size="large"
            color="black"
            style={styles.loadingContainer}
          />
        )}

        {activeScene}
      </View>
      {isLoading && <WholeScreenLoader />}
    </>
  );
};

export default BookingsScreen;
