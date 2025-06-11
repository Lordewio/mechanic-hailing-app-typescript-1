import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MechanicWalletScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mechanic Wallet</Text>
      <Text style={styles.balance}>Current Balance: $0.00 (Placeholder)</Text>
      <Text style={styles.info}>This screen will display earnings, payment history, and withdrawal options.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  balance: {
    fontSize: 20,
    marginBottom: 10,
    color: '#28a745',
  },
  info: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});

export default MechanicWalletScreen;


