import React, { useMemo } from "react";
import { View, StyleProp, ViewStyle, Alert } from "react-native";
import { useTheme } from "@react-navigation/native";
import Clipboard from "@react-native-clipboard/clipboard";

/**
 * ? Local Imports
 */
import createStyles from "./PrivacyScreen.style";
import { SCREENS } from "@shared-constants";
import Text from "@shared-components/text-wrapper/TextWrapper";
import HeaderContainer from "@shared-components/headers/HeaderContainer";
import { ScrollView } from "react-native-gesture-handler";
import Header from "@shared-components/typography/header/Header";
import SubHeader from "@shared-components/typography/sub-header/SubHeader";
import Body from "@shared-components/typography/body/Body";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IPrivacyScreenProps {
  style?: CustomStyleProp;
}

const PrivacyScreen: React.FC<IPrivacyScreenProps> = () => {
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
  const Separator2 = () => <View style={styles.separatorContainer2} />;

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
      <HeaderContainer pageTitle={"Privacy"} navigateTo={SCREENS.HOME} />
      <ScrollView style={styles.container}>
        {/** 1st */}
        <Header text={"I. Introduction"} />
        <Body
          text={
            "When you use LawnQ, you trust us with your personal data. We’re committed to keeping that trust. That starts with helping you understand our privacy practices."
          }
        />
        <Body
          text={
            "This notice describes the personal data we collect, how it’s used and shared, and your choices regarding this data. We recommend that you read this along with our privacy overview, which highlights key points about our privacy practices."
          }
        />
        <Separator />

        {/** 2nd */}
        <Header text={"II. Overview"} />
        <Separator2 />
        <SubHeader text={"A. Scope"} />
        <Body
          text={
            "This notice applies to users of LawnQ’s and LawnQ Sp’s services anywhere in the world, including users of LawnQ’s apps, websites, features, or other services."
          }
        />
        <Body
          text={
            "This notice describes how LawnQ and its affiliates collect and use personal data. This notice applies to all users of our apps, websites, features, or other services anywhere in the world, unless covered by a separate privacy notice. This notice specifically applies to:"
          }
        />

        <Body
          isBullet
          text={
            "Customers: individuals who request or receive lawn mowing service, including those who receive lawn mowing service requested by another individual."
          }
        />
        <Body
          isBullet
          text={
            "Service providers: individuals who provide lawn mowing service to Customers individually or through partner lawn mowing service companies"
          }
        />

        <Body
          text={
            "This notice also governs LawnQ’s other collections of personal data in connection with its services. For example, we may collect the contact information of individuals who use accounts owned by LawnQ for Business customers, personal data of those who start but do not complete applications to be service providers; or other personal data in connection with our mapping technology and features."
          }
        />
        <Body
          text={
            "All those subject to this notice are referred to as “users” in this notice."
          }
        />
        <BodyWithURL
          text1={
            "Our practices are subject to applicable laws in the places in which we operate. This means that we engage in the practices described in this notice in a particular country or region only if permitted under the laws of those places. Please contact us through "
          }
          url={"support@lawnq.com.au"}
          text2={
            " with any questions regarding our practices in a particular country or region."
          }
        />
        <Body
          text={
            "LawnQ Technologies Inc. is the data controller for the personal data collected in connection with use of LawnQ’s services everywhere else."
          }
        />
        <Body
          text={
            "LawnQ operates, and processes personal data, globally. The exercise of data protection rights can be directed at any controller mentioned above, preferably via the designated channels, and will be handled by LawnQ as a group. We may also transfer such data to countries other than the one where our users live or use LawnQ’s services. We do so in order to fulfill our agreements with users, such as our Terms of Use, or based on users’ prior consent, adequacy decisions for the relevant countries, or other transfer mechanisms as may be available under applicable law, such as the Standard Contractual Clauses."
          }
        />
        <BodyWithURL
          text1={
            "Questions, comments, and complaints about LawnQ’s data practices can be submitte to "
          }
          url={"support@lawnq.com.au"}
          text2={
            ".  You may also use this form to submit a question to LawnQ’s Data Protection Officer."
          }
        />
        <Separator />

        {/** 3rd */}
        <Header text={"III. Data collections and uses"} />
        <Separator2 />
        <SubHeader text={"A. The data we collect"} />

        <Body text={"LawnQ collects personal data:"} />
        <Body
          isBullet
          text={"provided by users to LawnQ, such as during account creation"}
        />
        <Body
          isBullet
          text={
            "created during use of our services, such as location, app usage, and device data"
          }
        />
        <Body
          isBullet
          text={
            "from other sources, such as other users or account owners, business partners, vendors, insurance and financial solution providers, and governmental authorities"
          }
        />

        <Body
          text={
            "The following personal data is collected by or on behalf of LawnQ:"
          }
        />
        <Body
          isBullet
          text={`User profile and checkout information: We collect data when users place orders (including using guest checkout) or create or update their LawnQ accounts. This may include their name, email, phone number, login name and password, address, profile picture, payment or banking information (including related payment verification information), service provider’s license and other government identification documents (which may indicate document numbers as well as birth date, gender, and photo). This also includes vehicle or insurance information of service providers and delivery persons, emergency contact information, user settings, and evidence of health or fitness to provide services using LawnQ apps. \n\nThis also includes gender and/or occupation (when required for certain LawnQ services or programs, such as LawnQ Cash or features that enable women to provide services or receive services to/from other women). \n\nWe may use the photos submitted by users to verify their identities, such as through facial verification technologies. For more information, please see the section titled “How we use personal data.”`}
        />
        <Body
          isBullet
          text={
            "Background check and identity verification (service providers and delivery persons): This may include information such as service provider history or criminal record (where permitted by law), license status, known aliases and prior addresses, and right to work. This information may be collected by an authorized vendor on LawnQ’s behalf."
          }
        />
        <Body
          isBullet
          text={`Demographic data: We may collect demographic data about users, including through user surveys. In some countries, we may also receive demographic data about users from third parties.\n\nWe may also infer demographic data from other data collected from users.`}
        />
        <Body
          isBullet
          text={
            "User content: We collect the data submitted by users when they contact LawnQ customer support, provide ratings or compliments for other users, This may include feedback, photographs or other recordings collected by users, including audio or video recordings (such as from In app chat or Voice calls) submitted by users in connection with customer support. This also includes metadata relating to the method you use to communicate with LawnQ."
          }
        />
        <Body
          isBullet
          text={
            "Travel information: We collect travel itinerary information, including the times and dates of upcoming flight, lodging or car rental reservations, from users of our LawnQ Travel feature. We collect such information: (i) when users manually input their information into an LawnQ Travel itinerary; or (2) if authorized by users to access their Gmail accounts, from travel-related email confirmations. If so authorized, LawnQ will only access users’ Gmail accounts to collect travel itinerary information to enable the LawnQ Travel feature, and will adhere to Google’s API Services User Data Policy, including the limitations on use of data collected from users’ Gmail accounts."
          }
        />

        <Body
          text={"2. Data created during use of our services. This includes:"}
        />
        <Body
          isBullet
          text={
            "Location data (service provider and delivery person): We collect service providers’ and delivery persons’ precise or approximate location data, including to enable rides and deliveries, to enable ride/delivery tracking and safety features, to prevent and detect fraud, and to satisfy legal requirements. LawnQ collects this data when the LawnQ app is running in the foreground (app open and on-screen) or background (app open but not on-screen) of their mobile device."
          }
        />
        <Body
          isBullet
          text={
            "Location data (Customers and order recipients). We collect Customers’, and order recipients’ precise or approximate location data to enable and enhance use of our apps, including to improve customer and order pickups, facilitate deliveries, enable safety features, and prevent and detect fraud. Please see our Customer Location Help page for detailed information on how we use this data.\n\nWe collect such data from users’ mobile devices if they enable us to do so. (See “Choice and transparency” below for information on how Customers, and order recipients can enable location data collection). LawnQ collects such data from the time a ride, or order is requested until it is finished (and may indicate such collection via an icon or notification on your mobile device depending on your device’s operating system), and any time the app is running in the foreground (app open and on-screen) of their mobile device.\n\nCustomers and order recipients may use the LawnQ apps without enabling LawnQ to collect precise location data from their mobile devices. However, this may affect features in the LawnQ apps. For example, a customer who has not enabled location data collection will have to manually enter their pickup address."
          }
        />
        <Body
          isBullet
          text={
            "Transaction information: We collect transaction information related to the use of our services, including the type of services requested or provided, order details, payment transaction information (such as a restaurant’s or merchant's name and location and amount of transaction), delivery information, date and time the service was provided, amount charged, distance traveled, and payment method. Additionally, if someone uses your promotion code, we may associate your name with that person."
          }
        />
        <Body
          isBullet
          text={`Usage data: We collect data about how users interact with our services. This includes data such as access dates and times, app features or pages viewed, app crashes and other system activity, and type of browser. We may also collect data regarding the third-party sites or services used before interacting with our services, which we use for marketing. (Please see "How We Use Data" below for more information on how we market our services to users).\n\nIn some cases, we collect this data through cookies, pixels, tags, and similar tracking technologies that create and maintain unique identifiers. To learn more about these technologies, please see our Cookie Notice.`}
        />
        <Body
          isBullet
          text={`Device data: We may collect data about the devices used to access our services, including the hardware models, device IP address or other unique device identifiers, operating systems and versions, software, preferred languages, advertising identifiers, device motion data, and mobile network data.`}
        />
        <Body
          isBullet
          text={`Communications data: We enable users to communicate with each other and LawnQ through LawnQ’s mobile apps and websites. For example, we enable service providers and Customers, and delivery persons and order recipients, to call, text, or send other files to each other (generally without disclosing their telephone numbers to each other). To provide this service, LawnQ receives some data regarding the calls, texts, or other communications, including the date and time of the communications and the content of the communications. LawnQ may also use this data for customer support services (including to resolve disputes between users), for safety and security purposes, to improve our services and features, and for analytics.`}
        />
        <Body
          isBullet
          text={`Safety recordings: In certain jurisdictions, and where permitted by law, users can record the audio and/or video of their trips through an in-app feature or using a dashcam. In app recordings are encrypted and stored on users’ devices, and are only shared with LawnQ if submitted to customer support by the users in connection with safety incidents. Please see here for more information.`}
        />

        <Body text={`3. Data from other sources. These include:`} />
        <Body
          isBullet
          text={`Users participating in our referral programs. For example, when a user refers to another person, we receive the referred person’s personal data from that user.`}
        />
        <Body
          isBullet
          text={`LawnQ account owners who request services for or on behalf of other users, or who enable such users to request or receive services through their accounts. This includes owners of LawnQ for Business accounts.`}
        />
        <Body
          isBullet
          text={`Users or others providing information in connection with claims or disputes.`}
        />
        <Body
          isBullet
          text={`LawnQ business partners through which users create or access their LawnQ account, such as payment providers, social media services, or apps or websites that use LawnQ’s APIs or whose APIs LawnQ uses.`}
        />
        <Body
          isBullet
          text={`LawnQ business partners in connection with debit or credit cards issued by a financial institution in partnership with LawnQ to the extent disclosed in the terms and conditions for the card.`}
        />
        <Body
          isBullet
          text={`Vendors who help us verify users’ identity, background information, and eligibility to work, or who screen users in connection with sanctions, anti-money laundering, or know-your-customer requirements.`}
        />
        <Body
          isBullet
          text={`Insurance, vehicle, or financial services providers for service providers and/or delivery persons`}
        />
        <Body
          isBullet
          text={`Partner lawn mowing service companies (for service providers or delivery persons who use our services through an account associated with such a company)`}
        />
        <Body isBullet text={`Publicly available sources`} />
        <Body
          isBullet
          text={`Marketing service providers or data resellers whose data LawnQ uses for marketing or research`}
        />
        <Body
          isBullet
          text={`Law enforcement officials, public health officials, and other government authorities`}
        />

        <Body
          text={`LawnQ may combine the data collected from these sources with other data in its possession.`}
        />

        <Separator />
        <SubHeader text={`B. How we use personal data`} />
        <Body
          text={`LawnQ uses personal data to enable reliable and convenient lawn mowing service, delivery, and other products and services. We also use such data:`}
        />
        <Body
          isBullet
          text={`to enhance the safety and security of our users and services`}
        />
        <Body isBullet text={`for customer support`} />
        <Body isBullet text={`for research and development`} />
        <Body isBullet text={`to enable communications between users`} />
        <Body
          isBullet
          text={`to send marketing and non-marketing communications to users`}
        />
        <Body isBullet text={`in connection with legal proceedings`} />

        <Body
          text={`LawnQ does not sell or share user personal data with third parties for their direct marketing, except with users’ consent.`}
        />

        <Body text={`We use personal data we collect:`} />

        <Body
          text={`1. To provide our services. LawnQ uses data to provide, personalize, maintain, and improve our services.`}
        />
        <Body text={`This includes using data to:`} />
        <Body isBullet text={`create/update accounts`} />
        <Body
          isBullet
          text={`enable lawn mowing service and delivery services (such as using location data to facilitate a customer lawn mowing request), features that involve data sharing (such as fare splitting, ETA sharing, and ratings and compliments), and accessibility features to facilitate use of our services by those with disabilities`}
        />
        <Body isBullet text={`process payments`} />
        <Body
          isBullet
          text={`track and share the progress of rides or deliveries`}
        />
        <Body
          isBullet
          text={`personalize users’ accounts. We may, for example, present an LawnQ user with personalized based on their prior job requests. Please services see the section of this notice titled “Choice and transparency” to learn how to object to this use of personal data.`}
        />
        <Body
          isBullet
          text={`facilitate insurance, invoicing, or financing solutions`}
        />
        <Body
          isBullet
          text={`perform necessary operations to maintain our services, including to troubleshoot software bugs and operational problems; to conduct data analysis, testing, and research; and to monitor and analyze usage and activity trends.`}
        />

        <Body
          text={`LawnQ performs the above activities, including the collection and use of location data for purposes of these activities, on the grounds that they are necessary to fulfill our obligations to users under our Terms of Use or other agreements with users.`}
        />

        <Body
          text={`2. Safety and security. We use personal data to help maintain the safety, security, and integrity of our services and users. This includes:`}
        />
        <Body
          isBullet
          text={`verifying users' identity and eligibility to provide lawn mowing service or deliveries, including through reviews of background checks, where permitted by law, to help prevent use of our services by unsafe service providers and/or Customers.\n\nIn certain regions, this includes LawnQ’s Real-Time ID Check feature, which prompts service providers and delivery persons to share a selfie before going online to help ensure that the service provider or delivery person using the app matches the LawnQ account we have on file. We may also use this feature to complete other actions on your account, such as verifying change of bank account information or regaining account access.`}
        />
        <Body
          text={`Where permitted by law, we may also use selfies to verify that users are wearing masks, helmets or other safety gear through the use of object verification technology, where permitted by law.\n\nIn addition, where permitted by law, we may use facial recognition technology to process user profile photographs, identification photographs, or other user-submitted photographs for the sole purpose of preventing identity-borrowing or use of our services by unauthorized service providers or delivery people.`}
        />
        <Body
          isBullet
          text={`using data from service providers’ or delivery persons’ devices to detect unsafe driving behavior such as speeding or harsh braking and acceleration, and to inform them of safer driving practices. We also use data from delivery persons’ devices to verify the type of vehicles they used to provide deliveries.`}
        />
        <Body
          isBullet
          text={`using device, location, user profile, usage, and other data to prevent, detect, and combat fraud. This includes identifying fraudulent accounts or uses of our services, preventing use of our services by unauthorized service providers or delivery persons, verifying user identities in connection with certain payment methods, and preventing and combating unauthorized access to users’ accounts.`}
        />
        <Body
          isBullet
          text={`using user ratings, reported incidents, and other feedback to encourage compliance with our Community Guidelines and as grounds for deactivating users with low ratings or who otherwise violated such guidelines in certain countries.`}
        />
        <Body
          isBullet
          text={`sharing user name, location, phone number, vehicle details and other relevant information with third-party companies that support the management and de-escalation of interpersonal conflicts that may occur between users while on a trip or in the process of making a delivery.`}
        />
        <Body
          isBullet
          text={`using ratings, usage and other data to prevent matching of Customers and service providers for whom there is higher risk of conflict (for instance, because one user previously gave the other a one-star rating).`}
        />

        <Body
          text={`LawnQ performs the above activities on the grounds that they are necessary to fulfill our obligations to users under our Terms of Use or other agreements with users, and/or for purposes of the legitimate safety and security interests of LawnQ or other parties, including users and members of the general public.`}
        />
        <Body
          text={`3. Customer support. LawnQ uses the information we collect (which may include call recordings) to provide customer support, including to investigate and address user concerns and to monitor and improve our customer support responses and processes.`}
        />
        <Body
          text={`LawnQ performs the above activities on the grounds that they are necessary to fulfill our obligations to users under our Terms of Use or other agreements with users.`}
        />
        <Body
          text={`4. Research and development. We may use personal data for testing, research, analysis, product development, and machine learning to improve the user experience. This helps us make our services more convenient and easy-to-use, enhance the safety and security of our services, and develop new services and features.`}
        />
        <Body
          text={`LawnQ performs the above activities on the grounds that they are necessary to fulfill our obligations to users under our Terms of Use or other agreements with users in improving our existing services and features, or for purposes of LawnQ’s legitimate interests developing new services and features.`}
        />
        <Body
          text={`5. Enabling communications between users. For example, a service provider may message or call a customer to confirm a pick-up location, a customer may contact a service provider to retrieve a lost item, or a restaurant or delivery person may call an order recipient with information about their order.`}
        />
        <Body
          text={`LawnQ performs the above activities on the grounds that they are necessary to fulfill our obligations to users under our Terms of Use or other agreements with users.`}
        />
        <Body
          text={`6. Marketing. LawnQ may use personal data to market our services to our users. This includes sending users communications about LawnQ services, features, promotions, sweepstakes, studies, surveys, news, updates, and events. We may do so through various methods, including email, text messages, push notifications, in app communications and ads, and ads on third party platforms.`}
        />
        <Body
          text={`We may also inform users about products and services offered by LawnQ partners. For example, we may provide recommendations, promotions, or ads for LawnQ partners based on users’ past orders. Although we inform users about products and services offered by LawnQ partners, we do not sell users’ personal data to, or share it with, such partners or others for purposes of their own direct marketing or advertising, except with users’ consent.`}
        />
        <Body
          text={`We may use the data we collect, including in combination with advertising partners’ data, to personalize and improve the marketing communications (including ads) that we send on and off LawnQ’s apps and websites, including based on user location, use of LawnQ’s services, and user preferences and settings. For example, we share user data (such as hashed email address, usage information, and device or user identifiers) with Facebook and TikTok to personalize and improve our ads for LawnQ’s services.`}
        />
        <Body
          text={`For information about how to opt out of certain marketing communications (including ads) from LawnQ and its advertising partners, please see the section titled “Marketing choices.”`}
        />
        <Body
          text={`We may also send users communications regarding elections, ballots, referenda, and other political and notice processes that relate to our services. For example, LawnQ has notified some users by email of ballot measures or pending legislation relating to LawnQ’s services in those users’ areas.`}
        />
        <Body
          text={`LawnQ performs the above activities on the grounds that they are necessary for purposes of LawnQ’s legitimate interests in informing users about LawnQ services and features or those offered by LawnQ partners, or on the basis of user consent. See the sections titled “Choice and transparency” and “Marketing choices” for information on your choices regarding LawnQ’s use of your data for marketing.`}
        />
        <Body
          text={`7. Non-marketing communications. LawnQ may use personal data to generate and provide users with receipts; inform them of changes to our terms, services, or policies; or send other communications that aren’t for the purpose of marketing the services or products of LawnQ or its partners.`}
        />
        <Body
          text={`LawnQ performs the above activities on the grounds that they are necessary to fulfill our obligations to users under our Terms of Use or other agreements with users, or for purposes of LawnQ’s and its users’ legitimate interests in informing users about events that may have an impact on how they can use LawnQ services.`}
        />
        <Body
          text={`8. Legal proceedings and requirements. We may use personal data to investigate or address claims or disputes relating to use of LawnQ’s services, to satisfy requirements under applicable laws, regulations, or operating licenses or agreements, or pursuant to legal process or governmental request, including from law enforcement.`}
        />
        <Body
          text={`LawnQ performs the above activities on the grounds that they are necessary for purposes of LawnQ’s legitimate interests in investigating and responding to claims and disputes relating to use of LawnQ’s services and features, and/or necessary for compliance with applicable legal requirements.`}
        />
        <Body text={`9. Automated decision-making`} />
        <Body
          text={`We use personal data to make automated decisions relating to use of our services. This includes:`}
        />
        <Body
          isBullet
          text={`enabling dynamic pricing, in which the price of a ride, or the delivery fee for LawnQ Eats orders, is determined based on constantly varying factors such as the estimated time and distance, the predicted route, estimated traffic, and the number of Customers and service providers using LawnQ at a given moment.`}
        />
        <Body
          isBullet
          text={`matching available service providers and delivery persons to users requesting services. Users can be matched based on availability, proximity, and other factors such as likelihood to accept a trip based on their past behavior or preferences. Please see here for further information about our matching process.`}
        />
        <Body
          isBullet
          text={`determining user ratings, and deactivating users with low ratings. In the European Union or where otherwise required by law, such deactivation occurs only after human review and/or the possibility to appeal. For more information about how ratings are determined and used, please see here for customer ratings, here for service provider ratings, and here for delivery person ratings. Please also see the section below titled “Ratings look-up” for further information.`}
        />
        <Body
          isBullet
          text={`flagging users who are identified as having engaged in fraud, unsafe activity, or other activities that may harm LawnQ, its users, and others. In some cases, such as when a user is determined to be abusing LawnQ’s referral program or has submitted fraudulent documents, such behavior may result in automatic deactivation, or in the European Union or where otherwise required by law, deactivation after human review.`}
        />
        <Body
          isBullet
          text={`using service provider location information, and communications between Customers and service providers, to identify cancellation fees earned or induced through fraud. For example, if we determine by using such information that a service provider is delaying a customer pickup in order to induce a cancellation, we will not charge the customer a cancellation fee and will adjust the amounts paid to the service provider to omit such a fee. To object to such an adjustment, please contact LawnQ customer support.`}
        />
        <Body
          isBullet
          text={`Using service provider data (such as location, rating and gender) and customer data (such as rating, origin and destination) to help avoid pairings of users that may result in increased risk of conflict.`}
        />

        <Body
          text={`Click the links in this section for more information about these processes. To object to a deactivation resulting from these processes, please contact LawnQ customer support.`}
        />
        <Body
          text={`LawnQ performs the above activities on the grounds that they are necessary to fulfill our obligations to users under our Terms of Use or other agreements with users, or on the grounds that they are necessary for purposes of the legitimate interests of LawnQ, its users and others.`}
        />

        <Separator />
        <Header text={`C. Cookies and third-party technologies`} />
        <Body
          text={`LawnQ and its partners use cookies and other identification technologies on our apps, websites, emails, and online ads for purposes described in this notice, and LawnQ’s Cookie Notice.`}
        />
        <Body
          text={`Cookies are small text files that are stored on browsers or devices by websites, apps, online media, and advertisements. LawnQ uses cookies and similar technologies for purposes such as:`}
        />
        <Body isBullet text="authenticating users" />
        <Body isBullet text="remembering user preferences and settings" />
        <Body isBullet text="determining the popularity of content" />
        <Body
          isBullet
          text="delivering and measuring the effectiveness of advertising campaigns"
        />
        <Body
          isBullet
          text="analyzing site traffic and trends, and generally understanding the online behaviors and interests of people who interact with our services"
        />

        <Body text="We may also allow others to provide audience measurement and analytics services for us, to serve advertisements on our behalf across the Internet, and to track and report on the performance of those advertisements. These entities may use cookies, web beacons, SDKs, APIs and other technologies to identify the devices used by visitors to our websites, as well as when they visit other online sites and services." />
        <Body text="Please see our Cookie Notice for more information regarding the use of cookies and other technologies described in this section." />

        <Separator />
        <Header text="D. Data sharing and disclosure" />
        <Body text="Some of LawnQ’s services and features require that we share personal data with other users or at a user’s request. We may also share such data with our affiliates, subsidiaries, and partners, for legal reasons or in connection with claims or disputes." />
        <Body text="LawnQ may share personal data:" />
        <Body text="1. With other users" />
        <Body text="This includes sharing:" />
        <Body
          isBullet
          text="Customers’ first name, rating, and customer’s address/ locations with service providers"
        />
        <Body
          isBullet
          text="for service providers, we may share data with the customer, including name and photo; location; average rating provided by users; total number of Jobs performed; period of time since they signed up to be a service provider; contact information (if permitted by applicable laws); and service provider, including compliments and other feedback submitted by past users.\n\nWe also provide Customers with receipts containing information such as a breakdown of amounts charged, service provider or delivery person first name, photo. We also include other information on those receipts if required by law."
        />
        <Body
          isBullet
          text="for those who participate in LawnQ’s referral program, we share certain personal data of referred users, such as trip count, with the user who referred them, to the extent relevant to determining the referral bonus."
        />
        <Body text="2. At the user’s request" />
        <Body text="This includes sharing data with:" />
        <Body
          isBullet
          text="LawnQ business partners. For example, if a user requests a service through a partnership or promotional offering made by a third party, LawnQ may share certain data with those third parties. This may include, for example, other services, platforms, apps, or websites that integrate with our APIs; mowers suppliers or services; those with an API or service with which we integrate;  other LawnQ business partners and their users in connection with promotions, contests, or specialized services."
        />
        <Body
          isBullet
          text="Emergency services: We offer features that enable users to share their data with police, fire, and ambulance services in the event of an emergency or after certain incidents. For more information, please see the sections below titled “Choice and Transparency” and “Emergency Data Sharing”."
        />
        <Body text="3. With the general public" />
        <Body text="Questions or comments from users submitted through public forums such as LawnQ blogs and LawnQ social media pages may be viewable by the public, including any personal data included in the questions or comments submitted by a user." />
        <Body text="4. With the LawnQ account owner" />
        <Body text="If a user requests lawn mowing service or places an order using an account owned by another party, we may share their order or trip information, including location data, with the owner of that account. This occurs, for example, when:" />
        <Body
          isBullet
          text="a customer uses their employer’s LawnQ for Business profile, such as when they take trips arranged through LawnQ Central"
        />
        <Body
          isBullet
          text="a service provider or delivery person uses an account owned by or associated with an LawnQ partner lawn mowing service company or restaurant"
        />
        <Body
          isBullet
          text="a customer takes a trip arranged by a friend or under a Family Profile"
        />
        <Body
          isBullet
          text="a delivery person acts as a substitute (UK only)"
        />

        <Body text="5. With LawnQ subsidiaries and affiliates" />
        <Body text="We share personal data with our subsidiaries and affiliates to help us provide our services or conduct data processing on our behalf. For example, LawnQ processes and stores such data in the United States on behalf of its international subsidiaries and affiliates." />
        <Body text="6. With LawnQ service providers and business partners" />
        <Body text="LawnQ provides personal data to vendors, consultants, marketing partners, research firms, and other service providers or business partners. These include:" />
        <Body isBullet text="payment processors and facilitators" />
        <Body
          isBullet
          text="background check and identity verification providers"
        />
        <Body isBullet text="cloud storage providers" />
        <Body
          isBullet
          text="Google, in connection with the use of Google Maps in LawnQ’s apps (see Google’s privacy policy for information on their collection and use of data)"
        />
        <Body
          isBullet
          text="social media companies, including Facebook and TikTok, in connection with LawnQ’s use of their tools in LawnQ’s apps and websites (see Facebook’s and TikTok’s privacy policies for information on their collection and use of data)"
        />
        <Body
          isBullet
          text="Marketing partners and marketing platform providers, including social media advertising services, advertising networks, third-party data providers, and other service providers to reach or better understand our users and measure advertising effectiveness."
        />
        <Body
          isBullet
          text="research partners, including those performing surveys or research projects in partnership with LawnQ or on LawnQ’s behalf"
        />
        <Body
          isBullet
          text="vendors that assist LawnQ to enhance the safety and security of LawnQ apps and services"
        />
        <Body
          isBullet
          text="consultants, lawyers, accountants, and other professional service providers"
        />
        <Body isBullet text="insurance and financing partners" />
        <Body isBullet text="airports" />
        <Body
          isBullet
          text="providers of bike and scooters that can be rented through LawnQ apps, such as Lime"
        />
        <Body
          isBullet
          text="restaurants, grocery stores and other merchants from whom order recipients place orders, as well as partners and/or their point of sale providers, including for order fulfillment, delivery, communications and marketing purposes"
        />
        <Body
          isBullet
          text="third-party vehicle suppliers, including fleet and rental partners"
        />
        <Body text="7. For legal reasons or in the event of a dispute" />
        <Body text="LawnQ may share users’ personal data if we believe it’s required by applicable law, regulation, operating license or agreement, legal process or governmental request, or where the disclosure is otherwise appropriate due to safety or similar concerns." />
        <Body text="This includes sharing personal data with law enforcement officials, public health officials, other government authorities, airports (if required by the airport authorities as a condition of operating on airport property), or other third parties as necessary to enforce our Terms of Service, user agreements, or other policies; to protect LawnQ’s rights or property or the rights, safety, or property of others; or in the event of a claim or dispute relating to the use of our services. In the event of a dispute relating to use of another person’s credit card, we may be required by law to share your personal data, including trip or order information, with the owner of that credit card." />
        <Body text="For more information, please see LawnQ’s Guidelines for Law Enforcement Authorities - United States, Guidelines for Law Enforcement Authorities - Outside the US, and Guidelines for Third Party Data Requests and Service of Legal Documents." />
        <Body text="This also includes sharing personal data with others in connection with, or during negotiations of, any merger, sale of company assets, consolidation or restructuring, financing, or acquisition of all or a portion of our business by or into another company." />
        <Body text="8. With consent" />
        <Body text="LawnQ may share a user’s personal data other than as described in this notice if we notify the user and they consent to the sharing." />

        <Separator />
        <Header text="E. Data retention and deletion" />
        <Body text="LawnQ retains user data for as long as necessary for the purposes described above." />
        <Body text="Users may request deletion of their accounts at any time. LawnQ may retain user data after a deletion request due to legal or regulatory requirements or for reasons stated in this policy." />
        <Body text="LawnQ retains user data for as long as necessary for the purposes described above. This means that we retain different categories of data for different periods of time depending on the type of data, the category of user to whom the data relates, and the purposes for which we collected the data." />
        <Body text="Users may request deletion of their account at any time through the Settings > Privacy menus in the LawnQ app, or through LawnQ SP App (Customers and jobs recipients and service providers." />
        <Body text="Following an account deletion request, LawnQ deletes the user’s account and data, unless they must be retained due to legal or regulatory requirements, for purposes of safety, security, and fraud prevention, or because of an issue relating to the user’s account such as an outstanding credit or an unresolved claim or dispute. Because we are subject to legal and regulatory requirements relating to service providers, this generally means that we retain their account and data for a minimum of 7 years after a deletion request. For Customers and order recipients, their data is generally deleted within 90 days of a deletion request, except where retention is necessary for the above reasons." />

        <Separator />
        <Header text="IV. Choice and transparency" />
        <Body text="LawnQ enables users to access and/or control data that LawnQ collects, including through:" />
        <Body isBullet text="privacy settings" />
        <Body isBullet text="device permissions" />
        <Body isBullet text="in-app ratings pages" />
        <Body isBullet text="marketing choices" />
        <Body text="LawnQ also enables users to request access to or copies of their data, changes or updates to their accounts, or deletion of their accounts, or that LawnQ restricts its processing of user personal data." />

        <Body text="A. Privacy settings" />
        <Body text="The Settings > Privacy menu in the LawnQ app allows Customers and order recipients to set or update their preferences regarding location data collection and sharing, emergency data sharing, and notifications." />
        <Body
          isBullet
          text="Location data collection (Customers and order recipients)"
        />
        <Body text="Customers and order recipients can enable/disable LawnQ to collect location data from their mobile devices through their device settings, which can be accessed via the Settings > Privacy > Location menu." />
        <Body isBullet text="Share Live Location (Customers)" />
        <Body text="Customers can enable/disable LawnQ to share their real-time location data from their mobile devices with their service providers through their device settings, which can be accessed via the Settings > Privacy > Location menu." />
        <Body isBullet text="Emergency Data Sharing" />
        <Body text="Customers may enable LawnQ to share real-time location data from their mobile devices with emergency police, fire, and ambulance services. Such data may include approximate location at the time the emergency call was placed; the car’s make, model, color, and license plate information; the customer/service provider’s name and phone number; address locations." />
        <Body text="Customers may enable/disable this feature via the Settings > Privacy > Location menu, or the Safety Center." />
        <Body text="Service providers and delivery persons can also enable/disable Emergency Data" />
        <Body text="Sharing via the App settings > Emergency Data Sharing menu, or the Safety Toolkit." />
        <Body text="Notifications: account and trip updates their account. These notifications are a necessary part of using the LawnQ app and cannot be disabled. However, users may choose the method by which they receive these notifications through the LawnQ provides users with trip status notifications and updates related to activity on Settings > Privacy menu." />
        <Body isBullet text="Notifications: discounts and news" />
        <Body
          isBullet
          text="Users may enable LawnQ to send push notifications about discounts and news from"
        />
        <Body text="LawnQ. Push notifications may be enabled or disabled through the Settings > Privacy menus in the LawnQ app." />
        <Body isBullet text="Communications from restaurants and merchants" />
        <Body
          isBullet
          text="Users may opt-in to receive communications from certain restaurants while placing"
        />
        <Body
          isBullet
          text="an booking request in the LawnQ app. Those who opt-in may choose to cease receiving such communications through the Settings > Account > Data Sharing menus in the LawnQ app."
        />
        <Body text="B. Device permissions" />
        <Body text="Most mobile device platforms (iOS, Android, etc.) have defined certain types of device data that apps cannot access without the device owner’s permission, and these platforms have different methods for how that permission can be obtained. Please check the available settings on your device or check with your provider." />
        <Body text="C. In-app ratings pages" />
        <Body text="After every trip, service providers and Customers are able to rate each other on a scale from 1 to 5. An average of those ratings is associated with a user’s account and is displayed to other users for whom they provide or receive services. For example, customer ratings are available to service providers from whom they request lawn mowing service, and service provider ratings are available to their Customers." />
        <Body text="This 2-way system holds everyone accountable for their behavior. Accountability helps create a respectful, safe environment for service providers and Customers." />
        <Body text="Customers can see their average rating in the main menu of the LawnQ app." />
        <Body text="Service providers can see their average rating after tapping their profile photo in the LawnQ Service provider app." />
        <Body text="D. Marketing choices" />
        <Body text="Users may opt out of certain marketing communications (including ads) and use of their data for marketing in the following ways:" />
        <Body
          isBullet
          text="Ad settings: These settings enable users to choose whether their data is shared with LawnQ’s advertising partners to deliver personalized ads, and/or to measure the effectiveness of such ads."
        />
        <Body
          isBullet
          text="Marketing emails and messages: To opt out of receiving marketing emails from LawnQ, or for instructions on how to set your preferences regarding whether to receive marketing SMS or push notifications from LawnQ. Users may also opt out of receiving emails and other messages from LawnQ by following the unsubscribe instructions in those messages. We may still send users who have opted out of non-promotional communications, such as receipts for rides or information about their account."
        />
        <Body
          isBullet
          text="Cookies and related technologies: For information on how to opt out of personalized ads using cookies and related technologies, please see our Cookie Notice."
        />
        <Body
          isBullet
          text="LawnQ ads: LawnQ users can opt out of certain personalized ads from LawnQ’s advertising partners . Users who opt out may still see ads, but they will be less relevant."
        />
        <Body text="E. User personal data requests" />
        <Body
          isBullet
          text="LawnQ provides users with a variety of ways to learn about, control, and submit questions and comments about LawnQ’s handling of their personal data."
        />
        <Body
          isBullet
          text="Accessing data: Users can access data including their profile data and activity jobs history through the LawnQ apps or via LawnQ’s website. Users can also use our Explore Your Data feature to view an online summary of information about their account, such as number of trips or orders, rating, rewards status, and number of days since they’ve been an LawnQ user."
        />

        <Body text="Changing or updating data: Users can edit the name, phone number, email address, payment method, and photo associated with their account through the Settings menu in LawnQ’s apps or service provider portal. Users may also" />
        <Body isBullet text="request to update or correct their data here." />
        <Body
          isBullet
          text="Deleting data: Users may request deletion of their account at any time through the Settings > Privacy menus in the LawnQ app, or through LawnQ’s website (Customers and order recipients here; service providers and delivery persons here)."
        />
        <Body text="Objections, restrictions, and complaints: Users may request that we stop using all or some of their personal data, or that we limit our use of their data. This includes objecting to our use of personal data that is based on LawnQ’s legitimate interests. LawnQ may continue to process data after such objection or request to the extent required or permitted by law." />
        <Body text="In addition, depending on their location, users may have the right to file a complaint relating to LawnQ’s handling of their personal data with the data protection authority in their country." />

        <Separator />
        <Separator />
      </ScrollView>
    </>
  );
};

export default PrivacyScreen;
