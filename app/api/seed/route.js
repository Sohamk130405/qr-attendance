import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";

export async function POST(req, res) {
  await dbConnect();

  // Sample users to add to the database
  const users = [
    {
      id: "user1",
      name: "John Doe",
      registeredEvents: ["Event A", "Event B"],
    },
    {
      id: "user2",
      name: "Jane Smith",
      registeredEvents: ["Event B", "Event C"],
    },
    {
      id: "user3",
      name: "Alice Johnson",
      registeredEvents: ["Event A", "Event C"],
    },
    {
      id: "user4",
      name: "Bob Brown",
      registeredEvents: ["Event B"],
    },
  ];

  try {
    // Insert the users into the database
    await User.insertMany(users);
    return res.status(200).json({ message: "Users added successfully" });
  } catch (error) {
    console.error("Error adding users:", error);
    return res.status(500).json({ message: "Error adding users" });
  }
}
