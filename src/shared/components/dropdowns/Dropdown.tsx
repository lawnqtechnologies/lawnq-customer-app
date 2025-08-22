import React, { useState, useEffect } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { useTheme } from "@react-navigation/native";
import DropDownPicker, { ItemType } from "react-native-dropdown-picker";

/**
 * ? Local imports
 */

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IDropdownProps {
  style?: CustomStyleProp;
  height?: number | string;
  placeholder?: string;
  item?: string;
  setItem?: any;
  queue?: any;
  list: Array<object>;
  zIndex?: number;
  zIndexInverse?: number;
  isModal?: boolean;
}

const Dropdown: React.FC<IDropdownProps> = ({
  style,
  height,
  placeholder,
  item,
  setItem,
  queue,
  list,
  zIndex,
  zIndexInverse,
  isModal,
}) => {
  const theme = useTheme();

  /**
   * ? States
   */
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<any>(item);
  const [items, setItems] = useState<Array<object>>(list);

  /**
   * ? Watchers
   */
  useEffect(() => {
    !!setItem && setItem(value);
  }, [value]);

  useEffect(() => {
    !!queue && setValue(queue);
  }, [queue]);

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */

  const Dropdown = () => (
    <DropDownPicker
      open={open}
      value={value}
      items={items}
      setOpen={setOpen}
      setValue={setValue}
      setItems={setItems}
      style={[{ borderWidth: 0, height }, style]}
      placeholder={placeholder}
      dropDownContainerStyle={{
        borderWidth: 0,
      }}
      searchContainerStyle={{ borderBottomColor: "gray", borderWidth: 0 }}
      zIndex={zIndex}
      zIndexInverse={zIndexInverse}
      listMode={isModal ? "MODAL" : "FLATLIST"}
    />
  );

  return <Dropdown />;
};

export default Dropdown;
