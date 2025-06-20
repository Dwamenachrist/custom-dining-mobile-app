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

  const handleBrowseFiles = async () => {
    setError('');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: false,
        multiple: true,
      });
      
      if (result.canceled) return;
      
      const pickedFiles = result.assets;
      
      // Validate files
      for (const file of pickedFiles) {
        if (file.size && file.size > 5 * 1024 * 1024) {
          setError('File size must be 5MB or less.');
          return;
        }
        if (!file.name.endsWith('.pdf')) {
          setError('Only PDF files are allowed.');
          return;
        }
      }
      
      // Update files array
      const newFiles = [...files];
      pickedFiles.forEach((file, index) => {
        if (index < 2) { // Only allow 2 files max
          newFiles[index] = file;
        }
      });
      
      setFiles(newFiles);
      
    } catch (e) {
      setError('Failed to pick files.');
    }
  };

  const handlePickSingleFile = async (index: number) => {
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
        Please upload a valid certification for verification.
      </Text>
      
      <View style={styles.requirementsList}>
        <Text style={styles.requirementItem}>1. Corporate Registration(CAC)</Text>
        <Text style={styles.requirementItem}>2. Food Safety Certification:</Text>
        <Text style={styles.subInstructions}>
          ISO 22000: Food Safety Management Systems, or{'\n'}
          Certification from recognized Nigerian food regulatory authorities
        </Text>
      </View>

      <View style={styles.uploadBox}>
        <Ionicons name="cloud-upload-outline" size={48} color={colors.gray} style={{ marginBottom: 12 }} />
        <Text style={styles.uploadText}>Drag and Drop here</Text>
        <Text style={styles.uploadText}>or</Text>
        <TouchableOpacity style={styles.browseButton} onPress={handleBrowseFiles}>
          <Text style={styles.browseText}>Browse files</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.acceptedFormat}>Accepted Format: PDF only(max size:5MB each)</Text>

      {/* File List */}
      <View style={styles.filesList}>
        {files.map((file, idx) => (
          <View key={idx} style={styles.fileItem}>
            <View style={styles.fileIcon}>
              <Ionicons name="document" size={20} color={colors.primary} />
            </View>
            <View style={styles.fileDetails}>
              <Text style={styles.fileName}>
                {file ? file.name : `${FILE_LABELS[idx]}.pdf`}
              </Text>
              {file && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarBg}>
                    <View style={styles.progressBarFill} />
                  </View>
                </View>
              )}
            </View>
            {file ? (
              <TouchableOpacity onPress={() => handleRemoveFile(idx)} style={styles.removeButton}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={() => handlePickSingleFile(idx)} 
                style={styles.addButton}
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton, 
          { 
            backgroundColor: files[0] && files[1] && !error ? colors.primary : colors.gray,
            opacity: files[0] && files[1] && !error ? 1 : 0.6
          }
        ]}
        onPress={handleSubmit}
        disabled={!files[0] || !files[1] || !!error || isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Text>
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
  requirementsList: {
    marginBottom: 18,
  },
  requirementItem: {
    color: '#222',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  filesList: {
    marginBottom: 24,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    padding: 4,
  },
  browseButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 8,
  },
}); 