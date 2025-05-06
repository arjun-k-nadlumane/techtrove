// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRE } = require('../config');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    match: [
      /^(\+\d{1,3})?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
      'Please provide a valid phone number'
    ]
  },
  addresses: [
    {
      addressLine1: {
        type: String,
        required: true
      },
      addressLine2: String,
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      postalCode: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true,
        default: 'USA'
      },
      isDefault: {
        type: Boolean,
        default: false
      }
    }
  ],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update login timestamp
UserSchema.methods.updateLastLogin = async function() {
  this.lastLogin = Date.now();
  await this.save();
};

// Add address
UserSchema.methods.addAddress = async function(address) {
  // If this is the first address or set as default
  if (this.addresses.length === 0 || address.isDefault) {
    // Make all addresses non-default
    this.addresses.forEach(addr => {
      addr.isDefault = false;
    });
    address.isDefault = true;
  }
  
  this.addresses.push(address);
  await this.save();
  return this.addresses;
};

// Update address
UserSchema.methods.updateAddress = async function(addressId, updatedAddress) {
  const addressIndex = this.addresses.findIndex(
    addr => addr._id.toString() === addressId
  );
  
  if (addressIndex === -1) {
    throw new Error('Address not found');
  }
  
  // If updating to default
  if (updatedAddress.isDefault) {
    // Make all addresses non-default
    this.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }
  
  // Update address
  this.addresses[addressIndex] = {
    ...this.addresses[addressIndex].toObject(),
    ...updatedAddress
  };
  
  await this.save();
  return this.addresses;
};

// Remove address
UserSchema.methods.removeAddress = async function(addressId) {
  const addressIndex = this.addresses.findIndex(
    addr => addr._id.toString() === addressId
  );
  
  if (addressIndex === -1) {
    throw new Error('Address not found');
  }
  
  const wasDefault = this.addresses[addressIndex].isDefault;
  
  // Remove the address
  this.addresses.splice(addressIndex, 1);
  
  // If removed address was default and we have other addresses, make the first one default
  if (wasDefault && this.addresses.length > 0) {
    this.addresses[0].isDefault = true;
  }
  
  await this.save();
  return this.addresses;
};

// Add item to wishlist
UserSchema.methods.addToWishlist = async function(productId) {
  if (!this.wishlist.includes(productId)) {
    this.wishlist.push(productId);
    await this.save();
  }
  return this.wishlist;
};

// Remove item from wishlist
UserSchema.methods.removeFromWishlist = async function(productId) {
  this.wishlist = this.wishlist.filter(
    id => id.toString() !== productId
  );
  await this.save();
  return this.wishlist;
};

module.exports = mongoose.model('User', UserSchema);