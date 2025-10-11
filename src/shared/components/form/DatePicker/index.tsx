import React, {useMemo, useState} from 'react';
import {useTheme} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';

/* Framework */
import {StyleProp, TextInput, View, ViewStyle} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

/* Local */
import createStyles from './DatePicker.style';

/* Library */
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import {Controller, FieldError} from 'react-hook-form';

import {v2Colors} from '@theme/themes';
import {RootState} from 'store';
import {
  onSetBirthday,
  onSetReadbleBirthday,
} from '@services/states/user/user.slice';

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;
interface IFormDatePickerProps {
  name: string;
  label: string;
  placeholder?: string;
  control: any;
  ref?: any;
  style?: CustomStyleProp;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
  onFocus?: (a: string) => void;
  maximumDate: Date;
  isError?: FieldError | undefined;
}

const FormDatePicker: React.FC<IFormDatePickerProps> = ({
  name = '',
  label = '',
  control,
  ref,
  style,
  maximumDate,
  onFocus,
  rightIcon,
  isError,
}) => {
  const theme = useTheme();
  const {colors} = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();

  /**
   * ? Redux States
   */
  const {readableBirthday} = useSelector((state: RootState) => state.user);

  /**
   * ? States
   */
  const [date, setDate] = useState(
    new Date(moment().subtract(18, 'years').toDate()),
  );
  const [open, setOpen] = useState(false);

  return (
    <>
      <Controller
        control={control}
        name={name}
        render={({field: {onChange, onBlur, value}, fieldState: {error}}) => {
          return (
            <>
              <TouchableOpacity
                onPress={() => {
                  setOpen(true);
                }}
                style={[
                  styles.container,
                  {
                    borderColor: isError ? v2Colors.red : v2Colors.border,
                    borderWidth: isError ? 1 : 2,
                  },
                ]}>
                <View pointerEvents="none">
                  <TextInput
                    onChangeText={onChange}
                    onBlur={onBlur}
                    defaultValue={value}
                    placeholder={label}
                    style={styles.textInput}
                  />
                </View>

                <View style={styles.icon}>{rightIcon}</View>
              </TouchableOpacity>
              <DatePicker
                modal
                mode="date"
                open={open}
                date={date}
                maximumDate={maximumDate}
                onConfirm={date => {
                  const formattedDate = moment(date).format('LL');

                  setDate(date);
                  onChange(date);
                  setOpen(false);
                  onChange(formattedDate);
                  dispatch(onSetBirthday(moment(date).format('YYYY-MM-DD')));
                  dispatch(onSetReadbleBirthday(formattedDate));
                }}
                onCancel={() => {
                  setOpen(false);
                }}
              />
            </>
          );
        }}
      />
    </>
  );
};

export default FormDatePicker;
