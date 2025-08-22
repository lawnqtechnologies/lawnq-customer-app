import React, {useMemo, useRef} from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import * as NavigationService from 'react-navigation-helpers';
import {useDispatch} from 'react-redux';
import moment from 'moment';
import * as _ from 'lodash';

/**
 * ? Local imports
 */
import createStyles from './ReusableTab.style';
import {v2Colors} from '@theme/themes';
import {SCREENS} from '@shared-constants';
import Text from '@shared-components/text-wrapper/TextWrapper';

/**
 * ? SVGS
 */
import PENDING from '@assets/v2/bookings/icons/pending.svg';
import CHECK from '@assets/v2/bookings/icons/check.svg';
import ALERT from '@assets/v2/bookings/icons/alert.svg';
import CHAT_BUBBLE from '@assets/v2/bookings/icons/chat-bubble.svg';
import CALENDAR from '@assets/v2/bookings/icons/calendar.svg';
import CHEVRON_RIGHT from '@assets/v2/common/icons/chevron-right.svg';
import {
  onSetBookingItem,
  onSetChatCount,
} from '@services/states/booking/booking.slice';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IReusableTabProps {
  style?: CustomStyleProp;
  navigation?: any;
  data: any;
  statusType?: any;
}

const ReusableTab: React.FC<IReusableTabProps> = ({data, statusType}) => {
  const theme = useTheme();
  const {colors} = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();

  /**
   * ? Actions
   */

  const goToBookingDetails = (item: any, chatCount: number) => {
    dispatch(onSetBookingItem(item));
    dispatch(onSetChatCount(chatCount));
    NavigationService.navigate(SCREENS.BOOKING_DETAIL);
  };

  /**
   * ? References
   */
  const scrollY = useRef(new Animated.Value(0)).current;

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const renderItem = (value: any) => {
    const {item, index} = value;
    const {BookingRefNo, Address1, BookingDate, BookingTypeDesc, s_count} =
      item;

    const itemSize = 120;
    const inputRange = [-1, 0, itemSize * index, itemSize * (index + 2)];

    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0],
    });

    const opacityInputRange = [
      -1,
      0,
      itemSize * index,
      itemSize * (index + 0.5),
    ];
    const opacity = scrollY.interpolate({
      inputRange: opacityInputRange,
      outputRange: [1, 1, 1, 0],
    });

    if (!data.length) return null;
    return (
      <TouchableOpacity onPress={() => goToBookingDetails(item, s_count)}>
        <Animated.View style={[styles.item, {transform: [{scale}], opacity}]}>
          <View style={styles.column_1}>
            <View style={styles.bookingRefContainer}>
              {statusType === 'pending' && (
                <PENDING style={{marginRight: 10}} />
              )}
              {statusType === 'completed' && (
                <CHECK style={{marginRight: 10}} />
              )}
              {statusType === 'dispute' && <ALERT style={{marginRight: 10}} />}

              <Text
                h4
                bold
                color={
                  statusType === 'pending'
                    ? v2Colors.orange
                    : statusType === 'completed'
                      ? v2Colors.blue
                      : statusType === 'dispute'
                        ? v2Colors.red
                        : 'black'
                }
                style={{marginBottom: 3}}>
                {BookingRefNo || ''}
              </Text>
            </View>
            <Text h5 color={v2Colors.greenShade2} style={{fontSize: 15}}>
              {Address1 || ''}
            </Text>
          </View>
          <View style={styles.column_2}>
            <View>
              <CHAT_BUBBLE />
              {!!s_count && (
                <View style={styles.badge}>
                  <Text h6 bold color={'white'}>
                    {s_count}
                  </Text>
                </View>
              )}
            </View>
            <CHEVRON_RIGHT />
          </View>
        </Animated.View>

        <View style={styles.bottomContentContainer}>
          <CALENDAR style={{marginRight: 10}} />
          <Text h5 color={v2Colors.green}>
            {_.toLower(BookingTypeDesc) === 'queue later'
              ? moment(BookingDate).format('LL')
              : moment(BookingDate).format('LLL') || ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View>
      <Text h4 style={{textAlign: 'center'}} color={v2Colors.green}>
        {`No ${
          statusType === 'completed'
            ? 'completed'
            : statusType === 'pending'
              ? 'pending'
              : 'in dispute'
        } bookings yet`}
      </Text>
    </View>
  );

  return (
    <>
      <View style={styles.container}>
        <Animated.FlatList
          data={data}
          renderItem={renderItem}
          contentContainerStyle={{paddingVertical: 20}}
          keyExtractor={(_, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollY}}}],
            {useNativeDriver: true},
          )}
        />
      </View>
    </>
  );
};

export default ReusableTab;
