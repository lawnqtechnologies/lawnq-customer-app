import React, {useEffect} from 'react';
import {
  launchImageLibrary,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from 'store';
import {onSetLawnURIList} from '@services/states/booking/booking.slice';
import {
  onSetAddPropLawnImages,
  onSetAddPropUriList,
} from '@services/states/property/property.slice';

/**
 * ? Constants
 */
const CONTAINER = 'Lawns';

interface IImageUPloadFunctionProps {
  processType: string;
  action: string;
  setAction: any;
  setIsUploading: any;
  onUpload: boolean;
  setOnUpload: any;
  setIsDoneUploading: any;
  actionOnDoneUploading: any;
  setImageChanged?: any;
}

const ImageUploadFunction: React.FC<IImageUPloadFunctionProps> = ({
  processType,
  action,
  setAction,
  setIsUploading,
  onUpload,
  setOnUpload,
  setIsDoneUploading,
  actionOnDoneUploading,
  setImageChanged,
}) => {
  const dispatch = useDispatch();

  /**
   * ? Redux States
   */
  const {addPropURIList} = useSelector((state: RootState) => state.property);

  /**
   * ? Functions
   */
  const onSelectImagesFromGallery = () => {
    const isBookingUpload = processType === 'booking';
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      maxWidth: 2000,
      maxHeight: 2000,
      selectionLimit: isBookingUpload ? 1 : 5,
    };

    launchImageLibrary(options, (response: any) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        doneSelection();
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        doneSelection();
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
        doneSelection();
      } else {
        const responseArray = response.assets ?? [];
        const selectedImages = responseArray.map((r: any) => ({
          uri: r.uri,
          type: r.type,
          name: 'LAWNQ',
        }));
        if (!selectedImages.length) {
          doneSelection();
          return;
        }

        const newArray = isBookingUpload
          ? selectedImages.slice(0, 1)
          : [...addPropURIList, ...selectedImages];

        if (isBookingUpload) dispatch(onSetLawnURIList(newArray));
        else dispatch(onSetAddPropUriList(newArray));
        //setImages(source);
        doneSelection();

        // dispatchPropLawnImages(source);
      }
    });
  };

  const dispatchPropLawnImages = (thisImages: any) => {
    let formedPropImages: Array<any> = [];
    thisImages?.map((image: any, index: number) => {
      const {imageType} = image;
      formedPropImages.push(`${index + 1}.${imageType}`);
    });

    if (processType !== 'booking')
      dispatch(onSetAddPropLawnImages(formedPropImages));

    !!setImageChanged && setImageChanged(true);
  };

  const doneSelection = () => {
    setAction('');
    setIsDoneUploading(false);
    setIsUploading(false);
    setOnUpload(false);
  };

  const resetImages = () => {
    if (processType === 'booking') dispatch(onSetLawnURIList([]));
    else dispatch(onSetAddPropUriList([]));
  };

  /**
   * ? Watchers
   */
  useEffect(() => {
    if (!action) return;

    if (action === 'gallery') {
      onSelectImagesFromGallery();
      return;
    }
  }, [action]);

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */
  return null;
};

export default ImageUploadFunction;
