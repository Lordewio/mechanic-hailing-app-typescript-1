import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch } from 'react-redux';

// Define the route params interface
interface WriteReviewScreenParams {
  mechanicId: string;
  serviceId: string;
  bookingId?: string;
}

// Define a type for the navigation stack that includes this screen
type RootStackParamList = {
  WriteReview: WriteReviewScreenParams;
  // Add other screens as needed
};

const WriteReviewScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'WriteReview'>>();
  
  // Extract params with proper typing
  const { mechanicId, serviceId } = route.params;
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [mechanicName, setMechanicName] = useState('John Smith');
  const [serviceName, setServiceName] = useState('Brake Service');
  
  useEffect(() => {
    // In a real app, we would fetch the mechanic and service details from an API
    // For now, we'll use mock data
    setMechanicName('John Smith');
    setServiceName('Brake Service');
  }, [mechanicId, serviceId]);
  
  const handleRatingChange = (newRating: number): void => {
    setRating(newRating);
  };
  
  const handleSubmitReview = (): void => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    if (comment.trim() === '') {
      alert('Please write a review');
      return;
    }
    
    // In a real app, we would dispatch an action to save the review
    // dispatch(submitReview({ mechanicId, serviceId, bookingId, rating, comment }));
    
    alert('Thank you for your review!');
    navigation.goBack();
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write a Review</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Mechanic Info */}
        <View style={styles.mechanicSection}>
          <Text style={styles.reviewingText}>You're reviewing</Text>
          <Text style={styles.mechanicName}>{mechanicName}</Text>
          <Text style={styles.serviceName}>for {serviceName}</Text>
        </View>
        
        {/* Rating Selection */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>How would you rate your experience?</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity
                key={star}
                onPress={() => handleRatingChange(star)}
                style={styles.starButton}
              >
                <Ionicons 
                  name={star <= rating ? "star" : "star-outline"} 
                  size={40} 
                  color={star <= rating ? "#FFD700" : "#ccc"} 
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingText}>
            {rating === 0 ? 'Tap to rate' : 
             rating === 1 ? 'Poor' :
             rating === 2 ? 'Fair' :
             rating === 3 ? 'Good' :
             rating === 4 ? 'Very Good' : 'Excellent'}
          </Text>
        </View>
        
        {/* Review Comment */}
        <View style={styles.commentSection}>
          <Text style={styles.commentLabel}>Write your review</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Share your experience with this mechanic..."
            multiline
            numberOfLines={6}
            value={comment}
            onChangeText={setComment}
          />
          <Text style={styles.commentHint}>
            Your review will help other users find the right mechanic for their needs.
          </Text>
        </View>
        
        {/* Photo Upload (placeholder) */}
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>Add photos (optional)</Text>
          <TouchableOpacity style={styles.addPhotoButton}>
            <Ionicons name="camera-outline" size={24} color="#007bff" />
            <Text style={styles.addPhotoText}>Add Photos</Text>
          </TouchableOpacity>
          <Text style={styles.photoHint}>
            Photos help others see the quality of work.
          </Text>
        </View>
      </ScrollView>
      
      {/* Submit Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.submitButton, (rating === 0 || comment.trim() === '') && styles.submitButtonDisabled]}
          onPress={handleSubmitReview}
          disabled={rating === 0 || comment.trim() === ''}
        >
          <Text style={styles.submitButtonText}>Submit Review</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40, // For status bar
    backgroundColor: '#007bff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    paddingBottom: 80, // Space for bottom bar
  },
  mechanicSection: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reviewingText: {
    fontSize: 14,
    color: '#666',
  },
  mechanicName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  serviceName: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  ratingSection: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starButton: {
    padding: 8,
  },
  ratingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  commentSection: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    fontSize: 14,
    color: '#333',
    height: 120,
    textAlignVertical: 'top',
  },
  commentHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  photoSection: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20,
  },
  photoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
    padding: 16,
  },
  addPhotoText: {
    fontSize: 14,
    color: '#007bff',
    marginLeft: 8,
  },
  photoHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default WriteReviewScreen;
