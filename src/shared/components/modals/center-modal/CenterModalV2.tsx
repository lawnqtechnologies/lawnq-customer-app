import React, {useMemo} from 'react';
import {View, TouchableOpacity} from 'react-native';
import Modal from 'react-native-modal';
import {useTheme} from '@react-navigation/native';

/**
 * ? Local imports
 */
import createStyles from './CenterModalV2.style';
import Text from '@shared-components/text-wrapper/TextWrapper';

/**
 * ? SVGs
 */
import LikeGreenCircle from '@assets/v2/homescreen/icons/like-green-circle.svg';

interface ICenterModalV2 {
  style?: any;
  isVisible: boolean;
  setIsVisible: Function;
  icon?: JSX.Element | null;
  text?: string;
  onPressButton?: Function;
  fontMessageSize?: number
}

const CenterModalV2: React.FC<ICenterModalV2> = ({
  isVisible,
  setIsVisible,
  icon = <LikeGreenCircle height={75} width={75} />,
  text = 'Photo(s) successfully uploaded',
  onPressButton,
  fontMessageSize
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const Content = () => (
    <View style={styles.container}>
      {!!icon ? <Icon /> : <View style={{height: 2}} />}
      <Text center style={{fontSize: fontMessageSize ?? 20, marginVertical: 20}}>
        {text}
      </Text>
      <Button />
    </View>
  );

  const Icon = () => <View style={styles.icon}>{icon}</View>;

  const Button = () => (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setTimeout(() => {
            onPressButton && onPressButton();
          }, 300);
          setIsVisible(false);
        }}>
        <Text bold color={'white'}>
          Confirm
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
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
  );
};

export default CenterModalV2;
