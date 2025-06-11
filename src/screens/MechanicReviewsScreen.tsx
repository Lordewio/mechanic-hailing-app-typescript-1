// src/screens/MechanicReviewsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { MechanicStackParamList } from '../navigation/AppNavigator';

// Define the review interface
interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  rating: number;
  comment: string;
  date: string;
  serviceType: string;
}

// Mock data for mechanic reviews
const mockReviews: Review[] = [
  {
    id: 'r1',
    userId: 'u1',
    userName: 'Michael Wilson',
    userPhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
    comment: 'John did an excellent job diagnosing and fixing my check engine light issue. Very professional and knowledgeable.',
    date: '2025-05-10',
    serviceType: 'Engine Diagnostics'
  },
  {
    id: 'r2',
    userId: 'u2',
    userName: 'Emily Johnson',
    userPhoto: 'https://randomuser.me/api/portraits/women/28.jpg',
    rating: 4,
    comment: 'Good service, fixed my brake issue quickly. A bit pricey but worth it for the quality work.',
    date: '2025-05-05',
    serviceType: 'Brake Service'
  },
  {
    id: 'r3',
    userId: 'u3',
    userName: 'Robert Davis',
    userPhoto: 'https://randomuser.me/api/portraits/men/45.jpg',
    rating: 5,
    comment: 'Very thorough and explained everything clearly. Will definitely use again for future maintenance.',
    date: '2025-04-28',
    serviceType: 'Oil Change'
  },
  {
    id: 'r4',
    userId: 'u4',
    userName: 'Jennifer Smith',
    userPhoto: 'https://randomuser.me/api/portraits/women/65.jpg',
    rating: 3,
    comment: 'Service was okay. Fixed the issue but took longer than expected.',
    date: '2025-04-15',
    serviceType: 'Tire Rotation'
  },
  {
    id: 'r5',
    userId: 'u5',
    userName: 'David Brown',
    userPhoto: 'https://randomuser.me/api/portraits/men/22.jpg',
    rating: 5,
    comment: 'Excellent service! John went above and beyond to fix my car\'s electrical issues.',
    date: '2025-04-10',
    serviceType: 'Electrical System'
  },
  {
    id: 'r6',
    userId: 'u6',
    userName: 'Sarah Miller',
    userPhoto: 'https://randomuser.me/api/portraits/women/42.jpg',
    rating: 4,
    comment: 'Good experience overall. Fair pricing and quality work.',
    date: '2025-04-05',
    serviceType: 'AC Service'
  },
  {
    id: 'r7',
    userId: 'u7',
    userName: 'James Wilson',
    userPhoto: 'https://randomuser.me/api/portraits/men/67.jpg',
    rating: 5,
    comment: 'John is my go-to mechanic now. Always honest and reliable.',
    date: '2025-03-28',
    serviceType: 'Engine Tune-up'
  }
];

// Define prop types
type MechanicReviewsScreenRouteProp = RouteProp<MechanicStackParamList, 'MechanicReviews'>;
type MechanicReviewsScreenNavigationProp = NavigationProp<MechanicStackParamList>;

interface MechanicReviewsScreenProps {
  // Add any props if needed
}

const MechanicReviewsScreen: React.FC<MechanicReviewsScreenProps> = () => {
  const navigation = useNavigation<MechanicReviewsScreenNavigationProp>();
  const route = useRoute<MechanicReviewsScreenRouteProp>();
  
  // Get mechanicId from route params with fallback
  const { mechanicId } = route.params || { mechanicId: '1' };
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filterRating, setFilterRating] = useState<number>(0); // 0 means all ratings
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent'); // 'recent' or 'rating'
  
  useEffect(() => {
    // In a real app, we would fetch the reviews from an API
    // For now, we'll use mock data
    setReviews(mockReviews);
  }, [mechanicId]);
  
  const handleWriteReview = () => {
    // Navigate with required params and optional ones
    navigation.navigate('WriteReview', { 
      mechanicId, 
      serviceId: 's1', // Mock service ID
      bookingId: 'b1'  // Mock booking ID
    });
  };
  
  const handleFilterByRating = (rating: number) => {
    setFilterRating(rating === filterRating ? 0 : rating);
  };
  
  const filteredReviews = reviews.filter(review => 
    filterRating === 0 || review.rating === filterRating
  );
  
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    return 0;
  });
  
  const renderRatingFilter = (rating: number) => (
    <TouchableOpacity
      style={[styles.ratingFilter, filterRating === rating && styles.ratingFilterActive]}
      onPress={() => handleFilterByRating(rating)}
    >
      <Text style={[styles.ratingFilterText, filterRating === rating && styles.ratingFilterTextActive]}>
        {rating} {rating === 1 ? 'Star' : 'Stars'}
      </Text>
    </TouchableOpacity>
  );
  
  const renderReviewCard = (review: Review) => (
    <View key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: review.userPhoto }} style={styles.reviewerPhoto} />
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{review.userName}</Text>
          <Text style={styles.reviewDate}>{review.date}</Text>
        </View>
        <View style={styles.reviewRating}>
          {[1, 2, 3, 4, 5].map(star => (
            <Ionicons 
              key={star}
              name={star <= review.rating ? "star" : "star-outline"} 
              size={16} 
              color="#FFD700" 
            />
          ))}
        </View>
      </View>
      <Text style={styles.serviceType}>{review.serviceType}</Text>
      <Text style={styles.reviewComment}>{review.comment}</Text>
    </View>
  );
  
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
        <Text style={styles.headerTitle}>Reviews</Text>
        <TouchableOpacity 
          style={styles.writeReviewButton}
          onPress={handleWriteReview}
        >
          <Ionicons name="create-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* Rating Summary */}
      <View style={styles.ratingSummary}>
        <View style={styles.ratingOverall}>
          <Text style={styles.ratingOverallValue}>4.8</Text>
          <View style={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map(star => (
              <Ionicons 
                key={star}
                name={star <= 4.8 ? "star" : star <= 5 ? "star-half" : "star-outline"} 
                size={20} 
                color="#FFD700" 
              />
            ))}
          </View>
          <Text style={styles.ratingCount}>Based on {reviews.length} reviews</Text>
        </View>
        <View style={styles.ratingBreakdown}>
          {[5, 4, 3, 2, 1].map(rating => {
            const count = reviews.filter(r => r.rating === rating).length;
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            
            return (
              <View key={rating} style={styles.ratingBar}>
                <Text style={styles.ratingLabel}>{rating}</Text>
                <View style={styles.ratingBarContainer}>
                  <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
                </View>
                <Text style={styles.ratingBarCount}>{count}</Text>
              </View>
            );
          })}
        </View>
      </View>
      
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ratingFilters}
        >
          {[5, 4, 3, 2, 1].map(rating => renderRatingFilter(rating))}
        </ScrollView>
        
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'recent' && styles.sortButtonActive]}
            onPress={() => setSortBy('recent')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'recent' && styles.sortButtonTextActive]}>
              Most Recent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'rating' && styles.sortButtonActive]}
            onPress={() => setSortBy('rating')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'rating' && styles.sortButtonTextActive]}>
              Highest Rated
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Reviews List */}
      <ScrollView contentContainerStyle={styles.reviewsList}>
        {sortedReviews.length > 0 ? (
          sortedReviews.map(review => renderReviewCard(review))
        ) : (
          <View style={styles.noReviewsContainer}>
            <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
            <Text style={styles.noReviewsText}>No reviews match your filter</Text>
          </View>
        )}
      </ScrollView>
      
      {/* Write Review Button */}
      <TouchableOpacity 
        style={styles.writeReviewButtonFloat}
        onPress={handleWriteReview}
      >
        <Ionicons name="create" size={24} color="#fff" />
      </TouchableOpacity>
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
  writeReviewButton: {
    padding: 8,
  },
  ratingSummary: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ratingOverall: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
    paddingRight: 16,
  },
  ratingOverallValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingStars: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#666',
  },
  ratingBreakdown: {
    flex: 2,
    paddingLeft: 16,
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingLabel: {
    width: 20,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  ratingBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginHorizontal: 8,
  },
  ratingBarFill: {
    height: 8,
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  ratingBarCount: {
    width: 20,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ratingFilters: {
    paddingHorizontal: 16,
  },
  ratingFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  ratingFilterActive: {
    backgroundColor: '#007bff',
  },
  ratingFilterText: {
    fontSize: 12,
    color: '#666',
  },
  ratingFilterTextActive: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  sortLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: '#007bff',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  reviewsList: {
    padding: 16,
    paddingBottom: 80, // Space for floating button
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerPhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  reviewerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewRating: {
    flexDirection: 'row',
  },
  serviceType: {
    fontSize: 12,
    color: '#007bff',
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
  },
  noReviewsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noReviewsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  writeReviewButtonFloat: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default MechanicReviewsScreen;
