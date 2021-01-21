import mongoose, { Schema } from 'mongoose'

const listSchema = new Schema({
  id: mongoose.Types.ObjectId,
  name: {
    type: String,
    required: true,
  },
  image: {
    url: String,
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      qty: {
        type: Number,
        default: 1,
      },
    },
  ],
  listType: {
    type: String,
    enum: ['inventory', 'shopping'],
    default: 'shopping',
  },
})

listSchema.virtual('id').get(function (this: mongoose.Document<any>) {
  return this._id.toHexString()
})

export const List = mongoose.model('List', listSchema)
