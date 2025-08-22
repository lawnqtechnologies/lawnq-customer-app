import React, { useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { useTheme } from "@react-navigation/native";
import DropDownPicker from "react-native-dropdown-picker";

/**
 * ? Local imports
 */

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ISearchableDropdownProps {
  style?: CustomStyleProp;
  width?: number | string;
  height?: number | string;
  placeholder?: string;
  value: string;
  setValue: any;
  body?: Array<string>;
}

const SearchableDropdown: React.FC<ISearchableDropdownProps> = ({
  style,
  height,
  placeholder,
  value,
  setValue,
  body,
}) => {
  const theme = useTheme();

  /**
   * ? States
   */
  const [open, setOpen] = useState<boolean>(false);
  // const [value, setValue] = useState<any>("0");
  const [items, setItems] = useState([
    { label: "Home", value: "1" },
    { label: "Uncle", value: "2" },
    { label: "Dad", value: "3" },
  ]);

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
      searchable={true}
      placeholder={placeholder}
      dropDownContainerStyle={{
        width: "100%",
        borderWidth: 0,
      }}
      searchContainerStyle={{ borderBottomColor: "gray", borderWidth: 0 }}
      listMode={"MODAL"}
    />
  );

  return <Dropdown />;
};

export default SearchableDropdown;
