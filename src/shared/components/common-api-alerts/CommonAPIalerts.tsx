import Loader from '@shared-components/loaders/loader';
import CenterModalV2 from '@shared-components/modals/center-modal/CenterModalV2';
import React from 'react';

interface ICommonAPIalerts {
  loading: boolean;
  successText: string;
  successVisible: boolean;
  setSuccessVisible: Function;
  onPressSucess: Function;
  failedText: string;
  failedVisible: boolean;
  setFailedVisible: Function;
  onPressFailed: Function;
  commonErrorVisible: boolean;
  setCommonErrorVisible: Function;
  onPressCommonError: Function;
}

// composes of loading, success, failed and common error custom alerts
const CommonAPIalerts: React.FC<ICommonAPIalerts> = ({
  loading,
  successText,
  successVisible,
  setSuccessVisible,
  onPressSucess,
  failedText,
  failedVisible,
  setFailedVisible,
  onPressFailed,
  commonErrorVisible,
  setCommonErrorVisible,
  onPressCommonError,
}) => {
  return (
    <>
      {loading && <Loader />}
      {/* success modal */}
      <CenterModalV2
        isVisible={successVisible}
        setIsVisible={setSuccessVisible}
        onPressButton={onPressSucess}
        text={successText}
      />
      {/* failed modal */}
      <CenterModalV2
        isVisible={failedVisible}
        setIsVisible={setFailedVisible}
        onPressButton={onPressFailed}
        text={failedText}
        icon={null}
      />
      {/* common error modal */}
      <CenterModalV2
        isVisible={commonErrorVisible}
        setIsVisible={setCommonErrorVisible}
        onPressButton={onPressCommonError}
        text={'Something went wrong, please try again.'}
        icon={null}
      />
    </>
  );
};

export default CommonAPIalerts;
