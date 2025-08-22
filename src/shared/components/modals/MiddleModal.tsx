import React, {useMemo} from 'react';
import {View, StyleProp, ViewStyle} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Modal from 'react-native-modal';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';

/**
 * ? Local imports
 */
import createStyles from './BottomModal.style';

import Text from '@shared-components/text-wrapper/TextWrapper';
import {TouchableOpacity} from 'react-native-gesture-handler';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IMiddleModalScreenProps {
  style?: CustomStyleProp;
  isVisible: boolean;
  setIsVisible: Function;
  setQueue?: any;
  title?: string;
  body?: string;
}

const MiddleModal: React.FC<IMiddleModalScreenProps> = ({
  isVisible,
  setIsVisible,
  title,
  body,
}) => {
  const theme = useTheme();
  const {colors} = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  const Content = () => (
    <View style={styles.content}>
      <Header />
      <View style={styles.body}>{body}</View>
      <TouchableOpacity style={{flex: 1}} onPress={() => setIsVisible(false)}>
        <Text h4 bold color={'black'}>
          {'Done'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const Header = () => (
    <View style={styles.header}>
      <Text h4 bold color={colors.primary}>
        {title}
      </Text>
      <TouchableOpacity style={{flex: 1}} onPress={() => setIsVisible(false)}>
        <Icon
          name="close"
          type={IconType.MaterialIcons}
          color={colors.danger}
          size={25}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      isVisible={isVisible}
      // swipeDirection="down"
      style={styles.modal}
      animationOut="slideOutDown"
      animationInTiming={500}
      animationOutTiming={500}
      useNativeDriver
      hideModalContentWhileAnimating
      backdropTransitionOutTiming={0}>
      <Content />
    </Modal>
  );
};

export default MiddleModal;
