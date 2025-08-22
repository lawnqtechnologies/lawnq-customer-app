import * as yup from 'yup';

export const PropertySchema = yup
  .object()
  .shape({
    propertyName: yup.string().required('Property name is required.'),
    address: yup.string().required('Address is required'),
    lawnArea: yup.string().required('Lawn Area is required'),
    State: yup.string().required('State is required.'),
    Country: yup.string().required('Country is required.'),
    StreetNumber: yup.string().required('House Number is required.'),
    PostalCode: yup.string().required('Postal Code is required.'),
    Suburb: yup.string().required('Suburb is required.'),
    StreetName: yup.string().required('Street Name is required.'),
    Remarks: yup.string().nullable()
  })
  .required();
