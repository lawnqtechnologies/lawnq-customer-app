import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import Icon from "react-native-dynamic-vector-icons";
import { useDispatch, useSelector } from "react-redux";
import createStyles from "./SupportScreen.style";
import { RootState } from "../../../../../store";
import { SCREENS } from "@shared-constants";
import Text from "@shared-components/text-wrapper/TextWrapper";
import KeyboardHandler from "@shared-components/containers/KeyboardHandler";
import CommonButton from "@shared-components/buttons/CommonButton";
import WholeScreenLoader from "@shared-components/loaders/WholeScreenLoader";

import HeaderContainer from "@shared-components/headers/HeaderContainer";

import FastImage from "react-native-fast-image";

import {
  launchImageLibrary,
  ImageLibraryOptions,
} from "react-native-image-picker";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ISupportScreenProps {
  style?: CustomStyleProp;
  navigation: any;
  route: any;
}

const SupportScreen: React.FC<ISupportScreenProps> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const dispatch = useDispatch();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [supportMessage, setSupportMessage] = useState<any>("");
  const [subject, setSubject] = useState<any>("");
  const [imageName, setImageName] = useState<any>(null);
  const [imageType, setImageType] = useState<any>("");
  const [imageUri, setImageUri] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

   const {token, customerId, deviceDetails, customerInfo} = useSelector(
    (state: RootState) => state.user,
  );

  const textRef = useRef<any>();

  const selectImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: "photo",
      maxWidth: 2000,
      maxHeight: 2000,
      includeBase64: true,
      // selectionLimit: 0,
    };
    launchImageLibrary(options, (response: any) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else if (response.customButton) {
        console.log("User tapped custom button: ", response.customButton);
      } else {

        const name = { fileName: response.assets[0].fileName };
        const type = { type: response.assets[0].type };
        const source = { uri: response.assets[0].base64 };

        setImageName(name.fileName);
        setImageType(type.type);
        setImageUri(response.assets[0].base64);
      }
    });
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
              source={{ uri: `data:image/jpeg;base64,${imageUri}` }}
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
        <View style={{ height: 20 }} />
        <UploadImage />
      </>
    );
  };
  const sendMail = () => {
    if (!supportMessage.length) {
      Alert.alert("Please enter the description of the issue");
      return;
    }
    if (!subject.length) {
      Alert.alert("Please enter the subject of the issue");
      return;
    }
    setIsLoading(true)
    let emailBody = supportMessage;

    emailBody +=
      "<br /><b>Service Provider Name              -</b>  " +
      customerInfo.Firstname +
      customerInfo.Lastname;
    emailBody +=
      "<br /><b>Customer ID               -</b>  " + customerId;
      emailBody +=
      "<br /><b>Customer Mobile Number               -</b>  " + customerInfo.MobileNumber;

    let attachments = [];

    attachments.push({
      content: imageUri, // Image content in base64 format
      filename: imageName, // Name of the file
      type: imageType, // MIME type
      disposition: "attachment", // Can also be 'inline' to display image in th
    });

    let body = {
      personalizations: [
        {
          to: [{ email: "Support@lawnQ.com.au" }],
          subject: subject,
        },
      ],
      from: {
        email: "admin@lawnq.com.au",
        name: "LawnQ Administrator",
      },
      content: [{ type: "text/html", value: emailBody }],
      attachments: [
        {
          content: imageUri, // Base64 string of the image
          filename: imageName, // File name for the attachment
          type: imageType, // MIME type
          disposition: "attachment", // Can also be 'inline' to show in the email body
        },
      ],
    };
    fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization:
          "Bearer " +
          "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => {
        setIsLoading(false)
        if (response.ok == true) {
          setSupportMessage('')
          setSubject('')
          setImageUri(null)
          Alert.alert(
            "Email Sent successfully! Please wait we will get back to you."
          );
        } else {
          Alert.alert("Network Error! Please try again");
        }
      })
      .catch((err) => {
        setIsLoading(false)
        console.log(err);
        Alert.alert("Network Error! Please try again");
      });
  };

  const Submit = () => (
    <View style={styles.submit}>
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
          />
          <UploadSection />

          <Submit />
          {isLoading && <WholeScreenLoader />}
        </View>
      </KeyboardHandler>
    </>
  );
};

export default SupportScreen;
