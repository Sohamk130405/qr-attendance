"use client";

import { useState, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QrScanner from "@/components/QrScanner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const [selectedEvent, setSelectedEvent] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [alert, setAlert] = useState(null);

  const handleScan = useCallback(
    async (data) => {
      if (data) {
        setScanResult(data);
        try {
          const response = await fetch("/api/mark-attendance", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: data, eventName: selectedEvent }),
          });
          const result = await response.json();
          setAlert({
            type: response.ok ? "success" : "error",
            message: result.message,
          });
        } catch (error) {
          console.error("Error marking attendance:", error);
          setAlert({ type: "error", message: "Error marking attendance" });
        }
      }
    },
    [selectedEvent]
  );

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Event Attendance System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select onValueChange={(value) => setSelectedEvent(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Event A">Event A</SelectItem>
                <SelectItem value="Event B">Event B</SelectItem>
                <SelectItem value="Event C">Event C</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setScannerActive(!scannerActive)}>
              {scannerActive ? "Stop Scanner" : "Start Scanner"}
            </Button>
            {scanResult && <p>Last scanned: {scanResult}</p>}
            {alert && (
              <Alert
                variant={alert.type === "success" ? "default" : "destructive"}
                className={cn("flex justify-between items-center", {
                  "text-green-500 border-green-600": alert.type === "success",
                })}
              >
                <div>
                  <AlertTitle>
                    {alert.type === "success" ? "Success" : "Error"}
                  </AlertTitle>
                  <AlertDescription>{alert.message}</AlertDescription>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setAlert(null)}
                  className="ml-4"
                  size="icon"
                >
                  <X />
                </Button>
              </Alert>
            )}
            {scannerActive && selectedEvent && (
              <QrScanner onScan={handleScan} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
