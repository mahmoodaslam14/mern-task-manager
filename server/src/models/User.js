import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /.+@.+\..+/ },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.checkPassword = function checkPassword(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toJSON = function toJSON() {
  const { _id, name, email, role, createdAt } = this;
  return { id: _id, name, email, role, createdAt };
};

export default mongoose.model('User', userSchema);
