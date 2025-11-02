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
      required: true,
    },
    generatedSQL: {
      type: String,
      required: true,
    },
    executionResult: {
      success: Boolean,
      rowCount: Number,
      error: String,
      data: mongoose.Schema.Types.Mixed,
    },
    database: {
      type: String,
      required: true,
    },
    executionTime: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

queryHistorySchema.index({ userId: 1, createdAt: -1 });

const QueryHistory = mongoose.model('QueryHistory', queryHistorySchema);

export default QueryHistory;
