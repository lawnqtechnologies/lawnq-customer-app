import React, { useMemo } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useTheme } from "@react-navigation/native";

/**
 * ? Local Imports
 */
import createStyles from "./Body.style";
import Text from "@shared-components/text-wrapper/TextWrapper";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IBodyComponentProps {
  style?: CustomStyleProp;
  text: string;
  isBullet?: boolean;
}

const BodyComponent: React.FC<IBodyComponentProps> = ({ text, isBullet }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View
      style={[!isBullet ? styles.bodyContainer : styles.bulletedTextContainer]}
    >
      {isBullet && (
        <>
          <Text
            h1
            color={colors.fontDarkGray}
            style={{ position: "relative", bottom: 8 }}
          >
            •
          </Text>
          <View style={{ width: 15 }} />
        </>
      )}
      <Text h4 color={colors.fontDarkGray} style={styles.bodyText}>
        {text}
      </Text>
    </View>
  );
};

export default BodyComponent;
