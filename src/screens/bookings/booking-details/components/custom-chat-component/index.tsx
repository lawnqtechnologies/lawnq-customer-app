import React, {useCallback, useEffect, useState, useRef} from 'react';
import {useSelector} from 'react-redux';
import {
  GiftedChat,
  Bubble,
  MessageText,
  Composer,
  InputToolbar,
  Send,
  MessageImage,
} from 'react-native-gifted-chat';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import notifee from '@notifee/react-native';
import {Alert, View, Pressablety, Platform, ActivityIndicator, Text, Image, PermissionsAndroid, Modal} from 'react-native';
import moment from 'moment';
import _ from 'lodash';
import {useKeyboard} from '@react-native-community/hooks';
import {
  launchCamera,
  launchImageLibrary,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import FastImage from 'react-native-fast-image';

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
import CAMERA from '@assets/v2/homescreen/icons/camera.svg';
import {RootState} from 'store';
import {NOTIFICATION_SOUNDS} from '@shared-constants';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';

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
  renderMessageImage: any;
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
      renderMessageImage,
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
        renderMessageImage={renderMessageImage}
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

  /**
   * ? States
   */
  const [messages, setMessages] = useState<Array<any>>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState<boolean>(false);
  const [imageViewerUri, setImageViewerUri] = useState<string | null>(null);
  const latestUploadIdRef = useRef<string | null>(null);
  const isPickingImageRef = useRef<boolean>(false);
  const onSendRef = useRef<any>(null);

  const ensurePickerNotBusy = () => {
    if (isUploading) return false;
    if (isPickingImageRef.current) return false;
    return true;
  };

  const applyFirebaseChatData = useCallback((data: any) => {
    let newArray: Array<any> = [];

    if (!_.size(data)) {
      // If Firebase has no messages, keep whatever local pending messages exist.
      setMessages((prevMessages: any[]) => prevMessages);
      return;
    }

    const now = Date.now();

    Object?.keys(data).forEach(function (key) {
      const item = data[key];
      const {sender, text, type, createdAt, _id, image} = item;

      const parsedCreatedAt = createdAt ? JSON.parse(createdAt) : '';
      const createdAtDate = parsedCreatedAt ? new Date(parsedCreatedAt) : new Date();
      const messageTime = createdAtDate.getTime();
      const isRecent = now - messageTime < 10000; // Last 10 seconds

      const formedMessage: any = {
        _id,
        text: text || '',
        createdAt: createdAtDate,
        user: {
          _id: type === 'C' ? 1 : 2,
          name: sender,
        },
      };

      if (image) {
        formedMessage.image = image;
        console.log(`📷 Found image message: _id=${_id}, image=${String(image).substring(0, 50)}...`);
      }

      // Firebase messages are always 'sent'
      if (!formedMessage.status) {
        formedMessage.status = 'sent';
      }

      newArray.push(formedMessage);
    });

    const sortedArray: Array<any> = newArray.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const imageMessages = sortedArray.filter(m => m.image);
    console.log(`✅ Loaded ${sortedArray.length} messages from Firebase (${imageMessages.length} with images)`);

    // Merge Firebase messages into local state:
    // - keep local pending/uploading messages that haven't hit Firebase yet
    // - if Firebase has the message, DO NOT immediately force status='sent' if local is still pending
    //   (otherwise spinner disappears and Android sheet "blinks" due to multiple fast state transitions)
    setMessages((prevMessages: any[]) => {
      const firebaseIds = new Set(sortedArray.map(m => m._id));

      const keepLocalPending = prevMessages.filter((m: any) => {
        const status = m?.status;
        return (
          (m?.pending === true || status === 'uploading' || status === 'sending' || status === 'failed') &&
          !firebaseIds.has(m._id)
        );
      });

      const prevById = new Map(prevMessages.map((m: any) => [m._id, m]));
      const isSameMessage = (a: any, b: any) => {
        if (a === b) return true;
        if (!a || !b) return false;
        const aCreated = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
        const bCreated = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
        return (
          a._id === b._id &&
          (a.text || '') === (b.text || '') &&
          (a.image || '') === (b.image || '') &&
          aCreated === bCreated &&
          (a.user?._id ?? null) === (b.user?._id ?? null) &&
          (a.user?.name || '') === (b.user?.name || '') &&
          (a.status || '') === (b.status || '')
        );
      };

      const mergedFirebase = sortedArray.map((fm: any) => {
        const local = prevById.get(fm._id);
        if (local) {
          const next = {
            ...local,
            ...fm,
            // Preserve local pending state; only mark as sent once we explicitly clear pending.
            pending: local?.pending === true ? true : false,
            status: local?.pending === true ? (local?.status || 'sending') : 'sent',
            // Preserve local preview across the local->remote transition
            localImage: local?.localImage ?? local?.image,
          };
          // Preserve object identity if nothing important changed to avoid GiftedChat "blink"/rerender.
          return isSameMessage(local, next) ? local : next;
        }
        return {
          ...fm,
          pending: false,
          status: 'sent',
        };
      });

      const mergedAll = [...keepLocalPending, ...mergedFirebase].sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      // If nothing changed (same order and same object refs), return prevMessages to prevent rerender.
      if (mergedAll.length === prevMessages.length) {
        let unchanged = true;
        for (let i = 0; i < mergedAll.length; i++) {
          if (mergedAll[i] !== prevMessages[i]) {
            unchanged = false;
            break;
          }
        }
        if (unchanged) return prevMessages;
      }
      return mergedAll;
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
    // Live subscription: this is the root-cause fix for "need to close & reopen to see latest"
    const ref = database().ref(`/chats/${BookingRefNo}`);
    const onValue = (snapshot: any) => {
      applyFirebaseChatData(snapshot.val());
    };
    ref.on('value', onValue);

    return () => {
      ref.off('value', onValue);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [BookingRefNo, customerId, ServiceProviderId, Firstname, applyFirebaseChatData]);
  


  /**
   * ? Functions
   */
  
  /**
   * ? onSend callback - needs to be defined before onUploadImage
   */
  const onSend = useCallback((messages = []) => {
    if (!messages || messages.length === 0) {
      console.log('onSend: No messages to send');
      return;
    }
    
    const message = messages[0];
    const {text, _id, image} = message;
    
    console.log('onSend called with message:', {text, _id, image});
    
    // Update local state FIRST so user sees the message immediately
    // This ensures the message appears even if Firebase refresh happens
    setMessages((previousMessages: any) => {
      // Check if message already exists to avoid duplicates
      const messageExists = previousMessages.some((msg: any) => msg._id === _id);
      if (messageExists) {
        console.log('Message already exists in state, skipping append');
        return previousMessages;
      }
      console.log('Appending message to local state with image:', image);
      const updatedMessages = GiftedChat.append(previousMessages, messages);
      console.log('Updated messages count:', updatedMessages.length);
      return updatedMessages;
    });
    
    // Then save to Firebase (this happens async, so local state update is already visible)
    try {
      onSetChatData(text || '', _id, image);
      onSendChatNotif(text || 'Sent an image', _id);
      onGetCustomerChatCount(false);
      onGetSPChatCount(false);
      console.log('onSend: All helper functions called successfully');
    } catch (error) {
      console.error('onSend: Error calling helper functions:', error);
    }
  }, [Firstname, BookingRefNo, ServiceProviderId, customerId, SPInfo]);
  
  // Store the latest onSend in a ref so onUploadImage can always access it
  useEffect(() => {
    onSendRef.current = onSend;
  }, [onSend]);

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

  const onGetChatMessages = useCallback((forceRefresh?: boolean) => {
    // Kept for manual/forced refresh (e.g., after DB write), but primary flow is live subscription.
    console.log('🔄 Fetching chat messages from Firebase...', forceRefresh ? '(forced)' : '');
    database()
      .ref(`/chats/${BookingRefNo}`)
      .once('value')
      .then(snapshot => applyFirebaseChatData(snapshot.val()))
      .catch(error => {
        console.error('Error fetching chat messages:', error);
      });
  }, [BookingRefNo, applyFirebaseChatData]);

  const onSetChatData = useCallback(
    async (text: string, _id: string, image?: string, firebaseKey?: string): Promise<void> => {
    const formedData: any = {
      sender: Firstname,
      type: 'C',
      createdAt: JSON.stringify(moment()),
      text: text || '',
      _id,
    };
    
    // CRITICAL: Always include image field if it exists
    if (image) {
      formedData.image = image;
      console.log('Saving message to Firebase with image:', image);
    } else {
      console.log('Saving message to Firebase without image');
    }

    console.log('onSetChatData - Full data being saved:', JSON.stringify(formedData, null, 2));

    // Root-cause fix: use Firebase push key as the canonical message identity when provided.
    // This avoids `_id` collisions (GiftedChat keys) which can cause "new image shows previous image"
    // until a full remount.
    const ref = firebaseKey
      ? database().ref(`/chats/${BookingRefNo}/${firebaseKey}`)
      : database().ref(`/chats/${BookingRefNo}`).push();

    return ref.set(formedData).then(() => {
      console.log('✅ Data updated to Firebase successfully');
      console.log('Saved data included image:', !!formedData.image);
    }).catch((error) => {
      console.error('Error saving to Firebase:', error);
      throw error;
    });
  }, [Firstname, BookingRefNo]);

  /**
   * ? Image upload function - defined after onSend
   */
  const onUploadImage = useCallback(
    async (
      uri: string,
      fileName: string,
      mimeType: string,
      uploadId: string,
      messageId: string,
      base64?: string,
    ) => {
    // Log EXACT parameters received
    console.log('=== onUploadImage CALLED ===');
    console.log('URI parameter:', uri);
    console.log('fileName parameter:', fileName);
    console.log('mimeType parameter:', mimeType);
    console.log('uploadId parameter:', uploadId);
    console.log('Current latestUploadIdRef:', latestUploadIdRef.current);
    console.log('base64 provided:', !!base64, base64 ? `(len=${base64.length})` : '');
    
    const uploadUri = uri?.trim?.() || '';
    const hasBase64 = !!(base64 && typeof base64 === 'string' && base64.length > 0);

    if (!hasBase64 && (!uploadUri || !uploadUri.trim())) {
      console.error('❌ Invalid upload source (no base64 and no valid URI)');
      setIsUploading(false);
      latestUploadIdRef.current = null;
      return;
    }
    
    console.log('=== STARTING UPLOAD ===');
    console.log('Using base64 upload:', hasBase64);
    console.log('Using URI:', uploadUri);
    console.log('UploadId:', uploadId);
    
    try {
      // Verify this is still the current upload
      if (latestUploadIdRef.current !== uploadId) {
        console.log('❌ Upload cancelled - not the latest');
        console.log('Expected:', uploadId, 'Current:', latestUploadIdRef.current);
        setIsUploading(false);
        return;
      }
      
      const imageId = `chat_${BookingRefNo}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const fileExtension = fileName?.split('.').pop() || 'jpg';
      const storagePath = `chat/${BookingRefNo}/${imageId}.${fileExtension}`;
      
      console.log('=== UPLOADING TO FIREBASE STORAGE ===');
      console.log('Storage path:', storagePath);
      
      const reference = storage().ref(storagePath);
      if (hasBase64) {
        // Root-cause fix for "previous image": upload the exact bytes returned by the picker,
        // not a possibly reused temp file path.
        console.log('Calling putString(base64)');
        await reference.putString(base64 as string, 'base64', {contentType: mimeType});
      } else {
        console.log('Calling putFile with URI:', uploadUri);
        await reference.putFile(uploadUri);
      }
      console.log('✅ File uploaded to Firebase Storage');
      
      // Check again if this is still the latest upload
      if (latestUploadIdRef.current !== uploadId) {
        console.log('❌ Upload cancelled after file upload');
        setIsUploading(false);
        return;
      }
      
      console.log('✅ File upload completed');
      
      // Get the download URL
      const downloadURL = await reference.getDownloadURL();
      console.log('✅ Download URL:', downloadURL);
      
      if (!downloadURL) {
        throw new Error('Download URL is empty');
      }
      
      // Final check before saving
      if (latestUploadIdRef.current !== uploadId) {
        console.log('❌ Upload cancelled before saving');
        setIsUploading(false);
        return;
      }
      
      console.log('=== SAVING MESSAGE TO FIREBASE ===');
      console.log('Message ID:', messageId);
      console.log('Image URL:', downloadURL);

      // Update the existing local message:
      // - keep local preview (localImage) until remote URL is actually loaded to avoid flicker
      // - set remoteImage to the download URL
      // - move status from 'uploading' -> 'sending'
      setMessages((previousMessages: any[]) =>
        previousMessages.map((msg: any) => {
          if (msg._id === messageId) {
            return {
              ...msg,
              localImage: msg?.localImage ?? msg?.image,
              remoteImage: downloadURL,
              status: 'sending',
            };
          }
          return msg;
        }),
      );

      // Save to Firebase; when it succeeds, mark as sent (green tick)
      onSetChatData('', messageId, downloadURL, messageId)
        .then(() => {
          console.log('✅ Message saved to Firebase database');
          // Clear local pending after DB write success so the spinner stops at the right time.
          setMessages((previousMessages: any[]) =>
            previousMessages.map((msg: any) => {
              if (msg._id !== messageId) return msg;
              return {
                ...msg,
                pending: false,
                status: 'sent',
              };
            }),
          );
        })
        .catch((error) => {
          console.error('Error saving to Firebase:', error);
          setMessages((previousMessages: any[]) =>
            previousMessages.map((msg: any) => {
              if (msg._id === messageId) return {...msg, status: 'failed', pending: false};
              return msg;
            }),
          );
        });
      
      onSendChatNotif('Sent an image', messageId);
      onGetCustomerChatCount(false);
      onGetSPChatCount(false);
      
      console.log('=== IMAGE UPLOAD COMPLETED ===');
      console.log('✅ Message added to UI and saved to Firebase with image URL:', downloadURL);
      
      // Hide loader immediately since message is now visible
      setIsUploading(false);
      latestUploadIdRef.current = null;
      
     
    } catch (error: any) {
      if (latestUploadIdRef.current === uploadId) {
        console.error('❌ === IMAGE UPLOAD ERROR ===');
        console.error('Error:', error);
        setIsUploading(false);
        latestUploadIdRef.current = null;
        // Mark the local message as failed (so user sees error indicator instead of spinner)
        setMessages((previousMessages: any[]) =>
          previousMessages.map((msg: any) => {
            if (msg._id === messageId) return {...msg, status: 'failed'};
            return msg;
          }),
        );
        Alert.alert('Upload Failed', `Failed to upload image: ${error?.message || 'Unknown error'}`);
      }
    }
  },
  [BookingRefNo, Firstname, ServiceProviderId, customerId, SPInfo, onGetChatMessages, onSetChatData],
  );

  const handlePickedAsset = useCallback((asset: any) => {
    // Extract values directly from asset
    const selectedUri = asset?.fileCopyUri || asset?.uri || asset?.originalPath;
    const selectedFileName = asset?.fileName;
    const selectedType = asset?.type;
    const selectedBase64 = asset?.base64;

    if (!selectedUri) {
      Alert.alert('Error', 'No image URI found. Please try again.');
      return;
    }

    const freshUri = String(selectedUri).trim();
    if (!freshUri) {
      Alert.alert('Error', 'Invalid image URI. Please try again.');
      return;
    }

    // Reserve a Firebase push key up-front and use it as the message _id.
    const messageRef = database().ref(`/chats/${BookingRefNo}`).push();
    const firebaseMessageKey = messageRef.key;
    if (!firebaseMessageKey) {
      Alert.alert('Error', 'Failed to prepare message. Please try again.');
      return;
    }

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const uploadId = `upload_${timestamp}_${randomId}`;
    const uploadFileName = selectedFileName || `image_${timestamp}.jpg`;
    const uploadMimeType = selectedType || 'image/jpeg';

    // Create the message locally FIRST (gallery/camera both)
    const localMessageId = firebaseMessageKey;
    const localCreatedAt = new Date();
    const base64PreviewUri = selectedBase64
      ? `data:${uploadMimeType};base64,${selectedBase64}`
      : null;
    const localDisplayUri = base64PreviewUri || freshUri;

    const localImageMessage = {
      _id: localMessageId,
      text: '',
      createdAt: localCreatedAt,
      user: {
        _id: 1,
        name: Firstname,
      },
      image: localDisplayUri,
      localImage: localDisplayUri,
      pending: true,
      status: 'uploading',
    };

    setMessages((previousMessages: any[]) =>
      GiftedChat.append(previousMessages, [localImageMessage]),
    );

    latestUploadIdRef.current = uploadId;
    setIsUploading(true);

    onUploadImage(
      freshUri,
      uploadFileName,
      uploadMimeType,
      uploadId,
      localMessageId,
      selectedBase64,
    ).catch((error) => {
      console.error('Upload promise rejected:', error);
      setIsUploading(false);
      latestUploadIdRef.current = null;
      setMessages((previousMessages: any[]) =>
        previousMessages.map((msg: any) => {
          if (msg._id === localMessageId) return {...msg, status: 'failed'};
          return msg;
        }),
      );
    });
  }, [BookingRefNo, Firstname, onUploadImage]);

  const onPickFromGallery = useCallback(() => {
    if (!ensurePickerNotBusy()) return;
    isPickingImageRef.current = true;

    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      maxWidth: 2000,
      maxHeight: 2000,
      quality: 0.8,
      selectionLimit: 1,
      includeExtra: true,
      includeBase64: true,
    };

    launchImageLibrary(options, (response: any) => {
      isPickingImageRef.current = false;
      if (response?.didCancel) return;
      if (response?.errorCode || response?.errorMessage || response?.error) {
        const pickerError = response.errorMessage || response.error || response.errorCode;
        Alert.alert('Error', `Failed to pick image: ${pickerError}`);
        return;
      }
      const asset = response?.assets?.[0];
      if (!asset) {
        Alert.alert('Error', 'No image selected. Please try again.');
        return;
      }
      handlePickedAsset(asset);
    });
  }, [handlePickedAsset, isUploading]);

  const onPickFromCamera = useCallback(() => {
    if (!ensurePickerNotBusy()) return;
    isPickingImageRef.current = true;

    const options: any = {
      mediaType: 'photo',
      maxWidth: 2000,
      maxHeight: 2000,
      quality: 0.8,
      includeExtra: true,
      includeBase64: true,
      saveToPhotos: false,
      cameraType: 'back',
    };

    const run = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message: 'We need access to your camera to take photos.',
              buttonPositive: 'Allow',
              buttonNegative: 'Deny',
            },
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            isPickingImageRef.current = false;
            Alert.alert('Permission required', 'Camera permission is required to take a photo.');
            return;
          }
        }

        launchCamera(options, (response: any) => {
          isPickingImageRef.current = false;
          if (response?.didCancel) return;
          if (response?.errorCode || response?.errorMessage || response?.error) {
            const pickerError = response.errorMessage || response.error || response.errorCode;
            Alert.alert('Error', `Failed to take photo: ${pickerError}`);
            return;
          }
          const asset = response?.assets?.[0];
          if (!asset) {
            Alert.alert('Error', 'No photo captured. Please try again.');
            return;
          }
          handlePickedAsset(asset);
        });
      } catch (e: any) {
        isPickingImageRef.current = false;
        Alert.alert('Error', `Failed to take photo: ${e?.message || 'Unknown error'}`);
      }
    };

    run();
  }, [handlePickedAsset, isUploading]);

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

  const renderInputToolbar = useCallback((props: any) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 14,
        marginBottom: 20,
      }}>
      {/* Gallery */}
      <Pressablety
        onPress={onPickFromGallery}
        activeOpacity={0.7}
        style={{
          width: 44,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 8,
        }}>
        <Icon
          name="photo-library"
          type={IconType.MaterialIcons}
          size={22}
          color={isUploading ? v2Colors.border : v2Colors.green}
        />
      </Pressablety>
      {/* Camera */}
      <Pressablety
        onPress={onPickFromCamera}
        activeOpacity={0.7}
        style={{
          width: 44,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 8,
        }}>
        {isUploading ? (
          <ActivityIndicator size="small" color={v2Colors.green} />
        ) : (
          <Icon
            name="photo-camera"
            type={IconType.MaterialIcons}
            size={22}
            color={v2Colors.green}
          />
        )}
      </Pressablety>
      <InputToolbar
        {...props}
        containerStyle={{
          flex: 1,
          borderRadius: 7,
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 10,
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
    </View>
  ), [onPickFromGallery, onPickFromCamera, isUploading]);

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

  const renderMessageImage = useCallback((props: any) => {
    const {currentMessage} = props;
    
    if (currentMessage && currentMessage.image) {
      const imageField = typeof currentMessage.image === 'string'
        ? currentMessage.image
        : currentMessage.image?.uri || currentMessage.image;
      const remoteImageField =
        typeof currentMessage.remoteImage === 'string' ? currentMessage.remoteImage : undefined;
      const localImageField =
        typeof currentMessage.localImage === 'string' ? currentMessage.localImage : undefined;

      const isImageRemote = typeof imageField === 'string' && /^https?:\/\//.test(imageField);
      const remoteUrl = isImageRemote
        ? imageField
        : (remoteImageField && /^https?:\/\//.test(remoteImageField) ? remoteImageField : undefined);

      // Avoid swapping Image <-> FastImage (can cause Android bottom-sheet flicker):
      // Always render local preview as the base layer (when available), and render the remote FastImage overlay on top.
      const fallbackUrl = remoteUrl || imageField;
      const baseLocalUrl = localImageField || (typeof imageField === 'string' && !/^https?:\/\//.test(imageField) ? imageField : undefined);
      const shouldRenderLocalBase = !!baseLocalUrl;
      const shouldRenderRemoteOverlay = !!remoteUrl;
      
      const messageStatus = currentMessage.status; // 'uploading' | 'sending' | 'sent' | 'failed' | undefined
      const isPending =
        currentMessage.pending === true ||
        messageStatus === 'uploading' ||
        messageStatus === 'sending';
      const isOurMessage = currentMessage.user && currentMessage.user._id === 1;

      const openViewer = () => {
        // Prefer remote URL when available; otherwise fall back to local/base64 preview.
        const uriToView = remoteUrl || baseLocalUrl || fallbackUrl;
        if (!uriToView || typeof uriToView !== 'string') return;
        setImageViewerUri(uriToView);
        setIsImageViewerOpen(true);
      };
      
      return (
        // IMPORTANT (Android): give the container an explicit size.
        // Absolute-positioned children (remote overlay / loader) won't size the parent, which can
        // make the image "load" but remain invisible (0 height).
        <Pressablety
          activeOpacity={0.9}
          onPress={openViewer}
          style={{margin: 3, width: 200, height: 200, borderRadius: 13, overflow: 'hidden', position: 'relative'}}>
          {shouldRenderLocalBase ? (
            <Image
              source={{uri: baseLocalUrl}}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 13,
                opacity: isPending ? 0.7 : 1,
              }}
              resizeMode="cover"
              onError={(error) => {
                console.error('Image load error:', error?.nativeEvent);
                console.error('Failed to load local image URI:', baseLocalUrl);
              }}
            />
          ) : null}

          {shouldRenderRemoteOverlay ? (
            <FastImage
              source={{
                uri: remoteUrl!,
                priority: FastImage.priority.high,
                cache: isPending ? FastImage.cacheControl.web : FastImage.cacheControl.immutable,
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: 13,
                opacity: isPending ? 0.7 : 1,
              }}
              resizeMode={FastImage.resizeMode.cover}
              onError={(error) => {
                console.error('FastImage load error:', error);
                console.error('Failed to load remote image URL:', remoteUrl);
              }}
              onLoad={() => {
                console.log('✅ FastImage loaded successfully:', remoteUrl);
              }}
            />
          ) : null}

          {/* If no local preview exists, fall back to rendering whatever we have */}
          {!shouldRenderLocalBase && !shouldRenderRemoteOverlay ? (
            <Image
              source={{uri: fallbackUrl}}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 13,
                opacity: isPending ? 0.7 : 1,
              }}
              resizeMode="cover"
            />
          ) : null}

          {isPending && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 13,
              }}>
              <ActivityIndicator size="large" color="white" />
            </View>
          )}
          
          {/* Status indicator (green tick for sent messages) - only show for our messages */}
          {isOurMessage && messageStatus === 'sent' && (
            <View
              style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 10,
                width: 22,
                height: 22,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 3,
              }}>
              <Icon
                name="check"
                type={IconType.MaterialIcons}
                size={16}
                color={v2Colors.green}
              />
            </View>
          )}
          
          {/* Sending indicator (clock icon) - only show for our messages */}
          {isOurMessage && (messageStatus === 'uploading' || messageStatus === 'sending') && (
            <View
              style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 10,
                width: 22,
                height: 22,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 3,
              }}>
              <ActivityIndicator size="small" color={v2Colors.gray} />
            </View>
          )}

          {/* Failed indicator */}
          {isOurMessage && messageStatus === 'failed' && (
            <View
              style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 10,
                width: 22,
                height: 22,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 3,
              }}>
              <Icon
                name="error-outline"
                type={IconType.MaterialIcons}
                size={16}
                color={v2Colors.lightRed}
              />
            </View>
          )}
        </Pressablety>
      );
    }
    return null;
  }, []);

  return (
    <View style={{flex: 1}}>
      <Pressablety
        style={styles.closeButton}
        onPress={() => {
          setInitChat(false);
          setSnapPoint(0);
        }}>
        <X_RED />
      </Pressablety>

      <PureGiftedChatComponent
        messages={messages}
        onSend={onSend}
        renderBubble={renderBubble}
        renderMessageText={renderMessageText}
        renderInputToolbar={renderInputToolbar}
        renderComposer={renderComposer}
        renderSend={renderSend}
        renderMessageImage={renderMessageImage}
      />

      <Modal
        visible={isImageViewerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsImageViewerOpen(false)}>
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.95)'}}>
          <Pressablety
            onPress={() => setIsImageViewerOpen(false)}
            activeOpacity={0.8}
            style={{
              position: 'absolute',
              top: 50,
              right: 16,
              zIndex: 10,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.15)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Icon
              name="close"
              type={IconType.MaterialIcons}
              size={22}
              color="white"
            />
          </Pressablety>

          <Pressablety
            activeOpacity={1}
            onPress={() => setIsImageViewerOpen(false)}
            style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16}}>
            {imageViewerUri ? (
              <Image
                source={{uri: imageViewerUri}}
                style={{width: '100%', height: '100%'}}
                resizeMode="contain"
              />
            ) : null}
          </Pressablety>
        </View>
      </Modal>

      {/* {keyboardShown && isAndroid && <View style={{height: keyboardHeight}} />} */}
    </View>
  );
};
export default CustomChatComponent;
