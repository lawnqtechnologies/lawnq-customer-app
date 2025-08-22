import React, {useEffect, useState} from 'react';
import {Platform, Alert} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  ImageLibraryOptions,
} from 'react-native-image-picker';
// import storage from "@react-native-firebase/storage";
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

  const {lawnURIList} = useSelector((state: RootState) => state.booking);
  /**
   * ? Redux States
   */
  const {customerId} = useSelector((state: RootState) => state.user);
  const {propertyLength} = useSelector((state: RootState) => state.property);

  /**
   * ? States
   */
  const [images, setImages] = useState<any>(null);

  /**
   * ? Functions
   */
  const onSelectImagesFromGallery = () => {
    let newArray: any = [],
      source;
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      maxWidth: 2000,
      maxHeight: 2000,
      selectionLimit: 5,
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
        const responseArray = response.assets;

        responseArray.map((r: any) => {
          const {uri, type, name} = r;
          source = {uri: uri, type: type, name: 'LAWNQ'};
          newArray = [...lawnURIList, source];
        });

        if (processType === 'booking') dispatch(onSetLawnURIList(newArray));
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
