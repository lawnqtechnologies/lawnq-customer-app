import React, {useMemo} from 'react';
import {View, StyleProp, ViewStyle, TouchableOpacity} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Modal from 'react-native-modal';
import * as _ from 'lodash';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {useDispatch} from 'react-redux';

/**
 * ? Local imports
 */
import createStyles from './BookingModal.style';
import {v2Colors} from '@theme/themes';
import fonts from '@fonts';
import Text from '@shared-components/text-wrapper/TextWrapper';
import ModalArrow from '@assets/v2/homescreen/icons/modal-arrow.svg';
import Time from '@assets/v2/homescreen/icons/time.svg';
import CalendarGreen from '@assets/v2/homescreen/icons/calendar-green.svg';
import {onSetBookingType} from '@services/states/booking/booking.slice';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ICenterModalScreenProps {
  style?: CustomStyleProp;
  isVisible: boolean;
  setIsVisible: (e: boolean) => void;
  setShowCalendar: (e: boolean) => void;
  title?: string;
  setIsLoading: Function;
}

const BookingModal: React.FC<ICenterModalScreenProps> = ({
  isVisible,
  setIsVisible,
  setShowCalendar,
  title = 'Book',
  setIsLoading,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();

  /**
  |--------------------------------------------------
  | Local Component
  |--------------------------------------------------
  */
  const Content = () => (
    <View style={styles.content}>
      <ModalArrow style={styles.modalArrow} height={75} width={75} />
      <Icon
        name="close"
        style={styles.closeButton}
        type={IconType.MaterialIcons}
        color={v2Colors.lightRed}
        size={25}
        onPress={() => {
          setIsVisible(false);
          setIsLoading(false);
        }}
      />
      <Header />
      <Buttons />
    </View>
  );

  const Header = () => (
    <View style={styles.header}>
      <Text h2 fontFamily={fonts.lexend.regular} style={{fontWeight: '600'}}>
        {_.upperFirst(title)}
      </Text>
    </View>
  );
  /**
  |--------------------------------------------------
  | FUNCTIONS
  |--------------------------------------------------
  */
  const handleBookSchedule = () => {
    dispatch(onSetBookingType(2));
    setIsVisible(false);
    setIsLoading(true);
    setTimeout(() => {
      setShowCalendar(true);
      setIsLoading(false);
    }, 1000);
  };

  const Buttons = () => (
    <View style={styles.buttonContainer}>
      {/* <TouchableOpacity
        onPress={() => {
          dispatch(onSetBookingType(1));
          setIsVisible(false);
        }}
        style={styles.button1}>
        <Time style={{marginRight: 50}} />
        <Text h4 center color={v2Colors.green}>
          Book Today
        </Text>
      </TouchableOpacity> */}
      <View style={{marginTop: 20}} />
      <TouchableOpacity onPress={handleBookSchedule} style={styles.button2}>
        <CalendarGreen style={{marginRight: 10}} />
        <Text h4 center color={v2Colors.green}>
          Schedule Booking
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      testID={'modal'}
      isVisible={isVisible}
      backdropColor="rgba(0,0,0,0.5)"
      backdropOpacity={0.8}
      animationIn="fadeInDown"
      animationOut="zoomOutUp"
      animationInTiming={600}
      animationOutTiming={600}
      backdropTransitionInTiming={600}
      backdropTransitionOutTiming={600}>
      <Content />
    </Modal>
  );
};

export default BookingModal;
