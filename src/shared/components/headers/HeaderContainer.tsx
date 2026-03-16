import React, { useMemo, useState } from "react";
import { View, Pressable, StatusBar } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as NavigationService from "react-navigation-helpers";

/**
 * ? Local imports
 */
import createStyles from "./HeaderContainer.style";
import Text from "@shared-components/text-wrapper/TextWrapper";
import { v2Colors } from "@theme/themes";
import fonts from "@fonts";

/**
 * ? SVGs
 */
import ARROW_LEFT from "@assets/v2/headers/arrow-left.svg";
import TRASH from "@assets/v2/properties/icons/trash.svg";

interface IHeaderContainerProps {
  pageTitle?: string;
  navigateTo?: string;
  backDisabled?: boolean;
  hasCancel?: boolean;
  onCancel?: Function;
  hasDelete?: boolean;
  onDelete?: Function;
  backValue?: boolean;
}

const HeaderContainer: React.FC<IHeaderContainerProps> = ({
  pageTitle = "",
  navigateTo = "",
  backDisabled = false,
  hasCancel = false,
  onCancel,
  hasDelete = false,
  backValue=false,
  onDelete,
}) => {
  const theme = useTheme();
  const { top } = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, top), [theme, top]);
  const [isPressed, setIsPressed] = useState(false);

  const handleBack = () => {
    if (isPressed) return;
    setIsPressed(true);
    if(backValue){
    NavigationService.goBack()
    }
    else {
      NavigationService.push(navigateTo)
      setTimeout(() => setIsPressed(false), 500); // re-enable after delay
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={"dark-content"} />
      <View style={styles.leftContainer}>
        {!backDisabled && (
          <Pressable
            onPress={handleBack}
            disabled={isPressed}
           style={{ paddingTop: 2, marginRight: 15, opacity: isPressed ? 0.6 : 1 }}
          >
            <ARROW_LEFT width={24} height={24} />
          </Pressable>
        )}
        <Text h2 color={v2Colors.green} fontFamily={fonts.lexend.extraBold}>
          {pageTitle}
        </Text>
      </View>

      {hasCancel && onCancel && (
        <Pressable
          onPress={() => {
            onCancel();
          }}
          style={styles.cancelContainer}
          disabled={isPressed}
        >
          <Text right h3 color={v2Colors.highlight}>
            Cancel
          </Text>
        </Pressable>
      )}

      {hasDelete && onDelete && (
        <Pressable
          onPress={() => {
            onDelete();
          }}
          style={styles.deleteContainer}
          disabled={isPressed}
        >
          <TRASH />
        </Pressable>
      )}
    </View>
  );
};

export default HeaderContainer;
