"use client";

import React, { useEffect, useState } from "react";
import type { AccessLevel } from "@whop/api";
import Link from "next/link";
import { Button } from "./ui/button";

interface Marketplace {
  id: string;
  title: string;
  takeRate: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ExperienceHome({
  accessLevel,
  experienceId,
}: {
  accessLevel: AccessLevel;
  experienceId: string;
}) {
  const [marketplaces, setMarketplaces] = useState<Marketplace[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/experiences/${experienceId}/marketplaces`)
      .then(async (res) => {
        console.log(res);
        if (!res.ok) throw new Error("Failed to fetch marketplaces");
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setMarketplaces(data.marketplaces || []);
        setError(null);
      })
      .catch((err) => {
			console.log(err);
	     setError(err.message || "Unknown error");
        setMarketplaces([]);
      })
      .finally(() => setLoading(false));
  }, [experienceId]);

  return (
    <div>
      <div className="flex justify-center items-center">
        <div className="text-4xl font-bold text-center">
          Marketplaces for this experience
        </div>
      </div>
      {accessLevel === "admin" && (
        <div className="flex justify-center items-center">
          <Link href={`/experiences/${experienceId}/marketplace/create`}>
            <Button>Create a marketplace</Button>
          </Link>
        </div>
      )}
      <div className="mt-6">
        {loading && <div>Loading marketplaces...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && marketplaces && marketplaces.length === 0 && (
			<div>
				<div className="text-gray-500 text-center">
					No marketplaces found for this experience.
				</div>
				<div className="text-center">
            {accessLevel === 'admin' ? (
              <p className="text-gray-600 mb-2">
                Click 'Create a marketplace' above to create the first marketplace in this whop.
              </p>
            ) : accessLevel === 'customer' ? (
              <p className="text-gray-600 mb-2">
                No marketplaces are available at the moment. Please check back later.
              </p>
            ) : (
              <p className="text-gray-600">
                You don't have access to view this content.
              </p>
            )}
				</div>
			</div>
        )}
        {!loading && !error && marketplaces && marketplaces.length > 0 && (
          <ul className="divide-y divide-gray-200">
            {marketplaces.map((marketplace) => (
              <li key={marketplace.id} className="py-2">
                Marketplace ID: {marketplace.id}
                {/* Add more marketplace info here as needed */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}