import * as yup from "yup";
const phoneRegExp =
  /^((\\+[0-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

export const LoginSchema = yup
  .object({
    mobile: yup
      .string()
      .required("Mobile Number is required.")
      .matches(phoneRegExp, "Mobile Number is not valid")
      .min(8, "Mobile Number is not valid")
      .max(10, "Mobile Number is not valid"),
    password: yup.string().required("Password is required"),
  })
  .required();
