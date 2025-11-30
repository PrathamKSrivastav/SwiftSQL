import mongoose from 'mongoose';

const queryHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    naturalLanguageQuery: {
      type: String,
      default: '',  // 👈 CHANGE: Make it optional with default empty string
    },
    generatedSQL: {
      type: String,
      required: true,
    },
    database: {
      type: String,
      required: true,
    },
    executionResult: {
      success: {
        type: Boolean,
        required: true,
      },
      rowCount: {
        type: Number,
        default: 0,
      },
      data: {
        type: mongoose.Schema.Types.Mixed,
      },
      error: {
        type: String,
      },
    },
    executionTime: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
queryHistorySchema.index({ userId: 1, createdAt: -1 });

const QueryHistory = mongoose.model('QueryHistory', queryHistorySchema);

export default QueryHistory;
