import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const FILE_LABELS = [
  'Corporate Registration (CAC)',
  'Food Safety Certification',
];

export default function UploadCertifications() {
  const router = useRouter();
  const [files, setFiles] = useState<(DocumentPicker.DocumentPickerAsset | null)[]>([null, null]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickFile = async (index: number) => {
    setError('');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: false,
      });
      if (result.canceled) return;
      const picked = result.assets[0];
      if (picked.size && picked.size > 5 * 1024 * 1024) {
        setError('File size must be 5MB or less.');
        return;
      }
      if (!picked.name.endsWith('.pdf')) {
        setError('Only PDF files are allowed.');
        return;
      }
      const newFiles = [...files];
      newFiles[index] = picked;
      setFiles(newFiles);
    } catch (e) {
      setError('Failed to pick file.');
    }
  };

  const handleRemoveFile = (index: number) => {
    setError('');
    const newFiles = [...files];
    newFiles[index] = null;
    setFiles(newFiles);
  };

  const handleSubmit = async () => {
    if (!files[0] || !files[1]) return;
    setIsSubmitting(true);
    try {
      await AsyncStorage.setItem('certUploaded', 'true');
      await AsyncStorage.setItem('certFiles', JSON.stringify(files.map(f => f?.name)));
      setFiles([null, null]);
      router.back();
    } catch (e) {
      setError('Failed to upload files.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Certification Upload</Text>
      <Text style={styles.instructions}>
        Please upload a valid certification for verification. {'\n'}
        1. Corporate Registration(CAC){'\n'}
        2. Food Safety Certification:{'\n'}
        <Text style={styles.subInstructions}>
          ISO 22000: Food Safety Management Systems, or Certification from recognized Nigerian food regulatory authorities
        </Text>
      </Text>
      <View style={styles.uploadBox}>
        <Ionicons name="cloud-upload-outline" size={36} color={colors.gray} style={{ marginBottom: 8 }} />
        <Text style={styles.uploadText}>Drag and Drop here</Text>
        <Text style={styles.uploadText}>or</Text>
          <Text style={styles.browseText}>Browse files</Text>
        <View style={{ width: '100%', marginTop: 12 }}>
          {files.map((file, idx) => (
            <View key={idx} style={styles.fileRow}>
              <TouchableOpacity
                style={styles.filePicker}
                onPress={() => handlePickFile(idx)}
                disabled={!!file}
              >
                <Ionicons name="document-outline" size={20} color={colors.primary} />
                <Text style={styles.fileLabel}>{FILE_LABELS[idx]}</Text>
              </TouchableOpacity>
              {file && (
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>{file.name}</Text>
                  <View style={styles.progressBarBg}>
                    <View style={styles.progressBarFill} />
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveFile(idx)}>
                    <Ionicons name="close-circle" size={20} color="#B00020" />
        </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.acceptedFormat}>Accepted Format: PDF only (max size: 5MB each)</Text>
      </View>
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: files[0] && files[1] && !error ? colors.primary : colors.gray }]}
        onPress={handleSubmit}
        disabled={!files[0] || !files[1] || !!error || isSubmitting}
      >
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F0',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 12,
  },
  instructions: {
    color: '#222',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 18,
  },
  subInstructions: {
    color: '#888',
    fontSize: 13,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: '#BDBDBD',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 28,
    marginBottom: 24,
  },
  uploadText: {
    color: '#888',
    fontSize: 15,
    marginBottom: 2,
  },
  browseText: {
    color: '#3A7752',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 8,
  },
  fileRow: {
    width: '100%',
    marginBottom: 12,
  },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  fileLabel: {
    color: '#222',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 6,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  fileName: {
    color: '#222',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  progressBarBg: {
    height: 8,
    width: 80,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    width: 80,
    backgroundColor: '#3A7752',
    borderRadius: 4,
  },
  error: {
    color: '#B00020',
    fontSize: 13,
    marginTop: 6,
  },
  acceptedFormat: {
    color: '#888',
    fontSize: 12,
    marginTop: 10,
    fontStyle: 'italic',
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
}); 