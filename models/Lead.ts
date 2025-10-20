import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    contact: { type: String, required: true },
    status: { type: String, enum: ['new', 'contacted', 'won', 'lost'], default: 'new' },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);