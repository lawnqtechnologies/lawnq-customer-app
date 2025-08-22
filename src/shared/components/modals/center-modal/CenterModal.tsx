import React, {useMemo} from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Modal from 'react-native-modal';
import GestureRecognizer from 'react-native-swipe-gestures';
import * as _ from 'lodash';

/**
 * ? Local imports
 */
import createStyles from './CenterModal.style';
import Text from '@shared-components/text-wrapper/TextWrapper';
import {v2Colors} from '@theme/themes';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ICenterModalScreenProps {
  style?: CustomStyleProp;
  isVisible: boolean;
  setIsVisible: Function;
  title?: string;
  body?: string;
  showButton?: boolean;
  onPress?: () => any;
  buttonText?: string;
}

const CenterModal: React.FC<ICenterModalScreenProps> = ({
  isVisible,
  setIsVisible,
  title,
  body = 'Sample content.',
  showButton = true,
  onPress,
  buttonText = 'Ok',
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const Content = () => (
    <View style={styles.content}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Header />
        <Body />
        {showButton && <Button />}
      </ScrollView>
    </View>
  );

  const Header = () => (
    <View style={styles.header}>
      <Text h2 bold color={v2Colors.green}>
        {_.upperFirst(title)}
      </Text>
    </View>
  );

  const Body = () => (
    <View style={styles.body}>
      <Text h4 color={v2Colors.green} style={{textAlign: 'center'}}>
        {body}
      </Text>
    </View>
  );

  const Button = () => (
    <View style={styles.buttonContainer}>
      <TouchableOpacity onPress={onPress} style={styles.button}>
        <Text h4 bold color="white">
          {_.toUpper(buttonText) || ''}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <GestureRecognizer onSwipeDown={() => setIsVisible(false)}>
      <Modal
        testID={'modal'}
        isVisible={isVisible}
        backdropColor="rgba(0,0,0,0.5)"
        backdropOpacity={0.8}
        animationIn="zoomInDown"
        animationOut="zoomOutUp"
        animationInTiming={600}
        animationOutTiming={600}
        backdropTransitionInTiming={600}
        backdropTransitionOutTiming={600}>
        <Content />
      </Modal>
    </GestureRecognizer>
  );
};

export default CenterModal;
