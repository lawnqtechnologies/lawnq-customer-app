import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { RadioButton } from "react-native-paper";

import Text from "@shared-components/text-wrapper/TextWrapper";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IAddPropertyScreenProps {
  style?: CustomStyleProp;
  data: any;
  selected: any;
  setSelected?: any;
}

const RadioButtonComponent: React.FC<IAddPropertyScreenProps> = ({
  data,
  selected,
  setSelected,
}) => {
  return (
    <View>
      {data.map((item: { value: string }) => {
        return (
          <RadioButton
            value={item.value}
            status={selected ? "checked" : "unchecked"}
            onPress={() => setSelected(item.value)}
          />
        );
      })}
    </View>
  );
};

export default RadioButtonComponent;
