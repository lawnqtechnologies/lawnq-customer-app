import {ImageStyle, StyleSheet, TextStyle, ViewStyle} from 'react-native';
import fonts from '@fonts';
import {v2Colors} from '@theme/themes';

interface Styles {
  container: ViewStyle;
  closeButton: ViewStyle;
  messageList: ViewStyle;
  messageListContent: ViewStyle;
  messageBubble: ViewStyle;
  messageBubbleLeft: ViewStyle;
  messageBubbleRight: ViewStyle;
  messageImageBubble: ViewStyle;
  messageImageContainer: ViewStyle;
  messageImage: ImageStyle;
  messageImageLoaderOverlay: ViewStyle;
  messageText: TextStyle;
  messageTextLeft: TextStyle;
  messageTextRight: TextStyle;
  messageTimestamp: TextStyle;
  messageTimestampLeft: TextStyle;
  messageTimestampRight: TextStyle;
  inputContainer: ViewStyle;
  attachmentButton: ViewStyle;
  attachmentButtonDisabled: ViewStyle;
  textInput: TextStyle;
  sendButton: ViewStyle;
  sendButtonDisabled: ViewStyle;
  imagePreviewModal: ViewStyle;
  imagePreviewCloseButton: ViewStyle;
  imagePreviewScroll: ViewStyle;
  imagePreviewScrollContent: ViewStyle;
  imagePreviewImage: ImageStyle;
  imagePreviewLoaderOverlay: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    marginTop: 4,
    marginRight: 18,
    marginBottom: 2,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    maxWidth: '80%',
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  messageBubbleLeft: {
    alignSelf: 'flex-start',
    backgroundColor: v2Colors.lightGreen,
  },
  messageBubbleRight: {
    alignSelf: 'flex-end',
    backgroundColor: v2Colors.green,
  },
  messageImageBubble: {
    maxWidth: '86%',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  messageImageContainer: {
    width: 220,
    height: 160,
    borderRadius: 10,
    marginBottom: 6,
    overflow: 'hidden',
    backgroundColor: v2Colors.backgroundGray,
  },
  messageImage: {
    width: '100%',
    height: '100%',
    backgroundColor: v2Colors.backgroundGray,
  },
  messageImageLoaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  messageText: {
    fontFamily: fonts.lexend.regular,
    fontSize: 16,
    lineHeight: 22,
  },
  messageTextLeft: {
    color: v2Colors.green,
  },
  messageTextRight: {
    color: 'white',
  },
  messageTimestamp: {
    fontFamily: fonts.lexend.regular,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },
  messageTimestampLeft: {
    color: v2Colors.greenShade2,
  },
  messageTimestampRight: {
    color: 'rgba(255,255,255,0.78)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginTop: 6,
    marginBottom: 16,
    paddingHorizontal: 10,
    minHeight: 58,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: v2Colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 1,
  },
  attachmentButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  attachmentButtonDisabled: {
    opacity: 0.5,
  },
  textInput: {
    flex: 1,
    minHeight: 52,
    paddingVertical: 0,
    color: '#1F2933',
    fontFamily: fonts.lexend.regular,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  imagePreviewModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
  },
  imagePreviewCloseButton: {
    position: 'absolute',
    top: 48,
    right: 24,
    zIndex: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  imagePreviewScroll: {
    flex: 1,
  },
  imagePreviewScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreviewImage: {
    width: '100%',
    height: '100%',
  },
  imagePreviewLoaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.24)',
  },
});
export default styles;
