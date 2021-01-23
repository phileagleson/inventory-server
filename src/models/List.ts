import mongoose, { Schema } from 'mongoose'

const listSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      url: String,
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
        },
        qty: {
          type: Number,
          default: 1,
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    listType: {
      type: String,
      enum: ['inventory', 'shopping'],
      default: 'shopping',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

listSchema.virtual('id').get(function (this: mongoose.Document<any>) {
  return this._id.toHexString()
})

export const List = mongoose.model('List', listSchema)
