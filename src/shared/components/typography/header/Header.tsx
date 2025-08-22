import React, { useMemo } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useTheme } from "@react-navigation/native";

/**
 * ? Local Imports
 */
import createStyles from "./Header.style";
import Text from "@shared-components/text-wrapper/TextWrapper";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IHeaderComponentProps {
  style?: CustomStyleProp;
  text: string;
}

const HeaderComponent: React.FC<IHeaderComponentProps> = ({ text }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.bodyContainer}>
      <Text h2 color={colors.fontDarkGray} style={styles.bodyText}>
        {text}
      </Text>
    </View>
  );
};

export default HeaderComponent;
