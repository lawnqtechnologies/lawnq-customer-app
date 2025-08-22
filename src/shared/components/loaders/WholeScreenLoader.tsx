import React, { useMemo } from "react";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "@react-navigation/native";

import createStyles from "./style";
import Text from "@shared-components/text-wrapper/TextWrapper";

const WholeScreenLoader = () => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.neonGreen} />
      <Text h2 color={colors.white} style={{ marginTop: 10 }}>
        Loading...
      </Text>
    </View>
  );
};

export default WholeScreenLoader;
