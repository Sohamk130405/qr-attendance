import mongoose from "mongoose";
const AttendanceSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  registeredEvent: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Attendance ||
  mongoose.model("Attendance", AttendanceSchema);
