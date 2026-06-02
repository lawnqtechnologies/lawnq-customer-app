import React, { useMemo, useRef, useState } from "react";
import {
  View,
  StyleProp,
  ViewStyle,
  Alert,
  TextInput,
  Pressable,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { useSelector } from "react-redux";
import storage from "@react-native-firebase/storage";
import FastImage from "react-native-fast-image";
import {
  Asset,
  ImageLibraryOptions,
  launchImageLibrary,
} from "react-native-image-picker";
import * as NavigationService from "react-navigation-helpers";
import createStyles from "./SupportScreen.style";
import { RootState } from "store";
import { SCREENS } from "@shared-constants";
import Text from "@shared-components/text-wrapper/TextWrapper";
import KeyboardHandler from "@shared-components/containers/KeyboardHandler";
import CommonButton from "@shared-components/buttons/CommonButton";
import WholeScreenLoader from "@shared-components/loaders/WholeScreenLoader";
import HeaderContainer from "@shared-components/headers/HeaderContainer";
import { onSendEmail } from "@services/api/email.service";
import {useSafeBottomPadding} from 'shared/functions/useSafeBottomInset';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ISupportScreenProps {
  style?: CustomStyleProp;
  navigation: any;
  route: any;
}

const SUPPORT_EMAIL = "Support@lawnq.com.au";
const SUPPORT_SOURCE_NOTE = "This is from support page of customer app.";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const SupportScreen: React.FC<ISupportScreenProps> = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const submitBottomPadding = useSafeBottomPadding(30);
  const [supportMessage, setSupportMessage] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { customerId, customerInfo } = useSelector(
    (state: RootState) => state.user,
  );

  const textRef = useRef<any>();

  const selectImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: "photo",
      maxWidth: 2000,
      maxHeight: 2000,
      selectionLimit: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        console.log("ImagePicker Error: ", response.errorMessage);
        Alert.alert("Image Upload", "Unable to select image.");
        return;
      }

      const asset = response.assets?.[0];

      if (!asset?.uri) {
        Alert.alert("Image Upload", "Selected image is invalid.");
        return;
      }

      setSelectedImage(asset);
    });
  };

  const getImageExtension = (asset: Asset) =>
    asset.fileName?.split(".").pop() || asset.type?.split("/").pop() || "jpg";

  const getStoragePath = (asset: Asset) => {
    const extension = getImageExtension(asset);
    const safeCustomerId =
      customerId === null || customerId === undefined
        ? "unknown-customer"
        : String(customerId);

    return `support-email/${safeCustomerId}/${Date.now()}.${extension}`;
  };

  const uploadSupportImage = async (asset: Asset) => {
    if (!asset.uri) throw new Error("Image URI is missing.");

    const imageRef = storage().ref(getStoragePath(asset));
    const uploadUri = asset.uri.startsWith("file://")
      ? asset.uri.replace("file://", "")
      : asset.uri;

    await imageRef.putFile(uploadUri);

    return imageRef.getDownloadURL();
  };

  const UploadImage = () => (
    <View>
      <Pressable onPress={selectImage} style={styles.button}>
        <Text color="white">
          {selectedImage ? "Change Image" : "Select Image"}
        </Text>
      </Pressable>
      <View style={styles.imageContainer}>
        {selectedImage?.uri ? (
          <FastImage
            source={{ uri: selectedImage.uri }}
            style={styles.imageBox}
            resizeMode={FastImage.resizeMode.contain}
          />
        ) : null}
      </View>
    </View>
  );

  const sendMail = async () => {
    const trimmedMessage = supportMessage.trim();
    const trimmedSubject = subject.trim();

    if (!trimmedMessage.length) {
      Alert.alert("Please enter the description of the issue");
      return;
    }
    if (!trimmedSubject.length) {
      Alert.alert("Please enter the subject of the issue");
      return;
    }

    const senderName =
      [customerInfo?.Firstname, customerInfo?.Lastname]
        .filter(Boolean)
        .join(" ") || "Customer";
    const customerIdText =
      customerId === null || customerId === undefined ? "" : String(customerId);
    const customerMobile = customerInfo?.MobileNumber ?? "";

    try {
      setIsLoading(true);

      const imageUrl = selectedImage
        ? await uploadSupportImage(selectedImage)
        : "";

      const plainText = [
        SUPPORT_SOURCE_NOTE,
        "",
        trimmedMessage,
        "",
        imageUrl ? `Image URL: ${imageUrl}` : "",
        `Customer Name: ${senderName}`,
        `Customer ID: ${customerIdText}`,
        `Customer Mobile Number: ${customerMobile}`,
      ]
        .filter(Boolean)
        .join("\n");

      const imageHtml = imageUrl
        ? `<p><img src="${escapeHtml(
            imageUrl,
          )}" style="max-width:100%;height:auto;" /></p>`
        : "";

      const htmlContent = [
        `<p><b>${escapeHtml(SUPPORT_SOURCE_NOTE)}</b></p>`,
        `<p>${escapeHtml(trimmedMessage).replace(/\n/g, "<br />")}</p>`,
        imageHtml,
        "<hr />",
        "<p>",
        `<b>Customer Name:</b> ${escapeHtml(senderName)}<br />`,
        `<b>Customer ID:</b> ${escapeHtml(customerIdText)}<br />`,
        `<b>Customer Mobile Number:</b> ${escapeHtml(customerMobile)}`,
        "</p>",
      ].join("");

      const response = await onSendEmail({
        To: SUPPORT_EMAIL,
        Subject: trimmedSubject,
        HtmlContent: htmlContent,
        PlainText: plainText,
        SenderType: "Customer",
        SenderName: senderName,
      });

      if (response?.StatusCode && response.StatusCode !== "00") {
        Alert.alert(
          "Send Mail",
          response.StatusMessage || "Unable to send email. Please try again.",
        );
        return;
      }

      setSubject("");
      setSupportMessage("");
      setSelectedImage(null);
      Alert.alert("Support", "Email sent successfully.", [
        {
          text: "OK",
          onPress: () => NavigationService.navigate(SCREENS.HOME),
        },
      ]);
    } catch (error) {
      console.log("sendMail error:", error);
      Alert.alert("Send Mail", "Unable to send email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const Submit = () => (
    <View style={[styles.submit, submitBottomPadding]}>
      <CommonButton
        text={"Send Mail"}
        onPress={() => sendMail()}
        style={{ borderRadius: 5 }}
      />
    </View>
  );

  return (
    <>
      <KeyboardHandler>
        <HeaderContainer pageTitle="Support" navigateTo={SCREENS.HOME} />
        <View style={styles.container}>
          <TextInput
            value={subject}
            style={styles.inputSubject}
            onChangeText={(text: string) => {
              setSubject(text);
            }}
            autoCorrect={false}
            multiline
            numberOfLines={2}
            allowFontScaling={false}
            placeholder={"Subject"}
            placeholderTextColor={theme.colors.primary}
          />
          <TextInput
            ref={textRef}
            value={supportMessage}
            style={styles.input}
            onChangeText={(text: string) => {
              setSupportMessage(text);
            }}
            autoCorrect={false}
            multiline
            numberOfLines={10}
            allowFontScaling={false}
            placeholder={"Please enter your message here..."}
            placeholderTextColor={theme.colors.primary}
          />
          <UploadImage />

          <Submit />
          {isLoading && <WholeScreenLoader />}
        </View>
      </KeyboardHandler>
    </>
  );
};

export default SupportScreen;
