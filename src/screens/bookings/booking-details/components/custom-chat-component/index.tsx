import React, {useCallback, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import notifee from '@notifee/react-native';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {useKeyboard} from '@react-native-community/hooks';
import {
  BottomSheetFlatList,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import {
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';
import moment from 'moment';
import _ from 'lodash';
import {useBooking} from '@services/hooks/useBooking';
import {v2Colors} from '@theme/themes';
import styles from './styles';

/**
 * ? SVGs
 */
import SEND from '@assets/v2/chat/icons/send.svg';
import X_RED from '@assets/v2/chat/icons/x-red.svg';
import GALLERY from '@assets/v2/homescreen/icons/gallery.svg';
import {RootState} from 'store';
import {NOTIFICATION_SOUNDS} from '@shared-constants';

interface ICustomChatComponent {
  ServiceProviderId: any;
  SPInfo: {DeviceId: string; PlatformOs: string};
  bookingItem: any;
  setInitChat: Function;
  setSnapPoint: Function;
}

interface ChatImageAttachment {
  image: string;
  imageName: string;
  imageType: string;
}

const CustomChatComponent: React.FC<ICustomChatComponent> = ({
  ServiceProviderId,
  SPInfo,
  bookingItem,
  setInitChat,
  setSnapPoint,
}) => {
  const {BookingRefNo} = bookingItem ?? {};

  /**
   * ? Hooks
   */
  const {sendNotification} = useBooking();
  const {keyboardShown} = useKeyboard();

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
  const [draftMessage, setDraftMessage] = useState<string>('');
  const [isUploadingAttachment, setIsUploadingAttachment] =
    useState<boolean>(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [imageLoadingMap, setImageLoadingMap] = useState<{
    [key: string]: boolean;
  }>({});
  const [isPreviewImageLoading, setIsPreviewImageLoading] =
    useState<boolean>(false);

  /**
   * ? Variables
   */
  const onSend = useCallback(
    () => {
      if (isUploadingAttachment) return;

      const text = draftMessage.trim();
      if (!text) return;
      const _id = `${Date.now()}`;

      const newMessage = {
        _id,
        text,
        createdAt: new Date().toISOString(),
        user: {
          _id: 1,
          name: Firstname,
        },
      };

      onSendChatNotif(text, _id);
      onGetCustomerChatCount(false);
      onGetSPChatCount(false);
      onSetChatData(text, _id);
      setMessages(previousMessages => [newMessage, ...previousMessages]);
      setDraftMessage('');
    },
    [
      draftMessage,
      BookingRefNo,
      Firstname,
      SPInfo,
      ServiceProviderId,
      customerId,
      isUploadingAttachment,
    ],
  );

  /**
   * ? Watchers
   */

  useEffect(() => {
    if (!BookingRefNo || !customerId || !ServiceProviderId || !Firstname)
      return;

    onGetCustomerChatCount(true);
    onGetSPChatCount(true);
    onGetChatMessages();
  }, [BookingRefNo, customerId, ServiceProviderId, Firstname]);

  useEffect(() => {
    if (!BookingRefNo) return;
    onGetChatMessages();
    // triggerDefaultNotification()
  }, [BookingRefNo, receivedChatInfo]);

  /**
   * ? Functions
   */
  const onSendChatNotif = (
    text: string,
    _id: string,
    attachment?: ChatImageAttachment,
    notificationBody: string = text,
  ) => {
    const {DeviceId, PlatformOs} = SPInfo;
    const messagePayload = {
      text,
      _id,
      bookingItem,
      ...attachment,
    };

    const notifPayload = {
      DeviceId,
      Priority: 'high',
      IsAndroiodDevice: PlatformOs === 'android' ? true : false,
      Data: {
        ScreenName: 'BOOKING_CHAT',
        Message: JSON.stringify(messagePayload),
        Remarks: '',
      },
      Notification: {
        Title: Firstname,
        Body: notificationBody,
        Sound: NOTIFICATION_SOUNDS.NOTIFICATION_DEFAULT,
      },
    };

    if (attachment?.image) {
      console.log('Chat image notification message payload:', messagePayload);
    }

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
    if (!BookingRefNo) return;

    database()
      .ref(`/chats/${BookingRefNo}`)
      .once('value')
      .then(snapshot => {
        const data = snapshot.val();
        console.log('onGetChatMessages data:', data);

        let newArray: Array<any> = [];

        if (!_.size(data)) {
          setMessages([]);
          return;
        }

        Object.keys(data).forEach(function (key) {
          const item = data[key];
          const {
            sender,
            text,
            type,
            createdAt,
            _id,
            image,
            imageUrl,
            imageName,
            imageType,
          } = item;
          const imageValue = image || imageUrl || '';
          let parsedCreatedAt = createdAt;

          if (typeof createdAt === 'string') {
            try {
              parsedCreatedAt = JSON.parse(createdAt);
            } catch {
              parsedCreatedAt = createdAt;
            }
          }

          const formedMessage = {
            _id,
            text: text || '',
            image: imageValue,
            imageName: imageName || '',
            imageType: imageType || '',
            createdAt: parsedCreatedAt || new Date(),
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
      })
      .catch(error => {
        console.log('onGetChatMessages error:', error);
        setMessages([]);
      });
  };

  const onSetChatData = (
    text: string,
    _id: string,
    attachment?: ChatImageAttachment,
  ) => {
    const formedData = {
      sender: Firstname,
      type: 'C',
      createdAt: JSON.stringify(moment()),
      text,
      _id,
      ...attachment,
    };

    if (attachment?.image) {
      console.log('Chat image database payload:', formedData);
    }

    const newReference = database().ref(`/chats/${BookingRefNo}`).push();
    newReference.set(formedData).then(() => console.log('Data updated.'));
  };

  const getStoragePath = (asset: any, _id: string) => {
    const extension =
      asset?.fileName?.split('.').pop() ||
      asset?.type?.split('/').pop() ||
      'jpg';

    return `chat-attachments/${BookingRefNo}/${_id}.${extension}`;
  };

  const uploadChatImage = async (asset: any, _id: string) => {
    if (!asset?.uri) throw new Error('Image URI is missing.');

    const imageRef = storage().ref(getStoragePath(asset, _id));
    const uploadUri = asset.uri.startsWith('file://')
      ? asset.uri.replace('file://', '')
      : asset.uri;

    await imageRef.putFile(uploadUri);

    const imageUrl = await imageRef.getDownloadURL();
    console.log('Chat image upload URL:', imageUrl);

    return imageUrl;
  };

  const onSendImage = async (asset: any) => {
    const _id = `${Date.now()}`;
    const text = draftMessage.trim();

    setIsUploadingAttachment(true);

    try {
      const imageUrl = await uploadChatImage(asset, _id);
      console.log('Chat image send URL:', imageUrl);

      const imageName = asset?.fileName || `${_id}.jpg`;
      const imageType = asset?.type || 'image/jpeg';
      const notificationText = text || 'Sent an image';
      const attachment = {
        image: imageUrl,
        imageName,
        imageType,
      };
      const imagePayload = {
        _id,
        bookingRefNo: BookingRefNo,
        text,
        localUri: asset?.uri,
        fileSize: asset?.fileSize,
        ...attachment,
      };

      console.log('Chat image payload:', imagePayload);

      const newMessage = {
        _id,
        text,
        ...attachment,
        createdAt: new Date().toISOString(),
        user: {
          _id: 1,
          name: Firstname,
        },
      };

      onSendChatNotif(text, _id, attachment, notificationText);
      onGetCustomerChatCount(false);
      onGetSPChatCount(false);
      onSetChatData(text, _id, attachment);
      setMessages(previousMessages => [newMessage, ...previousMessages]);
      setDraftMessage('');
    } catch (error) {
      console.log('onSendImage error:', error);
      Alert.alert('Chat', 'Image upload failed, please try again.');
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const onSelectImage = () => {
    if (isUploadingAttachment) return;

    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      maxWidth: 2000,
      maxHeight: 2000,
      quality: 0.8,
      selectionLimit: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      if (response.errorCode || response.errorMessage) {
        console.log(
          'ImagePicker Error: ',
          response.errorCode || response.errorMessage,
        );
        Alert.alert('Chat', 'Unable to select image, please try again.');
        return;
      }

      const asset = response.assets?.[0];

      if (!asset?.uri) {
        Alert.alert('Chat', 'Unable to select image, please try again.');
        return;
      }

      onSendImage(asset);
    });
  };

  const formatMessageTimestamp = (createdAt: any) => {
    const timestamp = moment(createdAt);

    if (!timestamp.isValid()) return '';

    return timestamp.format('MMM D, YYYY h:mm A');
  };

  const openImagePreview = (imageUrl: string) => {
    setIsPreviewImageLoading(true);
    setSelectedImageUrl(imageUrl);
  };

  const closeImagePreview = () => {
    setSelectedImageUrl('');
    setIsPreviewImageLoading(false);
  };

  const setMessageImageLoading = (imageUrl: string, isLoading: boolean) => {
    setImageLoadingMap(previousValue => ({
      ...previousValue,
      [imageUrl]: isLoading,
    }));
  };

  const renderMessage = ({item}: {item: any}) => {
    const isCurrentUser = item?.user?._id === 1;
    const timestamp = formatMessageTimestamp(item?.createdAt);
    const imageUri = item?.image || item?.imageUrl || '';
    const isMessageImageLoading = imageUri
      ? imageLoadingMap[imageUri] !== false
      : false;

    if (imageUri) {
      console.log('Chat image render URL:', imageUri);
    }

    return (
      <View
        style={[
          styles.messageBubble,
          isCurrentUser
            ? styles.messageBubbleRight
            : styles.messageBubbleLeft,
          !!imageUri && styles.messageImageBubble,
        ]}>
        {!!imageUri && (
          <Pressable
            onPress={() => openImagePreview(imageUri)}
            style={styles.messageImageContainer}>
            <Image
              source={{uri: imageUri}}
              style={styles.messageImage}
              resizeMode="cover"
              onLoadStart={() => setMessageImageLoading(imageUri, true)}
              onLoadEnd={() => setMessageImageLoading(imageUri, false)}
              onError={() => setMessageImageLoading(imageUri, false)}
            />
            {isMessageImageLoading && (
              <View style={styles.messageImageLoaderOverlay}>
                <ActivityIndicator size="small" color={v2Colors.green} />
              </View>
            )}
          </Pressable>
        )}
        {!!item?.text && (
          <Text
            style={[
              styles.messageText,
              isCurrentUser ? styles.messageTextRight : styles.messageTextLeft,
            ]}>
            {item?.text}
          </Text>
        )}
        {!!timestamp && (
          <Text
            style={[
              styles.messageTimestamp,
              isCurrentUser
                ? styles.messageTimestampRight
                : styles.messageTimestampLeft,
            ]}>
            {timestamp}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.closeButton}
        onPress={() => {
          setInitChat(false);
          setSnapPoint(-1);
        }}>
        <X_RED pointerEvents="none" />
      </Pressable>

      <BottomSheetFlatList
        style={styles.messageList}
        data={messages}
        keyExtractor={item => String(item._id)}
        renderItem={renderMessage}
        inverted
        contentContainerStyle={styles.messageListContent}
        nestedScrollEnabled
        scrollEnabled
        showsVerticalScrollIndicator
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      />

      <View
        style={[
          styles.inputContainer,
            Platform.OS === 'android' &&
            styles.androidKeyboardInputLift,
        ]}>
        <Pressable
          onPress={onSelectImage}
          disabled={isUploadingAttachment}
          style={[
            styles.attachmentButton,
            isUploadingAttachment && styles.attachmentButtonDisabled,
          ]}>
          {isUploadingAttachment ? (
            <ActivityIndicator size="small" color={v2Colors.green} />
          ) : (
            <GALLERY pointerEvents="none" height={20} width={20} />
          )}
        </Pressable>

        <BottomSheetTextInput
          value={draftMessage}
          onChangeText={setDraftMessage}
          placeholder="Enter Message"
          placeholderTextColor={v2Colors.gray}
          returnKeyType="send"
          onSubmitEditing={onSend}
          style={styles.textInput}
        />

        <Pressable
          onPress={onSend}
          disabled={!draftMessage.trim() || isUploadingAttachment}
          style={[
            styles.sendButton,
            (!draftMessage.trim() || isUploadingAttachment) &&
              styles.sendButtonDisabled,
          ]}>
          <SEND pointerEvents="none" />
        </Pressable>
      </View>

      <Modal
        visible={!!selectedImageUrl}
        transparent
        animationType="fade"
        onRequestClose={closeImagePreview}>
        <View style={styles.imagePreviewModal}>
          <Pressable
            onPress={closeImagePreview}
            style={styles.imagePreviewCloseButton}>
            <X_RED pointerEvents="none" height={18} width={18} />
          </Pressable>

          <ScrollView
            style={styles.imagePreviewScroll}
            contentContainerStyle={styles.imagePreviewScrollContent}
            centerContent
            maximumZoomScale={4}
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}>
            {!!selectedImageUrl && (
              <Image
                source={{uri: selectedImageUrl}}
                style={styles.imagePreviewImage}
                resizeMode="contain"
                onLoadStart={() => setIsPreviewImageLoading(true)}
                onLoadEnd={() => setIsPreviewImageLoading(false)}
                onError={() => setIsPreviewImageLoading(false)}
              />
            )}
          </ScrollView>
          {isPreviewImageLoading && (
            <View style={styles.imagePreviewLoaderOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};
export default CustomChatComponent;
