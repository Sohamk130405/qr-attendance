import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  registeredEvent: [{ type: String, required: true }],
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
