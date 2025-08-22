import React, { useMemo } from "react";
import { View } from "react-native";
import { useTheme } from "@react-navigation/native";

/**
 * ?
 */
import createStyles from "./HeaderOne.style";
import Text from "@shared-components/text-wrapper/TextWrapper";

interface IInputTextProps {
  title?: string;
}

const HeaderOne: React.FC<IInputTextProps> = ({ title = "Title" }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.header}>
      <Text h3 bold color="white">
        {title}
      </Text>
    </View>
  );
};

export default HeaderOne;
