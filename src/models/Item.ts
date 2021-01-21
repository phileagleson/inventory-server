import mongoose, { Schema } from 'mongoose'

const itemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      url: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

itemSchema.virtual('id').get(function (this: mongoose.Document<any>) {
  return this._id.toHexString()
})

export const Item = mongoose.model('Item', itemSchema)
