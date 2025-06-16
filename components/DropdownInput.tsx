import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { TextInput } from './TextInput';
import { Entypo } from '@expo/vector-icons';
import { colors } from '../theme/colors';


interface DropdownInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  items: string[];
  label?: string;
}

export const DropdownInput: React.FC<DropdownInputProps> = ({
  value,
  onChangeText,
  placeholder,
  items,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (item: string) => {
    onChangeText(item);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        editable={false}
        rightIcon={
          <TouchableOpacity onPress={() => setIsOpen(!isOpen)}>
            <Entypo 
              name={isOpen ? "chevron-small-up" : "chevron-small-down"} 
              size={24} 
              color={colors.darkGray} 
            />
          </TouchableOpacity>
        }
      />

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1} 
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={items}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.itemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '80%',
    maxHeight: '60%',
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  itemText: {
    fontSize: 16,
    color: colors.darkGray,
  },
}); 