import React, { useMemo } from "react";
import { View, StyleProp, ViewStyle, Alert } from "react-native";
import { useTheme } from "@react-navigation/native";
import Clipboard from "@react-native-clipboard/clipboard";

/**
 * ? Local Imports
 */
import createStyles from "./FAQScreen.style";
import { SCREENS } from "@shared-constants";
import Text from "@shared-components/text-wrapper/TextWrapper";
import HeaderContainer from "@shared-components/headers/HeaderContainer";
import { ScrollView } from "react-native-gesture-handler";
import Header from "@shared-components/typography/header/Header";
import SubHeader from "@shared-components/typography/sub-header/SubHeader";
import Body from "@shared-components/typography/body/Body";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IFAQScreenProps {
  style?: CustomStyleProp;
}

const FAQScreen: React.FC<IFAQScreenProps> = () => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  /**
   * ? Functions
   */
  const onPressEmail = (url: string) => {
    Clipboard.setString(url);
    Alert.alert("Clipboard", `Copied to clipboard: ${url}`);
  };

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const Separator = () => <View style={styles.separatorContainer} />;

  const BodyWithURL = (props: {
    text1: string;
    url: string;
    text2: string;
  }) => (
    <Text style={styles.bodyWithURLContainer}>
      <Text h4 color={colors.fontDarkGray}>
        {props.text1}
      </Text>
      <Text
        h4
        color={"blue"}
        style={styles.url}
        onPress={() => onPressEmail(props.url)}
      >
        {props.url}
      </Text>
      <Text h4 color={colors.fontDarkGray}>
        {props.text2}
      </Text>
    </Text>
  );

  return (
    <>
      <HeaderContainer pageTitle={"FAQ"} navigateTo={SCREENS.HOME} />
      <ScrollView style={styles.container}>
        {/** 1st */}
        <Header text={"LawnQ Booking Related questions"} />
        <Separator />
        <SubHeader text="How do I calculate the size of the lawn area?" />
        <Body text="An easy way to remember the formula for area is A (area) = L (length) x W (width). If you have more than one area then you will calculate Area A + Area B to calculate the total size of the lawn." />
        <Separator />

        <SubHeader text="What if I enter the wrong lawn size?" />
        <Body text="LawnQ’s Admin team will validate the size through various tools that we use. We also double check your lawn size via GPS technology to confirm accuracy." />
        <Separator />

        <SubHeader text="Can I enter more than one property?" />
        <Body text="You can register as many properties as you like under “My Properties”. Each property will be validated by the LawnQ admin team for measurement purposes." />
        <Separator />

        <SubHeader text="How long does it take when I select the “book today” service?" />
        <Body text="“Book Today” Service should take approximately 24 hours. However, this can vary depending on the demand of the service in your area" />
        <Separator />

        <SubHeader text="What is the difference between standard and Ride on mowing?" />
        <Body text="Push Mowers are best for small to medium size yards while Ride on lawn mowers are best for yards bigger than half an acre. For yards larger than half an acre, a riding lawn mower is likely the best choice." />
        <Separator />

        <SubHeader text="How can I reach out to the service provider?" />
        <Body text="Navigate to Activities → Select the outstanding booking → click on the call icon or chat with the service provider in the box at the bottom of the screen." />
        <Separator />

        <SubHeader text="The service provider is not answering my calls or replying to my chat. What should I do?" />
        <Body text="Give the Service provider a 24 hours period to complete the job, however you can alway cancel your booking by going to Activities → Select the outstanding booking that you want to cancel → click on cancel to start the cancellation process. (Cancellation fees apply)" />
        <Separator />

        <SubHeader text="How much is the cancellation fee?" />
        <Body text="If you choose to cancel within 24 hours, you will be charged 2.5 percent cancellation fees which will go toward 3rd party surcharges for handling the transaction) If you cancel outside the 24 hours of the booking (the cancellation fees will be paid by the service provider)" />
        <Separator />

        <SubHeader text="What do I do if it’s raining and I can’t have the lawn mowed today?" />
        <Body text="There’s a feature to reschedule your booking where you can reschedule your booking by going to Activities → Select the outstanding booking that you want to reschedule → click on reschedule to pick a new booking date." />
        <Separator />

        <SubHeader text="How do I dispute a booking?" />
        <Body text="Go to Activities → Select a completed booking that you want to dispute → click on dispute to start the process." />
        <Separator />

        <SubHeader text="How can I reach out to LawnQ support team?" />
        <BodyWithURL
          text1="Please email "
          url="support@lawnQ.com.au"
          text2=" and one of our customer service team members will tend to your inquiry."
        />

        <Separator />
        <Separator />
      </ScrollView>
    </>
  );
};

export default FAQScreen;
