import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
const { Schema } = mongoose;

export const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, default: 'Untitled' },
    body: {
      type: String,
      required: true
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'organizations',
      autopopulate: true
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

notificationSchema.plugin(autoPopulate);

export default mongoose.model('notifications', notificationSchema);
