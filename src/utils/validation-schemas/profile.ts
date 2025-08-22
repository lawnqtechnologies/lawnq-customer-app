import * as yup from "yup";
const phoneRegExp =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

export const udpateProfileSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required.")
    .email("Email is not valid."),
  firstName: yup.string().required("First Name is required."),
  lastName: yup.string().required("Last Name is required."),
  mobile: yup
    .string()
    .required("Mobile Number is required.")
    .matches(phoneRegExp, "Mobile Number is not valid")
    .min(9, "Mobile Number is not valid")
    .max(10, "Mobile Number is not valid"),
});
