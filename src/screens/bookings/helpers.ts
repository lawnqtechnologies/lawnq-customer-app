export const getStatusTextColor = (value: string, colors: any) => {
  switch (value) {
    case "ACCEPTED":
    case "COMPLETED":
    case "CANCELLED":
      return colors.white;
    default:
      return colors.white;
  }
};

export const getStatusBgColor = (value: string, colors: any) => {
  switch (value) {
    case "ACCEPTED":
      return colors.calpyse;
    case "COMPLETED":
      return colors.darkGreen;
    case "CANCELLED":
      return colors.danger;
    default:
      return colors.darkerGray;
  }
};
