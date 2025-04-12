<template>
  <div class="profile-container">
    <h1 class="profile-title">My Profile</h1>
    
    <div class="profile-card">
      <div class="profile-header">
        <div class="profile-avatar">
          <img v-if="user.avatar" :src="user.avatar" alt="Profile Picture">
          <div v-else class="avatar-placeholder">{{ getInitials(user.name) }}</div>
        </div>
        <div class="profile-info">
          <h2>{{ user.name }}</h2>
          <p>{{ user.email }}</p>
          <p v-if="user.phone">{{ user.phone }}</p>
        </div>
      </div>
      
      <div class="profile-section">
        <h3>Personal Information</h3>
        <form @submit.prevent="updateProfile">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input type="text" id="name" v-model="user.name" />
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="user.email" />
          </div>
          
          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input type="tel" id="phone" v-model="user.phone" />
          </div>
          
          <div class="form-group">
            <label for="address">Address</label>
            <textarea id="address" v-model="user.address"></textarea>
          </div>
          
          <button type="submit" class="btn-update">Update Profile</button>
        </form>
      </div>
      
      <div class="profile-section">
        <h3>Donation History</h3>
        <div v-if="donations.length > 0" class="donation-history">
          <div v-for="(donation, index) in donations" :key="index" class="donation-item">
            <div class="donation-details">
              <p class="donation-amount">RM {{ donation.amount.toFixed(2) }}</p>
              <p class="donation-date">{{ formatDate(donation.date) }}</p>
              <p class="donation-category">{{ donation.category }}</p>
            </div>
            <div class="donation-status" :class="donation.status.toLowerCase()">
              {{ donation.status }}
            </div>
          </div>
        </div>
        <div v-else class="no-donations">
          <p>You haven't made any donations yet.</p>
          <router-link to="/donation" class="btn-donate">Make a Donation</router-link>
        </div>
      </div>
      
      <div class="profile-section">
        <h3>My Rewards</h3>
        <div v-if="rewards.length > 0" class="rewards-list">
          <div v-for="(reward, index) in rewards" :key="index" class="reward-item">
            <div class="reward-info">
              <h4>{{ reward.name }}</h4>
              <p>{{ reward.description }}</p>
              <p class="reward-expiry" v-if="reward.expiryDate">Expires: {{ formatDate(reward.expiryDate) }}</p>
            </div>
            <div class="reward-status" :class="reward.status.toLowerCase()">
              {{ reward.status }}
            </div>
          </div>
        </div>
        <div v-else class="no-rewards">
          <p>You don't have any rewards yet.</p>
          <router-link to="/rewards" class="btn-rewards">View Available Rewards</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileView',
  data() {
    return {
      user: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+60 12 345 6789',
        address: '123 Main Street, Kuala Lumpur, Malaysia',
        avatar: null
      },
      donations: [
        {
          amount: 100.00,
          date: new Date('2023-10-15'),
          category: 'Fakir (Poor)',
          status: 'Completed'
        },
        {
          amount: 50.00,
          date: new Date('2023-09-01'),
          category: 'Miskin (Needy)',
          status: 'Completed'
        },
        {
          amount: 75.00,
          date: new Date('2023-11-05'),
          category: 'Fi Sabilillah',
          status: 'Processing'
        }
      ],
      rewards: [
        {
          name: 'Tax Deduction Certificate',
          description: 'Certificate for tax deduction purposes for your donation of RM 100.00',
          status: 'Available',
          expiryDate: new Date('2024-04-30')
        },
        {
          name: 'Donation Badge',
          description: 'Silver donor badge for your contribution',
          status: 'Claimed',
          expiryDate: null
        }
      ]
    }
  },
  methods: {
    updateProfile() {
      // Here you would implement the logic to update the user profile
      // For example, making an API call to your backend
      alert('Profile updated successfully!');
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    getInitials(name) {
      if (!name) return '';
      return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase();
    }
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-title {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.profile-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  display: flex;
  padding: 2rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 2rem;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 2rem;
  font-weight: bold;
  color: #6c757d;
}

.profile-info h2 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #343a40;
}

.profile-info p {
  margin: 0.25rem 0;
  color: #6c757d;
}

.profile-section {
  padding: 2rem;
  border-bottom: 1px solid #e9ecef;
}

.profile-section:last-child {
  border-bottom: none;
}

.profile-section h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #343a40;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.btn-update {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-update:hover {
  background-color: #218838;
}

.donation-history,
.rewards-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.donation-item,
.reward-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #6c757d;
}

.donation-details p,
.reward-info p {
  margin: 0.25rem 0;
}

.donation-amount,
.reward-info h4 {
  font-weight: bold;
  color: #343a40;
  margin-top: 0;
}

.donation-date,
.donation-category,
.reward-expiry {
  color: #6c757d;
  font-size: 0.9rem;
}

.donation-status,
.reward-status {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
}

.donation-status.completed,
.reward-status.available,
.reward-status.claimed {
  background-color: #d4edda;
  color: #155724;
}

.donation-status.processing {
  background-color: #fff3cd;
  color: #856404;
}

.no-donations,
.no-rewards {
  text-align: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.btn-donate,
.btn-rewards {
  display: inline-block;
  margin-top: 1rem;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-donate:hover,
.btn-rewards:hover {
  background-color: #0069d9;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .profile-avatar {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .donation-item,
  .reward-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .donation-status,
  .reward-status {
    margin-top: 1rem;
    align-self: flex-start;
  }
}
</style> 