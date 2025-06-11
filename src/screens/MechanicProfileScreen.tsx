import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, Switch, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MechanicStackParamList } from '../navigation/AppNavigator';

type MechanicProfileScreenRouteProp = RouteProp<MechanicStackParamList, 'MechanicDetails'>; // Reusing MechanicDetails for now
type MechanicProfileScreenNavigationProp = StackNavigationProp<MechanicStackParamList, 'MechanicDetails'>;

interface MechanicProfileScreenProps {
  route: MechanicProfileScreenRouteProp;
  navigation: MechanicProfileScreenNavigationProp;
}

interface Mechanic {
  id: string;
  name: string;
  photoUrl: string;
  specializations: string[];
  rating: number;
  reviewCount: number;
  bio: string;
  isAvailable: boolean;
  contactEmail: string;
  contactPhone: string;
}

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}

const mockMechanicData: Mechanic = {
  id: 'mech123',
  name: 'John Doe',
  photoUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
  specializations: ['Engine Repair', 'Brakes', 'Diagnostics', 'Electrical'],
  rating: 4.7,
  reviewCount: 150,
  bio: 'Experienced mechanic with over 15 years in the automotive industry. Specializing in complex engine diagnostics and electrical system repairs. Dedicated to providing reliable and efficient service.',
  isAvailable: true,
  contactEmail: 'john.doe@example.com',
  contactPhone: '+1 (555) 123-4567',
};

const mockReviews: Review[] = [
  { id: 'r1', reviewerName: 'Alice B.', rating: 5, comment: 'John was very professional and fixed my car quickly. Highly recommend!', date: '2024-05-20' },
  { id: 'r2', reviewerName: 'Bob C.', rating: 4, comment: 'Good service, but took a bit longer than expected. Car runs great now.', date: '2024-04-15' },
  { id: 'r3', reviewerName: 'Charlie D.', rating: 5, comment: 'Excellent diagnostic skills. Found the issue that others missed.', date: '2024-03-10' },
];

const MechanicProfileScreen: React.FC<MechanicProfileScreenProps> = ({ route, navigation }) => {
  const { mechanicId } = route.params; // Assuming mechanicId is passed
  const [mechanic, setMechanic] = useState<Mechanic | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [editedSpecializations, setEditedSpecializations] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    // Simulate fetching mechanic data and reviews
    setTimeout(() => {
      setMechanic(mockMechanicData);
      setReviews(mockReviews);
      setEditedBio(mockMechanicData.bio);
      setEditedSpecializations(mockMechanicData.specializations.join(', '));
      setIsAvailable(mockMechanicData.isAvailable);
      setLoading(false);
    }, 1000);
  }, [mechanicId]);

  const handleSaveProfile = () => {
    if (mechanic) {
      // Simulate saving to backend
      const updatedMechanic = {
        ...mechanic,
        bio: editedBio,
        specializations: editedSpecializations.split(',').map(s => s.trim()).filter(s => s.length > 0),
        isAvailable: isAvailable,
      };
      setMechanic(updatedMechanic);
      setIsEditing(false);
      Alert.alert('Profile Updated', 'Your profile has been successfully updated.');
      // In a real app, dispatch an action to update Redux store and backend
    }
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={rating >= i ? 'star' : (rating >= i - 0.5 ? 'star-half' : 'star-outline')}
          size={18}
          color='#FFD700'
          style={styles.starIcon}
        />
      );
    }
    return <View style={styles.starRatingContainer}>{stars}</View>;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading mechanic profile...</Text>
      </View>
    );
  }

  if (!mechanic) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Mechanic not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mechanic Profile</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
          <Ionicons name={isEditing ? "save" : "create-outline"} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: mechanic.photoUrl }} style={styles.profilePhoto} />
          <Text style={styles.mechanicName}>{mechanic.name}</Text>
          <View style={styles.ratingSection}>
            {renderStarRating(mechanic.rating)}
            <Text style={styles.reviewCountText}>({mechanic.reviewCount} reviews)</Text>
          </View>
          <View style={styles.availabilityToggleContainer}>
            <Text style={styles.availabilityLabel}>Available for Jobs:</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isAvailable ? "#007bff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setIsAvailable}
              value={isAvailable}
              disabled={!isEditing}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          {isEditing ? (
            <TextInput
              style={styles.bioInput}
              multiline
              value={editedBio}
              onChangeText={setEditedBio}
              placeholder="Tell us about yourself..."
            />
          ) : (
            <Text style={styles.bioText}>{mechanic.bio}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specializations</Text>
          {isEditing ? (
            <TextInput
              style={styles.specializationsInput}
              value={editedSpecializations}
              onChangeText={setEditedSpecializations}
              placeholder="Comma-separated specializations (e.g., Engine, Brakes)"
            />
          ) : (
            <View style={styles.specializationsContainer}>
              {mechanic.specializations.map((spec, index) => (
                <View key={index} style={styles.specialtyBadge}>
                  <Text style={styles.specialtyText}>{spec}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.contactText}><Ionicons name="mail-outline" size={16} /> {mechanic.contactEmail}</Text>
          <Text style={styles.contactText}><Ionicons name="call-outline" size={16} /> {mechanic.contactPhone}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                  {renderStarRating(review.rating)}
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
            ))
          ) : (
            <Text>No reviews yet.</Text>
          )}
          <TouchableOpacity style={styles.addReviewButton} onPress={() => Alert.alert('Add Review', 'This feature would allow users to add a review.')}>
            <Ionicons name="add-circle-outline" size={20} color="#007bff" />
            <Text style={styles.addReviewButtonText}>Add a Review</Text>
          </TouchableOpacity>
        </View>

        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  editButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  mechanicName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  starRatingContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    marginHorizontal: 1,
  },
  reviewCountText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  availabilityToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#e9ecef',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  availabilityLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 10,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginTop: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  bioText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  specializationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyBadge: {
    backgroundColor: '#e0f7fa',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyText: {
    color: '#007bff',
    fontSize: 14,
  },
  specializationsInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  contactText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewComment: {
    fontSize: 15,
    color: '#555',
    marginBottom: 5,
  },
  reviewDate: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e6f2ff',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  addReviewButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MechanicProfileScreen;


