import React, {useMemo, useRef, useState} from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  Pressable,
  TextInput,
  Alert,
  Keyboard,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import * as NavigationService from 'react-navigation-helpers';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';

/**
 * ? Local imports
 */
import createStyles from './RatingFeedback.style';
import HeaderContainer from '@shared-components/headers/HeaderContainer';
import Text from '@shared-components/text-wrapper/TextWrapper';
import {SCREENS} from '@shared-constants';
import CommonButton from '@shared-components/buttons/CommonButton';

import {useBooking} from '@services/hooks/useBooking';
import {useSelector} from 'react-redux';
import {RootState} from 'store';
import KeyboardHandler from '@shared-components/containers/KeyboardHandler';

/**
 * ? Constants
 */
const STARS_NUMBER: Array<number> = [1, 2, 3, 4, 5];

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IRatingFeedbackScreenProps {
  style?: CustomStyleProp;
  route?: any;
}

const RatingFeedbackScreen: React.FC<IRatingFeedbackScreenProps> = ({
  route,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {saveFeedback} = useBooking();

  const completeBookingPayload = route.params?.completeBookingData;

  /**
   * ? Refs
   */
  const textRef = useRef<any>();

  /**
   * ? Redux States
   */
  const {customerId, deviceDetails} = useSelector(
    (state: RootState) => state.user,
  );

  /**
   * ? States
   */
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * ? Functions
   */
  const handleStarPress = (value: number) => {
    setRating(value);
  };

  const onSubmit = () => {
    setIsLoading(true);
    onSubmitFeedback();
  };

  const onSubmitFeedback = () => {
    console.log(
      'completeBookingPayload.BookingRefNo:',
      completeBookingPayload?.BookingRefNo,
    );
    if (!completeBookingPayload?.BookingRefNo) return setIsLoading(false);
    const payload = {
      BookingRefNo: completeBookingPayload?.BookingRefNo,
      CustomerId: customerId,
      Stars: rating,
      Feedback: feedback,
      Image: '',
      DeviceDetails: deviceDetails,
    };

    console.log('onSubmitFeedback payload:', payload);
    saveFeedback(
      payload,
      (data: any) => {
        setIsLoading(false);
        console.log('onSubmitFeedback data:', data);
        Alert.alert('Rating and Feedback', 'Successfully sent feedback.', [
          {
            onPress: () => {
              // NavigationService.goBack();
              NavigationService.navigate(SCREENS.HOME);
            },
            text: 'Confirm',
          },
        ]);
      },
      err => {
        console.log('onSubmitFeedback err:', err);
        onAlertGenericError(err);
      },
    );
  };

  const onAlertGenericError = (err: any) => {
    setIsLoading(false);
    Alert.alert('Oops', `Something went wrong. Please try again\n${err}`, [
      {
        onPress: () => {
          // NavigationService.goBack();
          NavigationService.navigate(SCREENS.HOME);
        },
        text: 'Confirm',
      },
    ]);
  };

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const renderHeader = (text: string, marginBottom: number) => (
    <Text h3 color="black" style={{marginBottom, textAlign: 'center'}}>
      {text}
    </Text>
  );

  const Spacer = () => <View style={{marginVertical: 20}} />;

  const Stars = () => (
    <View style={styles.starsContainer}>
      {STARS_NUMBER.map((rate: number) => {
        return (
          <Pressable onPress={() => handleStarPress(rate)}>
            <Icon
              name={rate <= rating ? 'star' : 'staro'}
              type={IconType.AntDesign}
              color={'rgba(200,170,0,1)'}
              size={40}
            />
          </Pressable>
        );
      })}
    </View>
  );

  const Submit = () => (
    <View
      style={{
        flexGrow: 1,
        justifyContent: 'flex-end',
      }}>
      <CommonButton
        text={'Submit'}
        style={styles.submitBtn}
        onPress={() => onSubmit()}
        isFetching={isLoading}
      />
    </View>
  );

  return (
    <>
      <Pressable style={styles.container} onPress={() => Keyboard.dismiss()}>
        <HeaderContainer
          pageTitle="Rating and Feedback"
          navigateTo={SCREENS.BOOKING_DETAIL}
        />
        <View style={styles.container}>
          <View style={{flex: 1, padding: 20}}>
            {renderHeader('Rate your Service Provider', 10)}
            <Stars />
            <Spacer />
            {renderHeader('Feedback', 5)}
            {/* <TextInput
              ref={textRef}
              onChangeText={(text: any) => {
                setFeedback(text);
              }}
              autoCorrect={false}
              multiline
              numberOfLines={5}
              allowFontScaling={false}
              placeholder={'Please enter your feedback here...'}
            /> */}
            <TextInput
              ref={textRef}
              style={styles.input}
              onChangeText={(text: any) => {
                setFeedback(text);
              }}
              autoCorrect={false}
              multiline
              numberOfLines={5}
              allowFontScaling={false}
              placeholder={'Please enter your feedback here...'}
            />
            <Submit />
          </View>
        </View>
      </Pressable>
    </>
  );
};

export default RatingFeedbackScreen;
