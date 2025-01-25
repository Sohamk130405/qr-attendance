import React from "react";

const SeedUsersButton = () => {
  const seedUsers = async () => {
    const response = await fetch("/api/seed", {
      method: "POST",
    });

    const data = await response.json();
    alert(data.message);
  };

  return <button onClick={seedUsers}>Seed Users</button>;
};

export default SeedUsersButton;
