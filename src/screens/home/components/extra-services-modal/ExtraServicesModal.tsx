import React, {useEffect, useMemo, useState} from 'react';
import {View, Pressable, TextInput, ScrollView, Keyboard} from 'react-native';
import Modal from 'react-native-modal';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';

import Text from '@shared-components/text-wrapper/TextWrapper';
import fonts from '@fonts';
import {v2Colors} from '@theme/themes';
import {useSafeBottomPadding} from 'shared/functions/useSafeBottomInset';
import {
  ExtraService,
  extraServiceCatalog,
  makeExtraServiceId,
} from '../../data';
import AddedServicesList from '../extra-services/AddedServicesList';
import styles from './ExtraServicesModal.style';

interface Props {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  // Current services from Redux; the modal edits a local copy and commits on Done.
  services: ExtraService[];
  onSave: (services: ExtraService[]) => void;
}

const ExtraServicesModal: React.FC<Props> = ({
  isVisible,
  setIsVisible,
  services,
  onSave,
}) => {
  const footerSafePadding = useSafeBottomPadding(16);
  const [workingServices, setWorkingServices] = useState<ExtraService[]>([]);
  const [query, setQuery] = useState<string>('');

  // Inline edit state.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');

  // Sync the working copy every time the modal is opened.
  useEffect(() => {
    if (isVisible) {
      setWorkingServices(services);
      setQuery('');
      cancelEdit();
    }
  }, [isVisible]);

  const trimmedQuery = query.trim();

  const matches = useMemo(() => {
    if (!trimmedQuery) return [];
    const lower = trimmedQuery.toLowerCase();
    const addedCatalogIds = new Set(
      workingServices.map(item => item.catalogId).filter(Boolean),
    );
    return extraServiceCatalog.filter(
      item =>
        item.name.toLowerCase().includes(lower) &&
        !addedCatalogIds.has(item.catalogId),
    );
  }, [trimmedQuery, workingServices]);

  const addCatalogService = (catalogId: number) => {
    const catalogItem = extraServiceCatalog.find(
      item => item.catalogId === catalogId,
    );
    if (!catalogItem) return;
    setWorkingServices(prev => [
      ...prev,
      {
        id: makeExtraServiceId(),
        name: catalogItem.name,
        description: catalogItem.description,
        isCustom: false,
        catalogId: catalogItem.catalogId,
        status: 'to_be_quoted',
      },
    ]);
    setQuery('');
    Keyboard.dismiss();
  };

  const addCustomService = () => {
    if (!trimmedQuery) return;
    setWorkingServices(prev => [
      ...prev,
      {
        id: makeExtraServiceId(),
        name: trimmedQuery,
        description: '',
        isCustom: true,
        status: 'to_be_quoted',
      },
    ]);
    setQuery('');
    Keyboard.dismiss();
  };

  const removeService = (id: string) => {
    setWorkingServices(prev => prev.filter(item => item.id !== id));
    if (editingId === id) cancelEdit();
  };

  const startEdit = (item: ExtraService) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditDescription(item.description);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
  };

  const saveEdit = () => {
    if (!editingId) return;
    const name = editName.trim();
    if (!name) return;
    setWorkingServices(prev =>
      prev.map(item =>
        item.id === editingId
          ? {...item, name, description: editDescription.trim()}
          : item,
      ),
    );
    cancelEdit();
  };

  const handleDone = () => {
    onSave(workingServices);
    setIsVisible(false);
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  const exactNameExists = extraServiceCatalog.some(
    item => item.name.toLowerCase() === trimmedQuery.toLowerCase(),
  );

  return (
    <Modal
      isVisible={isVisible}
      style={styles.modal}
      onBackdropPress={handleCancel}
      onBackButtonPress={handleCancel}
      useNativeDriver
      propagateSwipe>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            hitSlop={10}
            onPress={handleCancel}>
            <Icon
              name="arrow-back"
              type={IconType.MaterialIcons}
              size={24}
              color={v2Colors.green}
            />
          </Pressable>
          <View style={{flex: 1}}>
            <Text
              fontFamily={fonts.lexend.extraBold}
              color={v2Colors.green}
              style={styles.title}>
              Add Extra Services
            </Text>
            <Text color={v2Colors.greenShade2} style={styles.subtitle}>
              Add any additional services you need. Your provider will confirm
              the final price.
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Add a service */}
          <View style={styles.addServiceCard}>
            <Text
              fontFamily={fonts.lexend.extraBold}
              color={v2Colors.green}
              style={styles.sectionLabel}>
              Add a service
            </Text>

            <View style={styles.searchRow}>
              <Icon
                name="search"
                type={IconType.MaterialIcons}
                size={20}
                color={v2Colors.greenShade2}
              />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search for a service"
                placeholderTextColor={v2Colors.greenShade2}
                autoCorrect={false}
              />
              {!!query && (
                <Pressable hitSlop={8} onPress={() => setQuery('')}>
                  <Icon
                    name="cancel"
                    type={IconType.MaterialIcons}
                    size={20}
                    color={v2Colors.greenShade2}
                  />
                </Pressable>
              )}
            </View>

            <Text color={v2Colors.greenShade2} style={styles.helperText}>
              Search for a service, or type your own if it's not listed.
            </Text>

            {/* Results */}
            {!!trimmedQuery && (
              <View style={styles.resultsCard}>
                {matches.length > 0 ? (
                  matches.map((item, index) => (
                    <View key={item.catalogId}>
                      {index > 0 && <View style={styles.divider} />}
                      <Pressable
                        style={styles.matchRow}
                        onPress={() => addCatalogService(item.catalogId)}>
                        <Icon
                          name="add"
                          type={IconType.MaterialIcons}
                          size={20}
                          color={v2Colors.green}
                        />
                        <View style={styles.matchTextContainer}>
                          <Text
                            fontFamily={fonts.lexend.extraBold}
                            color={v2Colors.green}>
                            {item.name}
                          </Text>
                          <Text
                            color={v2Colors.greenShade2}
                            style={{fontSize: 13, marginTop: 2}}>
                            {item.description}
                          </Text>
                        </View>
                      </Pressable>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <View style={styles.emptyIconCircle}>
                      <Icon
                        name="search"
                        type={IconType.MaterialIcons}
                        size={26}
                        color={v2Colors.greenShade2}
                      />
                    </View>
                    <Text
                      fontFamily={fonts.lexend.extraBold}
                      color="black"
                      style={{fontSize: 16}}>
                      No matching services found
                    </Text>
                    <Text
                      color={v2Colors.greenShade2}
                      style={{marginTop: 4, textAlign: 'center'}}>
                      You can still add this as a custom service
                    </Text>
                  </View>
                )}

                {/* Add custom, shown when the query isn't already an exact catalog name */}
                {!exactNameExists && (
                  <>
                    {matches.length > 0 && <View style={styles.divider} />}
                    <Pressable
                      style={styles.addCustomRow}
                      onPress={addCustomService}>
                      <Icon
                        name="add"
                        type={IconType.MaterialIcons}
                        size={22}
                        color={v2Colors.green}
                      />
                      <Text
                        fontFamily={fonts.lexend.extraBold}
                        color={v2Colors.green}
                        style={{marginLeft: 8}}>
                        {`Add "${trimmedQuery}" as a custom service`}
                      </Text>
                    </Pressable>
                  </>
                )}
              </View>
            )}
          </View>

          {/* Inline edit panel */}
          {!!editingId && (
            <View style={styles.editPanel}>
              <Text
                fontFamily={fonts.lexend.extraBold}
                color={v2Colors.green}
                style={{marginBottom: 8}}>
                Edit service
              </Text>
              <TextInput
                style={styles.editInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Service name"
                placeholderTextColor={v2Colors.greenShade2}
              />
              <TextInput
                style={styles.editInput}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Description (optional)"
                placeholderTextColor={v2Colors.greenShade2}
              />
              <View style={styles.editButtonsRow}>
                <Pressable
                  style={[
                    styles.editButton,
                    {borderWidth: 1.5, borderColor: v2Colors.green},
                  ]}
                  onPress={cancelEdit}>
                  <Text color={v2Colors.green}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.editButton,
                    {backgroundColor: v2Colors.green},
                  ]}
                  onPress={saveEdit}>
                  <Text color="white">Save</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Added services */}
          <AddedServicesList
            services={workingServices}
            onEdit={startEdit}
            onRemove={removeService}
          />

          {/* Info banner */}
          {workingServices.length > 0 && (
            <View style={styles.infoBanner}>
              <Icon
                name="info-outline"
                type={IconType.MaterialIcons}
                size={22}
                color="#1E6FD9"
              />
              <View style={styles.infoTextContainer}>
                <Text fontFamily={fonts.lexend.extraBold} color="#1B3A5B">
                  Final pricing confirmed by provider
                </Text>
                <Text
                  color="#3E5C7A"
                  style={{marginTop: 4, fontSize: 13, lineHeight: 19}}>
                  Your selected services will be reviewed by your provider and
                  the final cost will be confirmed before the booking is
                  accepted.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, footerSafePadding]}>
          <Pressable style={styles.doneButton} onPress={handleDone}>
            <Text fontFamily={fonts.lexend.extraBold} color="white" h4>
              Done
            </Text>
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={handleCancel}>
            <Text fontFamily={fonts.lexend.extraBold} color={v2Colors.green} h4>
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default ExtraServicesModal;
