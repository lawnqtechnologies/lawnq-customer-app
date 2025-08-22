import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useTheme } from "@react-navigation/native";

/**
 * ? Local Imports
 */
import Text from "@shared-components/text-wrapper/TextWrapper";
import { v2Colors } from "@theme/themes";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ISubHeaderComponentProps {
  style?: CustomStyleProp;
  text: string;
}

const SubHeaderComponent: React.FC<ISubHeaderComponentProps> = ({ text }) => {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <View style={{ width: "90%", marginLeft: 10 }}>
      <Text h3 bold color={v2Colors.green}>
        {text}
      </Text>
    </View>
  );
};

export default SubHeaderComponent;
