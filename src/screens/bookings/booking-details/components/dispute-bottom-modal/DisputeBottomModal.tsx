import React, {useMemo, useRef, useState} from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Modal from 'react-native-modal';
import {useSelector} from 'react-redux';
import * as NavigationService from 'react-navigation-helpers';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {useKeyboard} from '@react-native-community/hooks';
import FastImage from 'react-native-fast-image';
import {
  launchImageLibrary,
  ImageLibraryOptions,
} from 'react-native-image-picker';

/**
 * ? Local Imports
 */
import createStyles from './DisputeBottomModal.style';
import {SCREENS} from '@shared-constants';
import Text from '@shared-components/text-wrapper/TextWrapper';

import {v2Colors} from '@theme/themes';
import CommonAPIalerts from '@shared-components/common-api-alerts/CommonAPIalerts';
import KeyboardHandler from '@shared-components/containers/KeyboardHandler';
import {ScreenHeight} from '@freakycoder/react-native-helpers';
import CommonButton from '@shared-components/buttons/CommonButton';
import {RootState} from 'store';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IDisputeBottomModalProps {
  style?: CustomStyleProp;
  isVisible: boolean;
  setIsVisible: Function;
  disputeBooking: any;
  bookingRefNo: string;
  onSendNotification: Function;
}

const DisputeBottomModal: React.FC<IDisputeBottomModalProps> = ({
  isVisible,
  setIsVisible,
  disputeBooking,
  bookingRefNo,
  onSendNotification,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const keyboard = useKeyboard();
  const {keyboardShown, keyboardHeight} = keyboard;
  const [imageName, setImageName] = useState<any>(null);
  const [imageType, setImageType] = useState<any>('');
  const [imageUri, setImageUri] = useState<any>(null);
  /**
   * ? Redux states
   */
  const {token, customerId, deviceDetails} = useSelector(
    (state: RootState) => state.user,
  );

  /**
   * ? States
   */
  const [showDisputeSuccess, setShowDisputeSuccess] = useState<boolean>(false);
  const [showDisputeFail, setShowDisputeFail] = useState<boolean>(false);
  const [showCommonError, setShowCommonError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [disputeMessage, setDisputeMessage] = useState<string>('');

  /**
   * ? Refs
   */
  const textRef = useRef<any>();

  /**
   * ? Functions
   */

  const selectImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      maxWidth: 2000,
      maxHeight: 2000,
      // selectionLimit: 0,
    };
    launchImageLibrary(options, (response: any) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        console.log(response.assets);

        const name = {fileName: response.assets[0].fileName};
        const type = {type: response.assets[0].type};
        const source = {uri: response.assets[0].uri};

        setImageName(name.fileName);
        setImageType(type.type);
        setImageUri(source.uri);
      }
    });
  };
  const onDispute = async () => {
    setLoading(true);

    let request = new FormData();
    request.append('CustomerToken', token);
    request.append('CustomerId', customerId);
    request.append('BookingRefNo', bookingRefNo);
    request.append('CustomerReason', disputeMessage);
    request.append('Photo', {
      name: imageName,
      type: imageType,
      uri: imageUri,
    });

    request.append('DeviceDetails.AppVersion', deviceDetails.AppVersion);
    request.append('DeviceDetails.DeviceModel', deviceDetails.DeviceModel);
    request.append('DeviceDetails.DeviceVersion', deviceDetails.DeviceVersion);
    request.append('DeviceDetails.IpAddress', deviceDetails.IpAddress);
    request.append('DeviceDetails.MacAddress', deviceDetails.MacAddress);
    request.append('DeviceDetails.Platform', deviceDetails.Platform);
    request.append('DeviceDetails.PlatformOs', deviceDetails.PlatformOs);

    console.log('onDispute payload:', JSON.stringify(request));
    disputeBooking(
      request,
      (data: any) => {
        console.log('onDispute data:', data);
        setLoading(false);
        const {StatusCode} = data;

        if (StatusCode === '00') return setShowDisputeSuccess(true);
        return setShowDisputeFail(true);
      },
      (err: any) => {
        console.log('onDispute err:', err);
        setLoading(false);
        setShowCommonError(true);
      },
    );
  };

  const UploadImage = () => {
    return (
      <View>
        <TouchableOpacity onPress={selectImage} style={styles.button}>
          <Text color="white">Select Image</Text>
        </TouchableOpacity>
        <View style={styles.imageContainer}>
          {imageUri !== null ? (
            <FastImage
              source={{uri: imageUri}}
              style={styles.imageBox}
              resizeMode={FastImage.resizeMode.contain}
            />
          ) : null}
        </View>
      </View>
    );
  };

  const UploadSection = () => {
    return (
      <>
        <View style={{height: 20}} />
        <UploadImage />
      </>
    );
  };

  const onDisputeSuccess = () => {
    delayedHide(true);
    onSendNotification(`Your booking ${bookingRefNo} is in dispute.`);
  };
  const onDisputeFail = () => {
    delayedHide();
  };
  const delayedHide = (isSuccess?: boolean) => {
    setTimeout(() => {
      setIsVisible(false);
    }, 500);
    setTimeout(() => {
      isSuccess && NavigationService.navigate(SCREENS.HOME);
    }, 800);
  };

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => {
          setIsVisible(false);
        }}
        style={styles.closeButton}>
        <Icon
          name="close"
          type={IconType.MaterialIcons}
          color={v2Colors.lightRed}
          size={25}
        />
      </TouchableOpacity>
      <Text color={v2Colors.green} style={{fontWeight: '700', fontSize: 22}}>
        Dispute Booking
      </Text>
    </View>
  );

  const Footer = () => (
    <View style={{marginBottom: 30, marginHorizontal: 20}}>
      <CommonButton
        text={'Send'}
        isFetching={loading}
        onPress={onDispute}
        style={{borderRadius: 5}}
        disabled={!disputeMessage}
      />
    </View>
  );

  return (
    <Modal
      isVisible={isVisible}
      swipeDirection="down"
      style={styles.modal}
      animationOut="slideOutDown"
      animationInTiming={500}
      animationOutTiming={500}
      useNativeDriver
      hideModalContentWhileAnimating
      backdropTransitionOutTiming={0}>
      <View
        style={[
          styles.content,
          {
            minHeight: keyboardShown
              ? ScreenHeight * 0.3 + keyboardHeight
              : '70%',
          },
        ]}>
        <KeyboardHandler>
          <Header />
          <TextInput
            ref={textRef}
            value={disputeMessage}
            style={styles.input}
            onChangeText={(text: string) => setDisputeMessage(text)}
            autoCorrect={false}
            multiline
            numberOfLines={10}
            allowFontScaling={false}
            placeholder={'Please enter your reason here...'}
          />
          <UploadSection />
          {!keyboardShown && <Footer />}
        </KeyboardHandler>
      </View>

      {/* success, fail, common error for dispute API call */}
      <CommonAPIalerts
        loading={loading}
        // success
        successText={'Dispute sent successfully.'}
        successVisible={showDisputeSuccess}
        setSuccessVisible={setShowDisputeSuccess}
        onPressSucess={onDisputeSuccess}
        // fail
        failedText={'Dispute Failed, please try again.'}
        failedVisible={showDisputeFail}
        setFailedVisible={setShowDisputeFail}
        onPressFailed={onDisputeFail}
        // common error
        commonErrorVisible={showCommonError}
        setCommonErrorVisible={setShowCommonError}
        onPressCommonError={() => {
          delayedHide();
        }}
      />
    </Modal>
  );
};

export default DisputeBottomModal;
