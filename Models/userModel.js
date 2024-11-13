import mongoose from 'mongoose'

// TODO: Integration with ldap.

const userSchema = new mongoose.Schema({
  entryDate: { type: Date, default: Date.now },
  fullName: { type: String },
  birthDate: { type: Date },
  email: {
    type: String,
    required: true,
    unique: true,
    // eslint-disable-next-line no-useless-escape
    match: [/.+\@.+\..+/, 'Please enter a valid e-mail address']
  },
  username: { type: String },
  cuit: { type: String, unique: true, required: true },
  phone: { type: String },
  address: { type: String },
  location: { type: String },
  position: { type: String },
  department: { type: String },
  password: { type: String, default: 'Admin123#' },
  accessRole: {
    type: String,
    default: 'Soporte',
    enum: ['Admin', 'Soporte', 'Gerente']
  }

})

userSchema.pre('save', function (next) {
  if (this.email && !this.username) {
    this.username = this.email.split('@')[0]
  }
  next()
})

export const User = mongoose.model('User', userSchema)
