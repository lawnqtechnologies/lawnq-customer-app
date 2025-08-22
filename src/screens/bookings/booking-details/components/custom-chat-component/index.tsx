import React, {useCallback, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {
  GiftedChat,
  Bubble,
  MessageText,
  Composer,
  InputToolbar,
  Send,
} from 'react-native-gifted-chat';
import database from '@react-native-firebase/database';
import notifee from '@notifee/react-native';
import {Alert, View, TouchableOpacity} from 'react-native';
import moment from 'moment';
import _ from 'lodash';
import {useKeyboard} from '@react-native-community/hooks';

import {useBooking} from '@services/hooks/useBooking';
import {isAndroid} from '@freakycoder/react-native-helpers';
import {v2Colors} from '@theme/themes';
import fonts from '@fonts';
import styles from './styles';

/**
 * ? SVGs
 */
import SEND from '@assets/v2/chat/icons/send.svg';
import X_RED from '@assets/v2/chat/icons/x-red.svg';
import {RootState} from 'store';
import {NOTIFICATION_SOUNDS} from '@shared-constants';

interface ICustomChatComponent {
  ServiceProviderId: any;
  SPInfo: {DeviceId: string; PlatformOs: string};
  bookingItem: any;
  setInitChat: Function;
  setSnapPoint: Function;
}

interface IPureGiftedChatComponent {
  messages: any;
  onSend: any;
  renderBubble: any;
  renderMessageText: any;
  renderInputToolbar: any;
  renderComposer: any;
  renderSend: any;
}

class PureGiftedChatComponent extends React.PureComponent<IPureGiftedChatComponent> {
  render() {
    const {
      messages,
      onSend,
      renderBubble,
      renderMessageText,
      renderInputToolbar,
      renderComposer,
      renderSend,
    } = this.props;

    return (
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: 1,
        }}
        infiniteScroll
        renderBubble={renderBubble}
        renderMessageText={renderMessageText}
        renderInputToolbar={renderInputToolbar}
        renderComposer={renderComposer}
        renderSend={renderSend}
        placeholder={'Enter Message'}
        minInputToolbarHeight={60}
        keyboardShouldPersistTaps={'never'}
      />
    );
  }
}

const CustomChatComponent: React.FC<ICustomChatComponent> = ({
  ServiceProviderId,
  SPInfo,
  bookingItem,
  setInitChat,
  setSnapPoint,
}) => {
  const {BookingRefNo} = bookingItem;

  /**
   * ? Hooks
   */
  const {sendNotification} = useBooking();
  const keyboard = useKeyboard();
  const {keyboardShown, keyboardHeight} = keyboard;

  /**
   * ? Redux States
   */
  const {customerInfo, customerId} = useSelector(
    (state: RootState) => state.user,
  );
  const {Firstname} = customerInfo;
  const {receivedChatInfo} = useSelector((state: RootState) => state.system);

  /**
   * ? States
   */
  const [messages, setMessages] = useState<Array<any>>([]);

  /**
   * ? Variables
   */
  const onSend = useCallback((messages = []) => {
    const {text, _id} = messages[0];
    setMessages((previousMessages: any) => {
      onSendChatNotif(text, _id);
      onGetCustomerChatCount(false);
      onGetSPChatCount(false);
      onSetChatData(text, _id);

      return GiftedChat.append(previousMessages, messages);
    });
  }, []);

  /**
   * ? Watchers
   */
  // ? Handles fetch of all chats when in app
  useEffect(() => {
    if (!customerId || !ServiceProviderId || !Firstname) return;

    onGetCustomerChatCount(true);
    onGetSPChatCount(true);
    onGetChatMessages();
  }, []);

  useEffect(() => {
    onGetChatMessages();
  }, [receivedChatInfo]);

  /**
   * ? Functions
   */
  const onSendChatNotif = (text: string, _id: string) => {
    const {DeviceId, PlatformOs} = SPInfo;

    const notifPayload = {
      DeviceId,
      Priority: 'high',
      IsAndroiodDevice: PlatformOs === 'android' ? true : false,
      Data: {
        ScreenName: 'BOOKING_CHAT',
        Message: JSON.stringify({
          text,
          _id,
          bookingItem,
        }),
        Remarks: '',
      },
      Notification: {
        Title: Firstname,
        Body: text,
        Sound: NOTIFICATION_SOUNDS.NOTIFICATION_DEFAULT,
      },
    };
    console.log('onSendChatNotif payload:', notifPayload);
    sendNotification(
      notifPayload,
      data => {
        console.log('onSendChatNotif data:', data);
        // onCreateConvoMessage(text);
      },
      err => {
        console.log('onSendChatNotif err:', err);
        Alert.alert('Chat', 'Something went wrong, please try again.');
      },
    );
  };

  const onGetSPChatCount = (onMount: boolean) => {
    database()
      .ref(`/chat_count/service-provider/${ServiceProviderId}/${BookingRefNo}`)
      .once('value')
      .then(snapshot => {
        const data = snapshot.val();
        console.log('onGetSPChatCount data:', data);

        // when 1st time reset for service provider
        if (!data && onMount) return onSaveServiceProviderChat(0, 0, onMount);
        // when 1st time sending chat -> chat count is 1
        if (!data && !onMount) return onSaveServiceProviderChat(1, 0, onMount);

        // when there is data in firebase
        const {c_count, s_count} = data;

        // decreases chat app badge count when count is more than 0
        if (s_count > 0 && onMount) onDecrementAppBadgeCount(s_count);

        // reset for service provider
        if (onMount) onSaveServiceProviderChat(c_count, 0, onMount);
        // when sending chat -> chat count + 1
        if (!onMount) onSaveServiceProviderChat(c_count, s_count, onMount);
      });
  };
  const onSaveServiceProviderChat = (
    c_count: number,
    s_count: number,
    mounted: boolean,
  ) => {
    database()
      .ref(`/chat_count/service-provider/${ServiceProviderId}/${BookingRefNo}`)
      .set({
        c_count: mounted ? c_count : c_count + 1,
        s_count,
      })
      .then(() => console.log('onSaveServiceProviderChat Data set.'));
  };

  const onGetCustomerChatCount = (onMount: boolean) => {
    database()
      .ref(`/chat_count/customer/${customerId}/${BookingRefNo}`)
      .once('value')
      .then(snapshot => {
        const data = snapshot.val();
        // console.log("data:", data);

        if (!data && onMount) return onSaveCustomerChat(0, 0, onMount);
        // when 1st time sending chat -> chat count is 1
        if (!data && !onMount) return onSaveCustomerChat(1, 0, onMount);

        // when there is data in firebase
        const {c_count, s_count} = data;
        if (s_count > 0 && onMount) onDecrementAppBadgeCount(s_count);

        if (onMount) onSaveCustomerChat(c_count, 0, onMount);
        // when sending chat -> chat count + 1
        if (!onMount) onSaveCustomerChat(c_count, s_count, onMount);
      });
  };
  const onSaveCustomerChat = (
    c_count: number,
    s_count: number,
    mounted: boolean,
  ) => {
    database()
      .ref(`/chat_count/customer/${customerId}/${BookingRefNo}`)
      .set({
        c_count: mounted ? c_count : c_count + 1,
        s_count,
      })
      .then(() => console.log('onSaveCustomerChat Data set.'));
  };

  const onDecrementAppBadgeCount = (refCount: number) => {
    console.log('onDecrementAppBadgeCount');
    notifee
      .decrementBadgeCount(refCount)
      .then(() => notifee.getBadgeCount())
      .then(count =>
        console.log(`Badge count decremented by ${refCount} to:`, count),
      );
  };

  const onGetChatMessages = () => {
    database()
      .ref(`/chats/${BookingRefNo}`)
      .once('value')
      .then(snapshot => {
        const data = snapshot.val();
        console.log('onGetChatMessages ata:', data);

        let newArray: Array<any> = [];

        if (!_.size(data)) return;
        Object?.keys(data).forEach(function (key) {
          const item = data[key];
          const {sender, text, type, createdAt, _id} = item;

          const formedMessage = {
            _id,
            text,
            createdAt: JSON.parse(createdAt) || '',
            user: {
              _id: type === 'C' ? 1 : 2,
              name: sender,
              // avatar: "https://placeimg.com/140/140/any",
            },
          };
          newArray.push(formedMessage);
        });

        const sortedArray: Array<any> = newArray.sort(
          (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
        );
        console.log('sortedArray:', sortedArray);
        setMessages(sortedArray);
      });
  };

  const onSetChatData = (text: string, _id: string) => {
    const formedData = {
      sender: Firstname,
      type: 'C',
      createdAt: JSON.stringify(moment()),
      text,
      _id,
    };

    const newReference = database().ref(`/chats/${BookingRefNo}`).push();
    newReference.set(formedData).then(() => console.log('Data updated.'));
  };

  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        left: {
          backgroundColor: v2Colors.lightGreen,
        },
        right: {
          backgroundColor: v2Colors.green,
        },
      }}
    />
  );

  const renderMessageText = (props: any) => (
    <MessageText
      {...props}
      textStyle={{
        left: {color: v2Colors.green, fontFamily: fonts.lexend.regular},
        right: {color: 'white', fontFamily: fonts.lexend.regular},
      }}
      customTextStyle={{fontSize: 16, lineHeight: 24}}
    />
  );

  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={{
        width: '85%',
        borderRadius: 7,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        marginHorizontal: 14,
        marginBottom: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: v2Colors.border,

        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 1,
      }}
      primaryStyle={{alignItems: 'center'}}
    />
  );

  const renderComposer = (props: any) => (
    <Composer
      {...props}
      textInputStyle={{
        fontFamily: fonts.lexend.regular,
        fontSize: 16,
        color: v2Colors.gray,
      }}
    />
  );

  const renderSend = (props: any) => (
    <Send
      {...props}
      disabled={!props.text}
      containerStyle={{
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
      }}>
      <SEND />
    </Send>
  );

  return (
    <View style={{flex: 1}}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          setInitChat(false);
          setSnapPoint(0);
        }}>
        <X_RED />
      </TouchableOpacity>

      <PureGiftedChatComponent
        messages={messages}
        onSend={onSend}
        renderBubble={renderBubble}
        renderMessageText={renderMessageText}
        renderInputToolbar={renderInputToolbar}
        renderComposer={renderComposer}
        renderSend={renderSend}
      />

      {/* {keyboardShown && isAndroid && <View style={{height: keyboardHeight}} />} */}
    </View>
  );
};
export default CustomChatComponent;
