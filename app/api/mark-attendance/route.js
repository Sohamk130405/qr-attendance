import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import Attendance from "@/lib/models/Attendance";

export async function POST(req) {
  await dbConnect();

  const { userId, eventName } = await req.json();
  console.log(userId, eventName);
  try {
    // Check if the user is registered for the event
    const user = await User.findOne({
      id: userId,
    });
    if (!user) {
      return NextResponse.json(
        { message: "User not registered for this event" },
        { status: 400 }
      );
    }

    const isUserRegisteredForCurrentEvent =
      user.registeredEvent.includes(eventName);
    if (!isUserRegisteredForCurrentEvent) {
      return NextResponse.json(
        { message: "User not registered for this event" },
        { status: 400 }
      );
    }
    // Check if attendance is already marked
    const existingAttendance = await Attendance.findOne({
      userId,
      registeredEvent: eventName,
    });
    if (existingAttendance) {
      return NextResponse.json(
        { message: "Attendance already marked for this user" },
        { status: 400 }
      );
    }

    // Mark attendance
    await Attendance.create({ userId, registeredEvent: eventName });

    return NextResponse.json(
      { message: "Attendance marked successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error marking attendance:", error);
    return NextResponse.json(
      { message: "Error marking attendance" },
      { status: 500 }
    );
  }
}
