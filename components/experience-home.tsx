"use client";

import React, { useEffect, useState } from "react";
import type { AccessLevel } from "@whop/api";
import Link from "next/link";
import { Button } from "./ui/button";

interface Membership {
  id: string;
  // Add other fields as needed
  [key: string]: any;
}

export default function ExperienceHome({
  accessLevel,
  experienceId,
}: {
  accessLevel: AccessLevel;
  experienceId: string;
}) {
  const [memberships, setMemberships] = useState<Membership[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/experiences/${experienceId}/memberships`)
      .then(async (res) => {
        console.log(res);
        if (!res.ok) throw new Error("Failed to fetch memberships");
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setMemberships(data.memberships || []);
        setError(null);
      })
      .catch((err) => {
			console.log(err);
	     setError(err.message || "Unknown error");
        setMemberships([]);
      })
      .finally(() => setLoading(false));
  }, [experienceId]);

  return (
    <div>
      <div className="flex justify-center items-center">
        <div className="text-4xl font-bold text-center">
          Memberships for this experience
        </div>
      </div>
      {accessLevel === "admin" && (
        <div className="flex justify-center items-center">
          <Link href={`/experiences/${experienceId}/edit`}>
            <Button variant={"link"}>Create a marketplace</Button>
          </Link>
        </div>
      )}
      <div className="mt-6">
        {loading && <div>Loading memberships...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && memberships && memberships.length === 0 && (
          <div className="text-gray-500 text-center">No memberships found for this experience.</div>
        )}
        {!loading && !error && memberships && memberships.length > 0 && (
          <ul className="divide-y divide-gray-200">
            {memberships.map((membership) => (
              <li key={membership.id} className="py-2">
                Membership ID: {membership.id}
                {/* Add more membership info here as needed */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}