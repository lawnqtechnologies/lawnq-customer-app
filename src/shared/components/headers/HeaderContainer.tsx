import React, { useMemo } from "react";
import { View, TouchableOpacity, StatusBar } from "react-native";
import { useTheme } from "@react-navigation/native";
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
import { propertySlice } from "@services/states/property/property.slice";

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
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleBack = () => {
    if(backValue){
    NavigationService.goBack()
    }
    else {
      NavigationService.push(navigateTo)
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={"dark-content"} />
      <View style={styles.leftContainer}>
        {!backDisabled && (
          <TouchableOpacity
            onPress={handleBack}
            style={{ paddingTop: 2, marginRight: 15 }}
          >
            <ARROW_LEFT width={24} height={24} />
          </TouchableOpacity>
        )}
        <Text h2 color={v2Colors.green} fontFamily={fonts.lexend.extraBold}>
          {pageTitle}
        </Text>
      </View>

      {hasCancel && onCancel && (
        <TouchableOpacity
          onPress={() => onCancel()}
          style={styles.cancelContainer}
        >
          <Text right h3 color={v2Colors.highlight}>
            Cancel
          </Text>
        </TouchableOpacity>
      )}

      {hasDelete && onDelete && (
        <TouchableOpacity
          onPress={() => onDelete()}
          style={styles.deleteContainer}
        >
          <TRASH />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default HeaderContainer;
